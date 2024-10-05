// Declare global interfaces
declare global {
  interface Account {
    id: string;
    name: string;
    amount: number;
    percentage: number | null;
    baseValue: number;   // The original amount used as the baseline
  }

  interface Period {
    id: string;
    period: string;
    accounts: Account[];
    createdAt: Date;
  }
}

export {}; // This is necessary to make the file a module and allow global augmentation
