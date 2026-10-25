/**
 * Lossless financial calculation utilities.
 * Conforms to AGENTS.md invariant: NEVER use floating-point numbers for money.
 */

export function parseLosslessAmount(val: string): bigint {
  const trimmed = val.trim();
  if (!/^\d+$/.test(trimmed)) {
    throw new Error(`Invalid amount format for lossless calculation: "${val}". Expected non-negative whole integer units.`);
  }
  return BigInt(trimmed);
}

export function sumAmounts(amounts: string[]): string {
  const total = amounts.reduce((acc, curr) => {
    return acc + parseLosslessAmount(curr);
  }, BigInt(0));
  return total.toString();
}

export function formatLosslessAmount(amount: string, asset: string = 'VND'): string {
  try {
    const bi = parseLosslessAmount(amount);
    // Format with thousands separator
    const formatted = bi.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${formatted} ${asset}`;
  } catch {
    return `${amount} ${asset}`;
  }
}

export function isPositiveAmount(amount: string): boolean {
  try {
    const bi = parseLosslessAmount(amount);
    return bi > BigInt(0);
  } catch {
    return false;
  }
}
