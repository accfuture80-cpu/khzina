import { DataSource, Repository } from 'typeorm';
import { SystemSettings } from '../../entities/system-settings.entity';
import { WorkflowSettings } from '../../entities/workflow-settings.entity';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { UpdateWorkflowSettingsDto } from './dto/update-workflow-settings.dto';
export declare class SettingsService {
    private readonly repo;
    private readonly workflowRepo;
    private readonly dataSource;
    constructor(repo: Repository<SystemSettings>, workflowRepo: Repository<WorkflowSettings>, dataSource: DataSource);
    get(): Promise<SystemSettings>;
    update(dto: UpdateSettingsDto): Promise<SystemSettings>;
    getWorkflowSettings(): Promise<WorkflowSettings>;
    updateWorkflowSettings(dto: UpdateWorkflowSettingsDto): Promise<WorkflowSettings>;
    resetSystem(): Promise<{
        message: string;
    }>;
}
