import { VoucherLineType } from '../../../entities/voucher-line.entity';
export declare class VoucherLineDto {
    lineType: VoucherLineType;
    mainCategoryId?: number;
    subCategoryId?: number;
    costCenterId?: number;
    employeeId?: number;
    vehicleId?: number;
    vendorId?: number;
    customerId?: number;
    amount: number;
    description?: string;
}
