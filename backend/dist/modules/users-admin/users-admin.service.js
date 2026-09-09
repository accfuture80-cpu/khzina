"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersAdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const user_entity_1 = require("../../entities/user.entity");
const role_entity_1 = require("../../entities/role.entity");
const SALT_ROUNDS = 10;
let UsersAdminService = class UsersAdminService {
    constructor(userRepo, roleRepo) {
        this.userRepo = userRepo;
        this.roleRepo = roleRepo;
    }
    async findAll() {
        return this.userRepo.find({ relations: ['roles'], order: { id: 'ASC' } });
    }
    async findOneOrFail(id) {
        const user = await this.userRepo.findOne({ where: { id }, relations: ['roles'] });
        if (!user)
            throw new common_1.NotFoundException('المستخدم غير موجود');
        return user;
    }
    async create(dto) {
        const existing = await this.userRepo.findOne({ where: { username: dto.username } });
        if (existing) {
            throw new common_1.ConflictException('اسم المستخدم ده مستخدم قبل كده');
        }
        const roles = await this.roleRepo.find({ where: { id: (0, typeorm_2.In)(dto.roleIds) } });
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
    async update(id, dto) {
        const user = await this.findOneOrFail(id);
        if (dto.name !== undefined)
            user.name = dto.name;
        if (dto.phone !== undefined)
            user.phone = dto.phone;
        if (dto.isActive !== undefined)
            user.isActive = dto.isActive;
        if (dto.roleIds !== undefined) {
            user.roles = await this.roleRepo.find({ where: { id: (0, typeorm_2.In)(dto.roleIds) } });
        }
        return this.userRepo.save(user);
    }
    async resetPassword(id, dto) {
        const user = await this.findOneOrFail(id);
        user.passwordHash = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);
        await this.userRepo.save(user);
        return { message: 'تم تغيير كلمة السر بنجاح' };
    }
    async deactivate(id) {
        const user = await this.findOneOrFail(id);
        user.isActive = false;
        return this.userRepo.save(user);
    }
    async activate(id) {
        const user = await this.findOneOrFail(id);
        user.isActive = true;
        return this.userRepo.save(user);
    }
};
exports.UsersAdminService = UsersAdminService;
exports.UsersAdminService = UsersAdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], UsersAdminService);
//# sourceMappingURL=users-admin.service.js.map