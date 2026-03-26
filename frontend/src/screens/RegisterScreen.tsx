import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { userService } from '../services/userService';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setError('All fields are required.');
      return;
    }
    if (username.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await userService.register({ username, email, password, role });
      navigate('/login');
    } catch (err: any) {
      console.error('Registration Error:', err);
      setError(err.friendlyMessage || 'Registration failed. Please try again.');
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
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop" 
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
                Join the <br/>Precision <br/>Ecosystem.
              </h1>
              <p className="text-on-primary-container text-lg max-w-md font-medium">
                Create your enterprise account to start managing high-performance architectural requisitions.
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
          <div className="mb-10">
            <h2 className="font-headline text-3xl font-bold text-on-surface tracking-tight mb-2">Create Account</h2>
            <p className="text-on-surface-variant font-medium">Join Architectural Ledger today.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <p className="text-error text-sm font-medium">{error}</p>}
            
            <div className="group relative">
              <label className="block text-[0.7rem] font-bold uppercase tracking-widest text-on-surface-variant mb-1 ml-1 transition-colors group-focus-within:text-primary">
                Username
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-1 py-3 bg-transparent border-0 border-b-2 border-surface-container-highest focus:ring-0 focus:border-primary transition-all font-body text-on-surface placeholder:text-outline/50"
                  placeholder="alexander_sterling"
                  required
                />
              </div>
            </div>

            <div className="group relative">
              <label className="block text-[0.7rem] font-bold uppercase tracking-widest text-on-surface-variant mb-1 ml-1 transition-colors group-focus-within:text-primary">
                Email Address
              </label>
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-1 py-3 bg-transparent border-0 border-b-2 border-surface-container-highest focus:ring-0 focus:border-primary transition-all font-body text-on-surface placeholder:text-outline/50"
                  placeholder="name@enterprise.com"
                  required
                />
              </div>
            </div>

            <div className="group relative">
              <label className="block text-[0.7rem] font-bold uppercase tracking-widest text-on-surface-variant mb-1 ml-1 transition-colors group-focus-within:text-primary">
                Security Key
              </label>
              <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-1 py-3 bg-transparent border-0 border-b-2 border-surface-container-highest focus:ring-0 focus:border-primary transition-all font-body text-on-surface placeholder:text-outline/50"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="group relative">
              <label className="block text-[0.7rem] font-bold uppercase tracking-widest text-on-surface-variant mb-1 ml-1 transition-colors group-focus-within:text-primary">
                Role
              </label>
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-1 py-3 bg-transparent border-0 border-b-2 border-surface-container-highest focus:ring-0 focus:border-primary transition-all font-body text-on-surface"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="operator">Operator</option>
              </select>
            </div>

            <div className="pt-4 space-y-4">
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-5 rounded-md bg-gradient-to-b from-primary to-primary-container text-white font-headline font-bold text-sm uppercase tracking-[0.2em] shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-70"
              >
                {isLoading ? 'Creating Account...' : 'Register'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <p className="text-center text-xs text-on-surface-variant">
                Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Sign in</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
