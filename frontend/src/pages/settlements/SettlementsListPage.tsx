import { useMemo, useState, Fragment } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { api } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import SearchableSelect from '../../components/SearchableSelect';
import SubCategorySelect from '../../components/SubCategorySelect';

interface SettlementLineForm {
  mainCategoryId?: number;
  subCategoryId?: number;
  costCenterId?: number;
  amount: number;
  description?: string;
}

function emptyLine(): SettlementLineForm {
  return { amount: 0 };
}

export default function SettlementsListPage() {
  const { hasRole } = useAuth();
  const hasFullAccess = hasRole('system_admin', 'financial_manager');
  const canApprove = hasFullAccess || hasRole('financial_manager');
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [selectedLineId, setSelectedLineId] = useState<number | undefined>();
  const [settlementDate, setSettlementDate] = useState(new Date().toISOString().slice(0, 10));
  const [lines, setLines] = useState<SettlementLineForm[]>([emptyLine()]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['custody-settlements'],
    queryFn: async () => (await api.get('/custody-settlements')).data,
  });

  const { data: availableLines } = useQuery({
    queryKey: ['available-custody-lines'],
    queryFn: async () => (await api.get('/custody-settlements/available-custody-lines')).data,
  });

  const { data: mainCategories } = useQuery({
    queryKey: ['expense-categories-main'],
    queryFn: async () => (await api.get('/expense-categories-main')).data,
  });
  const { data: costCenters } = useQuery({
    queryKey: ['cost-centers'],
    queryFn: async () => (await api.get('/cost-centers')).data,
  });

  const selectedCustody = availableLines?.find((l: any) => l.lineId === selectedLineId);
  const totalEntered = lines.reduce((sum, l) => sum + (Number(l.amount) || 0), 0);
  const remainingAfter = selectedCustody ? selectedCustody.remaining - totalEntered : 0;

  function updateLine(index: number, patch: Partial<SettlementLineForm>) {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }

  function resetForm() {
    setSelectedLineId(undefined);
    setLines([emptyLine()]);
    setSettlementDate(new Date().toISOString().slice(0, 10));
    setShowForm(false);
  }

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!selectedCustody) throw new Error('اختر العهدة الأول');
      return (
        await api.post('/custody-settlements', {
          custodyVoucherLineId: selectedCustody.lineId,
          employeeId: selectedCustody.employeeId,
          settlementDate,
          lines: lines
            .filter((l) => l.amount > 0)
            .map((l) => ({
              mainCategoryId: l.mainCategoryId,
              subCategoryId: l.subCategoryId,
              costCenterId: l.costCenterId,
              amount: l.amount,
              description: l.description,
            })),
        })
      ).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custody-settlements'] });
      queryClient.invalidateQueries({ queryKey: ['available-custody-lines'] });
      resetForm();
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      alert(error.response?.data?.message ?? 'حصل خطأ أثناء حفظ التسوية');
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: number) => (await api.post(`/custody-settlements/${id}/approve`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['custody-settlements'] }),
    onError: (error: AxiosError<{ message?: string }>) => {
      alert(error.response?.data?.message ?? 'حصل خطأ أثناء الاعتماد');
    },
  });

  const custodyOptions = useMemo(
    () =>
      (availableLines ?? []).map((l: any) => ({
        id: l.lineId,
        label: `${l.employeeName} - إذن ${l.serialNumber} - متبقي ${l.remaining.toLocaleString('ar-EG')}`,
      })),
    [availableLines],
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-semibold text-ink">تسوية العهدة</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 bg-vault-700 text-white rounded-lg text-sm hover:bg-vault-900"
        >
          {showForm ? 'إلغاء' : 'تسوية جديدة'}
        </button>
      </div>
      <p className="text-vault-500 mb-6">تسويات العهد والسلف اللي أخدها الموظفين</p>

      {showForm && (
        <div className="bg-white rounded-xl border border-vault-100 p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <label className="block">
              <span className="text-xs text-ink/70 mb-1 block">العهدة/السلفة المطلوب تسويتها</span>
              <SearchableSelect
                options={custodyOptions}
                value={selectedLineId}
                onChange={setSelectedLineId}
                placeholder="اكتب اسم الموظف أو رقم الإذن..."
              />
            </label>
            <label className="block">
              <span className="text-xs text-ink/70 mb-1 block">تاريخ التسوية</span>
              <input
                type="date"
                value={settlementDate}
                onChange={(e) => setSettlementDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-vault-100 text-sm"
              />
            </label>
          </div>

          {selectedCustody && (
            <div className="bg-vault-50 rounded-lg p-3 mb-4 text-sm flex gap-6">
              <span>قيمة العهدة: {selectedCustody.amount.toLocaleString('ar-EG')}</span>
              <span>متسوّى قبل كده: {selectedCustody.settled.toLocaleString('ar-EG')}</span>
              <span className="font-medium text-vault-900">
                المتبقي: {selectedCustody.remaining.toLocaleString('ar-EG')}
              </span>
            </div>
          )}

          {/* بنود المصاريف - ممكن أكتر من مصروف على مراكز تكلفة مختلفة في نفس التسوية */}
          <div className="space-y-3 mb-3">
            {lines.map((line, i) => (
              <div
                key={i}
                className="grid grid-cols-2 md:grid-cols-5 gap-2 items-end bg-vault-50/50 p-3 rounded-lg"
              >
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
                  <span className="text-xs text-ink/70 mb-1 block">المبلغ</span>
                  <input
                    type="number"
                    value={line.amount || ''}
                    onChange={(e) => updateLine(i, { amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-vault-100 text-sm"
                  />
                </label>

                <div className="flex gap-2">
                  <label className="block flex-1">
                    <span className="text-xs text-ink/70 mb-1 block">بيان</span>
                    <input
                      type="text"
                      value={line.description ?? ''}
                      onChange={(e) => updateLine(i, { description: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-vault-100 text-sm"
                    />
                  </label>
                  {lines.length > 1 && (
                    <button
                      onClick={() => setLines((prev) => prev.filter((_, idx) => idx !== i))}
                      className="text-red-500 hover:text-red-700 text-sm px-2"
                    >
                      حذف
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setLines((prev) => [...prev, emptyLine()])}
            className="text-sm text-vault-700 hover:text-vault-900 mb-4"
          >
            + إضافة بند مصروف تاني
          </button>

          {selectedCustody && (
            <div
              className={`text-sm mb-4 ${remainingAfter < 0 ? 'text-red-600' : 'text-vault-500'}`}
            >
              إجمالي البنود: {totalEntered.toLocaleString('ar-EG')} - المتبقي بعد التسوية:{' '}
              {remainingAfter.toLocaleString('ar-EG')}
            </div>
          )}

          <button
            onClick={() => createMutation.mutate()}
            disabled={!selectedCustody || totalEntered <= 0 || createMutation.isPending}
            className="px-5 py-2 bg-vault-700 text-white rounded-lg text-sm hover:bg-vault-900 disabled:opacity-50"
          >
            {createMutation.isPending ? 'جاري الحفظ...' : 'حفظ التسوية'}
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-vault-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-vault-50 text-vault-700">
            <tr>
              <th className="px-4 py-3 text-right font-medium">رقم التسوية</th>
              <th className="px-4 py-3 text-right font-medium">الموظف</th>
              <th className="px-4 py-3 text-right font-medium">التاريخ</th>
              <th className="px-4 py-3 text-right font-medium">الحالة</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {data?.map((s: any) => (
              <Fragment key={s.id}>
                <tr className="border-t border-vault-50">
                  <td className="px-4 py-3 font-medium">{s.serialNumber}</td>
                  <td className="px-4 py-3">{s.employee?.name}</td>
                  <td className="px-4 py-3 text-vault-500">{s.settlementDate}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        s.status === 'approved'
                          ? 'bg-vault-100 text-vault-900'
                          : 'bg-gold-100 text-gold-700'
                      }`}
                    >
                      {s.status === 'approved' ? 'معتمدة' : 'بانتظار الاعتماد'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                        className="text-vault-700 hover:text-vault-900"
                      >
                        {expandedId === s.id ? 'إخفاء' : 'التفاصيل'}
                      </button>
                      {s.status === 'draft' && canApprove && (
                        <button
                          onClick={() => approveMutation.mutate(s.id)}
                          className="text-gold-700 hover:text-gold-900 font-medium"
                        >
                          اعتماد
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                {expandedId === s.id && (
                  <tr className="bg-vault-50/50">
                    <td colSpan={5} className="px-4 py-3">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-vault-500">
                            <th className="text-right py-1">المصروف الرئيسي</th>
                            <th className="text-right py-1">المصروف الفرعي</th>
                            <th className="text-right py-1">مركز التكلفة</th>
                            <th className="text-right py-1">البيان</th>
                            <th className="text-right py-1">المبلغ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {s.lines?.map((l: any) => (
                            <tr key={l.id} className="border-t border-vault-100">
                              <td className="py-1.5">{l.mainCategory?.name ?? '-'}</td>
                              <td className="py-1.5">{l.subCategory?.name ?? '-'}</td>
                              <td className="py-1.5">{l.costCenter?.name ?? '-'}</td>
                              <td className="py-1.5">{l.description ?? '-'}</td>
                              <td className="py-1.5 tabular-amount">
                                {Number(l.amount).toLocaleString('ar-EG')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
        {!isLoading && data?.length === 0 && (
          <p className="text-center text-vault-500 py-10">لا يوجد تسويات حتى الآن</p>
        )}
      </div>
    </div>
  );
}
