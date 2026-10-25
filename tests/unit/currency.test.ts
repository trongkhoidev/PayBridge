import { describe, it, expect } from 'vitest';
import { sumAmounts, parseLosslessAmount, formatLosslessAmount } from '@/lib/utils/currency';

describe('Currency and Lossless Precision Utils', () => {
  it('parses valid integer amount strings to BigInt', () => {
    expect(parseLosslessAmount('1000000')).toBe(BigInt(1000000));
  });

  it('rejects decimal points and invalid characters to prevent precision loss', () => {
    expect(() => parseLosslessAmount('100.50')).toThrow();
    expect(() => parseLosslessAmount('-500')).toThrow();
    expect(() => parseLosslessAmount('abc')).toThrow();
  });

  it('accurately sums large amounts without floating point roundoff errors', () => {
    const amounts = [
      '15000000', // 15M VND
      '22000000', // 22M VND
      '8500000',  // 8.5M VND
    ];
    const total = sumAmounts(amounts);
    expect(total).toBe('45500000');
  });

  it('formats amount with commas and asset symbol', () => {
    expect(formatLosslessAmount('45500000', 'VND')).toBe('45,500,000 VND');
  });
});
