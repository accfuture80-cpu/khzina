import { CustodySettlement } from './custody-settlement.entity';
import { ExpenseCategoryMain } from './expense-category-main.entity';
import { ExpenseCategorySub } from './expense-category-sub.entity';
import { CostCenter } from './cost-center.entity';
export declare class CustodySettlementLine {
    id: number;
    settlement: CustodySettlement;
    mainCategory: ExpenseCategoryMain;
    subCategory: ExpenseCategorySub;
    costCenter: CostCenter;
    amount: number;
    description: string;
}
