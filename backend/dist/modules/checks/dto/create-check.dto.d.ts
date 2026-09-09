import { CheckDirection } from '../../../entities/check.entity';
export declare class CreateCheckDto {
    checkNumber: string;
    direction: CheckDirection;
    vendorId?: number;
    customerId?: number;
    bankAccountId?: number;
    bankName?: string;
    dueDate: string;
    amount: number;
    notes?: string;
}
