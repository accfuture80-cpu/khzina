import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => (await api.get('/settings')).data,
  });
  const { data: workflow } = useQuery({
    queryKey: ['workflow-settings'],
    queryFn: async () => (await api.get('/settings/workflow')).data,
  });

  const [form, setForm] = useState({ companyName: '', companyAddress: '', companyPhone: '' });
  const [saved, setSaved] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  useEffect(() => {
    if (data) {
      setForm({
        companyName: data.companyName ?? '',
        companyAddress: data.companyAddress ?? '',
        companyPhone: data.companyPhone ?? '',
      });
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: async () => (await api.patch('/settings', form)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const workflowMutation = useMutation({
    mutationFn: async (patch: { requireFinancialReview?: boolean; requireGmApproval?: boolean }) =>
      (await api.patch('/settings/workflow', patch)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workflow-settings'] }),
  });

  const resetMutation = useMutation({
    mutationFn: async () => (await api.post('/settings/reset-system')).data,
    onSuccess: (result) => {
      setResetMessage(result.message);
      setResetConfirmText('');
      queryClient.clear();
      setTimeout(() => navigate('/'), 2500);
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink mb-1">الإعدادات</h1>
      <p className="text-vault-500 mb-6">بيانات الشركة، دورة الاعتماد، وإعدادات النظام العامة</p>

      {/* بيانات الشركة */}
      <div className="bg-white rounded-xl border border-vault-100 p-6 max-w-lg mb-6">
        <h3 className="font-semibold text-ink mb-4">بيانات الشركة</h3>
        <label className="block mb-4">
          <span className="text-sm text-ink/70 mb-1 block">اسم الشركة</span>
          <input
            value={form.companyName}
            onChange={(e) => setForm((p) => ({ ...p, companyName: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-vault-100 text-sm"
          />
        </label>

        <label className="block mb-4">
          <span className="text-sm text-ink/70 mb-1 block">العنوان</span>
          <input
            value={form.companyAddress}
            onChange={(e) => setForm((p) => ({ ...p, companyAddress: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-vault-100 text-sm"
          />
        </label>

        <label className="block mb-6">
          <span className="text-sm text-ink/70 mb-1 block">رقم التليفون</span>
          <input
            value={form.companyPhone}
            onChange={(e) => setForm((p) => ({ ...p, companyPhone: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-vault-100 text-sm"
          />
        </label>

        <div className="flex items-center gap-3">
          <button
            onClick={() => updateMutation.mutate()}
            className="px-5 py-2 bg-vault-700 text-white rounded-lg text-sm hover:bg-vault-900"
          >
            حفظ
          </button>
          {saved && <span className="text-green-600 text-sm">تم الحفظ ✓</span>}
        </div>
      </div>

      {/* دورة الاعتماد */}
      <div className="bg-white rounded-xl border border-vault-100 p-6 max-w-lg mb-6">
        <h3 className="font-semibold text-ink mb-1">دورة اعتماد الأذون</h3>
        <p className="text-xs text-vault-500 mb-4">
          الاعتماد الأول (مدير إداري/إنتاجي) إجباري دايمًا. تقدر تتحكم في باقي الخطوات هنا.
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-ink">١. اعتماد أول (مدير إداري/إنتاجي)</div>
              <div className="text-xs text-vault-400">خطوة إجبارية - مينفعش تتقفل</div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs bg-vault-100 text-vault-700">مفعّلة دايمًا</span>
          </div>

          <div className="flex items-center justify-between border-t border-vault-50 pt-4">
            <div>
              <div className="text-sm text-ink">٢. المراجعة المالية (المدير المالي)</div>
              <div className="text-xs text-vault-400">لو قفلتها، الإذن يتخطاها بعد الاعتماد الأول</div>
            </div>
            <button
              onClick={() =>
                workflowMutation.mutate({ requireFinancialReview: !workflow?.requireFinancialReview })
              }
              className={`w-12 h-6 rounded-full transition relative ${
                workflow?.requireFinancialReview ? 'bg-vault-700' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition ${
                  workflow?.requireFinancialReview ? 'right-0.5' : 'right-6'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between border-t border-vault-50 pt-4">
            <div>
              <div className="text-sm text-ink">٣. اعتماد المدير العام</div>
              <div className="text-xs text-vault-400">لو قفلتها، الإذن يوصل "معتمد نهائيًا" من غير ما يعدي عليه</div>
            </div>
            <button
              onClick={() => workflowMutation.mutate({ requireGmApproval: !workflow?.requireGmApproval })}
              className={`w-12 h-6 rounded-full transition relative ${
                workflow?.requireGmApproval ? 'bg-vault-700' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition ${
                  workflow?.requireGmApproval ? 'right-0.5' : 'right-6'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* منطقة الخطر: تصفير النظام */}
      <div className="bg-white rounded-xl border border-red-200 p-6 max-w-lg">
        <h3 className="font-semibold text-red-700 mb-1">منطقة الخطر</h3>
        <p className="text-xs text-vault-500 mb-4">
          تصفير النظام بيمسح كل الأذون والحركات والتحويلات والأرصدة والمستحقات والشيكات نهائيًا
          ومفيش رجوع فيه. التكويد الأساسي (فروع، بنوك، موظفين، موردين، عملاء...) والمستخدمين مش
          بيتأثروا. استخدمها لو عايز تبدأ تشغيل حقيقي بعد فترة تجربة.
        </p>

        {resetMessage ? (
          <p className="text-green-700 text-sm">{resetMessage} - هيتم تحويلك للصفحة الرئيسية...</p>
        ) : (
          <>
            <label className="block mb-3">
              <span className="text-xs text-ink/70 mb-1 block">
                اكتب <span className="font-mono font-bold">تصفير</span> عشان تأكد
              </span>
              <input
                value={resetConfirmText}
                onChange={(e) => setResetConfirmText(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-red-200 text-sm"
              />
            </label>
            <button
              onClick={() => resetMutation.mutate()}
              disabled={resetConfirmText !== 'تصفير' || resetMutation.isPending}
              className="px-5 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {resetMutation.isPending ? 'جاري التصفير...' : 'تصفير النظام نهائيًا'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
