export type AccountType = 'CASH' | 'BANK' | 'DIGITAL_WALLET' | 'CREDIT_CARD';

export interface AccountInterface {
  id: string;
  user_id: string;
  name: string;
  balance: number;
  type: AccountType;
  is_default: boolean;
}
