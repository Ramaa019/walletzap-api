import { UserModel } from './User.model.js';
import { AccountModel } from './Account.model.js';
import { CategoryModel } from './Category.model.js';
import { TransactionModel } from './Transaction.model.js';

export const setupAssociations = () => {
  // User and Account association
  UserModel.hasMany(AccountModel, {
    foreignKey: 'user_id',
    as: 'accounts',
  });
  AccountModel.belongsTo(UserModel, {
    foreignKey: 'user_id',
    as: 'user',
  });

  // User and Category association
  UserModel.hasMany(CategoryModel, {
    foreignKey: 'user_id',
    as: 'categories',
  });
  CategoryModel.belongsTo(UserModel, {
    foreignKey: 'user_id',
    as: 'user',
  });

  // Transaction and Account association
  TransactionModel.belongsTo(AccountModel, {
    foreignKey: 'account_id',
    as: 'account',
  });
  AccountModel.hasMany(TransactionModel, {
    foreignKey: 'account_id',
    as: 'transactions',
  });

  // Transaction and Category association
  TransactionModel.belongsTo(CategoryModel, {
    foreignKey: 'category_id',
    as: 'category',
  });
  CategoryModel.hasMany(TransactionModel, {
    foreignKey: 'category_id',
    as: 'transactions',
  });
};
