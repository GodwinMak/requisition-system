import React, { useState, useEffect } from 'react';
import { authHelper } from '../lib/auth';
import { api } from '../lib/api';
import { User, Role } from '../types';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle,
  MoreHorizontal,
  Loader2,
  Trash2,
  Edit2,
  UserPlus,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({ username: '', email: '', password: '', role: 'operator' as Role });
  const [createLoading, setCreateLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await fetch(api.url('/'), {
        headers: api.getHeaders()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setUsers(Array.isArray(data) ? data : (data.users || []));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      const response = await fetch(api.url('/'), {
        method: 'POST',
        headers: api.getHeaders(),
        body: JSON.stringify(newUserData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create user');
      
      setIsCreateModalOpen(false);
      setNewUserData({ username: '', email: '', password: '', role: 'operator' });
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdateUser = async (id: string, updates: Partial<User>) => {
    try {
      const response = await fetch(api.url(`/${id}`), {
        method: 'PUT',
        headers: api.getHeaders(),
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update user');
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const response = await fetch(api.url(`/${id}`), {
        method: 'DELETE',
        headers: api.getHeaders()
      });
      if (!response.ok) throw new Error('Failed to delete user');
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-primary w-10 h-10" /></div>;

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-5xl font-extrabold text-primary tracking-tighter">User Management</h2>
          <div className="mt-4 flex items-center space-x-4">
            <span className="bg-primary-fixed text-on-primary-fixed-variant px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
              Administrative Access Only
            </span>
            <p className="text-on-surface-variant text-sm font-label">Total Entities: {users.length}</p>
          </div>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-6 py-4 industrial-gradient text-on-primary rounded-xl font-headline font-bold text-sm tracking-wide shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <UserPlus className="w-5 h-5" />
          Register New Entity
        </button>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-surface/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-surface-container-lowest rounded-3xl shadow-2xl border border-outline-variant/10 overflow-hidden">
            <div className="p-8 border-b border-outline-variant/10 flex justify-between items-center">
              <h3 className="font-headline text-2xl font-bold text-primary">Register New User</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-surface-container rounded-full transition-colors">
                <X className="w-6 h-6 text-on-surface-variant" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Username</label>
                  <input 
                    type="text"
                    value={newUserData.username}
                    onChange={(e) => setNewUserData({...newUserData, username: e.target.value})}
                    className="w-full px-4 py-3 bg-surface-container-low border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 transition-all font-body text-on-surface"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Email Address</label>
                  <input 
                    type="email"
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                    className="w-full px-4 py-3 bg-surface-container-low border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 transition-all font-body text-on-surface"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Initial Password</label>
                  <input 
                    type="password"
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
                    className="w-full px-4 py-3 bg-surface-container-low border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 transition-all font-body text-on-surface"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Operational Role</label>
                  <select 
                    value={newUserData.role}
                    onChange={(e) => setNewUserData({...newUserData, role: e.target.value as Role})}
                    className="w-full px-4 py-3 bg-surface-container-low border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 transition-all font-body text-on-surface"
                  >
                    <option value="admin">Admin</option>
                    <option value="engineer">Engineer</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="operator">Operator</option>
                    <option value="guest">Guest</option>
                  </select>
                </div>
              </div>
              <button 
                type="submit"
                disabled={createLoading}
                className="w-full industrial-gradient text-on-primary py-4 rounded-xl font-headline font-bold text-lg tracking-wide shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {createLoading ? <Loader2 className="animate-spin" /> : 'Create User Entity'}
              </button>
            </form>
          </div>
        </div>
      )}

      {error && <div className="p-4 bg-error-container text-error rounded-xl">{error}</div>}

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 bg-surface-container rounded-3xl overflow-hidden p-1 shadow-sm">
          <div className="bg-surface-container-lowest rounded-[1.25rem] overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-label text-[11px] uppercase tracking-[0.2em]">
                  <th className="px-8 py-5 font-semibold">Username & Identity</th>
                  <th className="px-8 py-5 font-semibold">Email Address</th>
                  <th className="px-8 py-5 font-semibold">Operational Role</th>
                  <th className="px-8 py-5 font-semibold">Status</th>
                  <th className="px-8 py-5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low">
                {users.map((user) => (
                  <tr key={user.id} className="group hover:bg-surface-container-low transition-colors duration-200">
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center font-headline font-bold text-primary">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-headline font-bold text-primary">{user.username}</p>
                          <p className="text-xs text-on-surface-variant">ID: {user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-on-surface font-body text-sm">{user.email}</td>
                    <td className="px-8 py-6">
                      <select 
                        value={user.role}
                        onChange={(e) => handleUpdateUser(user.id, { role: e.target.value as Role })}
                        className="bg-transparent border-none font-label text-sm font-medium text-on-surface focus:ring-0 cursor-pointer"
                        disabled={user.id === authHelper.getUser()?.id}
                      >
                        <option value="admin">Admin</option>
                        <option value="engineer">Engineer</option>
                        <option value="supervisor">Supervisor</option>
                        <option value="operator">Operator</option>
                        <option value="guest">Guest</option>
                      </select>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleUpdateUser(user.id, { isActive: !user.isActive })}
                          className={cn(
                            "w-2 h-2 rounded-full", 
                            user.isActive ? "bg-tertiary" : "bg-error"
                          )} 
                        />
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-on-surface-variant hover:text-error p-2 transition-colors"
                          title="Delete User"
                          disabled={user.id === authHelper.getUser()?.id}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <button className="text-on-surface-variant hover:text-primary p-2 transition-colors">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
