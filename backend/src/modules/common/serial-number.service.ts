import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { VoucherSequence } from '../../entities/voucher-sequence.entity';

@Injectable()
export class SerialNumberService {
  /**
   * بيولّد رقم تسلسلي فريد لنوع مستند معين خلال سنة معينة.
   * لازم تتنفذ جوا Transaction (باستخدام manager) عشان تمنع تكرار الرقم
   * لو حصل طلبين في نفس اللحظة (Race Condition).
   *
   * الشكل النهائي: PREFIX-YYYY-000001
   * مثال: EXP-2026-000042 / REV-2026-000017
   */
  async generate(
    manager: EntityManager,
    docType: string, // expense / revenue / settlement / transfer
    prefix: string,
    year: number = new Date().getFullYear(),
  ): Promise<string> {
    // قفل الصف (Pessimistic Lock) عشان لو طلبين جم في نفس اللحظة ميتكررش الرقم
    let sequence = await manager
      .createQueryBuilder(VoucherSequence, 'seq')
      .setLock('pessimistic_write')
      .where('seq.voucherType = :docType AND seq.year = :year', {
        docType,
        year,
      })
      .getOne();

    if (!sequence) {
      sequence = manager.create(VoucherSequence, {
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
}
