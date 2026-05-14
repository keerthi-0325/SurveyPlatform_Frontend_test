import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit, Shield, Eye, UserCheck, Loader2, X, Check } from 'lucide-react';
import { usersApi } from '../services/api';
import { PageHeader, Spinner, ConfirmDialog } from '../components/ui';
import useAuthStore from '../store/authStore';

const ROLES = {
  admin:  { label: 'Admin',  icon: Shield,    color: 'bg-red-100 text-red-700 border-red-200',    desc: 'Full access — manage users, delete data, all settings' },
  staff:  { label: 'Staff',  icon: UserCheck, color: 'bg-blue-100 text-blue-700 border-blue-200', desc: 'Create and manage surveys, view all responses' },
  viewer: { label: 'Viewer', icon: Eye,       color: 'bg-gray-100 text-gray-700 border-gray-200', desc: 'Read-only — view surveys and analytics, no editing' },
};

function RoleBadge({ role }) {
  const cfg = ROLES[role] ?? ROLES.viewer;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${cfg.color}`}>
      <Icon size={10} /> {cfg.label}
    </span>
  );
}

function UserModal({ user, onClose, onSave }) {
  const isEdit = Boolean(user?.user_id);
  const [form, setForm] = useState({
    name:       user?.name       ?? '',
    email:      user?.email      ?? '',
    password:   '',
    role:       user?.role       ?? 'staff',
    department: user?.department ?? '',
    job_title:  user?.job_title  ?? '',
    phone:      user?.phone      ?? '',
    is_active:  user?.is_active  ?? true,
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.name || !form.email) return alert('Name and email are required.');
    if (!isEdit && !form.password) return alert('Password is required for new users.');
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      await onSave(payload);
      onClose();
    } catch (e) {
      alert(e?.response?.data?.error ?? 'Save failed.');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{isEdit ? 'Edit User' : 'Add User'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name *</label>
              <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="John Smith" />
            </div>
            <div>
              <label className="label">Email *</label>
              <input type="email" className="input" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="john@company.com" />
            </div>
            <div>
              <label className="label">{isEdit ? 'New Password' : 'Password *'}</label>
              <input type="password" className="input" value={form.password} onChange={(e) => set('password', e.target.value)}
                placeholder={isEdit ? 'Leave blank to keep current' : 'Min 8 characters'} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+91 99999 00000" />
            </div>
            <div>
              <label className="label">Department</label>
              <input className="input" value={form.department} onChange={(e) => set('department', e.target.value)} placeholder="Sales, HR, etc." />
            </div>
            <div>
              <label className="label">Job Title</label>
              <input className="input" value={form.job_title} onChange={(e) => set('job_title', e.target.value)} placeholder="Manager, Analyst…" />
            </div>
          </div>

          {/* Role selector */}
          <div>
            <label className="label">Role *</label>
            <div className="grid grid-cols-3 gap-3 mt-1">
              {Object.entries(ROLES).map(([key, cfg]) => {
                const Icon = cfg.icon;
                return (
                  <button
                    key={key} type="button"
                    onClick={() => set('role', key)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      form.role === key
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon size={14} className={form.role === key ? 'text-indigo-600' : 'text-gray-400'} />
                      <span className={`text-sm font-semibold ${form.role === key ? 'text-indigo-700' : 'text-gray-700'}`}>{cfg.label}</span>
                    </div>
                    <p className="text-xs text-gray-400 leading-tight">{cfg.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {isEdit && (
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} />
              <span className="text-gray-700">Active (can log in)</span>
            </label>
          )}
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={submit} disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            {isEdit ? 'Save Changes' : 'Create User'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const qc          = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);
  const [modal, setModal]             = useState(null); // null | {} | {user}
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'], queryFn: usersApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => usersApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: usersApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setDeleteTarget(null); },
  });

  const handleSave = (data) => {
    if (modal?.user_id) {
      return updateMutation.mutateAsync({ id: modal.user_id, data });
    }
    return createMutation.mutateAsync(data);
  };

  return (
    <div className="p-8">
      <PageHeader
        title="User Management"
        subtitle="Manage team members and their access roles"
        action={
          <button onClick={() => setModal({})} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add User
          </button>
        }
      />

      {/* Role legend */}
      <div className="card mb-6">
        <p className="text-sm font-semibold text-gray-700 mb-3">Role Permissions</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Object.entries(ROLES).map(([key, cfg]) => {
            const Icon = cfg.icon;
            return (
              <div key={key} className={`flex items-start gap-2 p-3 rounded-xl border ${cfg.color}`}>
                <Icon size={15} className="mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold">{cfg.label}</p>
                  <p className="text-xs mt-0.5 opacity-80">{cfg.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner className="text-indigo-600 w-6 h-6" /></div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {['Name','Email','Role','Department','Status','Actions'].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.user_id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{u.name}</p>
                        {u.job_title && <p className="text-xs text-gray-400">{u.job_title}</p>}
                        {u.user_id === currentUser?.user_id && (
                          <span className="text-xs text-indigo-500 font-medium">(you)</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-sm">{u.email}</td>
                  <td className="py-3 px-4"><RoleBadge role={u.role} /></td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{u.department || '—'}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      u.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <button onClick={() => setModal(u)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <Edit size={14} />
                      </button>
                      {u.user_id !== currentUser?.user_id && (
                        <button onClick={() => setDeleteTarget(u.user_id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!users.length && (
                <tr><td colSpan={6} className="py-10 text-center text-gray-400">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal !== null && (
        <UserModal user={modal?.user_id ? modal : null} onClose={() => setModal(null)} onSave={handleSave} />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Remove User"
        message="This will permanently remove the user from your organisation. They will lose all access immediately."
        onConfirm={() => deleteMutation.mutate(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
