import { NextRequest, NextResponse } from 'next/server';
import { payoutBatchService } from '@/lib/services/batch-service';
import { ExecuteBatchInputSchema } from '@/lib/validation/batch';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parseResult = ExecuteBatchInputSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Execution validation failed',
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const actorId = body.actorId || 'employer_admin_demo';
    const updated = await payoutBatchService.executeBatch(
      id,
      actorId,
      parseResult.data.idempotencyKey
    );

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Execution failed';
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
