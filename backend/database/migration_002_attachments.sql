-- تعديل قاعدة بيانات: إضافة جدول "المرفقات" (شيكات/فواتير/إلخ) المرتبطة بالأذون والتسويات والتحويلات
-- آمن يتنفذ أكتر من مرة (كل جزء بيتحقق الأول إنه مش موجود قبل ما يعمله)

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attachments_attachable_type_enum') THEN
    CREATE TYPE attachments_attachable_type_enum AS ENUM ('voucher', 'settlement', 'transfer');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attachments_category_enum') THEN
    CREATE TYPE attachments_category_enum AS ENUM ('cheque', 'invoice', 'other');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS attachments (
  id SERIAL PRIMARY KEY,
  attachable_type attachments_attachable_type_enum NOT NULL,
  attachable_id INTEGER NOT NULL,
  category attachments_category_enum NOT NULL DEFAULT 'other',
  file_path VARCHAR(500) NOT NULL,
  original_name VARCHAR(255),
  mime_type VARCHAR(100),
  uploaded_by INTEGER REFERENCES users(id),
  uploaded_at TIMESTAMP NOT NULL DEFAULT now()
);

-- فهرس عشان استرجاع مرفقات إذن/تسوية/تحويل معين يبقى سريع
CREATE INDEX IF NOT EXISTS idx_attachments_attachable
  ON attachments (attachable_type, attachable_id);
