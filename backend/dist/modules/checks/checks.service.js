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
exports.ChecksService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const XLSX = require("xlsx");
const check_entity_1 = require("../../entities/check.entity");
const vendor_entity_1 = require("../../entities/vendor.entity");
const customer_entity_1 = require("../../entities/customer.entity");
let ChecksService = class ChecksService {
    constructor(checkRepo, vendorRepo, customerRepo) {
        this.checkRepo = checkRepo;
        this.vendorRepo = vendorRepo;
        this.customerRepo = customerRepo;
    }
    findAll() {
        return this.checkRepo.find({
            relations: ['vendor', 'customer', 'bankAccount'],
            order: { dueDate: 'ASC' },
        });
    }
    async findOneOrFail(id) {
        const check = await this.checkRepo.findOne({
            where: { id },
            relations: ['vendor', 'customer', 'bankAccount'],
        });
        if (!check)
            throw new common_1.NotFoundException('الشيك غير موجود');
        return check;
    }
    create(dto) {
        const check = this.checkRepo.create({
            checkNumber: dto.checkNumber,
            direction: dto.direction,
            vendor: dto.vendorId ? { id: dto.vendorId } : undefined,
            customer: dto.customerId ? { id: dto.customerId } : undefined,
            bankAccount: dto.bankAccountId ? { id: dto.bankAccountId } : undefined,
            bankName: dto.bankName,
            dueDate: dto.dueDate,
            amount: dto.amount,
            notes: dto.notes,
            status: check_entity_1.CheckStatus.PENDING,
        });
        return this.checkRepo.save(check);
    }
    async updateStatus(id, status) {
        const check = await this.findOneOrFail(id);
        check.status = status;
        return this.checkRepo.save(check);
    }
    async remove(id) {
        const check = await this.findOneOrFail(id);
        await this.checkRepo.remove(check);
    }
    async getDashboardTotals() {
        const today = new Date().toISOString().slice(0, 10);
        const overdueRow = await this.checkRepo
            .createQueryBuilder('c')
            .where('c.status = :status', { status: check_entity_1.CheckStatus.PENDING })
            .andWhere('c.dueDate < :today', { today })
            .select('COALESCE(SUM(c.amount), 0)', 'total')
            .addSelect('COUNT(*)', 'count')
            .getRawOne();
        const upcomingRow = await this.checkRepo
            .createQueryBuilder('c')
            .where('c.status = :status', { status: check_entity_1.CheckStatus.PENDING })
            .andWhere('c.dueDate >= :today', { today })
            .select('COALESCE(SUM(c.amount), 0)', 'total')
            .addSelect('COUNT(*)', 'count')
            .getRawOne();
        return {
            overdueChecksAmount: Number(overdueRow?.total || 0),
            overdueChecksCount: Number(overdueRow?.count || 0),
            upcomingChecksAmount: Number(upcomingRow?.total || 0),
            upcomingChecksCount: Number(upcomingRow?.count || 0),
        };
    }
    async importChecksFromExcel(buffer) {
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        if (rawRows.length === 0) {
            throw new common_1.BadRequestException('الملف فاضي أو الشيت الأول مفيهوش بيانات');
        }
        const vendors = await this.vendorRepo.find();
        const customers = await this.customerRepo.find();
        const vendorByCode = new Map(vendors.map((v) => [v.code, v]));
        const customerByCode = new Map(customers.map((c) => [c.code, c]));
        const notFoundCodes = [];
        const toInsert = [];
        rawRows.forEach((row, index) => {
            const checkNumber = String(row['رقم الشيك'] ?? row['checkNumber'] ?? '').trim();
            const typeRaw = String(row['النوع'] ?? row['direction'] ?? '').trim();
            const code = String(row['كود'] ?? row['code'] ?? '').trim();
            const dueDateRaw = row['تاريخ الاستحقاق'] ?? row['dueDate'] ?? '';
            const amount = Number(row['المبلغ'] ?? row['amount'] ?? 0);
            const bankName = String(row['اسم البنك'] ?? row['bankName'] ?? '').trim();
            const notes = String(row['ملاحظات'] ?? row['notes'] ?? '').trim();
            if (!checkNumber) {
                throw new common_1.BadRequestException(`الصف رقم ${index + 2} مفيهوش رقم شيك`);
            }
            if (!amount || amount <= 0) {
                throw new common_1.BadRequestException(`الصف رقم ${index + 2} (شيك ${checkNumber}) المبلغ غلط أو صفر`);
            }
            const dueDate = this.normalizeExcelDate(dueDateRaw);
            if (!dueDate) {
                throw new common_1.BadRequestException(`الصف رقم ${index + 2} (شيك ${checkNumber}) تاريخ الاستحقاق غلط أو فاضي`);
            }
            const isReceivable = typeRaw === 'وارد' || typeRaw.toLowerCase() === 'receivable';
            const isPayable = typeRaw === 'صادر' || typeRaw.toLowerCase() === 'payable';
            if (!isReceivable && !isPayable) {
                throw new common_1.BadRequestException(`الصف رقم ${index + 2} (شيك ${checkNumber}): عمود "النوع" لازم يكون "وارد" أو "صادر" بالظبط`);
            }
            let vendor;
            let customer;
            if (isReceivable) {
                customer = customerByCode.get(code);
                if (!customer)
                    notFoundCodes.push(code);
            }
            else {
                vendor = vendorByCode.get(code);
                if (!vendor)
                    notFoundCodes.push(code);
            }
            toInsert.push(this.checkRepo.create({
                checkNumber,
                direction: isReceivable ? check_entity_1.CheckDirection.RECEIVABLE : check_entity_1.CheckDirection.PAYABLE,
                vendor,
                customer,
                bankName: bankName || undefined,
                dueDate,
                amount,
                notes: notes || undefined,
                status: check_entity_1.CheckStatus.PENDING,
            }));
        });
        if (toInsert.length === 0) {
            throw new common_1.BadRequestException('مفيش ولا صف اتقرأ صح من الملف');
        }
        await this.checkRepo.save(toInsert);
        return {
            imported: toInsert.length,
            skippedCodesNotFound: [...new Set(notFoundCodes)],
        };
    }
    normalizeExcelDate(value) {
        if (!value)
            return undefined;
        if (typeof value === 'number') {
            const parsed = XLSX.SSF.parse_date_code(value);
            if (!parsed)
                return undefined;
            return `${parsed.y}-${String(parsed.m).padStart(2, '0')}-${String(parsed.d).padStart(2, '0')}`;
        }
        const asDate = new Date(value);
        if (isNaN(asDate.getTime()))
            return undefined;
        return asDate.toISOString().slice(0, 10);
    }
};
exports.ChecksService = ChecksService;
exports.ChecksService = ChecksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(check_entity_1.Check)),
    __param(1, (0, typeorm_1.InjectRepository)(vendor_entity_1.Vendor)),
    __param(2, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ChecksService);
//# sourceMappingURL=checks.service.js.map