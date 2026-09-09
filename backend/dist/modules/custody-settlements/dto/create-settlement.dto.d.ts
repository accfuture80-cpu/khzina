import { SettlementLineDto } from './settlement-line.dto';
export declare class CreateSettlementDto {
    custodyVoucherLineId: number;
    employeeId: number;
    settlementDate: string;
    lines: SettlementLineDto[];
}
