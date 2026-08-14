import { TransactionType } from './transaction.interface.js';

export interface CategoryInterface {
  id: string;
  user_id?: string | null;
  name: string;
  type: TransactionType;
}
