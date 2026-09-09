import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ChecksService } from './checks.service';
import { CreateCheckDto } from './dto/create-check.dto';
import { CheckStatus } from '../../entities/check.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleCode } from '../../entities/role.entity';

const CAN_MANAGE = [RoleCode.ACCOUNTANT, RoleCode.TREASURY_ACCOUNTANT, RoleCode.SYSTEM_ADMIN];

@Controller('checks')
export class ChecksController {
  constructor(private readonly checksService: ChecksService) {}

  @Get()
  findAll() {
    return this.checksService.findAll();
  }

  @Get('dashboard-totals')
  getDashboardTotals() {
    return this.checksService.getDashboardTotals();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.checksService.findOneOrFail(id);
  }

  @Post()
  @Roles(...CAN_MANAGE)
  create(@Body() dto: CreateCheckDto) {
    return this.checksService.create(dto);
  }

  @Post('import')
  @Roles(...CAN_MANAGE)
  @UseInterceptors(FileInterceptor('file'))
  async importChecks(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('لازم ترفع ملف إكسيل');
    return this.checksService.importChecksFromExcel(file.buffer);
  }

  @Patch(':id/mark-collected')
  @Roles(...CAN_MANAGE)
  markCollected(@Param('id', ParseIntPipe) id: number) {
    return this.checksService.updateStatus(id, CheckStatus.COLLECTED);
  }

  @Patch(':id/mark-bounced')
  @Roles(...CAN_MANAGE)
  markBounced(@Param('id', ParseIntPipe) id: number) {
    return this.checksService.updateStatus(id, CheckStatus.BOUNCED);
  }

  @Delete(':id')
  @Roles(...CAN_MANAGE)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.checksService.remove(id);
  }
}
