import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../entities/role.entity';

@Controller('roles')
export class RolesController {
  constructor(@InjectRepository(Role) private readonly repo: Repository<Role>) {}

  @Get()
  findAll() {
    return this.repo.find();
  }
}
