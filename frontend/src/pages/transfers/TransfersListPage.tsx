import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';

const kindLabels: Record<string, string> = {
  main_treasury: 'الخزينة الرئيسية',
  branch: 'فرع',
  bank: 'بنك',
  wallet: 'محفظة',
};

export default function TransfersListPage() {
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  // مدير النظام والمدير المالي عندهم صلاحية كاملة (نفس القاعدة في الباك اند)
  const hasFullAccess = hasRole('system_admin', 'financial_manager');

  const { data, isLoading } = useQuery({
    queryKey: ['transfers'],
    queryFn: async () => (await api.get('/transfers')).data,
  });

  const approveMutation = useMutation({
    mutationFn: async (id: number) => (await api.post(`/transfers/${id}/approve`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transfers'] }),
  });

  const executeMutation = useMutation({
    mutationFn: async (id: number) => (await api.post(`/transfers/${id}/execute`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transfers'] }),
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink mb-1">التحويلات</h1>
      <p className="text-vault-500 mb-6">التحويلات بين الخزينة والبنوك والمحافظ الإلكترونية</p>

      <div className="bg-white rounded-xl border border-vault-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-vault-50 text-vault-700">
            <tr>
              <th className="px-4 py-3 text-right font-medium">رقم التحويل</th>
              <th className="px-4 py-3 text-right font-medium">من</th>
              <th className="px-4 py-3 text-right font-medium">إلى</th>
              <th className="px-4 py-3 text-right font-medium">المبلغ</th>
              <th className="px-4 py-3 text-right font-medium">الحالة</th>
              <th className="px-4 py-3 text-right font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {data?.map((t: any) => (
              <tr key={t.id} className="border-t border-vault-50">
                <td className="px-4 py-3 font-medium">{t.serialNumber}</td>
                <td className="px-4 py-3">{kindLabels[t.fromType]} #{t.fromId}</td>
                <td className="px-4 py-3">{kindLabels[t.toType]} #{t.toId}</td>
                <td className="px-4 py-3 tabular-amount">
                  {Number(t.amount).toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3">
                  {t.status === 'pending' ? 'بانتظار الاعتماد' : t.status === 'approved' ? 'معتمد' : 'منفذ'}
                </td>
                <td className="px-4 py-3 space-x-2 space-x-reverse">
                  {t.status === 'pending' && (hasFullAccess || hasRole('financial_manager')) && (
                    <button
                      onClick={() => approveMutation.mutate(t.id)}
                      className="text-vault-700 hover:text-gold-700"
                    >
                      اعتماد
                    </button>
                  )}
                  {t.status === 'approved' && (hasFullAccess || hasRole('treasury_accountant')) && (
                    <button
                      onClick={() => executeMutation.mutate(t.id)}
                      className="text-vault-700 hover:text-gold-700"
                    >
                      تنفيذ
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && data?.length === 0 && (
          <p className="text-center text-vault-500 py-10">لا يوجد تحويلات حتى الآن</p>
        )}
      </div>
    </div>
  );
}
