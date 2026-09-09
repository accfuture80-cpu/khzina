import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RoleCode } from '../../../entities/role.entity';

// الأدوار دي بتقدر تعمل أي حاجة في النظام كله، حتى لو الـ Endpoint محدد أدوار تانية بـ @Roles(...)
// مدير النظام + المدير المالي = صلاحية كاملة على كل الشاشات
// ملحوظة: القائمة دي مُصدَّرة (export) عشان أي مكان تاني في الكود بيعمل تحقق يدوي من الأدوار
// (زي decide/disburse في vouchers.service.ts) يستخدم نفس المصدر بدل ما يكرر نفس القائمة
export const FULL_ACCESS_ROLES: RoleCode[] = [RoleCode.SYSTEM_ADMIN, RoleCode.FINANCIAL_MANAGER];

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleCode[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // لو الـ Endpoint مفيهوش @Roles(...) يبقى متاح لأي مستخدم مسجل دخول
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.roles) return false;

    if (user.roles.some((role: RoleCode) => FULL_ACCESS_ROLES.includes(role))) {
      return true;
    }

    return requiredRoles.some((role) => user.roles.includes(role));
  }
}
