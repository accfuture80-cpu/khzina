import { SetMetadata } from '@nestjs/common';
import { RoleCode } from '../../../entities/role.entity';

export const ROLES_KEY = 'roles';

// استخدام: @Roles(RoleCode.FINANCIAL_MANAGER, RoleCode.GENERAL_MANAGER)
export const Roles = (...roles: RoleCode[]) => SetMetadata(ROLES_KEY, roles);
