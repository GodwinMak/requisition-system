import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Settings, 
  LogOut,
  ClipboardList
} from 'lucide-react';
import { authHelper } from '../lib/auth';
import { cn } from '../lib/utils';

export default function Sidebar() {
  const navigate = useNavigate();
  const user = authHelper.getUser();
  const isAdmin = authHelper.isAdmin();

  const handleLogout = () => {
    authHelper.clearSession();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/stock', icon: Package, label: 'Inventory' },
    { to: '/requisitions', icon: ClipboardList, label: 'My Requests' },
  ];

  return (
    <aside className="w-64 bg-surface-container border-r border-outline-variant/10 flex flex-col h-screen sticky top-0">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 industrial-gradient rounded flex items-center justify-center font-bold text-white">L</div>
          <span className="font-headline font-extrabold tracking-tighter text-primary uppercase">Liquidmatics</span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-label text-xs uppercase tracking-widest font-bold transition-all",
                isActive ? "bg-primary text-on-primary shadow-lg" : "text-on-surface-variant hover:bg-surface-container-high hover:text-primary"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}

          {isAdmin && (
            <NavLink
              to="/admin/users"
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-label text-xs uppercase tracking-widest font-bold transition-all mt-4",
                isActive ? "bg-tertiary text-on-tertiary" : "text-tertiary hover:bg-tertiary-container/20"
              )}
            >
              <Users className="w-4 h-4" />
              Admin Control
            </NavLink>
          )}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-outline-variant/10">
        <NavLink to="/settings" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest">
          <Settings className="w-4 h-4" /> Settings
        </NavLink>
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-error hover:bg-error-container/10 rounded-xl transition-colors text-xs font-bold uppercase tracking-widest">
          <LogOut className="w-4 h-4" /> Terminate Session
        </button>
      </div>
    </aside>
  );
}