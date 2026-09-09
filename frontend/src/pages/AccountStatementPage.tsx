import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import PrintHeader from '../components/PrintHeader';

type AccountType = 'main_treasury' | 'branch' | 'bank' | 'wallet';
type ViewMode = 'summary' | 'analytical' | 'byCategory' | 'byVoucher' | 'detailed';

const tabs: { type: AccountType; label: string }[] = [
  { type: 'main_treasury', label: 'الخزينة الرئيسية' },
  { type: 'branch', label: 'الفروع' },
  { type: 'bank', label: 'البنوك' },
  { type: 'wallet', label: 'المحافظ الإلكترونية' },
];

function formatAmount(n: number) {
  return n.toLocaleString('ar-EG', { minimumFractionDigits: 2 });
}

// أول يوم وآخر يوم في الشهر الحالي - القيمة الافتراضية لفلتر التاريخ (والمستخدم يقدر يغيّرها بحرية)
function firstDayOfCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}
function lastDayOfCurrentMonth(): string {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
}

const lineTypeLabels: Record<string, string> = {
  expense: 'مصروف',
  custody_advance: 'عهدة / سلفة',
  vendor_payment: 'سداد مورد',
  other_revenue: 'إيراد آخر',
  customer_collection: 'تحصيل من عميل',
  custody_repayment: 'رد عهدة / سلفة',
  bank_commission: 'عمولة / مصاريف بنكية',
  transfer: 'تحويل',
  treasury_funding: 'تمويل الخزينة',
};

