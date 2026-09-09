import { User } from './user.entity';
export declare enum AttachableType {
    VOUCHER = "voucher",
    SETTLEMENT = "settlement",
    TRANSFER = "transfer"
}
export declare enum AttachmentCategory {
    CHEQUE = "cheque",
    INVOICE = "invoice",
    OTHER = "other"
}
export declare class Attachment {
    id: number;
    attachableType: AttachableType;
    attachableId: number;
    category: AttachmentCategory;
    filePath: string;
    originalName: string;
    mimeType: string;
    uploadedBy: User;
    uploadedAt: Date;
}
