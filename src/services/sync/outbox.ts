// src/services/sync/outbox.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/services/supabase/client';
import { uuid } from '@/lib/uuid';
import { createLogger } from '@/lib/log';
import type { OutboxOp, OutboxOpKind, SyncedTable, DeadLetter } from './types';

const log = createLogger('outbox');

const QUEUE_KEY = '@finance/outbox/queue';
const DEAD_KEY  = '@finance/outbox/dead';
const MAX_ATTEMPTS = 8;
const BACKOFF_CAP_MS = 60_000;

// ---------------- internal state ----------------

let isFlushing = false;
let flushTimer: ReturnType<typeof setTimeout> | null = null;

// ---------------- persistence ----------------

async function loadQueue(): Promise<OutboxOp[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as OutboxOp[];
  } catch {
    log.error('queue JSON parse failed, resetting');
    await AsyncStorage.removeItem(QUEUE_KEY);
    return [];
  }
}

async function saveQueue(q: OutboxOp[]): Promise<void> {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(q));
}

async function appendDeadLetter(op: OutboxOp, lastError: OutboxOp['lastError']): Promise<void> {
  const raw = await AsyncStorage.getItem(DEAD_KEY);
  const list: DeadLetter[] = raw ? JSON.parse(raw) : [];
  list.push({ ...op, lastError, droppedAt: Date.now() });
  await AsyncStorage.setItem(DEAD_KEY, JSON.stringify(list));
}

// ---------------- public API ----------------

export type EnqueueArgs = {
  table: SyncedTable;
  kind: OutboxOpKind;
  rowId: string;
  payload: Record<string, unknown>;
  prevUpdatedAt?: string;
};

export async function enqueue(args: EnqueueArgs): Promise<void> {
  const op: OutboxOp = {
    id: uuid(),
    enqueuedAt: Date.now(),
    attemptCount: 0,
    ...args,
  };
  const q = await loadQueue();
  q.push(op);
  await saveQueue(q);
  log.debug('enqueued', op.kind, op.table, op.rowId);
}

export async function flush(): Promise<void> {
  if (isFlushing) return;
  isFlushing = true;
  try {
    let q = await loadQueue();
    while (q.length > 0) {
      const op = q[0];
      const outcome = await tryOp(op);

      if (outcome === 'success') {
        q.shift();
        await saveQueue(q);
        continue;
      }

      if (outcome === 'drop') {
        // Non-retriable failure: archive to dead-letter for diagnostic visibility.
        if (op.lastError) await appendDeadLetter(op, op.lastError);
        q.shift();
        await saveQueue(q);
        continue;
      }

      // retry: bump attempt count, schedule backoff, stop the flush
      op.attemptCount += 1;
      if (op.attemptCount >= MAX_ATTEMPTS) {
        await appendDeadLetter(op, op.lastError);
        q.shift();
        await saveQueue(q);
        continue;
      }
      await saveQueue(q);
      scheduleRetry(op.attemptCount);
      break;
    }
  } finally {
    isFlushing = false;
  }
}

type Outcome = 'success' | 'retry' | 'drop';

async function tryOp(op: OutboxOp): Promise<Outcome> {
  try {
    if (op.kind === 'insert') {
      const { error } = await supabase
        .from(op.table)
        .upsert({ id: op.rowId, ...op.payload } as never, { onConflict: 'id', ignoreDuplicates: true });
      if (error) return classify(op, error);
      return 'success';
    }
    // update: optimistic-lock on updated_at
    let q = supabase.from(op.table).update(op.payload as never).eq('id', op.rowId);
    if (op.prevUpdatedAt) q = q.lte('updated_at', op.prevUpdatedAt);
    const { error, count } = await (q as never as { select: (col: string, opts: { count: 'exact'; head: boolean }) => Promise<{ error: { code?: string; message: string } | null; count: number | null }> }).select('id', { count: 'exact', head: true });
    if (error) return classify(op, error);
    if ((count ?? 0) === 0) {
      // server has a newer row; drop and let Realtime/refetch reconcile.
      log.info('drop stale update', op.table, op.rowId);
      return 'drop';
    }
    return 'success';
  } catch (e) {
    op.lastError = { code: 'network', message: String(e) };
    return 'retry';
  }
}

function classify(op: OutboxOp, error: { code?: string; message: string }): Outcome {
  op.lastError = { code: error.code ?? 'unknown', message: error.message };
  const code = error.code ?? '';
  // 23xxx = PG integrity error; PGRST/4xx-like = bad request; auth = 401/403.
  if (code.startsWith('23') || code === 'PGRST116' || code === '401' || code === '403') {
    return 'drop';
  }
  return 'retry';
}

function scheduleRetry(attempt: number) {
  if (flushTimer) return;
  const delay = Math.min(BACKOFF_CAP_MS, 1000 * 2 ** (attempt - 1));
  log.debug('schedule retry in', delay, 'ms');
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flush();
  }, delay);
}

// ---------------- maintenance ----------------

export async function clear(): Promise<void> {
  await AsyncStorage.multiRemove([QUEUE_KEY, DEAD_KEY]);
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
}

export async function getQueueLength(): Promise<number> {
  const q = await loadQueue();
  return q.length;
}

export async function getDeadLetters(): Promise<DeadLetter[]> {
  const raw = await AsyncStorage.getItem(DEAD_KEY);
  return raw ? (JSON.parse(raw) as DeadLetter[]) : [];
}
