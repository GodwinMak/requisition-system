import React, { useState } from 'react';
import axios from 'axios';
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
  
  const [profileLoading, setProfileLoading] = useState(false);
  const [securityLoading, setSecurityLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [securityMessage, setSecurityMessage] = useState({ type: '', text: '' });

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage({ type: '', text: '' });

    try {
      const response = await axios.put(api.url(`/${user?.id}`), 
        { username: username.trim() }, 
        { headers: api.getHeaders() }
      );

      const data = response.data;
      
      // Update local storage so the UI updates immediately
      if (user) {
        authHelper.setUser({ ...user, username: data.user?.username || username });
      }
      
      setProfileMessage({ type: 'success', text: 'Username updated successfully' });
    } catch (err: any) {
      setProfileMessage({ type: 'error', text: err.response?.data?.message || err.message });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setSecurityMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    setSecurityLoading(true);
    setSecurityMessage({ type: '', text: '' });

    try {
      const response = await axios.put(api.url(`/profile`), 
        { 
          currentPassword: currentPassword, 
          password: newPassword 
        },
        { headers: api.getHeaders() }
      );

      const data = response.data;

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSecurityMessage({ type: 'success', text: 'Password changed successfully.' });
    } catch (err: any) {
      setSecurityMessage({ type: 'error', text: err.response?.data?.message || err.message });
    } finally {
      setSecurityLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-12">
      <div>
        <h2 className="font-headline text-5xl font-extrabold text-primary tracking-tighter">System Settings</h2>
        <p className="text-on-surface-variant text-sm font-label mt-2 uppercase tracking-widest">Configure your identity and security protocols</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Settings */}
        <section className="bg-surface-container p-8 rounded-3xl space-y-6 shadow-sm">
          <div className="flex items-center justify-between text-primary">
            <div className="flex items-center gap-3">
              <SettingsIcon className="w-6 h-6" />
              <h3 className="font-headline text-xl font-bold">Profile Identity</h3>
            </div>
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
            {profileMessage.text && (
              <div className={`p-3 rounded-lg flex items-center gap-2 ${
                profileMessage.type === 'success' ? 'bg-tertiary-container text-on-tertiary-container' : 'bg-error-container text-on-error-container'
              }`}>
                {profileMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <p className="text-xs font-medium">{profileMessage.text}</p>
              </div>
            )}
            <button 
              type="submit"
              disabled={profileLoading}
              className="flex items-center justify-center gap-2 px-6 py-3 industrial-gradient text-on-primary rounded-lg font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {profileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
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
            {securityMessage.text && (
              <div className={`p-3 rounded-lg flex items-center gap-2 ${
                securityMessage.type === 'success' ? 'bg-tertiary-container text-on-tertiary-container' : 'bg-error-container text-on-error-container'
              }`}>
                {securityMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <p className="text-xs font-medium">{securityMessage.text}</p>
              </div>
            )}
            <button 
              type="submit"
              disabled={securityLoading}
              className="flex items-center justify-center gap-2 px-6 py-3 industrial-gradient text-on-primary rounded-lg font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {securityLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
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
