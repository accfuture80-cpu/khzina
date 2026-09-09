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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseCategorySub = void 0;
const typeorm_1 = require("typeorm");
const expense_category_main_entity_1 = require("./expense-category-main.entity");
let ExpenseCategorySub = class ExpenseCategorySub {
};
exports.ExpenseCategorySub = ExpenseCategorySub;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ExpenseCategorySub.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, length: 30 }),
    __metadata("design:type", String)
], ExpenseCategorySub.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 150 }),
    __metadata("design:type", String)
], ExpenseCategorySub.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => expense_category_main_entity_1.ExpenseCategoryMain),
    (0, typeorm_1.JoinColumn)({ name: 'main_category_id' }),
    __metadata("design:type", expense_category_main_entity_1.ExpenseCategoryMain)
], ExpenseCategorySub.prototype, "mainCategory", void 0);
exports.ExpenseCategorySub = ExpenseCategorySub = __decorate([
    (0, typeorm_1.Entity)('expense_categories_sub')
], ExpenseCategorySub);
//# sourceMappingURL=expense-category-sub.entity.js.map