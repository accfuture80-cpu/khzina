import { Fragment, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';

interface Role {
  id: number;
  code: string;
  name: string;
}

interface UserRow {
  id: number;
  name: string;
  username: string;
  phone: string;
  isActive: boolean;
  roles: Role[];
}

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [resettingId, setResettingId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const { data: roles } = useQuery<Role[]>({
    queryKey: ['roles'],
    queryFn: async () => (await api.get('/roles')).data,
  });

  const { data: users, isLoading } = useQuery<UserRow[]>({
    queryKey: ['admin-users'],
    queryFn: async () => (await api.get('/users')).data,
  });

  const [newUser, setNewUser] = useState({
    name: '',
    username: '',
    password: '',
    phone: '',
    roleIds: [] as number[],
  });

  const createMutation = useMutation({
    mutationFn: async () => (await api.post('/users', newUser)).data,
    onSuccess: () => {
      setNewUser({ name: '', username: '', password: '', phone: '', roleIds: [] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...patch }: any) => (await api.patch(`/users/${id}`, patch)).data,
    onSuccess: () => {
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, activate }: { id: number; activate: boolean }) =>
      (await api.patch(`/users/${id}/${activate ? 'activate' : 'deactivate'}`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ id, password }: { id: number; password: string }) =>
      (await api.patch(`/users/${id}/reset-password`, { newPassword: password })).data,
    onSuccess: () => {
      setResettingId(null);
      setNewPassword('');
    },
  });

  function toggleRole(roleId: number, current: number[]): number[] {
    return current.includes(roleId)
      ? current.filter((r) => r !== roleId)
      : [...current, roleId];
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink mb-1">المستخدمين</h1>
      <p className="text-vault-500 mb-6">إضافة المستخدمين وتحديد أدوارهم وصلاحياتهم</p>

      {/* نموذج إضافة مستخدم */}
      <div className="bg-white rounded-xl border border-vault-100 p-6 mb-6">
        <h3 className="font-semibold text-ink mb-4">إضافة مستخدم جديد</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <input
            placeholder="الاسم"
            value={newUser.name}
            onChange={(e) => setNewUser((p) => ({ ...p, name: e.target.value }))}
            className="px-3 py-2 rounded-lg border border-vault-100 text-sm"
          />
          <input
            placeholder="اسم المستخدم"
            value={newUser.username}
            onChange={(e) => setNewUser((p) => ({ ...p, username: e.target.value }))}
            className="px-3 py-2 rounded-lg border border-vault-100 text-sm"
          />
          <input
            type="password"
            placeholder="كلمة السر"
            value={newUser.password}
            onChange={(e) => setNewUser((p) => ({ ...p, password: e.target.value }))}
            className="px-3 py-2 rounded-lg border border-vault-100 text-sm"
          />
          <input
            placeholder="رقم التليفون"
            value={newUser.phone}
            onChange={(e) => setNewUser((p) => ({ ...p, phone: e.target.value }))}
            className="px-3 py-2 rounded-lg border border-vault-100 text-sm"
          />
        </div>

        <div className="mb-4">
          <span className="text-sm text-ink/70 mb-2 block">الأدوار</span>
          <div className="flex flex-wrap gap-2">
            {roles?.map((r) => (
              <label
                key={r.id}
                className={`px-3 py-1.5 rounded-full text-sm cursor-pointer border transition ${
                  newUser.roleIds.includes(r.id)
                    ? 'bg-vault-900 text-white border-vault-900'
                    : 'bg-white text-vault-700 border-vault-100'
                }`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={newUser.roleIds.includes(r.id)}
                  onChange={() =>
                    setNewUser((p) => ({ ...p, roleIds: toggleRole(r.id, p.roleIds) }))
                  }
                />
                {r.name}
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={() => createMutation.mutate()}
          className="px-5 py-2 bg-vault-700 text-white rounded-lg text-sm hover:bg-vault-900"
        >
          إضافة المستخدم
        </button>
      </div>

      {/* قائمة المستخدمين */}
      <div className="bg-white rounded-xl border border-vault-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-vault-50 text-vault-700">
            <tr>
              <th className="px-4 py-3 text-right">الاسم</th>
              <th className="px-4 py-3 text-right">اسم المستخدم</th>
              <th className="px-4 py-3 text-right">الأدوار</th>
              <th className="px-4 py-3 text-right">الحالة</th>
              <th className="px-4 py-3 text-right"></th>
            </tr>
          </thead>
          <tbody>
            {users?.map((u) => (
              <Fragment key={u.id}>
                <tr className="border-t border-vault-50">
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3 text-vault-500">{u.username}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {u.roles.map((r) => (
                        <span
                          key={r.id}
                          className="px-2 py-0.5 rounded-full text-xs bg-vault-50 text-vault-700"
                        >
                          {r.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs ${
                        u.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {u.isActive ? 'مفعّل' : 'معطّل'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3 text-vault-700">
                      <button
                        onClick={() => setEditingId(editingId === u.id ? null : u.id)}
                        className="hover:text-gold-700"
                      >
                        تعديل الأدوار
                      </button>
                      <button
                        onClick={() => setResettingId(resettingId === u.id ? null : u.id)}
                        className="hover:text-gold-700"
                      >
                        إعادة تعيين الباس
                      </button>
                      <button
                        onClick={() =>
                          toggleActiveMutation.mutate({ id: u.id, activate: !u.isActive })
                        }
                        className={u.isActive ? 'text-red-500' : 'text-green-600'}
                      >
                        {u.isActive ? 'تعطيل' : 'تفعيل'}
                      </button>
                    </div>
                  </td>
                </tr>

                {editingId === u.id && (
                  <tr className="bg-vault-50/40">
                    <td colSpan={5} className="px-4 py-4">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {roles?.map((r) => {
                          const checked = u.roles.some((ur) => ur.id === r.id);
                          return (
                            <label
                              key={r.id}
                              className={`px-3 py-1.5 rounded-full text-sm cursor-pointer border transition ${
                                checked
                                  ? 'bg-vault-900 text-white border-vault-900'
                                  : 'bg-white text-vault-700 border-vault-100'
                              }`}
                            >
                              <input
                                type="checkbox"
                                className="hidden"
                                checked={checked}
                                onChange={() => {
                                  const current = u.roles.map((ur) => ur.id);
                                  updateMutation.mutate({
                                    id: u.id,
                                    roleIds: toggleRole(r.id, current),
                                  });
                                }}
                              />
                              {r.name}
                            </label>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                )}

                {resettingId === u.id && (
                  <tr className="bg-vault-50/40">
                    <td colSpan={5} className="px-4 py-4">
                      <div className="flex gap-2 items-center">
                        <input
                          type="password"
                          placeholder="كلمة السر الجديدة"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="px-3 py-2 rounded-lg border border-vault-100 text-sm"
                        />
                        <button
                          onClick={() =>
                            resetPasswordMutation.mutate({ id: u.id, password: newPassword })
                          }
                          className="px-4 py-2 bg-vault-700 text-white rounded-lg text-sm hover:bg-vault-900"
                        >
                          حفظ
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
        {!isLoading && users?.length === 0 && (
          <p className="text-center text-vault-500 py-10">لا يوجد مستخدمين حتى الآن</p>
        )}
      </div>
    </div>
  );
}
