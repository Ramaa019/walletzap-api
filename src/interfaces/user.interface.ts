export type UserRole = 'ADMIN' | 'CLIENT';

export interface UserInterface {
    id: string;
    username: string;
    email: string;
    password: string;
    role: UserRole;
    phone_number?: string | null; // Optional property, can be null
}