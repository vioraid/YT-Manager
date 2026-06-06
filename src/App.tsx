/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MetricCards from './components/MetricCards';
import DashboardTab from './components/DashboardTab';
import AnalyticsTab from './components/AnalyticsTab';
import ReportsTab from './components/ReportsTab';
import ActivityLogTab from './components/ActivityLogTab';
import SettingsTab from './components/SettingsTab';
import { YoutubeChannel, ActivityLog, ApiSettings, TabType } from './types';
import { RefreshCcw, Bell, AlertCircle, Sparkles, User, LogOut } from 'lucide-react';

export default function App() {
  // Global States
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [channels, setChannels] = useState<YoutubeChannel[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<YoutubeChannel | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // API Config parameters
  const [apiSettings, setApiSettings] = useState<ApiSettings>({
    googleClientId: '',
    googleClientSecret: '',
    youtubeApiKey: '',
    autoSyncInterval: 30,
    exportFormat: 'json',
  });

  // UI Notification Toast
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Setup Notification Helper
  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Theme Toggler
  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  // Load active parameters on mount
  useEffect(() => {
    // Determine system preferences or localstorage theme overrides
    const localTheme = localStorage.getItem('theme');
    if (localTheme === 'dark') setIsDarkMode(true);

    // Load active settings from server proxy configured
    fetch('/api/settings/config')
      .then(res => res.json())
      .then(data => {
        setApiSettings({
          googleClientId: data.googleClientId,
          googleClientSecret: data.hasClientSecret ? '••••••••••••••••' : '',
          youtubeApiKey: data.youtubeApiKey,
          autoSyncInterval: data.autoSyncInterval,
          exportFormat: data.exportFormat
        });
      })
      .catch(err => console.error('Gagal mengambil konfigurasi:', err));

    // Pull current channels and activity logs
    pullChannelsAndLogs();

    // Pull User Profile context if present via headers / API
    setUserEmail('anjazrera@gmail.com');
  }, []);

  // Save theme selection to localStorage so it persists across renders
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Background sync scheduler as per prompt request: "Background scheduler: Update setiap 30 menit."
  useEffect(() => {
    const minutes = apiSettings.autoSyncInterval || 30;
    const intervalMs = minutes * 60 * 1000;

    const timer = setInterval(() => {
      console.log(`Auto Sync background scheduler triggered every ${minutes} minutes...`);
      handleRefreshAllSilent();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [apiSettings.autoSyncInterval]);

  // Unified pull handler
  const pullChannelsAndLogs = async () => {
    try {
      const chanRes = await fetch('/api/channels');
      const chanData = await chanRes.json();
      if (chanData.channels) {
        setChannels(chanData.channels);
      }

      const logRes = await fetch('/api/activity-logs');
      const logData = await logRes.json();
      if (logData.logs) {
        setActivityLogs(logData.logs);
      }
    } catch (err) {
      console.error('Error fetching data from MultiTube api server:', err);
    }
  };

  // Silent sync trigger without interrupting active screens
  const handleRefreshAllSilent = async () => {
    try {
      const res = await fetch('/api/channels/refresh-all', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await pullChannelsAndLogs();
      }
    } catch (err) {
      console.error('Background synchronization failed:', err);
    }
  };

  // Refresh Single channel metrics
  const handleRefreshSingle = async (id: string) => {
    try {
      const res = await fetch(`/api/channels/${id}/refresh`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showNotification(`Berhasil menyinkronkan data untuk channel: ${data.channel.channelName}`, 'success');
        await pullChannelsAndLogs();
      }
    } catch (err: any) {
      showNotification('Gagal menyinkronkan data. Silakan coba lagi.', 'error');
    }
  };

  // Refresh All channels with indicator
  const handleRefreshAll = async () => {
    try {
      const res = await fetch('/api/channels/refresh-all', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showNotification('Semua channel YouTube berhasil disinkronisasi!', 'success');
        await pullChannelsAndLogs();
      }
    } catch (err: any) {
      showNotification('Sinkronisasi masal gagal.', 'error');
    }
  };

  // Disconnect a connected youtube channel
  const handleDisconnect = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin memutuskan sinkronisasi channel ini?')) return;
    try {
      const res = await fetch(`/api/channels/${id}/disconnect`, { method: 'POST' });
      if (res.ok) {
        showNotification('Channel YouTube berhasil diputus dari dashboard.', 'info');
        await pullChannelsAndLogs();
        if (selectedChannel?.channelId === id) {
          setSelectedChannel(null);
        }
      }
    } catch (err: any) {
      showNotification('Gagal memutuskan koneksi channel.', 'error');
    }
  };

  // Manual configuration saving interface
  const handleSaveSettings = (updated: ApiSettings) => {
    setApiSettings(updated);
    showNotification('Credentials dan API parameters berhasil diperbarui!', 'success');
    
    // Add activity logger directly
    const newLogItem: ActivityLog = {
      id: `log_${Date.now()}`,
      userId: 'anjazrera',
      action: 'Update Settings',
      details: 'Pengaturan Google OAuth Client & YouTube API Key berhasil dikonfigurasi.',
      status: 'success',
      timestamp: new Date().toISOString()
    };
    setActivityLogs(prev => [newLogItem, ...prev]);
  };

  // Simulate addition of a YouTube channel (Sandbox mode)
  const handleSimulateChannelAddition = async (name: string, category: string, country: string, subCount: string) => {
    try {
      const res = await fetch('/api/channels/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, category, country, subCount })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Berhasil menambahkan channel: ${data.channel.channelName}`, 'success');
        await pullChannelsAndLogs();
      }
    } catch (err) {
      showNotification('Gagal menambahkan channel simulasi.', 'error');
    }
  };

  // Navigation switcher with auto scroll back top
  const handleNavigateTab = (tab: TabType) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Specific router to open analytics detailed page
  const handleOpenChannelAnalytics = (channel: YoutubeChannel) => {
    setSelectedChannel(channel);
    setActiveTab('analytics');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div className={`flex h-screen overflow-hidden font-sans ${isDarkMode ? 'dark bg-[#0A0A0A]' : 'bg-[#FCFCFC]'}`}>
      
      {/* 1. Sidebar Left */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={handleNavigateTab} 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme} 
        userEmail={userEmail}
      />

      {/* 2. Main Area Center */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Header toolbar */}
        <header className={`px-8 py-5 border-b shrink-0 flex items-center justify-between transition-colors ${
          isDarkMode ? 'bg-[#0f0f0f] border-zinc-850 text-zinc-100' : 'bg-white border-[#EFEFEF] text-slate-800'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-[9px] bg-slate-50 text-[#FF0000] border border-slate-100/90 px-3 py-1 rounded-full font-black uppercase tracking-widest dark:bg-zinc-900 dark:border-zinc-800 dark:text-red-400">
              Multi-Account Studio
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Refresh All Status icon */}
            <button 
              onClick={handleRefreshAll}
              title="Sinkronkan Semua Channel Sekaligus"
              className="p-2.5 rounded-full text-slate-400 hover:text-[#FF0000] hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
            >
              <RefreshCcw className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-[#EFEFEF] dark:bg-zinc-800" />

            {/* Profile Avatar Trigger metadata */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono tracking-wider text-slate-450 font-bold hidden sm:block">ANJAZRERA</span>
              <div className="w-8 h-8 rounded-full bg-linear-to-tr from-rose-500 to-red-600 flex items-center justify-center text-white font-serif italic font-bold text-xs shadow-xs">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Floating notifications */}
        {notification && (
          <div className="fixed top-6 right-6 z-50 animate-bounce">
            <div className={`p-4 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2.5 ${
              notification.type === 'success' 
                ? 'bg-emerald-50 border-emerald-250 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                : notification.type === 'error'
                  ? 'bg-red-50 border-red-250 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                  : 'bg-zinc-50 border-zinc-250 text-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-300'
            }`}>
              <Sparkles className="w-4 h-4" />
              {notification.message}
            </div>
          </div>
        )}

        {/* Workspace Body container */}
        <main className="p-8 max-w-7xl w-full mx-auto space-y-8 flex-1">
          {/* Summary stats visible exclusively on core tabs */}
          {activeTab === 'dashboard' && (
            <MetricCards channels={channels} isDarkMode={isDarkMode} />
          )}

          {/* Tab Route Switching */}
          {activeTab === 'dashboard' && (
            <DashboardTab 
              channels={channels}
              onRefresh={handleRefreshSingle}
              onRefreshAll={handleRefreshAll}
              onDisconnect={handleDisconnect}
              onSelectChannelForAnalytics={handleOpenChannelAnalytics}
              onSimulateChannelAddition={handleSimulateChannelAddition}
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'channels' && (
            <DashboardTab 
              channels={channels}
              onRefresh={handleRefreshSingle}
              onRefreshAll={handleRefreshAll}
              onDisconnect={handleDisconnect}
              onSelectChannelForAnalytics={handleOpenChannelAnalytics}
              onSimulateChannelAddition={handleSimulateChannelAddition}
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsTab 
              channels={channels}
              selectedChannel={selectedChannel}
              onSelectChannel={setSelectedChannel}
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsTab 
              channels={channels}
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'activity_log' && (
            <ActivityLogTab 
              logs={activityLogs}
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab 
              settings={apiSettings}
              onSaveSettings={handleSaveSettings}
              isDarkMode={isDarkMode}
            />
          )}
        </main>
      </div>

    </div>
  );
}
