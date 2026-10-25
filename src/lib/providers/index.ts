import { PayoutProvider } from '@/types';
import { MockPayoutProvider } from './mock-provider';
import { NinePayPayoutProvider } from './ninepay-placeholder';

let singletonProvider: PayoutProvider | null = null;

export function getPayoutProvider(): PayoutProvider {
  if (singletonProvider) {
    return singletonProvider;
  }

  const selectedProvider = process.env.PAYOUT_PROVIDER_DEFAULT || 'mock';

  if (selectedProvider === 'ninepay') {
    singletonProvider = new NinePayPayoutProvider();
  } else {
    singletonProvider = new MockPayoutProvider();
  }

  return singletonProvider;
}

export * from './mock-provider';
export * from './ninepay-placeholder';
