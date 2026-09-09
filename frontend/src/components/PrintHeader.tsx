import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

// هيدر ورقي بيظهر بس وقت الطباعة (مخفي تمامًا على الشاشة العادية)
// بياخد بيانات الشركة من شاشة الإعدادات عشان كل الأذون والتقارير تتطبع بترويسة موحّدة
export default function PrintHeader() {
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => (await api.get('/settings')).data,
    staleTime: 5 * 60 * 1000,
  });

  const contactLine = [settings?.companyAddress, settings?.companyPhone]
    .filter(Boolean)
    .join(' - ');

  return (
    <div className="hidden print:block mb-6 pb-3 border-b-2 border-vault-900">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-vault-900">
            {settings?.companyName ?? 'اسم الشركة'}
          </h2>
          {contactLine && <p className="text-xs text-vault-700 mt-1">{contactLine}</p>}
        </div>
        <span className="text-xs text-vault-500">
          تاريخ الطباعة: {new Date().toLocaleDateString('ar-EG')}
        </span>
      </div>
    </div>
  );
}
