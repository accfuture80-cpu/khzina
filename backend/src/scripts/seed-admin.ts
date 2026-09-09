import * as bcrypt from 'bcrypt';
import AppDataSource from '../config/typeorm.config';
import { User } from '../entities/user.entity';
import { Role, RoleCode } from '../entities/role.entity';

async function seedAdmin() {
  await AppDataSource.initialize();

  const roleRepo = AppDataSource.getRepository(Role);
  const userRepo = AppDataSource.getRepository(User);

  let adminRole = await roleRepo.findOne({ where: { code: RoleCode.SYSTEM_ADMIN } });
  if (!adminRole) {
    adminRole = await roleRepo.save(
      roleRepo.create({ code: RoleCode.SYSTEM_ADMIN, name: 'مدير النظام' }),
    );
  }

  const existing = await userRepo.findOne({ where: { username: 'admin' } });
  if (existing) {
    console.log('⚠️  المستخدم admin موجود بالفعل، مفيش حاجة اتعملت.');
    await AppDataSource.destroy();
    return;
  }

  const passwordHash = await bcrypt.hash('Admin@123', 10);

  await userRepo.save(
    userRepo.create({
      name: 'مدير النظام',
      username: 'admin',
      passwordHash,
      isActive: true,
      roles: [adminRole],
    }),
  );

  console.log('✅ تم إنشاء مستخدم مدير النظام بنجاح:');
  console.log('   اسم المستخدم: admin');
  console.log('   كلمة السر: Admin@123');
  console.log('⚠️  غيّر كلمة السر دي فورًا بعد أول دخول من شاشة المستخدمين.');

  await AppDataSource.destroy();
}

seedAdmin().catch((err) => {
  console.error('حصل خطأ أثناء إنشاء المستخدم:', err);
  process.exit(1);
});
