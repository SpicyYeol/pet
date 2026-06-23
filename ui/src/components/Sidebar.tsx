import React from 'react';
import { 
  LayoutDashboard, 
  History, 
  Contact, 
  Settings,
  Activity,
  BarChart3,
  HeartPulse
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  clinician: { name: string; title: string; avatarUrl: string };
}

export default function Sidebar({
  activeTab,
  onSelectTab,
  clinician
}: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ews', label: 'Vitals EWS', icon: HeartPulse },
    { id: 'feasibility', label: 'Feasibility', icon: BarChart3 },
    { id: 'history', label: 'History', icon: History },
    { id: 'patients', label: 'Patient Records', icon: Contact },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className="w-full md:w-[300px] bg-background border-b md:border-b-0 md:border-r border-outline-variant/30 flex flex-col justify-between shrink-0 h-auto md:h-screen sticky top-0 md:py-6 z-[60]">
      <div className="flex flex-col flex-1">
        {/* Brand Logo & title specs */}
        <div className="px-6 py-4 md:py-0 md:mb-10 text-left">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary-fixed-dim animate-pulse" />
            <h1 className="font-headline text-2xl font-bold text-primary-fixed-dim tracking-tight">
              VET-PPG
            </h1>
          </div>
          <p className="font-mono text-[10px] text-on-surface-variant/50 uppercase tracking-widest mt-1">
            rPPG Capillary Telemetry Workstation
          </p>
        </div>

        {/* Action navigation tabs */}
        <nav className="space-y-1.5 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-4 py-3 px-4 rounded-xl transition-all font-mono text-sm tracking-wide text-left uppercase group outline-none relative ${
                  isSelected 
                    ? 'bg-primary-container/10 border-r-2 border-primary-fixed-dim text-primary-fixed-dim' 
                    : 'text-on-surface-variant/60 hover:bg-white/5 hover:text-on-surface'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-105 ${
                  isSelected ? 'text-primary-fixed-dim' : 'text-on-surface-variant/40 group-hover:text-on-surface-variant/70'
                }`} />
                <span className="font-sans font-medium">{item.label}</span>

                {isSelected && (
                  <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary-fixed-dim shadow-[0_0_6px_#00e639]"></span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Clinician Profile Footer Card */}
      <div className="px-5 py-4 border-t border-outline-variant/15 mt-auto flex items-center gap-3.5 bg-black/10">
        <img 
          alt="Staff Clinician" 
          className="w-11 h-11 rounded-full border border-primary-fixed-dim/20 object-cover pointer-events-none" 
          src={clinician.avatarUrl}
          referrerPolicy="no-referrer"
        />
        <div className="min-w-0">
          <p className="font-sans font-bold text-sm text-on-surface truncate">
            {clinician.name}
          </p>
          <p className="text-[10px] text-on-surface-variant/50 font-mono uppercase tracking-wider truncate">
            {clinician.title}
          </p>
        </div>
      </div>
    </aside>
  );
}
