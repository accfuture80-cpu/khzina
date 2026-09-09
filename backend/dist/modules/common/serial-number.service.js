"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SerialNumberService = void 0;
const common_1 = require("@nestjs/common");
const voucher_sequence_entity_1 = require("../../entities/voucher-sequence.entity");
let SerialNumberService = class SerialNumberService {
    async generate(manager, docType, prefix, year = new Date().getFullYear()) {
        let sequence = await manager
            .createQueryBuilder(voucher_sequence_entity_1.VoucherSequence, 'seq')
            .setLock('pessimistic_write')
            .where('seq.voucherType = :docType AND seq.year = :year', {
            docType,
            year,
        })
            .getOne();
        if (!sequence) {
            sequence = manager.create(voucher_sequence_entity_1.VoucherSequence, {
                voucherType: docType,
                year,
                lastNumber: 0,
            });
        }
        sequence.lastNumber += 1;
        await manager.save(sequence);
        const paddedNumber = String(sequence.lastNumber).padStart(6, '0');
        return `${prefix}-${year}-${paddedNumber}`;
    }
};
exports.SerialNumberService = SerialNumberService;
exports.SerialNumberService = SerialNumberService = __decorate([
    (0, common_1.Injectable)()
], SerialNumberService);
//# sourceMappingURL=serial-number.service.js.map