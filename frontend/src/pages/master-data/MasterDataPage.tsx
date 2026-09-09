import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import { AxiosError } from 'axios';
import PrintHeader from '../../components/PrintHeader';

interface FieldConfig {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'select';
  // للحقول من نوع select: منين نجيب الخيارات وإزاي نعرض كل خيار
  relationEndpoint?: string;
  optionLabel?: (item: any) => string;
}

interface ResourceConfig {
  endpoint: string;
  title: string;
  fields: FieldConfig[];
}

// إعدادات كل جدول تكويد - أضف هنا أي جدول جديد بسهولة وهيظهر تلقائيًا كتاب فوق
const RESOURCES: Record<string, ResourceConfig> = {
  branches: {
    endpoint: '/branches',
    title: 'الفروع',
    fields: [
      { key: 'code', label: 'الكود' },
      { key: 'name', label: 'الاسم' },
    ],
  },
  'cost-centers': {
    endpoint: '/cost-centers',
    title: 'مراكز التكلفة',
    fields: [
      { key: 'code', label: 'الكود' },
      { key: 'name', label: 'الاسم' },
    ],
  },
  'expense-categories-main': {
    endpoint: '/expense-categories-main',
    title: 'المصروف الرئيسي',
    fields: [
      { key: 'code', label: 'الكود' },
      { key: 'name', label: 'الاسم' },
    ],
  },
  'expense-categories-sub': {
    endpoint: '/expense-categories-sub',
    title: 'المصروف الفرعي',
    fields: [
      { key: 'code', label: 'الكود' },
      { key: 'name', label: 'الاسم' },
      {
        key: 'mainCategory',
        label: 'المصروف الرئيسي',
        type: 'select',
        relationEndpoint: '/expense-categories-main',
        optionLabel: (item) => item.name,
      },
    ],
  },
  currencies: {
    endpoint: '/currencies',
    title: 'العملات',
    fields: [
      { key: 'code', label: 'الكود' },
      { key: 'name', label: 'الاسم' },
      { key: 'symbol', label: 'الرمز' },
    ],
  },
  'bank-accounts': {
    endpoint: '/bank-accounts',
    title: 'البنوك',
    fields: [
      { key: 'code', label: 'الكود' },
      { key: 'bankName', label: 'اسم البنك' },
      { key: 'branchName', label: 'الفرع' },
      { key: 'accountNumber', label: 'رقم الحساب' },
      { key: 'responsiblePerson', label: 'المسؤول' },
      {
        key: 'currency',
        label: 'العملة',
        type: 'select',
        relationEndpoint: '/currencies',
        optionLabel: (item) => item.code,
      },
      { key: 'openingBalance', label: 'الرصيد الافتتاحي', type: 'number' },
    ],
  },
  'e-wallets': {
    endpoint: '/e-wallets',
    title: 'المحافظ الإلكترونية',
    fields: [
      { key: 'code', label: 'الكود' },
      { key: 'walletProvider', label: 'مزوّد الخدمة' },
      { key: 'phoneNumber', label: 'رقم الهاتف' },
      { key: 'ownerName', label: 'اسم المسؤول' },
      { key: 'openingBalance', label: 'الرصيد الافتتاحي', type: 'number' },
    ],
  },
  employees: {
    endpoint: '/employees',
    title: 'الموظفين',
    fields: [
      { key: 'code', label: 'الكود' },
      { key: 'name', label: 'الاسم' },
      { key: 'jobTitle', label: 'الوظيفة' },
      { key: 'department', label: 'القسم' },
    ],
  },
  vehicles: {
    endpoint: '/vehicles',
    title: 'السيارات',
    fields: [
      { key: 'code', label: 'الكود' },
      { key: 'plateNumber', label: 'رقم اللوحة' },
      { key: 'model', label: 'الموديل' },
      {
        key: 'driver',
        label: 'السائق',
        type: 'select',
        relationEndpoint: '/employees',
        optionLabel: (item) => item.name,
      },
    ],
  },
  vendors: {
    endpoint: '/vendors',
    title: 'الموردين',
    fields: [
      { key: 'code', label: 'الكود' },
      { key: 'name', label: 'الاسم' },
      { key: 'phone', label: 'التليفون' },
    ],
  },
  customers: {
    endpoint: '/customers',
    title: 'العملاء',
    fields: [
      { key: 'code', label: 'الكود' },
      { key: 'name', label: 'الاسم' },
      { key: 'phone', label: 'التليفون' },
    ],
  },
};

