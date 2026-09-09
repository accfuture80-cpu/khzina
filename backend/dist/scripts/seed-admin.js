"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = require("bcrypt");
const typeorm_config_1 = require("../config/typeorm.config");
const user_entity_1 = require("../entities/user.entity");
const role_entity_1 = require("../entities/role.entity");
async function seedAdmin() {
    await typeorm_config_1.default.initialize();
    const roleRepo = typeorm_config_1.default.getRepository(role_entity_1.Role);
    const userRepo = typeorm_config_1.default.getRepository(user_entity_1.User);
    let adminRole = await roleRepo.findOne({ where: { code: role_entity_1.RoleCode.SYSTEM_ADMIN } });
    if (!adminRole) {
        adminRole = await roleRepo.save(roleRepo.create({ code: role_entity_1.RoleCode.SYSTEM_ADMIN, name: 'مدير النظام' }));
    }
    const existing = await userRepo.findOne({ where: { username: 'admin' } });
    if (existing) {
        console.log('⚠️  المستخدم admin موجود بالفعل، مفيش حاجة اتعملت.');
        await typeorm_config_1.default.destroy();
        return;
    }
    const passwordHash = await bcrypt.hash('Admin@123', 10);
    await userRepo.save(userRepo.create({
        name: 'مدير النظام',
        username: 'admin',
        passwordHash,
        isActive: true,
        roles: [adminRole],
    }));
    console.log('✅ تم إنشاء مستخدم مدير النظام بنجاح:');
    console.log('   اسم المستخدم: admin');
    console.log('   كلمة السر: Admin@123');
    console.log('⚠️  غيّر كلمة السر دي فورًا بعد أول دخول من شاشة المستخدمين.');
    await typeorm_config_1.default.destroy();
}
seedAdmin().catch((err) => {
    console.error('حصل خطأ أثناء إنشاء المستخدم:', err);
    process.exit(1);
});
//# sourceMappingURL=seed-admin.js.map