// src/types/models.ts
export interface Income {
  id?: string;
  amount: number;
  date: Date;
  category: string;
  month: string;
  year: number;
  means: string;
  note?: string;
}

export interface Expense {
  id?: string;
  amount: number;
  date: Date;
  category: string;
  specific_name: string;
  month: string;
  year: number;
  means: string;
  recurring?: boolean;
  note?: string;
}
