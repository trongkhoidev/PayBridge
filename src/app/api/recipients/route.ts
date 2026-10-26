import { NextRequest, NextResponse } from 'next/server';
import { recipientRepository } from '@/lib/repositories/recipient-repository';

export async function GET() {
  try {
    const list = await recipientRepository.listRecipients();
    return NextResponse.json({ success: true, data: list });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to list recipients';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name || !body.accountNumber || !body.bankCode) {
      return NextResponse.json(
        { success: false, error: 'Name, bankCode and accountNumber are required.' },
        { status: 400 }
      );
    }

    const created = await recipientRepository.addRecipient({
      name: body.name,
      role: body.role || 'Contractor',
      email: body.email || '',
      bankCode: body.bankCode,
      bankName: body.bankName || body.bankCode,
      accountNumber: body.accountNumber,
      isVerified: true,
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to add recipient';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
