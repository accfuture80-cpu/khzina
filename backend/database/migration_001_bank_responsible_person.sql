-- إضافة عمود "المسؤول" لجدول البنوك (bank_accounts)
-- المحافظ الإلكترونية أصلاً فيها owner_name، البنوك كانت ناقصة نفس الفكرة

ALTER TABLE bank_accounts
  ADD COLUMN IF NOT EXISTS responsible_person VARCHAR(150);
