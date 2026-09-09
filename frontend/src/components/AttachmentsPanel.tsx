import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

type AttachableType = 'voucher' | 'settlement' | 'transfer';
type AttachmentCategory = 'cheque' | 'invoice' | 'other';

interface AttachmentItem {
  id: number;
  category: AttachmentCategory;
  originalName: string;
  mimeType: string;
  uploadedAt: string;
  uploadedBy?: { username?: string; fullName?: string };
}

const categoryLabels: Record<AttachmentCategory, string> = {
  cheque: 'شيك',
  invoice: 'فاتورة',
  other: 'أخرى',
};

export default function AttachmentsPanel({
  attachableType,
  attachableId,
  readOnly = false,
}: {
  attachableType: AttachableType;
  attachableId: number;
  readOnly?: boolean;
}) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState<AttachmentCategory>('other');
  const [uploadError, setUploadError] = useState('');

  const queryKey = ['attachments', attachableType, attachableId];

  const { data: attachments, isLoading } = useQuery<AttachmentItem[]>({
    queryKey,
    queryFn: async () =>
      (await api.get('/attachments', { params: { attachableType, attachableId } })).data,
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('attachableType', attachableType);
      formData.append('attachableId', String(attachableId));
      formData.append('category', category);
      return (await api.post('/attachments', formData)).data;
    },
    onSuccess: () => {
      setUploadError('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err: any) =>
      setUploadError(err.response?.data?.message ?? 'حصل خطأ أثناء رفع الملف'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => (await api.delete(`/attachments/${id}`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  // بنجيب الملف كـ blob (مش رابط مباشر) عشان التوكن يتبعت مع الطلب، وبعدين نفتحه في تاب جديد
  async function previewFile(attachment: AttachmentItem) {
    const res = await api.get(`/attachments/${attachment.id}/file`, { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    window.open(url, '_blank');
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate(file);
  }

  return (
    <div className="bg-white rounded-xl border border-vault-100 p-6 mb-4 print:hidden">
      <h3 className="font-semibold text-ink mb-4">المرفقات (شيكات / فواتير)</h3>

      {!readOnly && (
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as AttachmentCategory)}
            className="px-3 py-2 rounded-lg border border-vault-100 text-sm"
          >
            <option value="cheque">شيك</option>
            <option value="invoice">فاتورة</option>
            <option value="other">أخرى</option>
          </select>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={handleFileChange}
            className="text-sm"
          />
          {uploadMutation.isPending && (
            <span className="text-sm text-vault-500">جاري الرفع...</span>
          )}
        </div>
      )}

      {uploadError && (
        <div className="mb-4 px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm">
          {uploadError}
        </div>
      )}

      {isLoading && <p className="text-sm text-vault-500">جاري التحميل...</p>}

      {!isLoading && (attachments?.length ?? 0) === 0 && (
        <p className="text-sm text-vault-500">لا يوجد مرفقات حتى الآن</p>
      )}

      {!isLoading && (attachments?.length ?? 0) > 0 && (
        <div className="space-y-2">
          {attachments!.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between border border-vault-50 rounded-lg px-3 py-2 text-sm"
            >
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded-full bg-vault-50 text-vault-700 text-xs">
                  {categoryLabels[a.category]}
                </span>
                <button
                  onClick={() => previewFile(a)}
                  className="text-vault-700 hover:text-gold-700 underline"
                >
                  {a.originalName}
                </button>
                <span className="text-xs text-vault-400">
                  {new Date(a.uploadedAt).toLocaleString('ar-EG')}
                </span>
              </div>
              {!readOnly && (
                <button
                  onClick={() => confirm('تأكيد حذف المرفق؟') && deleteMutation.mutate(a.id)}
                  className="text-red-500 hover:text-red-700 text-xs"
                >
                  حذف
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
