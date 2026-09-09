"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseCrudService = void 0;
const common_1 = require("@nestjs/common");
class BaseCrudService {
    constructor(repository, relations = []) {
        this.repository = repository;
        this.relations = relations;
    }
    findAll() {
        return this.repository.find({ order: { id: 'ASC' }, relations: this.relations });
    }
    async findOneOrFail(id) {
        const entity = await this.repository.findOne({
            where: { id },
            relations: this.relations,
        });
        if (!entity)
            throw new common_1.NotFoundException('العنصر غير موجود');
        return entity;
    }
    create(data) {
        const entity = this.repository.create(data);
        return this.repository.save(entity);
    }
    async update(id, data) {
        const entity = await this.findOneOrFail(id);
        Object.assign(entity, data);
        return this.repository.save(entity);
    }
    async remove(id) {
        const entity = await this.findOneOrFail(id);
        await this.assertRemovable(entity);
        await this.repository.remove(entity);
    }
    async assertRemovable(entity) { }
}
exports.BaseCrudService = BaseCrudService;
//# sourceMappingURL=base-crud.service.js.map