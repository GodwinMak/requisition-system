import React from 'react';
import { authHelper } from '../lib/auth';
import { 
  TrendingUp, 
  Package, 
  Clock, 
  CheckCircle,
  ShieldCheck,
  AlertCircle,
  Archive,
  ClipboardCheck,
  Warehouse
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function Dashboard() {
  const user = authHelper.getUser();

  const stats = [
    { 
      label: 'Pending Approval', 
      value: '24', 
      icon: Clock, 
      color: 'text-amber-500', 
      bg: 'bg-amber-50',
      description: 'Awaiting supervisor sign-off'
    },
    { 
      label: 'Completed', 
      value: '142', 
      icon: CheckCircle, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-50',
      description: 'Fully processed & issued'
    },
    { 
      label: 'Store Inventory', 
      value: '856', 
      icon: Warehouse, 
      color: 'text-blue-500', 
      bg: 'bg-blue-50',
      description: 'Active stock line items'
    },
    { 
      label: 'Rejected', 
      value: '3', 
      icon: AlertCircle, 
      color: 'text-rose-500', 
      bg: 'bg-rose-50',
      description: 'Requires revision'
    }
  ];

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-5xl font-extrabold text-primary tracking-tighter uppercase">Operations Hub</h2>
          <div className="mt-4 flex items-center space-x-4">
            <span className="bg-primary-fixed text-on-primary-fixed-variant px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
              {user?.role} Access
            </span>
            <p className="text-on-surface-variant text-sm font-label">System User: <span className="font-bold text-primary">{user?.username}</span></p>
          </div>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">System Time</p>
          <p className="font-mono text-lg font-bold text-primary">{new Date().toLocaleTimeString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Main Stats Grid */}
        {stats.map((stat, i) => (
          <div key={i} className="col-span-12 sm:col-span-6 lg:col-span-3 bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/10 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={cn("p-3 rounded-2xl transition-colors", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <TrendingUp className="w-4 h-4 text-on-surface-variant opacity-30 group-hover:opacity-100 transition-opacity" />
            </div>
            <h4 className="font-headline text-4xl font-extrabold text-primary tracking-tight">{stat.value}</h4>
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mt-1">{stat.label}</p>
            <p className="mt-4 text-[10px] text-on-surface-variant font-medium leading-relaxed">{stat.description}</p>
          </div>
        ))}

        {/* System Integrity Card */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container rounded-3xl p-1 shadow-sm">
          <div className="bg-surface-container-lowest rounded-[1.25rem] p-8 h-full">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-headline text-2xl font-bold text-primary">Recent Requisitions</h3>
              <button className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">View All Records</button>
            </div>
            <div className="space-y-4">
              {[
                { icon: Package, title: 'Hydraulic Pump Assembly (X-45)', status: 'Pending Approval', time: '12 mins ago', id: 'REQ-2024-001', color: 'bg-amber-100 text-amber-700' },
                { icon: Archive, title: 'Industrial Lubricant (Grade A)', status: 'Completed', time: '2 hours ago', id: 'REQ-2024-002', color: 'bg-emerald-100 text-emerald-700' },
                { icon: ClipboardCheck, title: 'Safety Gear - Helmets & Gloves', status: 'In Review', time: '5 hours ago', id: 'REQ-2024-003', color: 'bg-blue-100 text-blue-700' },
              ].map((item, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 rounded-2xl border border-outline-variant/5 hover:bg-surface-container-low transition-all group cursor-pointer">
                  <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-headline font-bold text-primary">{item.title}</p>
                        <p className="text-[10px] font-mono text-on-surface-variant">{item.id}</p>
                      </div>
                      <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-tighter">{item.time}</span>
                    </div>
                  </div>
                  <div className={cn("px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider", item.color)}>
                    {item.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Store Quick View */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-primary text-on-primary p-8 rounded-3xl overflow-hidden relative shadow-lg h-full flex flex-col justify-between">
            <ShieldCheck className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mb-2">Security Ledger</p>
              <h4 className="font-headline text-2xl font-bold tracking-tight mb-4">Zero Trust Protocol</h4>
              <p className="text-xs opacity-80 leading-relaxed">
                All requisitions are cryptographically signed and logged for audit purposes. System integrity is verified every 60 seconds.
              </p>
            </div>
            <div className="mt-8 pt-8 border-t border-on-primary/10">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Audit Status</span>
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Verified
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
