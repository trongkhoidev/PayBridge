import { NextRequest, NextResponse } from 'next/server';
import { payoutBatchService } from '@/lib/services/batch-service';
import { geminiAdvisorService } from '@/lib/ai/gemini-service';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const batch = await payoutBatchService.getBatch(id);

    if (!batch) {
      return NextResponse.json(
        { success: false, error: `Batch not found: ${id}` },
        { status: 404 }
      );
    }

    const summary = await geminiAdvisorService.summarizeBatch({ batch });

    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'AI advisor error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
