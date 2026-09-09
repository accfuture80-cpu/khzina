import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { api } from '../api/client';
import PrintHeader from '../components/PrintHeader';

interface ExpenseRow {
  voucherId: number;
  date: string;
  serialNumber: string;
  costCenter: string;
  mainCategory: string;
  subCategory: string;
  account: string;
  description: string;
  amount: number;
}

function firstDayOfCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}
function lastDayOfCurrentMonth(): string {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
}

function formatAmount(n: number) {
  return n.toLocaleString('ar-EG', { minimumFractionDigits: 2 });
}

export default function ExpensesReportPage() {
  const [fromDate, setFromDate] = useState(firstDayOfCurrentMonth());
  const [toDate, setToDate] = useState(lastDayOfCurrentMonth());

  const { data, isLoading } = useQuery<ExpenseRow[]>({
    queryKey: ['expenses-report', fromDate, toDate],
    queryFn: async () =>
      (
        await api.get('/reports/expenses-report', {
          params: { fromDate: fromDate || undefined, toDate: toDate || undefined },
        })
      ).data,
  });

  const total = (data ?? []).reduce((sum, r) => sum + r.amount, 0);

  function exportToExcel() {
    if (!data || data.length === 0) return;

    const rows = data.map((r) => ({
      التاريخ: r.date,
      'رقم الإذن': r.serialNumber,
      'مركز التكلفة': r.costCenter,
      'المصروف الرئيسي': r.mainCategory,
      'المصروف الفرعي': r.subCategory,
      الحساب: r.account,
      البيان: r.description,
      المبلغ: r.amount,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    // عرض أعمدة مناسب بدل الافتراضي الضيق
    worksheet['!cols'] = [
      { wch: 12 }, // التاريخ
      { wch: 16 }, // رقم الإذن
      { wch: 18 }, // مركز التكلفة
      { wch: 20 }, // المصروف الرئيسي
      { wch: 20 }, // المصروف الفرعي
      { wch: 18 }, // الحساب
      { wch: 30 }, // البيان
      { wch: 14 }, // المبلغ
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'المصاريف');

    const fileName = `تقرير_المصاريف_${fromDate || 'الكل'}_${toDate || 'الكل'}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }

  return (
    <div>
      <PrintHeader />
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold text-ink mb-1">تقرير المصاريف</h1>
          <p className="text-vault-500">كل بنود الصرف بالتاريخ ومركز التكلفة والمصروف الرئيسي والفرعي</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportToExcel}
            disabled={!data || data.length === 0}
            className="px-4 py-2 text-sm rounded-lg border border-vault-100 hover:bg-vault-50 disabled:opacity-50"
          >
            تصدير إكسيل
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 text-sm rounded-lg border border-vault-100 hover:bg-vault-50"
          >
            طباعة
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3 mb-6 print:hidden">
        <label className="block">
          <span className="text-xs text-ink/70 mb-1 block">من تاريخ</span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-3 py-2 rounded-lg border border-vault-100 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-xs text-ink/70 mb-1 block">إلى تاريخ</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-3 py-2 rounded-lg border border-vault-100 text-sm"
          />
        </label>
      </div>

      {isLoading && <p className="text-vault-500">جاري التحميل...</p>}

      <div className="bg-white rounded-xl border border-vault-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-vault-50 text-vault-700">
            <tr>
              <th className="px-4 py-3 text-right">التاريخ</th>
              <th className="px-4 py-3 text-right">رقم الإذن</th>
              <th className="px-4 py-3 text-right">مركز التكلفة</th>
              <th className="px-4 py-3 text-right">المصروف الرئيسي</th>
              <th className="px-4 py-3 text-right">المصروف الفرعي</th>
              <th className="px-4 py-3 text-right">الحساب</th>
              <th className="px-4 py-3 text-right">المبلغ</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((r, i) => (
              <tr key={i} className="border-t border-vault-50 even:bg-vault-50/30">
                <td className="px-4 py-3 text-vault-500">{r.date}</td>
                <td className="px-4 py-3">
                  <Link
                    to={`/vouchers/${r.voucherId}`}
                    className="text-vault-700 underline decoration-dotted hover:text-gold-700 print:no-underline print:text-inherit"
                  >
                    {r.serialNumber}
                  </Link>
                </td>
                <td className="px-4 py-3">{r.costCenter}</td>
                <td className="px-4 py-3">{r.mainCategory}</td>
                <td className="px-4 py-3">{r.subCategory}</td>
                <td className="px-4 py-3 text-vault-500">{r.account}</td>
                <td className="px-4 py-3 tabular-amount">{formatAmount(r.amount)}</td>
              </tr>
            ))}
          </tbody>
          {!isLoading && (
            <tfoot>
              <tr className="border-t-2 border-vault-100 bg-vault-50/50 font-semibold">
                <td className="px-4 py-3" colSpan={6}>
                  الإجمالي
                </td>
                <td className="px-4 py-3 tabular-amount">{formatAmount(total)}</td>
              </tr>
            </tfoot>
          )}
        </table>

        {!isLoading && data?.length === 0 && (
          <p className="text-center text-vault-500 py-10">لا يوجد مصاريف في الفترة دي</p>
        )}
      </div>
    </div>
  );
}