export default function AccountStatementPage() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<AccountType>(
    (searchParams.get('accountType') as AccountType) || 'main_treasury',
  );
  const [selectedAccountId, setSelectedAccountId] = useState<number | undefined>(
    searchParams.get('accountId') ? Number(searchParams.get('accountId')) : undefined,
  );
  const [viewMode, setViewMode] = useState<ViewMode>('summary');
  const [fromDate, setFromDate] = useState(firstDayOfCurrentMonth());
  const [toDate, setToDate] = useState(lastDayOfCurrentMonth());

  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => (await api.get('/branches')).data,
  });
  const { data: bankAccounts } = useQuery({
    queryKey: ['bank-accounts'],
    queryFn: async () => (await api.get('/bank-accounts')).data,
  });
  const { data: wallets } = useQuery({
    queryKey: ['e-wallets'],
    queryFn: async () => (await api.get('/e-wallets')).data,
  });

  const mainBranch = branches?.find((b: any) => b.isMain);
  const nonMainBranches = branches?.filter((b: any) => !b.isMain) ?? [];

  // تحديد الحساب الفعلي المطلوب عرض كشفه حسب التاب المختار
  const effectiveAccountId =
    activeTab === 'main_treasury' ? mainBranch?.id : selectedAccountId;
  const effectiveAccountType = activeTab;

  const optionsList = useMemo(() => {
    if (activeTab === 'branch') return nonMainBranches;
    if (activeTab === 'bank') return bankAccounts ?? [];
    if (activeTab === 'wallet') return wallets ?? [];
    return [];
  }, [activeTab, nonMainBranches, bankAccounts, wallets]);

  const { data: statement, isLoading } = useQuery({
    queryKey: ['account-statement', effectiveAccountType, effectiveAccountId, fromDate, toDate],
    queryFn: async () =>
      (
        await api.get('/reports/account-statement', {
          params: {
            accountType: effectiveAccountType,
            accountId: effectiveAccountId,
            fromDate: fromDate || undefined,
            toDate: toDate || undefined,
          },
        })
      ).data,
    enabled: !!effectiveAccountId,
  });

  function accountLabel(item: any) {
    if (activeTab === 'bank') return `${item.bankName} - ${item.accountNumber}`;
    if (activeTab === 'wallet') return `${item.walletProvider} - ${item.phoneNumber}`;
    return item.name;
  }

  // تجميع الحركات حسب نوع البند لعرض "تحليلي"
  const analyticalGroups = useMemo(() => {
    if (!statement?.transactions) return [];
    const map = new Map<string, number>();
    for (const t of statement.transactions) {
      map.set(t.lineType, (map.get(t.lineType) ?? 0) + t.amount);
    }
    return Array.from(map.entries()).map(([lineType, amount]) => ({ lineType, amount }));
  }, [statement]);

  const hasDateRange = !!(fromDate || toDate);

  return (
    <div>
      <PrintHeader />
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold text-ink mb-1">كشف الحساب</h1>
          <p className="text-vault-500">حركة تفصيلية أو إجمالية لأي حساب في النظام</p>
        </div>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 text-sm rounded-lg border border-vault-100 hover:bg-vault-50"
        >
          طباعة
        </button>
      </div>

      {/* التابات */}
      <div className="flex gap-2 mb-4 print:hidden">
        {tabs.map((t) => (
          <button
            key={t.type}
            onClick={() => {
              setActiveTab(t.type);
              setSelectedAccountId(undefined);
            }}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              activeTab === t.type
                ? 'bg-vault-900 text-white'
                : 'bg-white text-vault-700 border border-vault-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* اختيار الحساب المحدد لو مش خزينة رئيسية + فلتر التاريخ */}
      <div className="flex flex-wrap items-end gap-3 mb-6 print:hidden">
        {activeTab !== 'main_treasury' && (
          <label className="block">
            <span className="text-xs text-ink/70 mb-1 block">الحساب</span>
            <select
              value={selectedAccountId ?? ''}
              onChange={(e) => setSelectedAccountId(Number(e.target.value))}
              className="px-3 py-2 rounded-lg border border-vault-100 text-sm"
            >
              <option value="">اختر الحساب</option>
              {optionsList.map((item: any) => (
                <option key={item.id} value={item.id}>
                  {accountLabel(item)}
                </option>
              ))}
            </select>
          </label>
        )}
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
        {hasDateRange && (
          <button
            onClick={() => {
              setFromDate('');
              setToDate('');
            }}
            className="px-3 py-2 text-sm text-vault-500 hover:text-vault-900"
          >
            مسح الفترة
          </button>
        )}
      </div>

      {!effectiveAccountId && (
        <p className="text-vault-500">اختر حساب من فوق لعرض كشف الحساب بتاعه</p>
      )}

      {isLoading && <p className="text-vault-500">جاري التحميل...</p>}

      {statement && (
        <>
          {/* شريط الفترة المطبوعة */}
          {hasDateRange && (
            <p className="hidden print:block text-sm text-vault-700 mb-4">
              الفترة من {fromDate || 'بداية النشاط'} إلى {toDate || 'اليوم'}
            </p>
          )}

          {/* ملخص الأرصدة */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {hasDateRange && (
              <SummaryCard label="رصيد سابق (قبل الفترة)" value={statement.summary.previousBalance} />
            )}
            <SummaryCard label="إجمالي الإيرادات" value={statement.summary.totalRevenue} />
            <SummaryCard label="تمويل الخزينة" value={statement.summary.treasuryFunding} />
            <SummaryCard label="إجمالي الصرف" value={statement.summary.totalExpense} negative />
            <SummaryCard label="تحويلات داخلة" value={statement.summary.transfersIn} />
            <SummaryCard label="تحويلات خارجة" value={statement.summary.transfersOut} negative />
            <SummaryCard
              label={hasDateRange ? 'الرصيد الختامي (آخر الفترة)' : 'الرصيد الحالي'}
              value={hasDateRange ? statement.summary.closingBalance : statement.summary.currentBalance}
              highlight
            />
          </div>

          {/* اختيار طريقة العرض */}
          <div className="flex flex-wrap gap-2 mb-4 print:hidden">
            {[
              { value: 'summary', label: 'إجمالي' },
              { value: 'analytical', label: 'تحليلي' },
              { value: 'byCategory', label: 'تفصيلي بالبند' },
              { value: 'byVoucher', label: 'إجمالي الأذون' },
              { value: 'detailed', label: 'تفصيلي بكل حركة' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setViewMode(opt.value as ViewMode)}
                className={`px-4 py-1.5 rounded-full text-sm transition ${
                  viewMode === opt.value
                    ? 'bg-gold-500 text-vault-900 font-medium'
                    : 'bg-white text-vault-700 border border-vault-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {viewMode === 'analytical' && (
            <div className="bg-white rounded-xl border border-vault-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-vault-50 text-vault-700">
                  <tr>
                    <th className="px-4 py-3 text-right">نوع الحركة</th>
                    <th className="px-4 py-3 text-right">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticalGroups.map((g) => (
                    <tr key={g.lineType} className="border-t border-vault-50 even:bg-vault-50/30">
                      <td className="px-4 py-3">{lineTypeLabels[g.lineType] ?? g.lineType}</td>
                      <td className="px-4 py-3 tabular-amount">{formatAmount(g.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* تفصيلي بالبند: مجمّع حسب المصروف الرئيسي/الفرعي/مركز التكلفة - مفيد لمعرفة أكتر بند اتصرف عليه */}
          {viewMode === 'byCategory' && (
            <div className="bg-white rounded-xl border border-vault-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-vault-50 text-vault-700">
                  <tr>
                    <th className="px-4 py-3 text-right">المصروف الرئيسي</th>
                    <th className="px-4 py-3 text-right">المصروف الفرعي</th>
                    <th className="px-4 py-3 text-right">مركز التكلفة</th>
                    <th className="px-4 py-3 text-right">عدد الحركات</th>
                    <th className="px-4 py-3 text-right">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {statement.byCategory.map((g: any, i: number) => (
                    <tr key={i} className="border-t border-vault-50 even:bg-vault-50/30">
                      <td className="px-4 py-3">{g.mainCategory}</td>
                      <td className="px-4 py-3 text-vault-500">{g.subCategory}</td>
                      <td className="px-4 py-3 text-vault-500">{g.costCenter}</td>
                      <td className="px-4 py-3 text-vault-500">{g.count}</td>
                      <td className="px-4 py-3 tabular-amount">{formatAmount(g.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {statement.byCategory.length === 0 && (
                <p className="text-center text-vault-500 py-10">لا يوجد حركات في الفترة دي</p>
              )}
            </div>
          )}

          {/* إجمالي الأذون: صف واحد لكل إذن بإجماليه، من غير تفاصيل البنود */}
          {viewMode === 'byVoucher' && (
            <div className="bg-white rounded-xl border border-vault-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-vault-50 text-vault-700">
                  <tr>
                    <th className="px-4 py-3 text-right">رقم الإذن</th>
                    <th className="px-4 py-3 text-right">التاريخ</th>
                    <th className="px-4 py-3 text-right">النوع</th>
                    <th className="px-4 py-3 text-right">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {statement.byVoucher.map((v: any) => (
                    <tr key={v.voucherId} className="border-t border-vault-50 even:bg-vault-50/30">
                      <td className="px-4 py-3">
                        <Link
                          to={`/vouchers/${v.voucherId}`}
                          className="text-vault-700 underline decoration-dotted hover:text-gold-700 print:no-underline print:text-inherit"
                        >
                          {v.serialNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-vault-500">{v.date}</td>
                      <td className="px-4 py-3">{v.voucherType === 'revenue' ? 'إيراد' : 'صرف'}</td>
                      <td className="px-4 py-3 tabular-amount">{formatAmount(v.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {statement.byVoucher.length === 0 && (
                <p className="text-center text-vault-500 py-10">لا يوجد أذون في الفترة دي</p>
              )}
            </div>
          )}

          {viewMode === 'detailed' && (
            <div className="bg-white rounded-xl border border-vault-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-vault-50 text-vault-700">
                  <tr>
                    <th className="px-4 py-3 text-right">رقم الإذن</th>
                    <th className="px-4 py-3 text-right">التاريخ</th>
                    <th className="px-4 py-3 text-right">نوع الحركة</th>
                    <th className="px-4 py-3 text-right">البيان</th>
                    <th className="px-4 py-3 text-right">المبلغ</th>
                  </tr>
                </thead>
                <tbody>
                  {statement.transactions.map((t: any, i: number) => (
                    <tr key={i} className="border-t border-vault-50 even:bg-vault-50/30">
                      <td className="px-4 py-3">
                        <Link
                          to={`/vouchers/${t.voucherId}`}
                          className="text-vault-700 underline decoration-dotted hover:text-gold-700 print:no-underline print:text-inherit"
                        >
                          {t.serialNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-vault-500">{t.date}</td>
                      <td className="px-4 py-3">{lineTypeLabels[t.lineType] ?? t.lineType}</td>
                      <td className="px-4 py-3 text-vault-500">{t.description ?? '-'}</td>
                      <td className="px-4 py-3 tabular-amount">{formatAmount(t.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {statement.transactions.length === 0 && (
                <p className="text-center text-vault-500 py-10">لا يوجد حركات مسجلة</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  negative,
  highlight,
}: {
  label: string;
  value: number;
  negative?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-5 border ${
        highlight ? 'bg-vault-900 text-paper border-vault-900' : 'bg-white border-vault-100'
      }`}
    >
      <div className={`text-xs mb-1 ${highlight ? 'text-vault-300' : 'text-vault-500'}`}>
        {label}
      </div>
      <div
        className={`text-lg font-semibold tabular-amount ${
          negative && !highlight ? 'text-red-600' : ''
        }`}
      >
        {formatAmount(value)}
      </div>
    </div>
  );
}
