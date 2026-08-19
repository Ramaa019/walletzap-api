import { sequelize } from '../config/database.js';
import { DataTypes, Model, Optional } from 'sequelize';
import { TransactionType } from '../interfaces/transaction.interface.js';
import { CategoryInterface } from '../interfaces/category.interface.js';

type CategoryCreationAttributes = Optional<CategoryInterface, 'id'>; // Make 'id' optional

export class CategoryModel
  extends Model<CategoryInterface, CategoryCreationAttributes>
  implements CategoryInterface
{
  declare id: string;
  declare user_id?: string | null;
  declare name: string;
  declare type: TransactionType;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

CategoryModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('EXPENSE', 'INCOME'),
      allowNull: false,
      defaultValue: 'EXPENSE', // Default value if not provided
    },
  },
  {
    sequelize,
    tableName: 'categories',
    timestamps: true,
    hooks: {
      beforeDestroy: async (category) => {
        // check if system categories have no owner
        if (category.user_id === null) {
          throw new Error('Cannot delete system category');
        }
      },
    },
  }
);
