interface UsageCheck {
    where: string;
    count: () => Promise<number>;
}
export declare function assertNotReferenced(entityLabel: string, checks: UsageCheck[], suggestDeactivate?: boolean): Promise<void>;
export {};
