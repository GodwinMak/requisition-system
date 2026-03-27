import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { UserPlus, Mail, Lock, User, Loader2 } from 'lucide-react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(api.url('/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username, 
          email, 
          password, 
          role: 'guest' // Default role as per requirements
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-6">
        <div className="max-w-md w-full bg-surface-container-lowest p-10 rounded-3xl shadow-xl text-center space-y-6">
          <div className="w-20 h-20 bg-primary-fixed text-primary rounded-full flex items-center justify-center mx-auto">
            <UserPlus className="w-10 h-10" />
          </div>
          <h2 className="font-headline text-3xl font-extrabold text-primary">Registration Successful</h2>
          <p className="text-on-surface-variant">Your account has been created. Please wait for an administrator to verify your account and assign a role.</p>
          <p className="text-sm text-on-surface-variant italic">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-surface">
      <div className="absolute inset-0 z-0">
        <img 
          className="w-full h-full object-cover brightness-[0.4] contrast-[1.1]"
          src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=2000"
          alt="Construction Site"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-primary/20 mix-blend-multiply"></div>
      </div>

      <main className="relative z-10 w-full max-w-md px-6 bg-surface-container-lowest p-10 rounded-3xl shadow-2xl">
        <header className="mb-10 text-center">
          <h2 className="font-headline text-3xl font-bold text-primary mb-2">Create Account</h2>
          <p className="text-on-surface-variant text-sm font-medium uppercase tracking-wider">Liquidmatics Identity Service</p>
        </header>

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
                <input 
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 transition-all font-body text-on-surface placeholder:text-outline/50"
                  type="text"
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="relative group">
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 ml-1">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
                <input 
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 transition-all font-body text-on-surface placeholder:text-outline/50"
                  type="email"
                  placeholder="name@liquidmatics.co.tz"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="relative group">
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
                <input 
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 transition-all font-body text-on-surface placeholder:text-outline/50"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {error && <p className="text-error text-sm font-medium">{error}</p>}

          <button 
            className="w-full industrial-gradient text-on-primary py-5 rounded-lg font-headline font-bold text-lg tracking-wide shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            type="submit"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Register Entity'}
          </button>

          <div className="text-center">
            <p className="text-on-surface-variant text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline">Sign in</Link>
            </p>
          </div>
        </form>
      </main>
    </div>
  );
}
