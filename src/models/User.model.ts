import { DataTypes, Model, Optional } from 'sequelize';
import {UserInterface, UserRole} from '../interfaces/user.interface.js';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/database.js';

interface UserCreationAttributes extends Optional<UserInterface, 'id'> {} // Make 'id' optional

export class UserModel
    extends Model<UserInterface, UserCreationAttributes>
    implements UserInterface {
    declare id: string;
    declare username: string
    declare email: string;
    declare password: string
    declare role: UserRole;
    declare phone_number?: string | null; // Optional property, can be null
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;

    // Method to validate password.
    async validatePassword(passwordTextPlain: string): Promise<boolean> {
        return await bcrypt.compare(passwordTextPlain, this.password);
    }
}

UserModel.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(255),
            unique: true,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        phone_number: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        role: {
            type: DataTypes.ENUM('ADMIN', 'CLIENT'),
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'users',
        timestamps: true,
        hooks: {
            beforeCreate: async (user: UserModel) => {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            },
            beforeUpdate: async (user: UserModel) => {
                if (user.changed('password')) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(user.password, salt);
                }
            },
        },
    }
);
