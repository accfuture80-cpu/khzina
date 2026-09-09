import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import PrintHeader from '../components/PrintHeader';

interface AccountBalance {
  id: number;
  accountType: 'main_treasury' | 'branch' | 'bank' | 'wallet';
  accountId: number;
  currentBalance: string;
  lastUpdated: string;
}

const typeLabels: Record<string, string> = {
  main_treasury: 'الخزينة الرئيسية',
  branch: 'فرع',
  bank: 'حساب بنكي',
  wallet: 'محفظة إلكترونية',
};

function formatAmount(value: string) {
  return Number(value).toLocaleString('ar-EG', { minimumFractionDigits: 2 });
}

export default function BalancesPage() {
  const { data, isLoading } = useQuery<AccountBalance[]>({
    queryKey: ['account-balances'],
    queryFn: async () => (await api.get('/account-balances')).data,
  });
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
  const { data: duesTotals } = useQuery({
    queryKey: ['dues-dashboard-totals'],
    queryFn: async () => (await api.get('/dues/dashboard-totals')).data,
  });
  const { data: checksTotals } = useQuery({
    queryKey: ['checks-dashboard-totals'],
    queryFn: async () => (await api.get('/checks/dashboard-totals')).data,
  });

  // بدل ما نعرض رقم الحساب بس، نجيب اسمه الحقيقي من شاشات التكويد
  function accountName(b: AccountBalance) {
    if (b.accountType === 'main_treasury' || b.accountType === 'branch') {
      const branch = branches?.find((x: any) => x.id === b.accountId);
      return branch?.name ?? `#${b.accountId}`;
    }
    if (b.accountType === 'bank') {
      const acc = bankAccounts?.find((x: any) => x.id === b.accountId);
      return acc ? `${acc.bankName} - ${acc.accountNumber}` : `#${b.accountId}`;
    }
    const wallet = wallets?.find((x: any) => x.id === b.accountId);
    return wallet ? `${wallet.walletProvider} - ${wallet.phoneNumber}` : `#${b.accountId}`;
  }

  const total = data?.reduce((sum, b) => sum + Number(b.currentBalance), 0) ?? 0;

  return (
    <div>
      <PrintHeader />
      <div className="flex items-center justify-between mb-1 print:hidden">
        <h1 className="text-2xl font-semibold text-ink">الأرصدة الحالية</h1>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 text-sm rounded-lg border border-vault-100 hover:bg-vault-50"
        >
          طباعة
        </button>
      </div>
      <p className="text-vault-500 mb-6 print:hidden">نظرة سريعة على أرصدة كل الحسابات لحظيًا</p>

      {/* بطاقة الإجمالي */}
      <div className="bg-vault-900 text-paper rounded-2xl p-6 mb-8 flex items-center justify-between">
        <div>
          <div className="text-vault-300 text-sm mb-1">إجمالي الأرصدة (كل الحسابات)</div>
          <div className="text-3xl font-bold tabular-amount">
            {formatAmount(String(total))}
          </div>
        </div>
        <div className="w-14 h-14 rounded-full border-2 border-gold-500 flex items-center justify-center print:hidden">
          <span className="text-gold-500 text-xl font-bold">خ</span>
        </div>
      </div>

      {isLoading && <p className="text-vault-500">جاري التحميل...</p>}

      {/* الداش بورد: إيه اللي لينا وإيه اللي علينا */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Link
          to="/dues-and-checks"
          className="bg-white rounded-xl border border-vault-100 p-5 hover:border-gold-500 transition block"
        >
          <div className="text-xs text-vault-500 mb-1">مستحق للموردين (علينا)</div>
          <div className="text-lg font-semibold text-red-600 tabular-amount">
            {formatAmount(String(duesTotals?.totalVendorDues ?? 0))}
          </div>
          <div className="text-xs text-vault-400 mt-1">{duesTotals?.vendorDuesCount ?? 0} فاتورة</div>
        </Link>

        <Link
          to="/dues-and-checks"
          className="bg-white rounded-xl border border-vault-100 p-5 hover:border-gold-500 transition block"
        >
          <div className="text-xs text-vault-500 mb-1">مطلوب من العملاء (لينا)</div>
          <div className="text-lg font-semibold text-green-700 tabular-amount">
            {formatAmount(String(duesTotals?.totalCustomerDues ?? 0))}
          </div>
          <div className="text-xs text-vault-400 mt-1">{duesTotals?.customerDuesCount ?? 0} فاتورة</div>
        </Link>

        <Link
          to="/dues-and-checks"
          className="bg-white rounded-xl border border-vault-100 p-5 hover:border-gold-500 transition block"
        >
          <div className="text-xs text-vault-500 mb-1">شيكات متأخرة</div>
          <div className="text-lg font-semibold text-red-600 tabular-amount">
            {formatAmount(String(checksTotals?.overdueChecksAmount ?? 0))}
          </div>
          <div className="text-xs text-vault-400 mt-1">{checksTotals?.overdueChecksCount ?? 0} شيك</div>
        </Link>

        <Link
          to="/dues-and-checks"
          className="bg-white rounded-xl border border-vault-100 p-5 hover:border-gold-500 transition block"
        >
          <div className="text-xs text-vault-500 mb-1">شيكات تحت التحصيل</div>
          <div className="text-lg font-semibold text-amber-700 tabular-amount">
            {formatAmount(String(checksTotals?.upcomingChecksAmount ?? 0))}
          </div>
          <div className="text-xs text-vault-400 mt-1">{checksTotals?.upcomingChecksCount ?? 0} شيك</div>
        </Link>
      </div>

      <h2 className="text-lg font-semibold text-ink mb-4 print:hidden">أرصدة الحسابات</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.map((b) => (
          <Link
            key={b.id}
            to={`/statement?accountType=${b.accountType}&accountId=${b.accountId}`}
            className="bg-white rounded-xl border border-vault-100 p-5 hover:border-gold-500 transition block"
          >
            <div className="text-xs text-vault-500 mb-1">
              {typeLabels[b.accountType]} - {accountName(b)}
            </div>
            <div className="text-xl font-semibold text-ink tabular-amount">
              {formatAmount(b.currentBalance)}
            </div>
            <div className="text-xs text-gold-700 mt-2 print:hidden">عرض حركة الحساب ←</div>
          </Link>
        ))}
      </div>

      {data?.length === 0 && (
        <p className="text-vault-500 text-center py-12">
          لا يوجد أرصدة مسجلة حتى الآن - هتظهر هنا أول ما تتم أي عملية صرف أو تحويل
        </p>
      )}
    </div>
  );
}
