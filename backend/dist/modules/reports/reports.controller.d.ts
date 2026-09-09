import { ReportsService } from './reports.service';
import { AccountKind } from '../../entities/treasury-transfer.entity';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getAccountStatement(accountType: AccountKind, accountId: string, fromDate?: string, toDate?: string): Promise<{
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
