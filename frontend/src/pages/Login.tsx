import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { authHelper } from '../lib/auth';
import { api } from '../lib/api';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (authHelper.isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const loginResponse = await axios.post(api.url('/login'), { email, password });
      const loginData = loginResponse.data;

      const token = loginData.token || loginData.accessToken;
      if (!token) {
        throw new Error('No token received from server');
      }

      // Ensure token is clean of any whitespace/newlines
      authHelper.setToken(token.trim());

      // Check if user data is already in login response
      const userFromLogin = loginData.user || (loginData.role ? loginData : null);
      
      try {
        const profileResponse = await axios.get(api.url('/profile'), {
          headers: api.getHeaders()
        });

        const profileData = profileResponse.data;
        const userData = profileData.user || profileData;
        authHelper.setUser(userData);
        navigate('/dashboard');
        return;
      } catch (profileErr) {
        console.error('Profile fetch error:', profileErr);
        // Fallback to user data from login if available
        if (userFromLogin) {
          authHelper.setUser(userFromLogin);
          navigate('/dashboard');
          return;
        }
        throw profileErr;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
      authHelper.clearSession();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-surface">
      <div className="absolute inset-0 z-0">
        <img 
          className="w-full h-full object-cover brightness-[0.4] contrast-[1.1]"
          src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=2000"
          alt="Industrial Warehouse"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-primary/20 mix-blend-multiply"></div>
      </div>

      <main className="relative z-10 w-full max-w-5xl px-6 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden rounded-xl shadow-2xl shadow-primary/20">
        <div className="lg:col-span-7 bg-primary-container/40 glass-panel p-12 flex flex-col justify-between hidden lg:flex border-r border-outline-variant/10">
          <div>
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 industrial-gradient rounded flex items-center justify-center">
                <LogIn className="text-white w-6 h-6" />
              </div>
              <span className="font-headline font-extrabold text-2xl tracking-tighter text-surface-bright uppercase">Requisition</span>
            </div>
            <div className="space-y-6">
              <h1 className="font-headline text-5xl font-extrabold text-white leading-tight tracking-tight">
                Requisition <br/>
                <span className="text-primary-fixed-dim">Management</span> System.
              </h1>
              <p className="text-surface-variant text-lg max-w-md font-medium leading-relaxed">
                Streamline your company's material requests and inventory control with architectural precision.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <span className="font-headline text-3xl font-bold text-white">LM-SYS</span>
              <p className="font-label text-xs uppercase tracking-widest text-on-primary-container">System Node</p>
            </div>
            <div className="space-y-2">
              <span className="font-headline text-3xl font-bold text-white">24/7</span>
              <p className="font-label text-xs uppercase tracking-widest text-on-primary-container">Uptime Support</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-surface-container-lowest p-8 md:p-14 flex flex-col justify-center">
          <header className="mb-10">
            <h2 className="font-headline text-3xl font-bold text-primary mb-2">System Login</h2>
            <p className="text-on-surface-variant text-sm font-medium uppercase tracking-wider">Authorized Personnel Only</p>
          </header>

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-6">
              <div className="relative group">
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 ml-1" htmlFor="email">Work Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
                  <input 
                    className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 transition-all font-body text-on-surface placeholder:text-outline/50"
                    id="email"
                    type="email"
                    placeholder="name@liquidmatics.co.tz"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="relative group">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1" htmlFor="password">Secure Password</label>
                  <a className="text-xs font-bold text-primary-container hover:text-primary transition-colors" href="#">Forgot Credentials?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
                  <input 
                    className="w-full pl-12 pr-12 py-4 bg-surface-container-low border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 transition-all font-body text-on-surface placeholder:text-outline/50"
                    id="password"
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
              {loading ? <Loader2 className="animate-spin" /> : 'Sign In to Portal'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-on-surface-variant text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-bold hover:underline">Register here</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
