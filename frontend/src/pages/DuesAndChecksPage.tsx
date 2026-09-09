import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import PrintHeader from '../components/PrintHeader';

type TabType = 'vendors' | 'customers' | 'checks';

function formatAmount(n: number) {
  return n.toLocaleString('ar-EG', { minimumFractionDigits: 2 });
}
function isOverdue(dueDate: string) {
  return dueDate < new Date().toISOString().slice(0, 10);
}

export default function DuesAndChecksPage() {
  const [tab, setTab] = useState<TabType>('vendors');
  const [importMessage, setImportMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: vendorDues, isLoading: loadingVendors } = useQuery({
    queryKey: ['vendor-dues'],
    queryFn: async () => (await api.get('/dues/vendors')).data,
    enabled: tab === 'vendors',
  });
  const { data: customerDues, isLoading: loadingCustomers } = useQuery({
    queryKey: ['customer-dues'],
    queryFn: async () => (await api.get('/dues/customers')).data,
    enabled: tab === 'customers',
  });
  const { data: checks, isLoading: loadingChecks } = useQuery({
    queryKey: ['checks'],
    queryFn: async () => (await api.get('/checks')).data,
    enabled: tab === 'checks',
  });

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const endpoint =
        tab === 'vendors' ? '/dues/vendors/import' : tab === 'customers' ? '/dues/customers/import' : '/checks/import';
      return (await api.post(endpoint, formData, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
    },
    onSuccess: (result) => {
      const skipped = result.skipped ?? result.skippedCodesNotFound?.length ?? 0;
      const skippedCodes = result.notFoundCodes ?? result.skippedCodesNotFound ?? [];
      setImportMessage(
        `تم استيراد ${result.imported} صف بنجاح.` +
          (skipped > 0 ? ` (${skipped} صف اتجاهل لأن الكود مش موجود: ${skippedCodes.join('، ')})` : ''),
      );
      queryClient.invalidateQueries({ queryKey: ['vendor-dues'] });
      queryClient.invalidateQueries({ queryKey: ['customer-dues'] });
      queryClient.invalidateQueries({ queryKey: ['checks'] });
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    onError: (err: any) => {
      setImportMessage(err.response?.data?.message ?? 'حصل خطأ أثناء رفع الملف');
    },
  });

  const markVendorPaidMutation = useMutation({
    mutationFn: async (id: number) => (await api.patch(`/dues/vendors/${id}/mark-paid`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vendor-dues'] }),
  });
  const markCustomerPaidMutation = useMutation({
    mutationFn: async (id: number) => (await api.patch(`/dues/customers/${id}/mark-paid`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customer-dues'] }),
  });
  const markCollectedMutation = useMutation({
    mutationFn: async (id: number) => (await api.patch(`/checks/${id}/mark-collected`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['checks'] }),
  });
  const markBouncedMutation = useMutation({
    mutationFn: async (id: number) => (await api.patch(`/checks/${id}/mark-bounced`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['checks'] }),
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImportMessage('');
      importMutation.mutate(file);
    }
  }

  const columnsHint: Record<TabType, string> = {
    vendors: 'كود | رقم الفاتورة | تاريخ الاستحقاق | المبلغ | بيان',
    customers: 'كود | رقم الفاتورة | تاريخ الاستحقاق | المبلغ | بيان',
    checks: 'رقم الشيك | النوع (وارد/صادر) | كود | تاريخ الاستحقاق | المبلغ | اسم البنك | ملاحظات',
  };

  const isLoading = tab === 'vendors' ? loadingVendors : tab === 'customers' ? loadingCustomers : loadingChecks;

  return (
    <div>
      <PrintHeader />
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold text-ink mb-1">المستحقات والشيكات</h1>
          <p className="text-vault-500">مستحقات الموردين، تحصيلات العملاء، والشيكات - برفع إكسيل يومي</p>
        </div>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 text-sm rounded-lg border border-vault-100 hover:bg-vault-50"
        >
          طباعة
        </button>
      </div>

      <div className="flex gap-2 mb-4 print:hidden">
        {[
          { value: 'vendors', label: 'مستحق للموردين' },
          { value: 'customers', label: 'مطلوب من العملاء' },
          { value: 'checks', label: 'الشيكات' },
        ].map((t) => (
          <button
            key={t.value}
            onClick={() => {
              setTab(t.value as TabType);
              setImportMessage('');
            }}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              tab === t.value ? 'bg-vault-900 text-white' : 'bg-white text-vault-700 border border-vault-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* رفع إكسيل */}
      <div className="bg-white rounded-xl border border-vault-100 p-5 mb-4 print:hidden">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-semibold text-ink text-sm">رفع ملف إكسيل</h3>
            <p className="text-xs text-vault-500 mt-1">
              أعمدة الملف المطلوبة بالظبط: <span className="font-medium">{columnsHint[tab]}</span>
            </p>
          </div>
          <label className="px-4 py-2 bg-vault-700 text-white rounded-lg text-sm hover:bg-vault-900 cursor-pointer">
            {importMutation.isPending ? 'جاري الرفع...' : 'اختر ملف واحفظ'}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
              disabled={importMutation.isPending}
            />
          </label>
        </div>
        {importMessage && <p className="text-sm text-vault-700 mt-2">{importMessage}</p>}
        {tab !== 'checks' && (
          <p className="text-xs text-amber-700 mt-2">
            ملحوظة: كل رفع جديد بيمسح المستحقات "القديمة اللي لسه معلقة" ويحط بدالها محتوى الملف الجديد بالكامل
            (زي ما بيحصل مع أي كشف أرصدة يومي). المستحقات اللي عملتلها "تم السداد" مش بتتأثر.
          </p>
        )}
      </div>

      {isLoading && <p className="text-vault-500">جاري التحميل...</p>}

      {/* جدول الموردين */}
      {tab === 'vendors' && (
        <div className="bg-white rounded-xl border border-vault-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-vault-50 text-vault-700">
              <tr>
                <th className="px-4 py-3 text-right">المورد</th>
                <th className="px-4 py-3 text-right">رقم الفاتورة</th>
                <th className="px-4 py-3 text-right">تاريخ الاستحقاق</th>
                <th className="px-4 py-3 text-right">المبلغ</th>
                <th className="px-4 py-3 text-right">الحالة</th>
                <th className="px-4 py-3 print:hidden"></th>
              </tr>
            </thead>
            <tbody>
              {vendorDues?.map((d: any) => (
                <tr key={d.id} className="border-t border-vault-50 even:bg-vault-50/30">
                  <td className="px-4 py-3 font-medium">{d.vendor?.name}</td>
                  <td className="px-4 py-3 text-vault-500">{d.invoiceNumber ?? '-'}</td>
                  <td className={`px-4 py-3 ${d.status === 'pending' && isOverdue(d.dueDate) ? 'text-red-600 font-medium' : 'text-vault-500'}`}>
                    {d.dueDate ?? '-'}
                  </td>
                  <td className="px-4 py-3 tabular-amount">{formatAmount(Number(d.amount))}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs ${d.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {d.status === 'paid' ? 'اتسدد' : 'مستحق'}
                    </span>
                  </td>
                  <td className="px-4 py-3 print:hidden">
                    {d.status === 'pending' && (
                      <button onClick={() => markVendorPaidMutation.mutate(d.id)} className="text-vault-700 hover:text-gold-700">
                        علّم كمسدد
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loadingVendors && vendorDues?.length === 0 && (
            <p className="text-center text-vault-500 py-10">لا يوجد مستحقات موردين حاليًا</p>
          )}
        </div>
      )}

      {/* جدول العملاء */}
      {tab === 'customers' && (
        <div className="bg-white rounded-xl border border-vault-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-vault-50 text-vault-700">
              <tr>
                <th className="px-4 py-3 text-right">العميل</th>
                <th className="px-4 py-3 text-right">رقم الفاتورة</th>
                <th className="px-4 py-3 text-right">تاريخ الاستحقاق</th>
                <th className="px-4 py-3 text-right">المبلغ</th>
                <th className="px-4 py-3 text-right">الحالة</th>
                <th className="px-4 py-3 print:hidden"></th>
              </tr>
            </thead>
            <tbody>
              {customerDues?.map((d: any) => (
                <tr key={d.id} className="border-t border-vault-50 even:bg-vault-50/30">
                  <td className="px-4 py-3 font-medium">{d.customer?.name}</td>
                  <td className="px-4 py-3 text-vault-500">{d.invoiceNumber ?? '-'}</td>
                  <td className={`px-4 py-3 ${d.status === 'pending' && isOverdue(d.dueDate) ? 'text-red-600 font-medium' : 'text-vault-500'}`}>
                    {d.dueDate ?? '-'}
                  </td>
                  <td className="px-4 py-3 tabular-amount">{formatAmount(Number(d.amount))}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs ${d.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {d.status === 'paid' ? 'اتحصّل' : 'مطلوب'}
                    </span>
                  </td>
                  <td className="px-4 py-3 print:hidden">
                    {d.status === 'pending' && (
                      <button onClick={() => markCustomerPaidMutation.mutate(d.id)} className="text-vault-700 hover:text-gold-700">
                        علّم كمحصّل
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loadingCustomers && customerDues?.length === 0 && (
            <p className="text-center text-vault-500 py-10">لا يوجد مبالغ مطلوبة من عملاء حاليًا</p>
          )}
        </div>
      )}

      {/* جدول الشيكات */}
      {tab === 'checks' && (
        <div className="bg-white rounded-xl border border-vault-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-vault-50 text-vault-700">
              <tr>
                <th className="px-4 py-3 text-right">رقم الشيك</th>
                <th className="px-4 py-3 text-right">النوع</th>
                <th className="px-4 py-3 text-right">الطرف</th>
                <th className="px-4 py-3 text-right">البنك</th>
                <th className="px-4 py-3 text-right">تاريخ الاستحقاق</th>
                <th className="px-4 py-3 text-right">المبلغ</th>
                <th className="px-4 py-3 text-right">الحالة</th>
                <th className="px-4 py-3 print:hidden"></th>
              </tr>
            </thead>
            <tbody>
              {checks?.map((c: any) => (
                <tr key={c.id} className="border-t border-vault-50 even:bg-vault-50/30">
                  <td className="px-4 py-3 font-medium">{c.checkNumber}</td>
                  <td className="px-4 py-3">{c.direction === 'receivable' ? 'وارد' : 'صادر'}</td>
                  <td className="px-4 py-3">{c.customer?.name ?? c.vendor?.name ?? '-'}</td>
                  <td className="px-4 py-3 text-vault-500">
                    {c.bankAccount ? (
                      <Link
                        to={`/statement?accountType=bank&accountId=${c.bankAccount.id}`}
                        className="underline decoration-dotted hover:text-gold-700"
                      >
                        {c.bankAccount.bankName}
                      </Link>
                    ) : (
                      c.bankName ?? '-'
                    )}
                  </td>
                  <td className={`px-4 py-3 ${c.status === 'pending' && isOverdue(c.dueDate) ? 'text-red-600 font-medium' : 'text-vault-500'}`}>
                    {c.dueDate}
                  </td>
                  <td className="px-4 py-3 tabular-amount">{formatAmount(Number(c.amount))}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs ${
                        c.status === 'collected'
                          ? 'bg-green-100 text-green-700'
                          : c.status === 'bounced'
                            ? 'bg-red-100 text-red-700'
                            : isOverdue(c.dueDate)
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {c.status === 'collected' ? 'اتحصّل' : c.status === 'bounced' ? 'ارتد' : isOverdue(c.dueDate) ? 'متأخر' : 'تحت التحصيل'}
                    </span>
                  </td>
                  <td className="px-4 py-3 print:hidden">
                    {c.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => markCollectedMutation.mutate(c.id)} className="text-vault-700 hover:text-gold-700">
                          تحصّل
                        </button>
                        <button onClick={() => markBouncedMutation.mutate(c.id)} className="text-red-500 hover:text-red-700">
                          ارتد
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loadingChecks && checks?.length === 0 && (
            <p className="text-center text-vault-500 py-10">لا يوجد شيكات مسجلة حاليًا</p>
          )}
        </div>
      )}
    </div>
  );
}
