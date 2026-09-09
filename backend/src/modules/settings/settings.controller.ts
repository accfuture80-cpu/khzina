import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { UpdateWorkflowSettingsDto } from './dto/update-workflow-settings.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleCode } from '../../entities/role.entity';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // متاحة لأي مستخدم مسجل دخول (تُستخدم في هيدر الطباعة مثلاً)
  @Get()
  get() {
    return this.settingsService.get();
  }

  @Patch()
  @Roles(RoleCode.SYSTEM_ADMIN)
  update(@Body() dto: UpdateSettingsDto) {
    return this.settingsService.update(dto);
  }

  // متاحة لأي مستخدم مسجل دخول - عشان الباك اند يقدر يستخدمها في منطق الاعتماد
  // (كل مستخدم يقدر يشوف دورة العمل الحالية حتى لو مش هو اللي يعدلها)
  @Get('workflow')
  getWorkflowSettings() {
    return this.settingsService.getWorkflowSettings();
  }

  @Patch('workflow')
  @Roles(RoleCode.SYSTEM_ADMIN)
  updateWorkflowSettings(@Body() dto: UpdateWorkflowSettingsDto) {
    return this.settingsService.updateWorkflowSettings(dto);
  }

  // تصفير النظام بالكامل - مدير النظام بس، وإجراء لا رجعة فيه
  @Post('reset-system')
  @Roles(RoleCode.SYSTEM_ADMIN)
  resetSystem() {
    return this.settingsService.resetSystem();
  }
}
