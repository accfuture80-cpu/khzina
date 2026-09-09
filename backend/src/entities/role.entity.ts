import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

// القيم الثابتة لأكواد الأدوار - تُستخدم في منطق الاعتماد بالباك اند
export enum RoleCode {
  ACCOUNTANT = 'accountant',
  ADMIN_MANAGER = 'admin_manager',
  PRODUCTION_MANAGER = 'production_manager',
  FINANCIAL_MANAGER = 'financial_manager',
  GENERAL_MANAGER = 'general_manager',
  TREASURY_ACCOUNTANT = 'treasury_accountant',
  SYSTEM_ADMIN = 'system_admin', // إدارة المستخدمين والإعدادات فقط - مفصول عن أدوار العمل المالية
}

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  code: RoleCode;

  @Column({ length: 150 })
  name: string;
}
