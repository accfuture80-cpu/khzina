import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Role } from '../../entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
export declare class UsersAdminService {
    private readonly userRepo;
    private readonly roleRepo;
    constructor(userRepo: Repository<User>, roleRepo: Repository<Role>);
    findAll(): Promise<User[]>;
    findOneOrFail(id: number): Promise<User>;
    create(dto: CreateUserDto): Promise<User>;
    update(id: number, dto: UpdateUserDto): Promise<User>;
    resetPassword(id: number, dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    deactivate(id: number): Promise<User>;
    activate(id: number): Promise<User>;
}
