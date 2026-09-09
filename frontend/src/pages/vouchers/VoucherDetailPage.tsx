import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import PrintHeader from '../../components/PrintHeader';
import { amountToArabicWords } from '../../utils/amountToArabicWords';
import AttachmentsPanel from '../../components/AttachmentsPanel';

const statusLabels: Record<string, string> = {
  draft: 'مسودة',
  pending_first_approval: 'بانتظار الاعتماد الأول',
  pending_financial_review: 'بانتظار المراجعة المالية',
  pending_gm_approval: 'بانتظار اعتماد المدير العام',
  approved_final: 'معتمد نهائيًا',
  disbursed: 'مصروف',
  rejected: 'مرفوض',
};

// اسم حالة "مصروف" لازم يبقى "تم التحصيل" لو الإذن إيراد مش صرف
function statusLabelFor(status: string, voucherType: 'expense' | 'revenue') {
  if (status === 'disbursed' && voucherType === 'revenue') return 'تم التحصيل';
  return statusLabels[status] ?? status;
}

export default function VoucherDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { hasRole, user } = useAuth();
  const [comment, setComment] = useState('');

  const { data: voucher, isLoading } = useQuery({
    queryKey: ['voucher', id],
    queryFn: async () => (await api.get(`/vouchers/${id}`)).data,
  });

  const { data: history } = useQuery({
    queryKey: ['voucher-approvals', id],
    queryFn: async () => (await api.get(`/vouchers/${id}/approvals`)).data,
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['voucher', id] });
    queryClient.invalidateQueries({ queryKey: ['voucher-approvals', id] });
  }

  const submitMutation = useMutation({
    mutationFn: async () => (await api.post(`/vouchers/${id}/submit`)).data,
    onSuccess: invalidate,
  });

  const decideMutation = useMutation({
    mutationFn: async (decision: 'approved' | 'rejected') =>
      (await api.post(`/vouchers/${id}/decide`, { decision, comment })).data,
    onSuccess: () => {
      setComment('');
      invalidate();
    },
  });

  const disburseMutation = useMutation({
    mutationFn: async () => (await api.post(`/vouchers/${id}/disburse`)).data,
    onSuccess: invalidate,
  });

  const duplicateMutation = useMutation({
    mutationFn: async () => (await api.post(`/vouchers/${id}/duplicate`)).data,
    // يودّي على شاشة التعديل على طول بدل شاشة العرض - عشان يراجع وياخد بياناته وهو جاهز يعدّل
    onSuccess: (v) => navigate(`/vouchers/${v.id}/edit`),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => (await api.delete(`/vouchers/${id}`)).data,
    onSuccess: () => navigate('/vouchers'),
  });

  if (isLoading || !voucher) return <p className="text-vault-500">جاري التحميل...</p>;

  // تحديد هل المستخدم الحالي يقدر ياخد قرار في الخطوة الحالية
  // مدير النظام والمدير المالي عندهم صلاحية كاملة (نفس القاعدة المطبقة في الباك اند) - يقدروا يعتمدوا بدل أي حد
  const hasFullAccess = hasRole('system_admin', 'financial_manager');
  const canDecide =
    hasFullAccess ||
    (voucher.status === 'pending_first_approval' &&
      hasRole(voucher.approvalPath === 'admin_manager' ? 'admin_manager' : 'production_manager')) ||
    (voucher.status === 'pending_financial_review' && hasRole('financial_manager')) ||
    (voucher.status === 'pending_gm_approval' && hasRole('general_manager'));

  const canSubmit = voucher.status === 'draft' || voucher.status === 'rejected';
  const canDisburse =
    voucher.status === 'approved_final' && (hasFullAccess || hasRole('treasury_accountant'));
  // قاعدة الحذف: مدير النظام يحذف أي إذن، والمحاسب يحذف بس المسودة اللي هو نفسه عملها
  const canDelete =
    hasRole('system_admin') ||
    (hasRole('accountant') && voucher.status === 'draft' && voucher.createdBy?.id === user?.id);
  // نفس شرط قابلية التعديل في الباك اند: مسودة/مرفوض لأي حد شارك في الإذن، أو صاحب صلاحية كاملة/أمين خزينة في أي حالة
  const canEdit =
    voucher.status === 'draft' || voucher.status === 'rejected' || hasFullAccess || hasRole('treasury_accountant');

  return (
    <div>
      <PrintHeader />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-ink mb-1">
            إذن رقم {voucher.serialNumber}
          </h1>
          <span className="text-vault-500">{statusLabelFor(voucher.status, voucher.voucherType)}</span>
        </div>
        <div className="flex gap-2 print:hidden">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 text-sm rounded-lg border border-vault-100 hover:bg-vault-50"
          >
            طباعة
          </button>
          {canEdit && (
            <button
              onClick={() => navigate(`/vouchers/${voucher.id}/edit`)}
              className="px-4 py-2 text-sm rounded-lg border border-vault-100 hover:bg-vault-50"
            >
              تعديل
            </button>
          )}
          <button
            onClick={() => duplicateMutation.mutate()}
            className="px-4 py-2 text-sm rounded-lg border border-vault-100 hover:bg-vault-50"
          >
            تكرار
          </button>
          {canDelete && (
            <button
              onClick={() => confirm('تأكيد الحذف؟') && deleteMutation.mutate()}
              className="px-4 py-2 text-sm rounded-lg border border-red-200 text-red-600 hover:bg-red-50 print:hidden"
            >
              حذف
            </button>
          )}
        </div>
      </div>

      {/* بيانات الإذن */}
      <div className="bg-white rounded-xl border border-vault-100 p-6 mb-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <div className="text-xs text-vault-500 mb-1">النوع</div>
          <div>{voucher.voucherType === 'expense' ? 'صرف' : 'إيراد'}</div>
        </div>
        <div>
          <div className="text-xs text-vault-500 mb-1">التاريخ</div>
          <div>{voucher.voucherDate}</div>
        </div>
        <div>
          <div className="text-xs text-vault-500 mb-1">طريقة الدفع</div>
          <div>
            {voucher.paymentMethod === 'cash'
              ? 'نقدي'
              : voucher.paymentMethod === 'bank'
                ? 'بنك'
                : 'محفظة'}
          </div>
        </div>
        <div>
          <div className="text-xs text-vault-500 mb-1">الإجمالي</div>
          <div className="tabular-amount font-semibold">
            {Number(voucher.totalAmount).toLocaleString('ar-EG', { minimumFractionDigits: 2 })}{' '}
            {voucher.currency?.code}
          </div>
        </div>
      </div>

      {/* البنود */}
      <div className="bg-white rounded-xl border border-vault-100 p-6 mb-4">
        <h3 className="font-semibold text-ink mb-3">البنود</h3>
        <table className="w-full text-sm">
          <thead className="text-vault-500 text-right">
            <tr>
              <th className="pb-2">البيان</th>
              <th className="pb-2">مركز التكلفة</th>
              <th className="pb-2">المبلغ</th>
            </tr>
          </thead>
          <tbody>
            {voucher.lines?.map((l: any) => (
              <tr key={l.id} className="border-t border-vault-50">
                <td className="py-2">{l.description || l.mainCategory?.name || '-'}</td>
                <td className="py-2 text-vault-500">{l.costCenter?.name ?? '-'}</td>
                <td className="py-2 tabular-amount">
                  {Number(l.amount).toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-vault-200 font-semibold">
              <td className="py-2" colSpan={2}>
                الإجمالي
              </td>
              <td className="py-2 tabular-amount">
                {Number(voucher.totalAmount).toLocaleString('ar-EG', { minimumFractionDigits: 2 })}{' '}
                {voucher.currency?.code}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* المبلغ بالحروف - جزء أساسي في أي إذن ورقي رسمي */}
        <p className="hidden print:block mt-4 text-sm border-t border-vault-100 pt-3">
          <span className="text-vault-500">فقط وقدره: </span>
          <span className="font-medium">
            {amountToArabicWords(Number(voucher.totalAmount), voucher.currency?.code === 'USD' ? 'دولار' : 'جنيه')}
          </span>
        </p>
      </div>

      <AttachmentsPanel attachableType="voucher" attachableId={voucher.id} />

      {/* توقيعات - تظهر بس وقت الطباعة */}
      <div className="hidden print:grid grid-cols-3 gap-6 mt-10 mb-4 text-sm text-center">
        <div>
          <div className="border-t border-vault-900 pt-2 mt-10">محرر الإذن</div>
        </div>
        <div>
          <div className="border-t border-vault-900 pt-2 mt-10">المعتمِد</div>
        </div>
        <div>
          <div className="border-t border-vault-900 pt-2 mt-10">
            {voucher.voucherType === 'expense' ? 'المستلم' : 'المحصّل منه'}
          </div>
        </div>
      </div>

      {/* الإجراءات */}
      <div className="bg-white rounded-xl border border-vault-100 p-6 mb-4 print:hidden">
        <h3 className="font-semibold text-ink mb-3">الإجراءات</h3>

        {canSubmit && (
          <button
            onClick={() => submitMutation.mutate()}
            className="px-5 py-2 bg-vault-700 text-white rounded-lg text-sm hover:bg-vault-900"
          >
            إرسال للاعتماد
          </button>
        )}

        {canDecide && (
          <div className="space-y-3">
            <textarea
              placeholder="ملاحظات (اختياري)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-vault-100 text-sm"
              rows={2}
            />
            <div className="flex gap-2">
              <button
                onClick={() => decideMutation.mutate('approved')}
                className="px-5 py-2 bg-vault-700 text-white rounded-lg text-sm hover:bg-vault-900"
              >
                اعتماد
              </button>
              <button
                onClick={() => decideMutation.mutate('rejected')}
                className="px-5 py-2 bg-red-50 text-red-700 rounded-lg text-sm hover:bg-red-100"
              >
                رفض
              </button>
            </div>
          </div>
        )}

        {canDisburse && (
          <button
            onClick={() => disburseMutation.mutate()}
            className="px-5 py-2 bg-gold-500 text-vault-900 rounded-lg text-sm font-medium hover:bg-gold-300"
          >
            {voucher.voucherType === 'revenue' ? 'تم التحصيل' : 'تنفيذ الصرف الفعلي'}
          </button>
        )}

        {!canSubmit && !canDecide && !canDisburse && (
          <p className="text-vault-500 text-sm">لا يوجد إجراء متاح ليك حاليًا على الإذن ده</p>
        )}
      </div>

      {/* سجل الاعتمادات */}
      <div className="bg-white rounded-xl border border-vault-100 p-6">
        <h3 className="font-semibold text-ink mb-3">سجل الاعتمادات</h3>
        {history?.length ? (
          <ul className="space-y-2 text-sm">
            {history.map((h: any) => (
              <li key={h.id} className="flex justify-between border-b border-vault-50 pb-2">
                <span>
                  {h.approver?.name} - {h.decision === 'approved' ? 'اعتماد' : 'رفض'}
                  {h.comment ? ` (${h.comment})` : ''}
                </span>
                <span className="text-vault-500">
                  {new Date(h.decidedAt).toLocaleString('ar-EG')}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-vault-500 text-sm">لسه مفيش قرارات اتخذت على الإذن ده</p>
        )}
      </div>
    </div>
  );
}
