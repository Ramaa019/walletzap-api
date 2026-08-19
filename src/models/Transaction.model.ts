import { sequelize } from '../config/database.js';
import { DataTypes, Model, Optional } from 'sequelize';
import {
  TransactionInterface,
  TransactionType,
} from '../interfaces/transaction.interface.js';

type TransactionCreationAttributes = Optional<TransactionInterface, 'id'>; // Make 'id' optional

export class TransactionModel
  extends Model<TransactionInterface, TransactionCreationAttributes>
  implements TransactionInterface
{
  declare id: string;
  declare account_id?: string | null;
  declare category_id?: string | null;
  declare amount: number;
  declare type: TransactionType;
  declare description: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

TransactionModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    account_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'accounts',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('EXPENSE', 'INCOME'),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'transactions',
    timestamps: true,
  }
);
