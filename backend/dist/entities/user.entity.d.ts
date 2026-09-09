import { Role } from './role.entity';
export declare class User {
    id: number;
    name: string;
    username: string;
    passwordHash: string;
    phone: string;
    isActive: boolean;
    roles: Role[];
    createdAt: Date;
    updatedAt: Date;
}
