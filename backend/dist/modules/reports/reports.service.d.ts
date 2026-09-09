import { Repository } from 'typeorm';
import { TreasuryVoucher } from '../../entities/treasury-voucher.entity';
import { TreasuryTransfer, AccountKind } from '../../entities/treasury-transfer.entity';
import { AccountBalance } from '../../entities/account-balance.entity';
import { VoucherLine } from '../../entities/voucher-line.entity';
import { CustodySettlement } from '../../entities/custody-settlement.entity';
export declare class ReportsService {
    private readonly voucherRepo;
    private readonly transferRepo;
    private readonly balanceRepo;
    private readonly voucherLineRepo;
    private readonly settlementRepo;
    constructor(voucherRepo: Repository<TreasuryVoucher>, transferRepo: Repository<TreasuryTransfer>, balanceRepo: Repository<AccountBalance>, voucherLineRepo: Repository<VoucherLine>, settlementRepo: Repository<CustodySettlement>);
    getAccountStatement(accountType: AccountKind, accountId: number, fromDate?: string, toDate?: string): Promise<{
        summary: {
            previousBalance: number;
            totalRevenue: number;
            treasuryFunding: number;
            totalExpense: number;
            transfersIn: number;
            transfersOut: number;
            periodNet: number;
            closingBalance: number;
            currentBalance: number;
        };
        transactions: {
            voucherId: any;
            serialNumber: any;
            date: any;
            voucherType: any;
            lineType: any;
            amount: number;
            description: any;
            mainCategory: any;
            subCategory: any;
            costCenter: any;
        }[];
        byCategory: {
            mainCategory: string;
            subCategory: string;
            costCenter: string;
            amount: number;
            count: number;
        }[];
        byVoucher: {
            voucherId: number;
            serialNumber: string;
            date: string;
            voucherType: string;
            amount: number;
        }[];
    }>;
    getVendorsStatement(fromDate?: string, toDate?: string): Promise<{
        vendorId: any;
        vendorName: any;
        vendorCode: any;
        totalPaid: number;
        vouchersCount: number;
        lastPaymentDate: any;
    }[]>;
    getCustomersStatement(fromDate?: string, toDate?: string): Promise<{
        customerId: any;
        customerName: any;
        customerCode: any;
        totalCollected: number;
        vouchersCount: number;
        lastCollectionDate: any;
    }[]>;
    getCustodySettlementsStatement(fromDate?: string, toDate?: string): Promise<{
        employeeId: any;
        employeeName: any;
        employeeCode: any;
        settlementsCount: number;
        totalSettled: number;
        totalCustodyGranted: number;
        lastSettlementDate: any;
    }[]>;
    getExpensesReport(fromDate?: string, toDate?: string): Promise<{
        voucherId: any;
        date: any;
        serialNumber: any;
        costCenter: any;
        mainCategory: any;
        subCategory: any;
        account: any;
        description: any;
        amount: number;
    }[]>;
}