// ترتيب ظهور التابات فوق الجدول
const RESOURCE_ORDER = Object.keys(RESOURCES);

export default function MasterDataPage() {
  const { resource = 'branches' } = useParams();
  const navigate = useNavigate();
  const config = RESOURCES[resource] ?? RESOURCES.branches;
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  // امسح النموذج ولغّي وضع التعديل لو المستخدم نقل لتاب تاني
  useEffect(() => {
    setForm({});
    setEditingId(null);
    setSearch('');
  }, [resource]);

  const { data, isLoading } = useQuery({
    queryKey: [config.endpoint],
    queryFn: async () => (await api.get(config.endpoint)).data,
  });

  // بحث بسيط بيدور في كل الأعمدة النصية الظاهرة في الجدول - مفيد لما العدد يكبر
  const filteredData = useMemo(() => {
    if (!data) return data;
    const term = search.trim().toLowerCase();
    if (!term) return data;
    return data.filter((row: any) =>
      config.fields.some((f) => {
        const value = f.type === 'select' ? (f.optionLabel?.(row[f.key]) ?? '') : row[f.key];
        return String(value ?? '').toLowerCase().includes(term);
      }),
    );
  }, [data, search, config.fields]);

  function buildPayload() {
    const payload: Record<string, unknown> = {};
    for (const f of config.fields) {
      const raw = form[f.key];
      if (raw === undefined || raw === '') continue;
      if (f.type === 'select') payload[f.key] = { id: Number(raw) };
      else if (f.type === 'number') payload[f.key] = Number(raw);
      else payload[f.key] = raw;
    }
    return payload;
  }

  const createMutation = useMutation({
    mutationFn: async () => (await api.post(config.endpoint, buildPayload())).data,
    onSuccess: () => {
      setForm({});
      queryClient.invalidateQueries({ queryKey: [config.endpoint] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      alert(error.response?.data?.message ?? 'حصل خطأ أثناء الإضافة');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => (await api.patch(`${config.endpoint}/${editingId}`, buildPayload())).data,
    onSuccess: () => {
      setForm({});
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: [config.endpoint] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      alert(error.response?.data?.message ?? 'حصل خطأ أثناء التعديل');
    },
  });

  // يحمّل بيانات الصف في نموذج الإضافة عشان تعدّل عليه وتحفظ
  function startEdit(row: any) {
    const next: Record<string, string> = {};
    for (const f of config.fields) {
      const value = row[f.key];
      next[f.key] = f.type === 'select' ? (value?.id != null ? String(value.id) : '') : (value ?? '');
    }
    setForm(next);
    setEditingId(row.id);
  }

  function cancelEdit() {
    setForm({});
    setEditingId(null);
  }

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => api.delete(`${config.endpoint}/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [config.endpoint] }),
    onError: (error: AxiosError<{ message?: string }>) => {
      alert(error.response?.data?.message ?? 'حصل خطأ أثناء الحذف');
    },
  });

  return (
    <div>
      <PrintHeader />
      <div className="flex items-center justify-between mb-1 print:hidden">
        <h1 className="text-2xl font-semibold text-ink">التكويد الأساسي - {config.title}</h1>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 text-sm rounded-lg border border-vault-100 hover:bg-vault-50"
        >
          طباعة
        </button>
      </div>
      <p className="text-vault-500 mb-4 print:hidden">إضافة وتعديل بيانات جداول التكويد المختلفة</p>

      {/* تابات التنقل بين كل شاشات التكويد */}
      <div className="flex flex-wrap gap-2 mb-6 print:hidden">
        {RESOURCE_ORDER.map((key) => (
          <button
            key={key}
            onClick={() => navigate(`/master-data/${key}`)}
            className={`px-4 py-1.5 rounded-full text-sm transition ${
              resource === key
                ? 'bg-vault-900 text-white'
                : 'bg-white text-vault-700 border border-vault-100'
            }`}
          >
            {RESOURCES[key].title}
          </button>
        ))}
      </div>

      {/* نموذج إضافة سريع */}
      <div className="bg-white rounded-xl border border-vault-100 p-5 mb-4 print:hidden">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          {config.fields.map((f) =>
            f.type === 'select' ? (
              <RelationField
                key={f.key}
                field={f}
                value={form[f.key] ?? ''}
                onChange={(v) => setForm((p) => ({ ...p, [f.key]: v }))}
              />
            ) : (
              <label key={f.key} className="block">
                <span className="text-xs text-ink/70 mb-1 block">{f.label}</span>
                <input
                  type={f.type === 'number' ? 'number' : 'text'}
                  value={form[f.key] ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-vault-100 text-sm"
                />
              </label>
            ),
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => (editingId ? updateMutation.mutate() : createMutation.mutate())}
            className="px-5 py-2 bg-vault-700 text-white rounded-lg text-sm hover:bg-vault-900"
          >
            {editingId ? 'تحديث' : 'إضافة'}
          </button>
          {editingId && (
            <button
              onClick={cancelEdit}
              className="px-5 py-2 bg-white border border-vault-100 text-vault-700 rounded-lg text-sm hover:bg-vault-50"
            >
              إلغاء
            </button>
          )}
        </div>
      </div>

      {/* البحث */}
      <div className="flex items-center justify-between mb-3 print:hidden">
        <div className="relative w-full max-w-xs">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`بحث في ${config.title}...`}
            className="w-full px-3 py-2 rounded-lg border border-vault-100 text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-vault-500 hover:text-vault-900 text-xs"
            >
              مسح
            </button>
          )}
        </div>
        {!isLoading && (
          <span className="text-xs text-vault-500">
            {filteredData?.length ?? 0} من {data?.length ?? 0}
          </span>
        )}
      </div>

      {/* الجدول */}
      <div className="bg-white rounded-xl border border-vault-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-vault-50 text-vault-700">
            <tr>
              {config.fields.map((f) => (
                <th key={f.key} className="px-4 py-3 text-right font-medium">
                  {f.label}
                </th>
              ))}
              <th className="px-4 py-3 print:hidden"></th>
            </tr>
          </thead>
          <tbody>
            {filteredData?.map((row: any) => (
              <tr key={row.id} className="border-t border-vault-50">
                {config.fields.map((f) => (
                  <td key={f.key} className="px-4 py-3">
                    {f.type === 'select'
                      ? row[f.key]
                        ? f.optionLabel?.(row[f.key])
                        : '-'
                      : row[f.key]}
                  </td>
                ))}
                <td className="px-4 py-3 print:hidden">
                  <div className="flex gap-3">
                    <button
                      onClick={() => startEdit(row)}
                      className="text-vault-700 hover:text-vault-900"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(row.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      حذف
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && data?.length === 0 && (
          <p className="text-center text-vault-500 py-10">لا يوجد بيانات حتى الآن</p>
        )}
        {!isLoading && (data?.length ?? 0) > 0 && filteredData?.length === 0 && (
          <p className="text-center text-vault-500 py-10">لا توجد نتائج مطابقة للبحث</p>
        )}
      </div>
    </div>
  );
}

// حقل Dropdown بيجيب خياراته من API خاص بيه (مثلاً اختيار العملة أو المصروف الرئيسي)
function RelationField({
  field,
  value,
  onChange,
}: {
  field: FieldConfig;
  value: string;
  onChange: (value: string) => void;
}) {
  const { data: options } = useQuery({
    queryKey: [field.relationEndpoint],
    queryFn: async () => (await api.get(field.relationEndpoint!)).data,
    enabled: !!field.relationEndpoint,
  });

  return (
    <label className="block">
      <span className="text-xs text-ink/70 mb-1 block">{field.label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-vault-100 text-sm bg-white"
      >
        <option value="">اختر...</option>
        {options?.map((opt: any) => (
          <option key={opt.id} value={opt.id}>
            {field.optionLabel?.(opt) ?? opt.id}
          </option>
        ))}
      </select>
    </label>
  );
}
