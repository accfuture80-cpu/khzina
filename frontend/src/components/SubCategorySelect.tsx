import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

// Dropdown المصروف الفرعي - بيتحدث حسب المصروف الرئيسي المختار فقط
export default function SubCategorySelect({
  mainCategoryId,
  value,
  onChange,
}: {
  mainCategoryId?: number;
  value?: number;
  onChange: (v: number) => void;
}) {
  const { data } = useQuery({
    queryKey: ['expense-categories-sub', mainCategoryId],
    queryFn: async () =>
      (await api.get('/expense-categories-sub', { params: { mainCategoryId } })).data,
    enabled: !!mainCategoryId,
  });

  return (
    <label className="block">
      <span className="text-xs text-ink/70 mb-1 block">المصروف الفرعي</span>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={!mainCategoryId}
        className="w-full px-3 py-2 rounded-lg border border-vault-100 text-sm disabled:bg-vault-50"
      >
        <option value="">اختر</option>
        {data?.map((c: any) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </label>
  );
}
