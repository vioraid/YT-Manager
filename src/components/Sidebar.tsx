import React from 'react';
import { 
  LayoutDashboard, 
  Tv2, 
  BarChart3, 
  FileSpreadsheet, 
  Settings, 
  Database, 
  History, 
  Youtube,
  LogOut,
  Moon,
  Sun,
  Activity
} from 'lucide-react';
import { TabType } from '../types';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  userEmail?: string | null;
}

export default function Sidebar({ activeTab, setActiveTab, isDarkMode, toggleTheme, userEmail }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'channels', label: 'Channels', icon: Tv2 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
    { id: 'activity_log', label: 'Activity Log', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <aside className={`w-64 border-r shrink-0 flex flex-col h-screen overflow-y-auto ${
      isDarkMode ? 'bg-[#0f0f0f] border-zinc-850 text-zinc-100' : 'bg-white border-[#EFEFEF] text-slate-700'
    }`}>
      {/* Brand Logo */}
      <div className="px-6 py-8 border-b border-[#EFEFEF] dark:border-zinc-850">
        <h1 className="font-serif italic text-2xl tracking-tight text-[#FF0000] selection:bg-[#FF0000]/10">YTManager</h1>
        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">Multi-Channel Suite</p>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-4 px-3">Menu</div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm ${
                isActive 
                  ? 'bg-slate-50 text-slate-900 font-semibold border border-slate-100/60 dark:bg-zinc-900 dark:text-zinc-100'
                  : isDarkMode 
                    ? 'hover:bg-zinc-800/40 text-zinc-400 hover:text-zinc-100' 
                    : 'hover:bg-slate-50 text-slate-500 hover:text-slate-900'
              }`}
            >
              {/* Active Dot */}
              <div className={`w-1.5 h-1.5 rounded-full transition-all shrink-0 ${isActive ? 'bg-[#FF0000]' : 'bg-transparent'}`} />
              <Icon className={`w-4 h-4 shrink-0 opacity-80 ${isActive ? 'text-[#FF0000]' : ''}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Area */}
      <div className="p-4 border-t border-[#EFEFEF] dark:border-zinc-850 space-y-4">
        {/* Theme Switcher Toggle */}
        <button 
          onClick={toggleTheme}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-colors ${
            isDarkMode 
              ? 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800/60' 
              : 'border-slate-150 bg-slate-50 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <span className="text-[11px] font-semibold">Tema: {isDarkMode ? 'Gelap' : 'Terang'}</span>
          {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-500" />}
        </button>

        {/* User Info */}
        <div className="flex items-center gap-3 px-1">
          <div className="w-8 h-8 rounded-full bg-[#FF0000] flex items-center justify-center text-white text-xs font-serif italic">
            {userEmail ? userEmail[0].toUpperCase() : 'YT'}
          </div>
          <div className="truncate flex-1">
            <p className="text-xs font-bold leading-none truncate text-slate-800 dark:text-zinc-200">
              {userEmail ? userEmail.split('@')[0] : 'Administrator'}
            </p>
            <p className="text-[10px] text-slate-400 truncate mt-0.5">
              {userEmail || 'admin@multitube.com'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
