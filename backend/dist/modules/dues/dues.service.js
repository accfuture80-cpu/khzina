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
exports.DuesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const XLSX = require("xlsx");
const vendor_due_entity_1 = require("../../entities/vendor-due.entity");
const customer_due_entity_1 = require("../../entities/customer-due.entity");
const vendor_entity_1 = require("../../entities/vendor.entity");
const customer_entity_1 = require("../../entities/customer.entity");
let DuesService = class DuesService {
    constructor(vendorDueRepo, customerDueRepo, vendorRepo, customerRepo, dataSource) {
        this.vendorDueRepo = vendorDueRepo;
        this.customerDueRepo = customerDueRepo;
        this.vendorRepo = vendorRepo;
        this.customerRepo = customerRepo;
        this.dataSource = dataSource;
    }
    parseExcelFile(buffer) {
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        if (rawRows.length === 0) {
            throw new common_1.BadRequestException('الملف فاضي أو الشيت الأول مفيهوش بيانات');
        }
        return rawRows.map((row, index) => {
            const code = String(row['كود'] ?? row['الكود'] ?? row['code'] ?? '').trim();
            const amount = Number(row['المبلغ'] ?? row['amount'] ?? 0);
            const invoiceNumber = String(row['رقم الفاتورة'] ?? row['invoiceNumber'] ?? '').trim();
            const dueDateRaw = row['تاريخ الاستحقاق'] ?? row['dueDate'] ?? '';
            const description = String(row['بيان'] ?? row['description'] ?? '').trim();
            if (!code) {
                throw new common_1.BadRequestException(`الصف رقم ${index + 2} في الإكسيل مفيهوش كود`);
            }
            if (!amount || amount <= 0) {
                throw new common_1.BadRequestException(`الصف رقم ${index + 2} (كود ${code}) المبلغ فيه غلط أو صفر`);
            }
            return {
                code,
                invoiceNumber: invoiceNumber || undefined,
                dueDate: this.normalizeExcelDate(dueDateRaw),
                amount,
                description: description || undefined,
            };
        });
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
    async importVendorDues(buffer) {
        const rows = this.parseExcelFile(buffer);
        const batchId = `V-${Date.now()}`;
        const vendors = await this.vendorRepo.find();
        const vendorByCode = new Map(vendors.map((v) => [v.code, v]));
        const notFoundCodes = [];
        const toInsert = [];
        for (const row of rows) {
            const vendor = vendorByCode.get(row.code);
            if (!vendor) {
                notFoundCodes.push(row.code);
                continue;
            }
            toInsert.push(this.vendorDueRepo.create({
                vendor,
                invoiceNumber: row.invoiceNumber,
                dueDate: row.dueDate,
                amount: row.amount,
                description: row.description,
                status: vendor_due_entity_1.DueStatus.PENDING,
                importBatch: batchId,
            }));
        }
        if (toInsert.length === 0) {
            throw new common_1.BadRequestException(`مفيش ولا صف اتطابق مع أكواد موردين موجودة عندنا. تأكد إن عمود "كود" في الإكسيل مطابق لكود المورد في شاشة تكويد الموردين.`);
        }
        await this.dataSource.transaction(async (manager) => {
            await manager.delete(vendor_due_entity_1.VendorDue, { status: vendor_due_entity_1.DueStatus.PENDING });
            await manager.save(toInsert);
        });
        return {
            imported: toInsert.length,
            skipped: notFoundCodes.length,
            notFoundCodes: [...new Set(notFoundCodes)],
        };
    }
    async importCustomerDues(buffer) {
        const rows = this.parseExcelFile(buffer);
        const batchId = `C-${Date.now()}`;
        const customers = await this.customerRepo.find();
        const customerByCode = new Map(customers.map((c) => [c.code, c]));
        const notFoundCodes = [];
        const toInsert = [];
        for (const row of rows) {
            const customer = customerByCode.get(row.code);
            if (!customer) {
                notFoundCodes.push(row.code);
                continue;
            }
            toInsert.push(this.customerDueRepo.create({
                customer,
                invoiceNumber: row.invoiceNumber,
                dueDate: row.dueDate,
                amount: row.amount,
                description: row.description,
                status: vendor_due_entity_1.DueStatus.PENDING,
                importBatch: batchId,
            }));
        }
        if (toInsert.length === 0) {
            throw new common_1.BadRequestException(`مفيش ولا صف اتطابق مع أكواد عملاء موجودة عندنا. تأكد إن عمود "كود" في الإكسيل مطابق لكود العميل في شاشة تكويد العملاء.`);
        }
        await this.dataSource.transaction(async (manager) => {
            await manager.delete(customer_due_entity_1.CustomerDue, { status: vendor_due_entity_1.DueStatus.PENDING });
            await manager.save(toInsert);
        });
        return {
            imported: toInsert.length,
            skipped: notFoundCodes.length,
            notFoundCodes: [...new Set(notFoundCodes)],
        };
    }
    findAllVendorDues() {
        return this.vendorDueRepo.find({
            relations: ['vendor'],
            order: { dueDate: 'ASC' },
        });
    }
    findAllCustomerDues() {
        return this.customerDueRepo.find({
            relations: ['customer'],
            order: { dueDate: 'ASC' },
        });
    }
    async markVendorDuePaid(id) {
        const due = await this.vendorDueRepo.findOne({ where: { id } });
        if (!due)
            throw new common_1.NotFoundException('المستحق غير موجود');
        due.status = vendor_due_entity_1.DueStatus.PAID;
        return this.vendorDueRepo.save(due);
    }
    async markCustomerDuePaid(id) {
        const due = await this.customerDueRepo.findOne({ where: { id } });
        if (!due)
            throw new common_1.NotFoundException('المستحق غير موجود');
        due.status = vendor_due_entity_1.DueStatus.PAID;
        return this.customerDueRepo.save(due);
    }
    async getDashboardTotals() {
        const vendorPending = await this.vendorDueRepo
            .createQueryBuilder('d')
            .where('d.status = :status', { status: vendor_due_entity_1.DueStatus.PENDING })
            .select('COALESCE(SUM(d.amount), 0)', 'total')
            .addSelect('COUNT(*)', 'count')
            .getRawOne();
        const customerPending = await this.customerDueRepo
            .createQueryBuilder('d')
            .where('d.status = :status', { status: vendor_due_entity_1.DueStatus.PENDING })
            .select('COALESCE(SUM(d.amount), 0)', 'total')
            .addSelect('COUNT(*)', 'count')
            .getRawOne();
        return {
            totalVendorDues: Number(vendorPending?.total || 0),
            vendorDuesCount: Number(vendorPending?.count || 0),
            totalCustomerDues: Number(customerPending?.total || 0),
            customerDuesCount: Number(customerPending?.count || 0),
        };
    }
};
exports.DuesService = DuesService;
exports.DuesService = DuesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(vendor_due_entity_1.VendorDue)),
    __param(1, (0, typeorm_1.InjectRepository)(customer_due_entity_1.CustomerDue)),
    __param(2, (0, typeorm_1.InjectRepository)(vendor_entity_1.Vendor)),
    __param(3, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], DuesService);
//# sourceMappingURL=dues.service.js.map