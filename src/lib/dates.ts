// src/lib/dates.ts
import { parseISO, formatISO, startOfMonth, endOfMonth } from 'date-fns';

export function toISO(date: Date): string {
  return formatISO(date);
}

export function fromISO(iso: string): Date {
  return parseISO(iso);
}

export function monthBounds(date: Date): { start: Date; end: Date } {
  return { start: startOfMonth(date), end: endOfMonth(date) };
}
