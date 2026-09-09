import { DeepPartial, Repository } from 'typeorm';
export declare abstract class BaseCrudService<T extends {
    id: number;
}> {
    protected readonly repository: Repository<T>;
    private readonly relations;
    protected constructor(repository: Repository<T>, relations?: string[]);
    findAll(): Promise<T[]>;
    findOneOrFail(id: number): Promise<T>;
    create(data: DeepPartial<T>): Promise<T>;
    update(id: number, data: DeepPartial<T>): Promise<T>;
    remove(id: number): Promise<void>;
    protected assertRemovable(entity: T): Promise<void>;
}
