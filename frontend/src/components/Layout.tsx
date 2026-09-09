import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { to: '/', label: 'الأرصدة', end: true },
  { to: '/vouchers', label: 'الأذون' },
  { to: '/settlements', label: 'تسوية العهدة' },
  { to: '/transfers', label: 'التحويلات' },
  { to: '/statement', label: 'كشف الحساب' },
  { to: '/parties-statement', label: 'الموردين والعملاء' },
  { to: '/expenses-report', label: 'تقرير المصاريف' },
  { to: '/dues-and-checks', label: 'المستحقات والشيكات' },
  { to: '/master-data/branches', label: 'التكويد الأساسي' },
];

const adminNavItems = [
  { to: '/users', label: 'المستخدمين' },
  { to: '/settings', label: 'الإعدادات' },
];

export default function Layout() {
  const { user, logout, hasRole } = useAuth();

  return (
    <div className="min-h-screen flex">
      {/* الشريط الجانبي */}
      <aside className="w-64 bg-vault-900 text-paper flex flex-col">
        <div className="px-6 py-5 border-b border-vault-700/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border border-gold-500 flex items-center justify-center shrink-0">
              <span className="text-gold-500 font-bold">خ</span>
            </div>
            <span className="font-semibold text-lg">نظام الخزينة</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-lg text-sm transition ${
                  isActive
                    ? 'bg-gold-500 text-vault-900 font-medium'
                    : 'text-vault-100 hover:bg-vault-700/50'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}

          {hasRole('system_admin') && (
            <>
              <div className="pt-3 mt-3 border-t border-vault-700/50 px-4 text-xs text-vault-300">
                إدارة النظام
              </div>
              {adminNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `block px-4 py-2.5 rounded-lg text-sm transition ${
                      isActive
                        ? 'bg-gold-500 text-vault-900 font-medium'
                        : 'text-vault-100 hover:bg-vault-700/50'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        <div className="px-4 py-4 border-t border-vault-700/50">
          <div className="text-sm text-vault-300 mb-2">{user?.name}</div>
          <button
            onClick={logout}
            className="text-sm text-gold-500 hover:text-gold-300 transition"
          >
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* المحتوى */}
      <main className="flex-1 bg-paper overflow-y-auto">
        <div className="p-8 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
