import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { Role } from '../../entities/role.entity';
import { UsersAdminService } from './users-admin.service';
import { UsersAdminController } from './users-admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role])],
  controllers: [UsersAdminController],
  providers: [UsersAdminService],
})
export class UsersAdminModule {}
