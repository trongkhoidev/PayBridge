export interface RecipientRecord {
  id: string;
  name: string;
  role: string;
  email: string;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  isVerified: boolean;
  totalPaidVND: string;
  lastPayoutDate: string;
}

const INITIAL_RECIPIENTS: RecipientRecord[] = [
  {
    id: 'rec_01',
    name: 'Nguyen Van A',
    role: 'Senior Fullstack Engineer',
    email: 'nguyen.vana@tech-vn.io',
    bankCode: 'VCB',
    bankName: 'Vietcombank',
    accountNumber: '9704050012345678',
    isVerified: true,
    totalPaidVND: '120000000',
    lastPayoutDate: '2026-10-15',
  },
  {
    id: 'rec_02',
    name: 'Tran Thi B',
    role: 'Lead UI/UX Designer',
    email: 'tranthib@designstudio.vn',
    bankCode: 'MB',
    bankName: 'MB Bank',
    accountNumber: '9704220087654321',
    isVerified: true,
    totalPaidVND: '88000000',
    lastPayoutDate: '2026-10-15',
  },
  {
    id: 'rec_03',
    name: 'Le Hoang C',
    role: 'DevOps & Cloud Specialist',
    email: 'le.hoangc@infra.vn',
    bankCode: '9PAY_WALLET',
    bankName: '9Pay E-Wallet',
    accountNumber: '0912345678',
    isVerified: true,
    totalPaidVND: '45000000',
    lastPayoutDate: '2026-09-30',
  },
  {
    id: 'rec_04',
    name: 'Pham Minh D',
    role: 'QA Automation Engineer',
    email: 'pham.minhd@qa-craft.com',
    bankCode: 'TCB',
    bankName: 'Techcombank',
    accountNumber: '19034567890012',
    isVerified: true,
    totalPaidVND: '52000000',
    lastPayoutDate: '2026-10-01',
  },
  {
    id: 'rec_05',
    name: 'Dang Thu E',
    role: 'Smart Contract Auditor',
    email: 'dang.thue@secops.io',
    bankCode: 'ACB',
    bankName: 'Asia Commercial Bank',
    accountNumber: '2468101214',
    isVerified: false,
    totalPaidVND: '0',
    lastPayoutDate: 'Never',
  },
];

const globalForRecipients = globalThis as unknown as {
  __paybridge_recipients_storage?: RecipientRecord[];
};

export class RecipientRepository {
  private get storage(): RecipientRecord[] {
    if (!globalForRecipients.__paybridge_recipients_storage) {
      globalForRecipients.__paybridge_recipients_storage = [...INITIAL_RECIPIENTS];
    }
    return globalForRecipients.__paybridge_recipients_storage;
  }

  async listRecipients(): Promise<RecipientRecord[]> {
    return [...this.storage];
  }

  async addRecipient(recipient: Omit<RecipientRecord, 'id' | 'totalPaidVND' | 'lastPayoutDate'>): Promise<RecipientRecord> {
    const newRecord: RecipientRecord = {
      ...recipient,
      id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      totalPaidVND: '0',
      lastPayoutDate: 'Never',
    };
    this.storage.unshift(newRecord);
    return newRecord;
  }
}

export const recipientRepository = new RecipientRepository();
