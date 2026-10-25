import {
  AIAdvisorService,
  BatchSummaryRequest,
  BatchSummaryResponse,
} from '@/types';
import { formatLosslessAmount } from '../utils/currency';

/**
 * GeminiAdvisorService
 * AI Advisor placeholder.
 * Safe boundaries:
 * 1. Read-only natural language summary and risk flagging.
 * 2. CANNOT approve or execute payouts.
 * 3. Does not call external network if GEMINI_API_KEY is not set.
 */
export class GeminiAdvisorService implements AIAdvisorService {
  private readonly apiKey?: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
  }

  async summarizeBatch(request: BatchSummaryRequest): Promise<BatchSummaryResponse> {
    const { batch } = request;
    const formattedTotal = formatLosslessAmount(batch.sourceAmountTotal, batch.asset);

    // If no key is configured or placeholder key is present, return deterministic structured mock
    if (!this.apiKey || this.apiKey === 'placeholder_gemini_api_key') {
      const notes = [
        `Batch contains ${batch.items.length} payout item(s) totalling ${formattedTotal}.`,
        `Current lifecycle state: ${batch.status}.`,
        `Selected provider: ${batch.provider.toUpperCase()} (Sandbox/Mock simulation).`,
      ];

      const risks: string[] = [];
      if (batch.status === 'DRAFT') {
        notes.push('Batch is currently in draft. Needs recipient validation before approval.');
      } else if (batch.status === 'VALIDATED') {
        notes.push('Batch is validated and awaiting executive sign-off / approval.');
      } else if (batch.status === 'APPROVED') {
        notes.push('Batch is approved and queued for dispatch to provider testnet.');
      }

      if (BigInt(batch.sourceAmountTotal) > BigInt(100_000_000)) {
        risks.push('High value batch (> 100M VND): ensure secondary dual-control approval.');
      }

      return {
        summary: `Summary for batch "${batch.title}": Total ${formattedTotal} allocated across ${batch.items.length} recipient(s). State is currently ${batch.status}.`,
        actionableNotes: notes,
        riskWarnings: risks,
      };
    }

    // When real key is provided in future, actual Gemini API call can be hooked here.
    return {
      summary: `AI analysis active for batch ${batch.id}.`,
      actionableNotes: ['Real Gemini API connection will activate when credentials are valid.'],
      riskWarnings: [],
    };
  }
}

export const geminiAdvisorService = new GeminiAdvisorService();
