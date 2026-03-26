import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User as UserIcon, 
  Shield, 
  Group, 
  CreditCard, 
  Bell, 
  Headphones, 
  LogOut, 
  Search, 
  HelpCircle,
  BadgeCheck,
  Lock,
  Smartphone,
  Key
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userService, User } from '../services/userService';

export default function SettingsScreen() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState('Security');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
    }
  }, [user]);

  const isAdmin = user?.role?.toLowerCase() === 'admin';

  useEffect(() => {
    if (activeTab === 'Team Access' && isAdmin) {
      fetchUsers();
    }
  }, [activeTab, user, isAdmin]);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const data = await userService.getAllUsers();
      // The API might return the array directly or wrapped in an object
      const userList = Array.isArray(data) ? data : (data.users || data.data || []);
      setUsers(userList);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      alert(err.friendlyMessage || 'Failed to fetch enterprise directory.');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsUpdating(true);
    try {
      const updateData: any = { username };
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          alert('Passwords do not match');
          return;
        }
        updateData.currentPassword = currentPassword;
        updateData.password = newPassword;
      }
      await userService.updateProfile(updateData);
      updateUser({ ...user, username });
      alert('Profile updated successfully.');
      if (newPassword) {
        logout();
        navigate('/login');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.friendlyMessage || 'Failed to update profile.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    if (window.confirm('Are you sure you want to deactivate your account? This action is irreversible.')) {
      setIsDeleting(true);
      try {
        await userService.deleteUser(user.id);
        logout();
        navigate('/login');
      } catch (err: any) {
        console.error(err);
        alert(err.friendlyMessage || 'Failed to deactivate account.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-surface">
      {/* SideNavBar */}
      <aside className="fixed left-0 top-0 h-full flex flex-col gap-2 p-4 w-64 bg-surface-container-low z-40">
        <div className="px-4 mb-6 mt-4">
          <h2 className="text-primary font-bold text-lg">Settings</h2>
          <p className="text-xs text-on-surface-variant font-medium">Manage enterprise preferences</p>
        </div>
        <nav className="flex-1 flex flex-col gap-1">
          <NavItem icon={<UserIcon size={18} />} label="Account Overview" active={activeTab === 'Account Overview'} onClick={() => setActiveTab('Account Overview')} />
          <NavItem icon={<Shield size={18} />} label="Security" active={activeTab === 'Security'} onClick={() => setActiveTab('Security')} />
          {isAdmin && (
            <NavItem icon={<Group size={18} />} label="Team Access" active={activeTab === 'Team Access'} onClick={() => setActiveTab('Team Access')} />
          )}
          <NavItem icon={<CreditCard size={18} />} label="Billing" active={activeTab === 'Billing'} onClick={() => setActiveTab('Billing')} />
          <NavItem icon={<Bell size={18} />} label="Notifications" active={activeTab === 'Notifications'} onClick={() => setActiveTab('Notifications')} />
        </nav>
        <div className="mt-auto flex flex-col gap-1 pt-4 border-t border-outline-variant/15">
          <button className="mb-4 mx-2 py-2 px-4 bg-primary text-white font-semibold rounded text-sm hover:opacity-90 transition-opacity">
            Upgrade Plan
          </button>
          <NavItem icon={<Headphones size={18} />} label="Support" onClick={() => setActiveTab('Support')} />
          <button 
            onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-highest transition-all text-sm font-medium rounded-lg w-full text-left"
          >
            <LogOut size={18} />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-64 flex-1">
        {/* TopNavBar */}
        <header className="sticky top-0 w-full z-50 flex justify-between items-center px-8 h-16 bg-surface">
          <div className="flex items-center gap-8">
            <span className="text-2xl font-black text-primary font-headline">Architectural Ledger</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center bg-surface-container-low px-4 py-1.5 rounded-lg border border-outline-variant/15">
              <Search className="text-on-surface-variant w-4 h-4" />
              <input 
                className="bg-transparent border-none focus:ring-0 text-sm w-64 placeholder:text-outline ml-2" 
                placeholder="Search requisition IDs..." 
                type="text"
              />
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-on-surface-variant hover:bg-surface-container-low transition-colors rounded-full relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
              </button>
              <button className="p-2 text-on-surface-variant hover:bg-surface-container-low transition-colors rounded-full">
                <HelpCircle size={20} />
              </button>
              <div className="w-8 h-8 rounded-full bg-primary overflow-hidden ml-2 ring-2 ring-primary-container/10">
                <img 
                  alt="User Profile" 
                  className="w-full h-full object-cover" 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </header>

        <div className="p-12 max-w-5xl mx-auto">
          {activeTab === 'Security' && (
            <>
              <header className="mb-12">
                <h1 className="text-4xl font-extrabold tracking-tight text-primary mb-2">Account Credentials</h1>
                <p className="text-on-surface-variant max-w-2xl font-body leading-relaxed">
                  Securely manage your identity and access parameters. Changes to enterprise email may require organizational re-validation.
                </p>
              </header>

              <div className="grid grid-cols-12 gap-12">
                {/* Form Section */}
                <div className="col-span-12 lg:col-span-7 space-y-12">
                  {/* Identity Section */}
                  <section className="space-y-6">
                    <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                      <BadgeCheck className="text-secondary" size={20} />
                      Identity Profiles
                    </h3>
                    <div className="space-y-8 p-8 bg-surface-container-lowest shadow-[0px_12px_32px_rgba(25,28,29,0.04)] rounded-xl">
                      <div className="space-y-1 group">
                        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest px-1">Username</label>
                        <div className="relative mt-2">
                          <input 
                            className="w-full bg-surface-container-highest border-0 border-b-2 border-transparent focus:border-primary focus:ring-0 transition-all py-3 px-4 font-medium text-primary" 
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-1 group">
                        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest px-1">Enterprise Email</label>
                        <div className="relative mt-2">
                          <input 
                            className="w-full bg-surface-container-highest border-0 border-b-2 border-transparent focus:border-primary focus:ring-0 transition-all py-3 px-4 font-medium text-primary opacity-70" 
                            type="email" 
                            value={email}
                            readOnly
                          />
                        </div>
                        <p className="text-[10px] text-outline font-medium mt-1 ml-1">Verified on Oct 12, 2023</p>
                      </div>
                    </div>
                  </section>

                  {/* Password Section */}
                  <section className="space-y-6">
                    <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                      <Lock className="text-secondary" size={20} />
                      Access Credentials
                    </h3>
                    <div className="space-y-8 p-8 bg-surface-container-lowest shadow-[0px_12px_32px_rgba(25,28,29,0.04)] rounded-xl">
                      <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest px-1">Current Password</label>
                          <input 
                            className="w-full bg-surface-container-highest border-0 border-b-2 border-transparent focus:border-primary focus:ring-0 transition-all py-3 px-4" 
                            placeholder="••••••••••••" 
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest px-1">New Password</label>
                            <input 
                              className="w-full bg-surface-container-highest border-0 border-b-2 border-transparent focus:border-primary focus:ring-0 transition-all py-3 px-4" 
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest px-1">Confirm New Password</label>
                            <input 
                              className="w-full bg-surface-container-highest border-0 border-b-2 border-transparent focus:border-primary focus:ring-0 transition-all py-3 px-4" 
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="pt-4">
                        <button 
                          onClick={handleUpdate}
                          disabled={isUpdating}
                          className="bg-gradient-to-b from-primary to-primary-container text-white px-8 py-3 rounded-md font-bold text-sm tracking-tight shadow-md active:scale-[0.98] transition-all disabled:opacity-70"
                        >
                          {isUpdating ? 'Updating...' : 'Update Credentials'}
                        </button>
                      </div>
                    </div>
                  </section>

                  {/* Danger Zone */}
                  <section className="p-8 bg-error-container/20 rounded-xl border border-error/5">
                    <h3 className="text-sm font-bold text-error uppercase tracking-widest mb-4">Account Deprecation</h3>
                    <div className="flex items-start justify-between gap-6">
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        Deactivating your account will immediately revoke all access to active requisitions and archival ledgers. This action is audited and requires administrative approval.
                      </p>
                      <button 
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="shrink-0 text-error font-bold text-sm hover:underline decoration-2 underline-offset-4 disabled:opacity-50"
                      >
                        {isDeleting ? 'Deactivating...' : 'Deactivate Account'}
                      </button>
                    </div>
                  </section>
                </div>

                {/* Sidebar Info Cards */}
                <div className="col-span-12 lg:col-span-5 space-y-8">
                  {/* MFA Status Card */}
                  <div className="bg-surface-container-low p-8 rounded-xl relative overflow-hidden group">
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <span className="bg-tertiary/10 text-tertiary px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-tighter">Enterprise Secure</span>
                        <BadgeCheck className="text-tertiary w-8 h-8" />
                      </div>
                      <h4 className="text-xl font-bold text-primary mb-3">MFA: Active</h4>
                      <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                        Your account is protected by hardware-level authentication. Multi-Factor Authentication is mandated for all Ledger access points.
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-xs font-semibold text-primary">
                          <Smartphone size={16} />
                          Authenticator App Attached
                        </div>
                        <div className="flex items-center gap-3 text-xs font-semibold text-primary">
                          <Key size={16} />
                          Security Key: Yubico 5C
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Last Activity Bento */}
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-surface-container-low p-6 rounded-xl border-l-4 border-primary">
                      <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-2">Last Audit Entry</p>
                      <p className="text-sm font-bold text-primary mb-1">Stockholm, SE • IP 192.168.1.1</p>
                      <p className="text-xs text-on-surface-variant italic">Today at 09:42 AM</p>
                    </div>
                    <div className="bg-surface-container-low p-6 rounded-xl border-l-4 border-outline-variant">
                      <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-2">Device Registry</p>
                      <p className="text-sm font-bold text-primary mb-1">MacBook Pro 16" (M3 Max)</p>
                      <p className="text-xs text-on-surface-variant">Authenticated Browser: Safari v17.4</p>
                    </div>
                  </div>

                  {/* Visual Anchor */}
                  <div className="rounded-xl overflow-hidden h-48 relative shadow-lg">
                    <img 
                      className="w-full h-full object-cover" 
                      src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=2069&auto=format&fit=crop"
                      alt="Architecture"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-primary/20 mix-blend-multiply"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <p className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-70">Architecture of Trust</p>
                      <p className="text-lg font-bold leading-tight">Secured Ledger v4.2.0</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'Team Access' && isAdmin && (
            <div className="space-y-8">
              <header className="mb-12">
                <h1 className="text-4xl font-extrabold tracking-tight text-primary mb-2">Team Access Control</h1>
                <p className="text-on-surface-variant max-w-2xl font-body leading-relaxed">
                  Manage organizational users, roles, and access permissions across the Architectural Ledger ecosystem.
                </p>
              </header>

              {/* Debug Section */}
              <div className="p-4 bg-surface-container-high rounded-lg mb-8">
                <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-2">System Debug: Current Session Profile</p>
                <pre className="text-[10px] text-primary overflow-auto">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>

              <div className="bg-surface-container-lowest shadow-[0px_12px_32px_rgba(25,28,29,0.04)] rounded-xl overflow-hidden">
                <div className="p-6 border-b border-outline-variant/15 flex justify-between items-center">
                  <h3 className="font-bold text-primary">All Enterprise Users</h3>
                  <button className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">Add New User</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-surface-container-low text-[10px] font-bold uppercase tracking-widest text-outline">
                      <tr>
                        <th className="px-6 py-4">Username</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {isLoadingUsers ? (
                        <tr><td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">Loading enterprise directory...</td></tr>
                      ) : users.length === 0 ? (
                        <tr><td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">No users found in directory.</td></tr>
                      ) : users.map((u) => (
                        <tr key={u.id} className="hover:bg-surface-container-low/50 transition-colors">
                          <td className="px-6 py-4 font-medium text-primary">{u.username}</td>
                          <td className="px-6 py-4 text-on-surface-variant">{u.email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${u.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`w-2 h-2 rounded-full inline-block mr-2 ${u.isActive ? 'bg-green-500' : 'bg-outline'}`}></span>
                            <span className="text-xs font-medium">{u.isActive ? 'Active' : 'Inactive'}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="text-primary hover:underline text-xs font-bold mr-4">Edit</button>
                            <button className="text-error hover:underline text-xs font-bold">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {['Account Overview', 'Billing', 'Notifications', 'Support'].includes(activeTab) && (
            <div className="min-h-[400px] flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-outline">
                <Search size={32} />
              </div>
              <h2 className="text-2xl font-bold text-primary">{activeTab}</h2>
              <p className="text-on-surface-variant max-w-md">
                This section is currently under architectural review. Detailed documentation and interface parameters will be deployed in the next cycle.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="flex flex-row justify-between items-center px-12 w-full py-8 mt-auto bg-surface border-t border-outline-variant/15">
          <p className="text-xs text-on-surface-variant font-medium">© 2024 Editorial Enterprise Efficiency. All rights reserved.</p>
          <div className="flex gap-8">
            <Link to="#" className="text-xs text-on-surface-variant hover:text-primary underline transition-colors">Privacy Policy</Link>
            <Link to="#" className="text-xs text-on-surface-variant hover:text-primary underline transition-colors">Terms of Service</Link>
            <Link to="#" className="text-xs text-on-surface-variant hover:text-primary underline transition-colors">Compliance</Link>
          </div>
        </footer>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`
        flex items-center gap-3 px-4 py-3 transition-all duration-200 text-sm rounded-lg w-full text-left
        ${active 
          ? 'bg-surface-container-lowest text-primary font-bold shadow-sm' 
          : 'text-on-surface-variant hover:bg-surface-container-highest font-medium'}
      `}
    >
      {icon}
      {label}
    </button>
  );
}
