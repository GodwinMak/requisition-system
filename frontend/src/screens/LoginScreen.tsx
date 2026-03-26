import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await userService.login({ email, password });
      if (response.token) {
        
        navigate('/settings');
      } else {
        setError('Invalid response from server. No token received.');
      }
    } catch (err: any) {
      console.error('Login Error:', err.response.data);
      setError(err.friendlyMessage || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 architectural-bg">
      <div className="relative w-full max-w-[1100px] grid grid-cols-1 md:grid-cols-12 gap-0 overflow-hidden rounded-xl shadow-[0px_12px_32px_rgba(25,28,29,0.06)] bg-surface-container-lowest">
        {/* Left Side: Visual Anchor */}
        <div className="md:col-span-7 relative hidden md:block overflow-hidden bg-primary-container">
          <div className="absolute inset-0 opacity-40 mix-blend-overlay">
            <img 
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" 
              alt="Architectural perspective" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute inset-0 flex flex-col justify-between p-12 glass-overlay">
            <div className="space-y-2">
              <span className="font-headline font-extrabold text-xl text-white tracking-widest uppercase">Architectural Ledger</span>
              <div className="w-12 h-1 bg-on-primary-container"></div>
            </div>
            <div className="space-y-6">
              <h1 className="font-headline text-5xl font-bold text-white leading-tight tracking-tight">
                Institutional <br/>Efficiency. <br/>Precision Flow.
              </h1>
              <p className="text-on-primary-container text-lg max-w-md font-medium">
                Access the enterprise-grade requisition ecosystem designed for high-performance architectural procurement.
              </p>
            </div>
            <div className="flex items-center gap-4 text-on-primary-container/60 text-xs font-medium uppercase tracking-widest">
              <span>EST. 2024</span>
              <span className="w-1 h-1 rounded-full bg-on-primary-container/40"></span>
              <span>Secured Encryption</span>
            </div>
          </div>
        </div>

        {/* Right Side: Interaction Plane */}
        <div className="md:col-span-5 p-8 md:p-16 flex flex-col justify-center bg-surface-container-lowest">
          <div className="md:hidden mb-12">
            <span className="font-headline font-extrabold text-lg text-primary tracking-widest uppercase">Architectural Ledger</span>
          </div>
          <div className="mb-10">
            <h2 className="font-headline text-3xl font-bold text-on-surface tracking-tight mb-2">Portal Access</h2>
            <p className="text-on-surface-variant font-medium">Enter your credentials to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && <p className="text-error text-sm font-medium">{error}</p>}
            
            <div className="group relative">
              <label className="block text-[0.7rem] font-bold uppercase tracking-widest text-on-surface-variant mb-1 ml-1 transition-colors group-focus-within:text-primary">
                Email Address
              </label>
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-1 py-4 bg-transparent border-0 border-b-2 border-surface-container-highest focus:ring-0 focus:border-primary transition-all font-body text-on-surface placeholder:text-outline/50"
                  placeholder="name@enterprise.com"
                  required
                />
              </div>
            </div>

            <div className="group relative">
              <div className="flex justify-between items-end mb-1">
                <label className="block text-[0.7rem] font-bold uppercase tracking-widest text-on-surface-variant ml-1 transition-colors group-focus-within:text-primary">
                  Security Key
                </label>
                <Link to="#" className="text-[0.7rem] font-bold uppercase tracking-widest text-secondary hover:text-primary transition-colors underline-offset-4 hover:underline">
                  Forgot Password
                </Link>
              </div>
              <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-1 py-4 bg-transparent border-0 border-b-2 border-surface-container-highest focus:ring-0 focus:border-primary transition-all font-body text-on-surface placeholder:text-outline/50"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-5 rounded-md bg-gradient-to-b from-primary to-primary-container text-white font-headline font-bold text-sm uppercase tracking-[0.2em] shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-70"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <p className="text-center text-xs text-on-surface-variant">
                Don't have an account? <Link to="/register" className="text-primary font-bold hover:underline">Register here</Link>
              </p>
            </div>
          </form>

          <div className="mt-16 flex flex-col gap-6">
            <div className="h-[1px] w-full bg-surface-container-high"></div>
            <div className="flex items-center justify-between text-[0.65rem] font-bold uppercase tracking-widest text-outline">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                <span>System Status: Optimal</span>
              </div>
              <div className="flex gap-4">
                <Link to="#" className="hover:text-primary transition-colors">Support</Link>
                <Link to="#" className="hover:text-primary transition-colors">Security Audit</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
