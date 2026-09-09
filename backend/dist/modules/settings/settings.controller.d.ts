import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { UpdateWorkflowSettingsDto } from './dto/update-workflow-settings.dto';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    get(): Promise<import("../../entities/system-settings.entity").SystemSettings>;
    update(dto: UpdateSettingsDto): Promise<import("../../entities/system-settings.entity").SystemSettings>;
    getWorkflowSettings(): Promise<import("../../entities/workflow-settings.entity").WorkflowSettings>;
    updateWorkflowSettings(dto: UpdateWorkflowSettingsDto): Promise<import("../../entities/workflow-settings.entity").WorkflowSettings>;
    resetSystem(): Promise<{
        message: string;
    }>;
}
