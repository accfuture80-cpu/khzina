import { ConflictException } from '@nestjs/common';

// كل عنصر في checks بيمثل مكان محتمل يكون العنصر مستخدم فيه (بند إذن، بند تسوية عهدة...)
// لو أي واحد فيهم لقى استخدام، بنمنع الحذف ونرجّع رسالة واضحة بدل ما نسيب الداتابيز
// ترمي خطأ Foreign Key غير مفهوم للمستخدم.
interface UsageCheck {
  where: string; // اسم المكان بالعربي عشان الرسالة (مثلاً: "أذون الصرف/الإيراد")
  count: () => Promise<number>;
}

export async function assertNotReferenced(
  entityLabel: string,
  checks: UsageCheck[],
  suggestDeactivate = false,
): Promise<void> {
  for (const check of checks) {
    const count = await check.count();
    if (count > 0) {
      const hint = suggestDeactivate
        ? ' يمكنك إيقاف تفعيله بدلاً من حذفه.'
        : '';
      throw new ConflictException(
        `لا يمكن حذف ${entityLabel} لأنه مستخدم بالفعل في ${check.where} (${count} حركة).${hint}`,
      );
    }
  }
}
