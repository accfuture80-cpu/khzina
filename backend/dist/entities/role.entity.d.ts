export declare enum RoleCode {
    ACCOUNTANT = "accountant",
    ADMIN_MANAGER = "admin_manager",
    PRODUCTION_MANAGER = "production_manager",
    FINANCIAL_MANAGER = "financial_manager",
    GENERAL_MANAGER = "general_manager",
    TREASURY_ACCOUNTANT = "treasury_accountant",
    SYSTEM_ADMIN = "system_admin"
}
export declare class Role {
    id: number;
    code: RoleCode;
    name: string;
}
