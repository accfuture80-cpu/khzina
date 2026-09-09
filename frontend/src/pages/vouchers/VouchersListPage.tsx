import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { api } from '../../api/client';

interface VoucherListItem {
  id: number;
  voucherType: 'expense' | 'revenue';
  serialNumber: string;
  voucherDate: string;
  status: string;
  totalAmount: string;
  currency: { code: string };
}

const statusLabels: Record<string, { label: string; color: string }> = {
  draft: { label: 'مسودة', color: 'bg-gray-100 text-gray-700' },
  pending_first_approval: { label: 'بانتظار الاعتماد الأول', color: 'bg-amber-100 text-amber-700' },
  pending_financial_review: { label: 'بانتظار المراجعة المالية', color: 'bg-amber-100 text-amber-700' },
  pending_gm_approval: { label: 'بانتظار اعتماد المدير العام', color: 'bg-amber-100 text-amber-700' },
  approved_final: { label: 'معتمد نهائيًا', color: 'bg-vault-100 text-vault-700' },
  disbursed: { label: 'مصروف', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'مرفوض', color: 'bg-red-100 text-red-700' },
};

// اسم حالة "مصروف" لازم يبقى "تم التحصيل" لو الإذن إيراد مش صرف
function statusLabelFor(status: string, voucherType: 'expense' | 'revenue') {
  if (status === 'disbursed' && voucherType === 'revenue') {
    return { label: 'تم التحصيل', color: 'bg-green-100 text-green-700' };
  }
  return statusLabels[status];
}

export default function VouchersListPage() {
  const [typeFilter, setTypeFilter] = useState<'expense' | 'revenue' | ''>('');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery<VoucherListItem[]>({
    queryKey: ['vouchers', typeFilter],
    queryFn: async () =>
      (await api.get('/vouchers', { params: { voucherType: typeFilter || undefined } })).data,
  });

  // بحث برقم الإذن أو الحالة - مفيد لما عدد الأذون يكبر مع الوقت
  const filteredData = useMemo(() => {
    if (!data) return data;
    const term = search.trim().toLowerCase();
    if (!term) return data;
    return data.filter(
      (v) =>
        v.serialNumber.toLowerCase().includes(term) ||
        (statusLabels[v.status]?.label ?? v.status).toLowerCase().includes(term),
    );
  }, [data, search]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-ink mb-1">الأذون</h1>
          <p className="text-vault-500">أذون الصرف والإيراد ودورة اعتمادها</p>
        </div>
        <Link
          to="/vouchers/new"
          className="px-5 py-2.5 bg-vault-700 text-white rounded-lg hover:bg-vault-900 transition text-sm font-medium"
        >
          إذن جديد
        </Link>
      </div>

      {/* فلتر النوع والبحث */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex gap-2">
          {[
            { value: '', label: 'الكل' },
            { value: 'expense', label: 'أذون صرف' },
            { value: 'revenue', label: 'أذون إيراد' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTypeFilter(opt.value as any)}
              className={`px-4 py-1.5 rounded-full text-sm transition ${
                typeFilter === opt.value
                  ? 'bg-vault-900 text-white'
                  : 'bg-white text-vault-700 border border-vault-100'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث برقم الإذن أو الحالة..."
          className="w-full max-w-xs px-3 py-2 rounded-lg border border-vault-100 text-sm"
        />
      </div>

      <div className="bg-white rounded-xl border border-vault-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-vault-50 text-vault-700">
            <tr>
              <th className="px-4 py-3 text-right font-medium">رقم الإذن</th>
              <th className="px-4 py-3 text-right font-medium">التاريخ</th>
              <th className="px-4 py-3 text-right font-medium">النوع</th>
              <th className="px-4 py-3 text-right font-medium">المبلغ</th>
              <th className="px-4 py-3 text-right font-medium">الحالة</th>
              <th className="px-4 py-3 text-right font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {filteredData?.map((v) => (
              <tr key={v.id} className="border-t border-vault-50 even:bg-vault-50/30">
                <td className="px-4 py-3 font-medium">{v.serialNumber}</td>
                <td className="px-4 py-3 text-vault-500">{v.voucherDate}</td>
                <td className="px-4 py-3">{v.voucherType === 'expense' ? 'صرف' : 'إيراد'}</td>
                <td className="px-4 py-3 tabular-amount">
                  {Number(v.totalAmount).toLocaleString('ar-EG', { minimumFractionDigits: 2 })}{' '}
                  {v.currency?.code}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs ${statusLabelFor(v.status, v.voucherType)?.color}`}
                  >
                    {statusLabelFor(v.status, v.voucherType)?.label ?? v.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link to={`/vouchers/${v.id}`} className="text-vault-700 hover:text-gold-700">
                    عرض
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!isLoading && data?.length === 0 && (
          <p className="text-center text-vault-500 py-10">لا يوجد أذون حتى الآن</p>
        )}
        {!isLoading && (data?.length ?? 0) > 0 && filteredData?.length === 0 && (
          <p className="text-center text-vault-500 py-10">لا توجد نتائج مطابقة للبحث</p>
        )}
      </div>
    </div>
  );
}
