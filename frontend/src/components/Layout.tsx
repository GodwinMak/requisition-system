import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authHelper } from '../lib/auth';
import { 
  LayoutDashboard, 
  Package,
  ClipboardList,
  Users, 
  Settings, 
  LogOut, 
  Search, 
  Bell, 
  HelpCircle,
  Menu,
  Inbox
} from 'lucide-react';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authHelper.getUser();
  const isAdmin = authHelper.isAdmin();
  const canApprove = isAdmin || user?.role === 'procurement' || user?.role === 'approver';

  const handleLogout = () => {
    authHelper.clearSession();
    navigate('/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Package, label: 'Inventory', path: '/stock' },
    { icon: ClipboardList, label: 'My Requests', path: '/requisitions' },
    ...(canApprove ? [{ icon: Inbox, label: 'Incoming Tasks', path: '/requisitions/tasks' }] : []),
    ...(isAdmin ? [{ icon: Users, label: 'User Management', path: '/admin/users' }] : []),
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Sidebar */}
      <aside className="w-64 fixed left-0 top-0 h-full flex flex-col bg-surface-container shadow-xl shadow-primary/5 z-50 py-6 space-y-4">
        <div className="px-6 mb-8">
          <h1 className="font-headline font-extrabold text-primary text-2xl tracking-tighter">Liquidmatics</h1>
          <p className="font-label text-xs font-medium uppercase tracking-wider text-on-secondary-container mt-1">Requisition System</p>
        </div>

        <nav className="flex-1 flex flex-col space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center space-x-3 py-3 px-6 font-label text-sm font-medium uppercase tracking-wider transition-all active:translate-x-1",
                location.pathname === item.path 
                  ? "bg-surface-container-lowest text-primary rounded-l-full ml-4 shadow-sm" 
                  : "text-on-secondary-container hover:bg-surface-container-high"
              )}
            >
              <item.icon className={cn("w-5 h-5", location.pathname === item.path && "fill-current")} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="px-6 pt-6 mt-auto">
          <div className="bg-surface-container-low h-px w-full mb-6"></div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 py-3 px-6 text-on-secondary-container font-label text-sm font-medium uppercase tracking-wider hover:bg-surface-container-high transition-all active:translate-x-1"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 flex flex-col min-h-screen relative">
        <header className="w-full sticky top-0 z-40 bg-surface flex items-center justify-between px-8 h-16 border-b border-surface-container-low">
          <div className="flex items-center flex-1">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
              <input 
                className="w-full bg-surface-container-low border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="Search resources or users..."
                type="text"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full text-on-surface-variant hover:bg-primary-fixed-dim/10 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full text-on-surface-variant hover:bg-primary-fixed-dim/10 transition-colors">
              <HelpCircle className="w-5 h-5" />
            </button>
            <div className="h-8 w-px bg-surface-container-high"></div>
            <div className="flex items-center space-x-3 pl-2">
              <div className="text-right">
                <p className="text-xs font-bold text-primary font-headline leading-tight">{user?.username}</p>
                <p className="text-[10px] text-on-surface-variant font-label uppercase tracking-widest">{user?.role}</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-primary-fixed flex items-center justify-center font-bold text-primary">
                {user?.username.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <div className="p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
