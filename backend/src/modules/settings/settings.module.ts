import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemSettings } from '../../entities/system-settings.entity';
import { WorkflowSettings } from '../../entities/workflow-settings.entity';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SystemSettings, WorkflowSettings])],
  controllers: [SettingsController],
  providers: [SettingsService],
})
export class SettingsModule {}
