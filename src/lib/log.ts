// src/lib/log.ts
// Tiny leveled logger. Keep it minimal — no transports, no formatting libraries.
// Production builds suppress 'debug'.

type Level = 'debug' | 'info' | 'warn' | 'error';

const enabled: Record<Level, boolean> = {
  debug: __DEV__,
  info: true,
  warn: true,
  error: true,
};

function emit(level: Level, scope: string, ...args: unknown[]) {
  if (!enabled[level]) return;
  const tag = `[${level.toUpperCase()}][${scope}]`;
  // eslint-disable-next-line no-console
  (console[level] ?? console.log)(tag, ...args);
}

export function createLogger(scope: string) {
  return {
    debug: (...args: unknown[]) => emit('debug', scope, ...args),
    info:  (...args: unknown[]) => emit('info', scope, ...args),
    warn:  (...args: unknown[]) => emit('warn', scope, ...args),
    error: (...args: unknown[]) => emit('error', scope, ...args),
  };
}
