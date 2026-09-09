"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertNotReferenced = assertNotReferenced;
const common_1 = require("@nestjs/common");
async function assertNotReferenced(entityLabel, checks, suggestDeactivate = false) {
    for (const check of checks) {
        const count = await check.count();
        if (count > 0) {
            const hint = suggestDeactivate
                ? ' يمكنك إيقاف تفعيله بدلاً من حذفه.'
                : '';
            throw new common_1.ConflictException(`لا يمكن حذف ${entityLabel} لأنه مستخدم بالفعل في ${check.where} (${count} حركة).${hint}`);
        }
    }
}
//# sourceMappingURL=assert-not-referenced.js.map