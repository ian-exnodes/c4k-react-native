// src/lib/money.ts
//
// Money is stored as BIGINT minor units (e.g. 150 = $1.50).
// At runtime we treat it as a JS number with the documented constraint that
// values stay within Number.MAX_SAFE_INTEGER (9_007_199_254_740_991). For a
// finance app that's ~$90 trillion in cents — comfortably out of reach.

export type MinorUnits = number;

export function fromDecimalString(input: string): MinorUnits {
  // Accepts "1.50", "1.5", "1", ".5", with optional leading minus.
  const trimmed = input.trim();
  if (!/^-?\d+(\.\d{1,2})?$|^-?\.\d{1,2}$/.test(trimmed)) {
    throw new Error(`Invalid money input: ${input}`);
  }
  const sign = trimmed.startsWith('-') ? -1 : 1;
  const abs = trimmed.replace(/^-/, '');
  const [whole, frac = ''] = abs.split('.');
  const cents = (frac + '00').slice(0, 2);
  return sign * (Number(whole) * 100 + Number(cents));
}

export function toDecimalString(amount: MinorUnits): string {
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);
  const whole = Math.floor(abs / 100);
  const cents = (abs % 100).toString().padStart(2, '0');
  return `${sign}${whole}.${cents}`;
}

export function formatCurrency(
  amount: MinorUnits,
  currency: string,
  locale = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount / 100);
}
