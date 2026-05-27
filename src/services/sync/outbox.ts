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

async function loadDead(): Promise<DeadLetter[]> {
  const raw = await AsyncStorage.getItem(DEAD_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as DeadLetter[];
  } catch {
    log.error('dead-letter JSON parse failed, resetting');
    await AsyncStorage.removeItem(DEAD_KEY);
    return [];
  }
}

async function appendDeadLetter(op: OutboxOp, lastError: OutboxOp['lastError']): Promise<void> {
  const list = await loadDead();
  list.push({ ...op, lastError, droppedAt: Date.now() });
  await AsyncStorage.setItem(DEAD_KEY, JSON.stringify(list));
}

// Remove an op from the queue by id without clobbering concurrent enqueues.
// Always re-load before mutating so we never write a stale snapshot.
async function removeOpById(opId: string): Promise<void> {
  const fresh = await loadQueue();
  const idx = fresh.findIndex((o) => o.id === opId);
  if (idx >= 0) {
    fresh.splice(idx, 1);
    await saveQueue(fresh);
  }
}

// Replace an op in the queue by id (used to persist attemptCount/lastError updates).
async function replaceOpById(updatedOp: OutboxOp): Promise<void> {
  const fresh = await loadQueue();
  const idx = fresh.findIndex((o) => o.id === updatedOp.id);
  if (idx >= 0) {
    fresh[idx] = updatedOp;
    await saveQueue(fresh);
  }
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
  // Kick a flush so callers don't have to wait for a network event to trigger drain.
  // If we're offline or already flushing, flush() returns quickly.
  void flush();
}

export async function flush(): Promise<void> {
  if (isFlushing) return;
  isFlushing = true;
  try {
    while (true) {
      const q = await loadQueue();
      if (q.length === 0) break;
      const op = q[0];
      const outcome = await tryOp(op);

      if (outcome === 'success') {
        await removeOpById(op.id);
        continue;
      }

      if (outcome === 'drop') {
        if (op.lastError) await appendDeadLetter(op, op.lastError);
        await removeOpById(op.id);
        continue;
      }

      // retry path
      op.attemptCount += 1;
      if (op.attemptCount >= MAX_ATTEMPTS) {
        await appendDeadLetter(op, op.lastError);
        await removeOpById(op.id);
        continue;
      }
      await replaceOpById(op);
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
    // update: optimistic-lock on updated_at via .eq() (the trigger guarantees monotonicity,
    // so equality with the value the client last saw is sufficient).
    // .select('id') after .update() returns the affected rows; empty array means the
    // optimistic lock didn't match — server has a newer row.
    let q = supabase.from(op.table).update(op.payload as never).eq('id', op.rowId);
    if (op.prevUpdatedAt) q = q.eq('updated_at', op.prevUpdatedAt);
    const { error, data } = await q.select('id');
    if (error) return classify(op, error);
    if (!data || data.length === 0) {
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
  return loadDead();
}
