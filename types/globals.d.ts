// Declare global interfaces
declare global {
  interface Account {
    id: string;
    name: string;
    amount: number;
  }

  interface Month {
    id: string;
    month: string;
    accounts: Account[];
    createdAt: Date;
  }
}

export {}; // This is necessary to make the file a module and allow global augmentation
