import { ExpenseCategoryMain } from './expense-category-main.entity';
export declare class ExpenseCategorySub {
    id: number;
    code: string;
    name: string;
    mainCategory: ExpenseCategoryMain;
}
