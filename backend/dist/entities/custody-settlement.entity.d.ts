import { VoucherLine } from './voucher-line.entity';
import { Employee } from './employee.entity';
import { User } from './user.entity';
import { CustodySettlementLine } from './custody-settlement-line.entity';
export declare enum SettlementStatus {
    DRAFT = "draft",
    APPROVED = "approved"
}
export declare class CustodySettlement {
    id: number;
    serialNumber: string;
    custodyVoucherLine: VoucherLine;
    employee: Employee;
    settlementDate: string;
    status: SettlementStatus;
    createdBy: User;
    lines: CustodySettlementLine[];
    createdAt: Date;
}
