export type TransactionType = 'EXPENSE' | 'INCOME';

export interface TransactionInterface {
    id: string;
    account_id: string;
    category_id?: string | null;
    amount: number;
    type: TransactionType;
    description: string;
}