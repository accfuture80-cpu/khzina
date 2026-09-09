import { User } from './user.entity';
export declare enum ActivityAction {
    CREATE = "create",
    UPDATE = "update",
    DELETE = "delete",
    DUPLICATE = "duplicate",
    VIEW = "view",
    APPROVE = "approve",
    REJECT = "reject",
    DISBURSE = "disburse"
}
export declare class ActivityLog {
    id: number;
    user: User;
    action: ActivityAction;
    entityType: string;
    entityId: number;
    details: Record<string, any>;
    createdAt: Date;
}
