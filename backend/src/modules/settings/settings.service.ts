import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { SystemSettings } from '../../entities/system-settings.entity';
import { WorkflowSettings } from '../../entities/workflow-settings.entity';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { UpdateWorkflowSettingsDto } from './dto/update-workflow-settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(SystemSettings)
    private readonly repo: Repository<SystemSettings>,
    @InjectRepository(WorkflowSettings)
    private readonly workflowRepo: Repository<WorkflowSettings>,
    private readonly dataSource: DataSource,
  ) {}

  async get(): Promise<SystemSettings> {
    let settings = await this.repo.findOne({ where: {} });
    if (!settings) {
      // أول مرة يشتغل فيها النظام لو الـ Seed مكانش اتنفذ
      settings = await this.repo.save(this.repo.create({ companyName: 'اسم الشركة' }));
    }
    return settings;
  }

  async update(dto: UpdateSettingsDto): Promise<SystemSettings> {
    const settings = await this.get();
    Object.assign(settings, dto);
    return this.repo.save(settings);
  }

  // ============================================================
  // إعدادات دورة الاعتماد - إمكانية تخطي المراجعة المالية أو اعتماد المدير العام
  // ============================================================
  async getWorkflowSettings(): Promise<WorkflowSettings> {
    let settings = await this.workflowRepo.findOne({ where: {} });
    if (!settings) {
      settings = await this.workflowRepo.save(this.workflowRepo.create({}));
    }
    return settings;
  }

  async updateWorkflowSettings(dto: UpdateWorkflowSettingsDto): Promise<WorkflowSettings> {
    const settings = await this.getWorkflowSettings();
    Object.assign(settings, dto);
    return this.workflowRepo.save(settings);
  }

  // ============================================================
  // تصفير النظام: بيمسح كل البيانات التشغيلية (الأذون، الاعتمادات،
  // التحويلات، الأرصدة، تسويات العهدة، المستحقات، الشيكات) ويرجع
  // ترقيم الأذون للصفر - بيسيب التكويد الأساسي والمستخدمين زي ما هو
  // ============================================================
  async resetSystem(): Promise<{ message: string }> {
    await this.dataSource.query(`
      TRUNCATE TABLE
        activity_logs,
        attachments,
        voucher_approvals,
        custody_settlement_lines,
        custody_settlements,
        voucher_lines,
        treasury_vouchers,
        treasury_transfers,
        account_balances,
        voucher_sequences,
        vendor_dues,
        customer_dues,
        checks
      RESTART IDENTITY CASCADE;
    `);

    return { message: 'تم تصفير النظام بنجاح - كل الأذون والحركات والأرصدة اتمسحت والتكويد الأساسي والمستخدمين فضلوا زي ما هما' };
  }
}
