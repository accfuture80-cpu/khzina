import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import PrintHeader from '../components/PrintHeader';

interface VendorRow {
  vendorId: number;
  vendorName: string;
  vendorCode: string;
  totalPaid: number;
  vouchersCount: number;
  lastPaymentDate: string | null;
}

interface CustomerRow {
  customerId: number;
  customerName: string;
  customerCode: string;
  totalCollected: number;
  vouchersCount: number;
  lastCollectionDate: string | null;
}

export default function PartiesStatementPage() {
  const [partyType, setPartyType] = useState<'vendors' | 'customers'>('vendors');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const { data: vendors, isLoading: isLoadingVendors } = useQuery<VendorRow[]>({
    queryKey: ['vendors-statement', fromDate, toDate],
    queryFn: async () =>
      (
        await api.get('/reports/vendors-statement', {
          params: { fromDate: fromDate || undefined, toDate: toDate || undefined },
        })
      ).data,
    enabled: partyType === 'vendors',
  });

  const { data: customers, isLoading: isLoadingCustomers } = useQuery<CustomerRow[]>({
    queryKey: ['customers-statement', fromDate, toDate],
    queryFn: async () =>
      (
        await api.get('/reports/customers-statement', {
          params: { fromDate: fromDate || undefined, toDate: toDate || undefined },
        })
      ).data,
    enabled: partyType === 'customers',
  });

  const isLoading = partyType === 'vendors' ? isLoadingVendors : isLoadingCustomers;
  const totalAmount =
    partyType === 'vendors'
      ? (vendors ?? []).reduce((s, v) => s + v.totalPaid, 0)
      : (customers ?? []).reduce((s, c) => s + c.totalCollected, 0);

  return (
    <div>
      <PrintHeader />
      <div className="mb-6 print:hidden">
        <h1 className="text-2xl font-semibold text-ink mb-1">تقرير الموردين والعملاء</h1>
        <p className="text-vault-500">
          إجمالي المسدد لكل مورد والمحصّل من كل عميل، من الأذون المصروفة فعليًا فقط
        </p>
      </div>

      {/* ملحوظة: النظام حاليًا مبيسجّلش فواتير أو أرصدة افتتاحية للموردين والعملاء،
          فالتقرير ده بيوريك "المسدد/المحصّل فعليًا" بس - مش "المتبقي المستحق" */}
      <div className="mb-4 px-4 py-3 bg-amber-50 text-amber-800 rounded-lg text-sm print:hidden">
        التقرير ده بيوريك المبالغ اللي اتسددت/اتحصّلت فعليًا بس. النظام حاليًا مفيهوش تسجيل
        لفواتير الموردين/العملاء، فمقدرش أطلعلك "الباقي المستحق" لحد ما نضيف ميزة الفواتير.
      </div>

      <div className="flex flex-wrap items-end gap-3 mb-4 print:hidden">
        <div className="flex gap-2">
          <button
            onClick={() => setPartyType('vendors')}
            className={`px-4 py-1.5 rounded-full text-sm transition ${
              partyType === 'vendors'
                ? 'bg-vault-900 text-white'
                : 'bg-white text-vault-700 border border-vault-100'
            }`}
          >
            الموردين
          </button>
          <button
            onClick={() => setPartyType('customers')}
            className={`px-4 py-1.5 rounded-full text-sm transition ${
              partyType === 'customers'
                ? 'bg-vault-900 text-white'
                : 'bg-white text-vault-700 border border-vault-100'
            }`}
          >
            العملاء
          </button>
        </div>

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

      <div className="bg-white rounded-xl border border-vault-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-vault-50 text-vault-700">
            <tr>
              <th className="px-4 py-3 text-right font-medium">الكود</th>
              <th className="px-4 py-3 text-right font-medium">
                {partyType === 'vendors' ? 'المورد' : 'العميل'}
              </th>
              <th className="px-4 py-3 text-right font-medium">
                {partyType === 'vendors' ? 'إجمالي المسدد' : 'إجمالي المحصّل'}
              </th>
              <th className="px-4 py-3 text-right font-medium">عدد الأذون</th>
              <th className="px-4 py-3 text-right font-medium">
                {partyType === 'vendors' ? 'آخر سداد' : 'آخر تحصيل'}
              </th>
            </tr>
          </thead>
          <tbody>
            {partyType === 'vendors'
              ? vendors?.map((v) => (
                  <tr key={v.vendorId} className="border-t border-vault-50 even:bg-vault-50/30">
                    <td className="px-4 py-3">{v.vendorCode}</td>
                    <td className="px-4 py-3 font-medium">{v.vendorName}</td>
                    <td className="px-4 py-3 tabular-amount">
                      {v.totalPaid.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3">{v.vouchersCount}</td>
                    <td className="px-4 py-3 text-vault-500">{v.lastPaymentDate ?? '-'}</td>
                  </tr>
                ))
              : customers?.map((c) => (
                  <tr key={c.customerId} className="border-t border-vault-50 even:bg-vault-50/30">
                    <td className="px-4 py-3">{c.customerCode}</td>
                    <td className="px-4 py-3 font-medium">{c.customerName}</td>
                    <td className="px-4 py-3 tabular-amount">
                      {c.totalCollected.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3">{c.vouchersCount}</td>
                    <td className="px-4 py-3 text-vault-500">{c.lastCollectionDate ?? '-'}</td>
                  </tr>
                ))}
          </tbody>
          {!isLoading && (
            <tfoot>
              <tr className="border-t-2 border-vault-100 bg-vault-50/50 font-semibold">
                <td className="px-4 py-3" colSpan={2}>
                  الإجمالي
                </td>
                <td className="px-4 py-3 tabular-amount">
                  {totalAmount.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3" colSpan={2}></td>
              </tr>
            </tfoot>
          )}
        </table>

        {!isLoading &&
          ((partyType === 'vendors' && vendors?.length === 0) ||
            (partyType === 'customers' && customers?.length === 0)) && (
            <p className="text-center text-vault-500 py-10">لا توجد بيانات في الفترة دي</p>
          )}
      </div>
    </div>
  );
}
