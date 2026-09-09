import { NotFoundException } from '@nestjs/common';
import { DeepPartial, Repository } from 'typeorm';

// كلاس أساسي بيوفر عمليات (إضافة/تعديل/حذف/عرض) الجاهزة
// لأي جدول تكويد بسيط (فروع، بنوك، محافظ، مراكز تكلفة...)
// كل خدمة خاصة بجدول بترث منه بدل ما تكرر نفس الكود
export abstract class BaseCrudService<T extends { id: number }> {
  protected constructor(
    protected readonly repository: Repository<T>,
    // أسماء العلاقات اللي المفروض تتحمّل مع كل عنصر (زي 'currency' أو 'mainCategory')
    // عشان تظهر في شاشة التكويد العامة من غير ما نحتاج نعمل Controller مخصص لكل جدول
    private readonly relations: string[] = [],
  ) {}

  findAll(): Promise<T[]> {
    return this.repository.find({ order: { id: 'ASC' } as any, relations: this.relations });
  }

  async findOneOrFail(id: number): Promise<T> {
    const entity = await this.repository.findOne({
      where: { id } as any,
      relations: this.relations,
    });
    if (!entity) throw new NotFoundException('العنصر غير موجود');
    return entity;
  }

  create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async update(id: number, data: DeepPartial<T>): Promise<T> {
    const entity = await this.findOneOrFail(id);
    Object.assign(entity, data);
    return this.repository.save(entity);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.findOneOrFail(id);
    // بيسمح للأصناف الوارثة تمنع الحذف لو العنصر مستخدم في مكان تاني (إذن، تسوية...)
    await this.assertRemovable(entity);
    await this.repository.remove(entity);
  }

  // Hook فاضي بالـ Default - أي خدمة محتاجة تمنع الحذف بترثه وتعمل override
  protected async assertRemovable(entity: T): Promise<void> {}
}
