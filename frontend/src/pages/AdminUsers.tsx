import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { authHelper } from '../lib/auth';
import { api } from '../lib/api';
import { User, Role } from '../types';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
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
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [error, setError] = useState('');
  
  // Pagination and Filter States
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>(''); // 'true' or 'false'

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({ username: '', email: '', password: '', role: 'normal' as Role });
  const [createLoading, setCreateLoading] = useState(false);

  const fetchUsers = async () => {
    setError(''); // Clear previous errors before fetching
    try {
      const params: any = {
        page,
        pageSize,
      };

      if (search.trim()) params.search = search.trim();
      if (filterRole) params.role = filterRole;
      // Only send isActive if a specific status is selected
      if (filterStatus === 'true' || filterStatus === 'false') {
        params.isActive = filterStatus;
      }

      const response = await axios.get(api.url('/'), {
        params,
        headers: {
          ...api.getHeaders(),
          'Cache-Control': 'no-cache'
        }
      });

      const data = response.data;
 
      // Backend user.js returns { users: rows, totalItems: count ... }
      setUsers(data.users || []);
      setTotalItems(data.totalItems || 0);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, filterRole, filterStatus]); // Re-fetch when these change. Search usually handled by a button or debounce.

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);

    try {
      const response = await axios.post(
        api.url('/register'), 
        newUserData, 
        { headers: api.getHeaders() }
      );
      
      setIsCreateModalOpen(false);
      setNewUserData({ username: '', email: '', password: '', role: 'normal' });
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdateUser = async (id: string, updates: Partial<User>) => {
    setProcessingId(id);
    try {
      // Ensure body ONLY contains valid fields for updateById
      const allowedKeys = ['email', 'password', 'username', 'role', 'isActive'];
      const filteredBody: any = {};
      Object.keys(updates).forEach(key => {
        if (allowedKeys.includes(key)) filteredBody[key] = (updates as any)[key];
      });
      
      await axios.put(
        api.url(`/${id}`), 
        filteredBody, 
        { headers: api.getHeaders() }
      );

      await fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setProcessingId(null);
    }
  };
  

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await axios.delete(api.url(`/${id}`), {
        headers: api.getHeaders()
      });
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
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

      {/* Filters and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/10">
        <div className="relative col-span-1 md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input 
            type="text"
            placeholder="Search by username or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
            className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant/20 rounded-lg text-sm focus:border-primary focus:ring-0"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-on-surface-variant" />
          <select 
            value={filterRole}
            onChange={(e) => { setFilterRole(e.target.value); setPage(1); }}
            className="flex-1 py-2 bg-surface-container-lowest border border-outline-variant/20 rounded-lg text-xs font-bold uppercase tracking-wider focus:ring-0"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="procurement">Procurement</option>
            <option value="normal">Normal</option>
            <option value="approver">Approver</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <select 
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="flex-1 py-2 bg-surface-container-lowest border border-outline-variant/20 rounded-lg text-xs font-bold uppercase tracking-wider focus:ring-0"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <button 
            onClick={fetchUsers}
            className="px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-bold"
          >
            Apply
          </button>
        </div>
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
                    <option value="procurement">Procurement</option>
                    <option value="normal">Normal</option>
                    <option value="approver">Approver</option>
                    
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
                        <option value="procurement">Procurement</option>
                        <option value="normal">Normal</option>
                        <option value="approver">Approver</option>
                    
                      </select>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-2">
                        {processingId === user.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        ) : (
                          <button 
                          onClick={() => handleUpdateUser(user.id, { isActive: !user.isActive })}
                          className={cn("w-2 h-2 rounded-full", user.isActive ? "bg-tertiary" : "bg-error")} 
                          />
                        )}
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Footer */}
            <div className="px-8 py-4 bg-surface-container-low flex justify-between items-center">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                Showing {users.length} of {totalItems} Entities
              </p>
              <div className="flex items-center gap-2">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="p-2 rounded-lg hover:bg-surface-container disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-xs font-bold text-primary">Page {page}</span>
                <button 
                  disabled={users.length < pageSize}
                  onClick={() => setPage(p => p + 1)}
                  className="p-2 rounded-lg hover:bg-surface-container disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
