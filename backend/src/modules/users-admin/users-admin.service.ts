import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import { Role } from '../../entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersAdminService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
  ) {}

  async findAll() {
    return this.userRepo.find({ relations: ['roles'], order: { id: 'ASC' } });
  }

  async findOneOrFail(id: number) {
    const user = await this.userRepo.findOne({ where: { id }, relations: ['roles'] });
    if (!user) throw new NotFoundException('المستخدم غير موجود');
    return user;
  }

  async create(dto: CreateUserDto) {
    const existing = await this.userRepo.findOne({ where: { username: dto.username } });
    if (existing) {
      throw new ConflictException('اسم المستخدم ده مستخدم قبل كده');
    }

    const roles = await this.roleRepo.find({ where: { id: In(dto.roleIds) } });
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = this.userRepo.create({
      name: dto.name,
      username: dto.username,
      passwordHash,
      phone: dto.phone,
      roles,
    });

    return this.userRepo.save(user);
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.findOneOrFail(id);

    if (dto.name !== undefined) user.name = dto.name;
    if (dto.phone !== undefined) user.phone = dto.phone;
    if (dto.isActive !== undefined) user.isActive = dto.isActive;

    if (dto.roleIds !== undefined) {
      user.roles = await this.roleRepo.find({ where: { id: In(dto.roleIds) } });
    }

    return this.userRepo.save(user);
  }

  async resetPassword(id: number, dto: ResetPasswordDto) {
    const user = await this.findOneOrFail(id);
    user.passwordHash = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);
    await this.userRepo.save(user);
    return { message: 'تم تغيير كلمة السر بنجاح' };
  }

  // تعطيل بدل الحذف الفعلي - عشان ميأثرش على سجلات الأذون اللي أنشأها المستخدم
  async deactivate(id: number) {
    const user = await this.findOneOrFail(id);
    user.isActive = false;
    return this.userRepo.save(user);
  }

  async activate(id: number) {
    const user = await this.findOneOrFail(id);
    user.isActive = true;
    return this.userRepo.save(user);
  }
}
