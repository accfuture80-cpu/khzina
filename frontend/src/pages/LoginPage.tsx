import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch {
      setError('اسم المستخدم أو كلمة السر غير صحيحة');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* اللوحة الجانبية - الهوية البصرية */}
      <div className="hidden lg:flex lg:w-1/2 bg-vault-900 relative overflow-hidden items-center justify-center">
        {/* نمط خطوط دفتر الأستاذ كخلفية زخرفية خفيفة */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.07]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="ledger" width="100%" height="56" patternUnits="userSpaceOnUse">
              <line x1="0" y1="56" x2="100%" y2="56" stroke="#E5C877" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ledger)" />
        </svg>

        <div className="relative z-10 text-center px-12">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full border-2 border-gold-500 flex items-center justify-center">
            <span className="text-gold-500 text-2xl font-bold">خ</span>
          </div>
          <h1 className="text-4xl font-bold text-paper mb-3">نظام الخزينة</h1>
          <p className="text-vault-300 text-lg">
            إدارة متكاملة للخزينة، الأذون، والاعتمادات المالية
          </p>
        </div>
      </div>

      {/* نموذج تسجيل الدخول */}
      <div className="flex-1 flex items-center justify-center px-6">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <h2 className="text-2xl font-semibold text-ink mb-1">تسجيل الدخول</h2>
          <p className="text-vault-500 mb-8">أدخل بياناتك للوصول للنظام</p>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <label className="block mb-4">
            <span className="text-sm text-ink/70 mb-1 block">اسم المستخدم</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-vault-100 focus:border-vault-500 focus:outline-none focus:ring-2 focus:ring-vault-100 transition"
              required
            />
          </label>

          <label className="block mb-6">
            <span className="text-sm text-ink/70 mb-1 block">كلمة السر</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-vault-100 focus:border-vault-500 focus:outline-none focus:ring-2 focus:ring-vault-100 transition"
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-vault-700 text-white font-medium hover:bg-vault-900 transition disabled:opacity-50"
          >
            {loading ? 'جاري الدخول...' : 'دخول'}
          </button>
        </form>
      </div>
    </div>
  );
}
