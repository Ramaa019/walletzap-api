import { DataTypes, Model, Optional } from 'sequelize';
import {
  AccountInterface,
  AccountType,
} from '../interfaces/account.interface.js';
import { sequelize } from '../config/database.js';

type AccountCreationAttributes = Optional<AccountInterface, 'id'>; // Make 'id' optional

export class AccountModel
  extends Model<AccountInterface, AccountCreationAttributes>
  implements AccountInterface
{
  declare id: string;
  declare user_id: string;
  declare name: string;
  declare balance: number;
  declare type: AccountType;
  declare is_default: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

AccountModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users', // Name of the referenced table
        key: 'id', // Column in the referenced table
      },
      onDelete: 'CASCADE', // Optional: what happens when the referenced user is deleted
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    balance: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    type: {
      type: DataTypes.ENUM('CASH', 'BANK', 'DIGITAL_WALLET', 'CREDIT_CARD'),
      allowNull: false,
      defaultValue: 'CASH',
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'accounts',
    timestamps: true,
  }
);
