import { UsersAdminService } from './users-admin.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
export declare class UsersAdminController {
    private readonly usersAdminService;
    constructor(usersAdminService: UsersAdminService);
    findAll(): Promise<import("../../entities/user.entity").User[]>;
    findOne(id: number): Promise<import("../../entities/user.entity").User>;
    create(dto: CreateUserDto): Promise<import("../../entities/user.entity").User>;
    update(id: number, dto: UpdateUserDto): Promise<import("../../entities/user.entity").User>;
    resetPassword(id: number, dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    deactivate(id: number): Promise<import("../../entities/user.entity").User>;
    activate(id: number): Promise<import("../../entities/user.entity").User>;
}
