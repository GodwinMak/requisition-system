import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authHelper } from '../lib/auth';
import { api } from '../lib/api';
import { 
  User, 
  Lock, 
  ShieldCheck, 
  Save, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  Settings as SettingsIcon
} from 'lucide-react';

export default function Settings() {
  const user = authHelper.getUser();
  const [username, setUsername] = useState(user?.username || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id && !user?._id) {
      setMessage({ type: 'error', text: 'User ID not found in session. Please log in again.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    const userId = user.id || (user as any)._id;
    console.log('Attempting to update username for user:', userId);

    try {
      // Try /profile first as per documentation
      // Including ID in body as a precaution
      let response = await fetch(api.url('/profile'), {
        method: 'PUT',
        headers: api.getHeaders(),
        body: JSON.stringify({ id: userId, username }),
      });

      let data = await response.json();
      console.log('Update Profile Response:', data);

      // Fallback to ID-based endpoint if /profile returns "not found" or similar
      if (!response.ok && (response.status === 404 || (data.message && data.message.toLowerCase().includes('not found')))) {
        console.warn('PUT /profile failed with "not found". Falling back to PUT /:id');
        response = await fetch(api.url(`/${userId}`), {
          method: 'PUT',
          headers: api.getHeaders(),
          body: JSON.stringify({ id: userId, username }),
        });
        data = await response.json();
        console.log('Update User (ID-based) Response:', data);
      }

      if (!response.ok) throw new Error(data.message || data.error || 'Failed to update username');

      // Update local storage
      if (user) {
        authHelper.setUser({ ...user, username });
      }
      
      setMessage({ type: 'success', text: 'Username updated successfully' });
    } catch (err: any) {
      console.error('Update Username Error:', err);
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (!user?.id && !user?._id) {
      setMessage({ type: 'error', text: 'User ID not found in session. Please log in again.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    const userId = user.id || (user as any)._id;

    try {
      let response = await fetch(api.url('/profile'), {
        method: 'PUT',
        headers: api.getHeaders(),
        body: JSON.stringify({ id: userId, currentPassword, password: newPassword }),
      });

      let data = await response.json();
      console.log('Change Password Response:', data);

      // Fallback to ID-based endpoint if /profile returns "not found"
      if (!response.ok && (response.status === 404 || (data.message && data.message.toLowerCase().includes('not found')))) {
        console.warn('PUT /profile failed with "not found". Falling back to PUT /:id for password change');
        response = await fetch(api.url(`/${userId}`), {
          method: 'PUT',
          headers: api.getHeaders(),
          body: JSON.stringify({ id: userId, currentPassword, password: newPassword }),
        });
        data = await response.json();
        console.log('Change Password (ID-based) Response:', data);
      }

      if (!response.ok) throw new Error(data.message || data.error || 'Failed to change password');

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage({ type: 'success', text: 'Password changed successfully.' });
    } catch (err: any) {
      console.error('Change Password Error:', err);
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-12">
      <div>
        <h2 className="font-headline text-5xl font-extrabold text-primary tracking-tighter">System Settings</h2>
        <p className="text-on-surface-variant text-sm font-label mt-2 uppercase tracking-widest">Configure your identity and security protocols</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          message.type === 'success' ? 'bg-tertiary-container text-on-tertiary-container' : 'bg-error-container text-on-error-container'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Settings */}
        <section className="bg-surface-container p-8 rounded-3xl space-y-6 shadow-sm">
          <div className="flex items-center gap-3 text-primary">
            <SettingsIcon className="w-6 h-6" />
            <h3 className="font-headline text-xl font-bold">Profile Identity</h3>
          </div>
          
          <form onSubmit={handleUpdateUsername} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Username</label>
              <input 
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-low border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 transition-all font-body text-on-surface"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Email Address (Read Only)</label>
              <input 
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-3 bg-surface-container-low border-b-2 border-outline-variant/10 font-body text-on-surface-variant opacity-60 cursor-not-allowed"
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-3 industrial-gradient text-on-primary rounded-lg font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Update Profile
            </button>
          </form>
        </section>

        {/* Security Settings */}
        <section className="bg-surface-container p-8 rounded-3xl space-y-6 shadow-sm">
          <div className="flex items-center gap-3 text-primary">
            <Lock className="w-6 h-6" />
            <h3 className="font-headline text-xl font-bold">Security Protocol</h3>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Current Password</label>
              <input 
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-low border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 transition-all font-body text-on-surface"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">New Password</label>
              <input 
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-low border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 transition-all font-body text-on-surface"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Confirm New Password</label>
              <input 
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-low border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 transition-all font-body text-on-surface"
                required
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-3 industrial-gradient text-on-primary rounded-lg font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              Change Password
            </button>
          </form>
        </section>

        {/* Admin Quick Links */}
        {authHelper.isAdmin() && (
          <section className="col-span-1 md:col-span-2 bg-primary text-on-primary p-8 rounded-3xl shadow-lg relative overflow-hidden">
            <ShieldCheck className="absolute -right-4 -bottom-4 w-48 h-48 opacity-10 rotate-12" />
            <div className="relative z-10 space-y-4">
              <h3 className="font-headline text-2xl font-bold">Administrative Control Panel</h3>
              <p className="text-sm opacity-80 max-w-2xl">
                As an administrator, you have elevated privileges to manage the entire user base, verify new accounts, and assign operational roles across the Liquid network.
              </p>
              <div className="pt-4">
                <Link 
                  to="/admin/users" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary rounded-lg font-bold text-sm transition-all hover:bg-surface-bright active:scale-95"
                >
                  Go to User Management
                </Link>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
