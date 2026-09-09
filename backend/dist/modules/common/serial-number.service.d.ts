import { EntityManager } from 'typeorm';
export declare class SerialNumberService {
    generate(manager: EntityManager, docType: string, prefix: string, year?: number): Promise<string>;
}
