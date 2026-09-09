import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../../api/client';
import AttachmentsPanel from '../../components/AttachmentsPanel';
import SearchableSelect from '../../components/SearchableSelect';
import SubCategorySelect from '../../components/SubCategorySelect';
import { useAuth } from '../../contexts/AuthContext';

type LineType =
  | 'expense'
  | 'custody_advance'
  | 'vendor_payment'
  | 'other_revenue'
  | 'customer_collection'
  | 'custody_repayment'
  | 'bank_commission'
  | 'transfer'
  | 'treasury_funding';

const lineTypeLabels: Record<LineType, string> = {
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

interface VoucherLineForm {
  lineType: LineType;
  mainCategoryId?: number;
  subCategoryId?: number;
  costCenterId?: number;
  employeeId?: number;
  vehicleId?: number;
  vendorId?: number;
  customerId?: number;
  amount: number;
  description?: string;
}

function emptyLine(): VoucherLineForm {
  return { lineType: 'expense', amount: 0 };
}

export default function CreateVoucherPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const { user } = useAuth();

  const isAdminManager = user?.roles?.includes('admin_manager');
  const isProductionManager = user?.roles?.includes('production_manager');
  const isManager = isAdminManager || isProductionManager;

  const [voucherType, setVoucherType] = useState<'expense' | 'revenue'>('expense');
  const [voucherDate, setVoucherDate] = useState(new Date().toISOString().slice(0, 10));
  const [currencyId, setCurrencyId] = useState<number>();
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank' | 'wallet'>('cash');
  const [branchId, setBranchId] = useState<number>();
  const [bankAccountId, setBankAccountId] = useState<number>();
  const [walletId, setWalletId] = useState<number>();
  const [approvalPath, setApprovalPath] = useState<'admin_manager' | 'production_manager'>(
    'production_manager',
  );
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<VoucherLineForm[]>([emptyLine()]);
  const [error, setError] = useState('');

  // لو مدير إداري أو إنتاجي — إجبار المحفظة
  useEffect(() => {
    if (isManager) {
      setPaymentMethod('wallet');
    }
  }, [isManager]);

  const { data: existingVoucher, isLoading: isLoadingVoucher } = useQuery({
    queryKey: ['voucher', id],
    queryFn: async () => (await api.get(`/vouchers/${id}`)).data,
    enabled: isEditMode,
  });

  useEffect(() => {
    if (!existingVoucher) return;
    setVoucherType(existingVoucher.voucherType);
    setVoucherDate(existingVoucher.voucherDate?.slice(0, 10) ?? voucherDate);
    setCurrencyId(existingVoucher.currency?.id);
    setPaymentMethod(existingVoucher.paymentMethod);
    setBranchId(existingVoucher.branch?.id);
    setBankAccountId(existingVoucher.bankAccount?.id);
    setWalletId(existingVoucher.wallet?.id);
    if (existingVoucher.approvalPath) setApprovalPath(existingVoucher.approvalPath);
    setNotes(existingVoucher.notes ?? '');
    if (existingVoucher.lines?.length) {
      setLines(
        existingVoucher.lines.map((l: any) => ({
          lineType: l.lineType,
          mainCategoryId: l.mainCategory?.id,
          subCategoryId: l.subCategory?.id,
          costCenterId: l.costCenter?.id,
          employeeId: l.employee?.id,
          vehicleId: l.vehicle?.id,
          vendorId: l.vendor?.id,
          customerId: l.customer?.id,
          amount: Number(l.amount),
          description: l.description ?? '',
        })),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingVoucher]);

  const { data: currencies } = useQuery({
    queryKey: ['currencies'],
    queryFn: async () => (await api.get('/currencies')).data,
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
  const { data: mainCategories } = useQuery({
    queryKey: ['expense-categories-main'],
    queryFn: async () => (await api.get('/expense-categories-main')).data,
  });
  const { data: costCenters } = useQuery({
    queryKey: ['cost-centers'],
    queryFn: async () => (await api.get('/cost-centers')).data,
  });
  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => (await api.get('/employees')).data,
  });
  const { data: vendors } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => (await api.get('/vendors')).data,
  });
  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => (await api.get('/customers')).data,
  });
  const { data: vehicles } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => (await api.get('/vehicles')).data,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!currencyId) {
        throw new Error('يجب اختيار العملة');
      }
      if (!walletId && isManager) {
        throw new Error('يجب اختيار المحفظة الإلكترونية');
      }

      const payload = {
        voucherType,
        voucherDate,
        currencyId: Number(currencyId),
        paymentMethod,
        branchId: paymentMethod === 'cash' ? branchId : undefined,
        bankAccountId: paymentMethod === 'bank' ? bankAccountId : undefined,
        walletId: paymentMethod === 'wallet' ? walletId : undefined,
        approvalPath: voucherType === 'expense' ? approvalPath : undefined,
        notes,
        lines,
      };
      return isEditMode
        ? (await api.patch(`/vouchers/${id}`, payload)).data
        : (await api.post('/vouchers', payload)).data;
    },
    onSuccess: (voucher) => navigate(`/vouchers/${voucher.id}`),
    onError: (err: any) =>
      setError(err.response?.data?.message ?? err.message ?? 'حصل خطأ أثناء حفظ الإذن'),
  });

  function updateLine(index: number, patch: Partial<VoucherLineForm>) {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }

  function addLine() {
    setLines((prev) => [...prev, emptyLine()]);
  }

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  const total = lines.reduce((sum, l) => sum + (Number(l.amount) || 0), 0);

  const availableLineTypes: LineType[] =
    voucherType === 'expense'
      ? ['expense', 'custody_advance', 'vendor_payment', 'bank_commission', 'transfer']
      : ['other_revenue', 'customer_collection', 'custody_repayment', 'treasury_funding'];

  if (isEditMode && isLoadingVoucher) {
    return <p className="text-vault-500">جاري تحميل بيانات الإذن...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink mb-1">
        {isEditMode ? `تعديل إذن رقم ${existingVoucher?.serialNumber ?? ''}` : 'إذن جديد'}
      </h1>
      <p className="text-vault-500 mb-6">
        {isEditMode
          ? 'تعديل بيانات وبنود الإذن قبل إعادة إرساله للاعتماد'
          : 'إنشاء إذن صرف أو إيراد جديد للمراجعة والاعتماد'}
      </p>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      <div className="bg-white rounded-xl border border-vault-100 p-6 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <label className="block">
            <span className="text-sm text-ink/70 mb-1 block">نوع الإذن</span>
            <select
              value={voucherType}
              onChange={(e) => setVoucherType(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg border border-vault-100"
            >
              <option value="expense">إذن صرف</option>
              <option value="revenue">إذن إيراد</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm text-ink/70 mb-1 block">التاريخ</span>
            <input
              type="date"
              value={voucherDate}
              onChange={(e) => setVoucherDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-vault-100"
            />
          </label>

          <label className="block">
            <span className="text-sm text-ink/70 mb-1 block">العملة</span>
            <select
              value={currencyId ?? ''}
              onChange={(e) => setCurrencyId(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-vault-100"
            >
              <option value="">اختر العملة</option>
              {currencies?.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <label className="block">
            <span className="text-sm text-ink/70 mb-1 block">طريقة الدفع</span>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              disabled={isManager}
              className="w-full px-3 py-2 rounded-lg border border-vault-100 disabled:bg-gray-100"
            >
              <option value="cash">نقدي (خزينة/فرع)</option>
              <option value="bank">بنك</option>
              <option value="wallet">محفظة إلكترونية</option>
            </select>
            {isManager && (
              <p className="text-xs text-amber-600 mt-1">المدير الإداري/الإنتاجي: محفظة إلكترونية فقط</p>
            )}
          </label>

          {paymentMethod === 'cash' && !isManager && (
            <label className="block">
              <span className="text-sm text-ink/70 mb-1 block">الفرع / الخزينة</span>
              <select
                value={branchId ?? ''}
                onChange={(e) => setBranchId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-vault-100"
              >
                <option value="">اختر</option>
                {branches?.map((b: any) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          {paymentMethod === 'bank' && !isManager && (
            <label className="block">
              <span className="text-sm text-ink/70 mb-1 block">الحساب البنكي</span>
              <select
                value={bankAccountId ?? ''}
                onChange={(e) => setBankAccountId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-vault-100"
              >
                <option value="">اختر</option>
                {bankAccounts?.map((b: any) => (
                  <option key={b.id} value={b.id}>
                    {b.bankName} - {b.accountNumber}
                  </option>
                ))}
              </select>
            </label>
          )}

          {paymentMethod === 'wallet' && (
            <label className="block">
              <span className="text-sm text-ink/70 mb-1 block">المحفظة</span>
              <select
                value={walletId ?? ''}
                onChange={(e) => setWalletId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-vault-100"
              >
                <option value="">اختر</option>
                {wallets?.map((w: any) => (
                  <option key={w.id} value={w.id}>
                    {w.walletProvider} - {w.phoneNumber}
                  </option>
                ))}
              </select>
            </label>
          )}

          {voucherType === 'expense' && !isManager && (
            <label className="block">
              <span className="text-sm text-ink/70 mb-1 block">مسار الاعتماد</span>
              <select
                value={approvalPath}
                onChange={(e) => setApprovalPath(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-vault-100"
              >
                <option value="production_manager">مدير الإنتاج</option>
                <option value="admin_manager">مدير إداري</option>
              </select>
            </label>
          )}

          {voucherType === 'expense' && isManager && (
            <label className="block">
              <span className="text-sm text-ink/70 mb-1 block">مسار الاعتماد</span>
              <select
                value={isAdminManager ? 'admin_manager' : 'production_manager'}
                disabled
                className="w-full px-3 py-2 rounded-lg border border-vault-100 disabled:bg-gray-100"
              >
                <option value="admin_manager">مدير إداري</option>
                <option value="production_manager">مدير الإنتاج</option>
              </select>
            </label>
          )}
        </div>

        <label className="block">
          <span className="text-sm text-ink/70 mb-1 block">ملاحظات</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-vault-100"
          />
        </label>
      </div>

      <div className="bg-white rounded-xl border border-vault-100 p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-ink">البنود</h3>
          <button
            onClick={addLine}
            type="button"
            className="text-sm text-vault-700 hover:text-gold-700"
          >
            + إضافة بند
          </button>
        </div>

        <div className="space-y-4">
          {lines.map((line, i) => (
            <div key={i} className="border border-vault-50 rounded-lg p-4 relative">
              {lines.length > 1 && (
                <button
                  onClick={() => removeLine(i)}
                  type="button"
                  className="absolute left-3 top-3 text-red-500 text-sm"
                >
                  حذف
                </button>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label className="block">
                  <span className="text-xs text-ink/70 mb-1 block">نوع البند</span>
                  <select
                    value={line.lineType}
                    onChange={(e) => updateLine(i, { lineType: e.target.value as LineType })}
                    className="w-full px-3 py-2 rounded-lg border border-vault-100 text-sm"
                  >
                    {availableLineTypes.map((t) => (
                      <option key={t} value={t}>
                        {lineTypeLabels[t]}
                      </option>
                    ))}
                  </select>
                </label>

                {(line.lineType === 'expense' || line.lineType === 'bank_commission') && (
                  <>
                    <label className="block">
                      <span className="text-xs text-ink/70 mb-1 block">المصروف الرئيسي</span>
                      <select
                        value={line.mainCategoryId ?? ''}
                        onChange={(e) =>
                          updateLine(i, {
                            mainCategoryId: Number(e.target.value),
                            subCategoryId: undefined,
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-vault-100 text-sm"
                      >
                        <option value="">اختر</option>
                        {mainCategories?.map((c: any) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <SubCategorySelect
                      mainCategoryId={line.mainCategoryId}
                      value={line.subCategoryId}
                      onChange={(v) => updateLine(i, { subCategoryId: v })}
                    />

                    <label className="block">
                      <span className="text-xs text-ink/70 mb-1 block">مركز التكلفة</span>
                      <select
                        value={line.costCenterId ?? ''}
                        onChange={(e) => updateLine(i, { costCenterId: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg border border-vault-100 text-sm"
                      >
                        <option value="">اختر</option>
                        {costCenters?.map((c: any) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="text-xs text-ink/70 mb-1 block">السيارة (اختياري)</span>
                      <select
                        value={line.vehicleId ?? ''}
                        onChange={(e) =>
                          updateLine(i, { vehicleId: e.target.value ? Number(e.target.value) : undefined })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-vault-100 text-sm"
                      >
                        <option value="">بدون سيارة</option>
                        {vehicles?.map((v: any) => (
                          <option key={v.id} value={v.id}>
                            {v.plateNumber ?? v.code} {v.driver ? `- السائق: ${v.driver.name}` : ''}
                          </option>
                        ))}
                      </select>
                    </label>
                  </>
                )}

                {(line.lineType === 'custody_advance' || line.lineType === 'custody_repayment') && (
                  <label className="block">
                    <span className="text-xs text-ink/70 mb-1 block">الموظف</span>
                    <select
                      value={line.employeeId ?? ''}
                      onChange={(e) => updateLine(i, { employeeId: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border border-vault-100 text-sm"
                    >
                      <option value="">اختر</option>
                      {employees?.map((emp: any) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {line.lineType === 'vendor_payment' && (
                  <label className="block">
                    <span className="text-xs text-ink/70 mb-1 block">المورد</span>
                    <SearchableSelect
                      options={(vendors ?? []).map((v: any) => ({ id: v.id, label: v.name }))}
                      value={line.vendorId}
                      onChange={(vendorId) => updateLine(i, { vendorId })}
                      placeholder="اكتب اسم المورد..."
                    />
                  </label>
                )}

                {(line.lineType === 'customer_collection' || line.lineType === 'other_revenue') && (
                  <label className="block">
                    <span className="text-xs text-ink/70 mb-1 block">العميل</span>
                    <SearchableSelect
                      options={(customers ?? []).map((c: any) => ({ id: c.id, label: c.name }))}
                      value={line.customerId}
                      onChange={(customerId) => updateLine(i, { customerId })}
                      placeholder="اكتب اسم العميل..."
                    />
                  </label>
                )}

                <label className="block">
                  <span className="text-xs text-ink/70 mb-1 block">المبلغ</span>
                  <input
                    type="number"
                    value={line.amount || ''}
                    onChange={(e) => updateLine(i, { amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-vault-100 text-sm tabular-amount"
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="text-xs text-ink/70 mb-1 block">البيان</span>
                  <input
                    value={line.description ?? ''}
                    onChange={(e) => updateLine(i, { description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-vault-100 text-sm"
                  />
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-vault-50 flex justify-between items-center">
          <span className="text-vault-500">الإجمالي</span>
          <span className="text-xl font-semibold text-ink tabular-amount">
            {total.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {isEditMode && <AttachmentsPanel attachableType="voucher" attachableId={Number(id)} />}

      <button
        onClick={() => saveMutation.mutate()}
        disabled={saveMutation.isPending}
        className="px-6 py-2.5 bg-vault-700 text-white rounded-lg hover:bg-vault-900 transition font-medium disabled:opacity-50"
      >
        {saveMutation.isPending ? 'جاري الحفظ...' : isEditMode ? 'حفظ التعديلات' : 'حفظ كمسودة'}
      </button>
    </div>
  );
}