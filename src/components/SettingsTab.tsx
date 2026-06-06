import React, { useState } from 'react';
import { 
  Settings, 
  KeyRound, 
  Clock, 
  Globe, 
  Database, 
  HelpCircle, 
  Check, 
  FileJson,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { ApiSettings } from '../types';

interface SettingsTabProps {
  settings: ApiSettings;
  onSaveSettings: (settings: ApiSettings) => void;
  isDarkMode: boolean;
}

export default function SettingsTab({ settings, onSaveSettings, isDarkMode }: SettingsTabProps) {
  // Local bindings
  const [clientId, setClientId] = useState(settings.googleClientId || '');
  const [clientSecret, setClientSecret] = useState(settings.googleClientSecret || '');
  const [apiKey, setApiKey] = useState(settings.youtubeApiKey || '');
  const [interval, setInterval] = useState(settings.autoSyncInterval || 30);
  const [webhookUrl, setWebhookUrl] = useState('https://app.multitube.com/api/v1/webhook');
  const [language, setLanguage] = useState<'id' | 'en'>('id');
  const [showSecret, setShowSecret] = useState(false);

  // States
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isRefreshingKeys, setIsRefreshingKeys] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [backupMessage, setBackupMessage] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      googleClientId: clientId,
      googleClientSecret: clientSecret,
      youtubeApiKey: apiKey,
      autoSyncInterval: interval,
      exportFormat: 'json'
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Simulated Database Backup Download
  const handleBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      // Simulate file download
      const backupData = {
        meta: { app: 'MultiTube Manager', version: '1.0.0', date: new Date().toISOString() },
        credentials: { clientId, apiKey, interval },
        timestamp: Date.now()
      };
      
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `MultiTube_DB_Backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsBackingUp(false);
      setBackupMessage('Database backup downloaded successfully.');
      setTimeout(() => setBackupMessage(null), 3000);
    }, 1500);
  };

  // Simulated database restore state
  const handleRestore = () => {
    setIsRestoring(true);
    setTimeout(() => {
      setIsRestoring(false);
      setBackupMessage('Database restored successfully from standard image backup.');
      setTimeout(() => setBackupMessage(null), 3000);
    }, 1200);
  };

  const cardClass = isDarkMode ? 'bg-[#121212] border-zinc-805' : 'bg-white border-[#EFEFEF]';
  const textTitle = isDarkMode ? 'text-zinc-500' : 'text-[#8a8a8a]';

  return (
    <div className="space-y-6">
      {/* Upper header section */}
      <div className="border-b border-[#EFEFEF] dark:border-zinc-850 pb-6">
        <h2 className={`font-serif text-3xl italic leading-tight ${isDarkMode ? 'text-zinc-100' : 'text-[#121212]'}`}>
          System Settings
        </h2>
        <p className="text-xs text-slate-500 mt-2">Konfigurasi Google Cloud Developer credentials, YouTube Key, dan interval sinkronisasi DB.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Configuration settings form */}
        <div className={`p-6 rounded-2xl border shadow-2xs lg:col-span-2 ${cardClass}`}>
          <form onSubmit={handleSave} className="space-y-5">
            <h3 className={`text-xs font-bold uppercase tracking-widest border-b pb-2 ${isDarkMode ? 'text-zinc-200 border-zinc-800' : 'text-[#121212] border-[#EFEFEF]'}`}>
              Credentials Google Cloud & YouTube API
            </h3>

            {/* Google OAuth Client ID */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 block font-sans">Google OAuth Client ID</label>
              <input
                type="text"
                value={clientId}
                onChange={e => setClientId(e.target.value)}
                placeholder="1234567890-abc123xyz.apps.googleusercontent.com"
                className={`w-full px-4 py-2.5 rounded-full border text-xs focus:ring-1 focus:ring-[#FF0000]/30 focus:outline-hidden ${
                  isDarkMode ? 'bg-zinc-900 border-[#2a2a2a] text-zinc-100 placeholder-zinc-650' : 'bg-slate-50 border-slate-100 text-slate-800'
                }`}
              />
            </div>

            {/* Google OAuth Client Secret */}
            <div className="space-y-1.5 relative">
              <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 block font-sans">Google OAuth Client Secret</label>
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={clientSecret}
                  onChange={e => setClientSecret(e.target.value)}
                  placeholder="GOCSPX-xxxxxxxxxxxxxxxxxxxx"
                  className={`w-full px-4 py-2.5 rounded-full border text-xs focus:ring-1 focus:ring-[#FF0000]/30 focus:outline-hidden pr-10 ${
                    isDarkMode ? 'bg-zinc-900 border-[#2a2a2a] text-zinc-100 placeholder-zinc-650' : 'bg-slate-50 border-slate-100 text-slate-800'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-450 hover:text-slate-700 cursor-pointer"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* YouTube API Developer Key */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 block font-sans">YouTube Data API Key (v3)</label>
              <input
                type="text"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="AIzaSyAxxxxxxxxxxxxxxxxxxxxxxxx"
                className={`w-full px-4 py-2.5 rounded-full border text-xs focus:ring-1 focus:ring-[#FF0000]/30 focus:outline-hidden ${
                  isDarkMode ? 'bg-zinc-900 border-[#2a2a2a] text-zinc-100 placeholder-zinc-650' : 'bg-slate-50 border-slate-100 text-slate-800'
                }`}
              />
            </div>

            <h3 className={`text-xs font-bold uppercase tracking-widest border-b pb-2 pt-4 ${isDarkMode ? 'text-zinc-200 border-zinc-800' : 'text-[#121212] border-[#EFEFEF]'}`}>
              Interval Sinkronisasi & Webhook
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Interval selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 block font-sans">Interval Auto Sync</label>
                <select
                  value={interval}
                  onChange={e => setInterval(parseInt(e.target.value))}
                  className={`w-full px-4 py-2.5 rounded-full border text-xs focus:outline-hidden ${
                    isDarkMode ? 'bg-zinc-900 border-[#2a2a2a] text-zinc-205' : 'bg-slate-50 border-slate-100 text-slate-705'
                  }`}
                >
                  <option value={15}>Setiap 15 Menit</option>
                  <option value={30}>Setiap 30 Menit (Rekomendasi)</option>
                  <option value={60}>Setiap 60 Menit</option>
                  <option value={1440}>Setiap 24 Jam</option>
                </select>
              </div>

              {/* Language selection block */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 block font-sans">Bahasa / Language</label>
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value as 'id' | 'en')}
                  className={`w-full px-4 py-2.5 rounded-full border text-xs focus:outline-hidden ${
                    isDarkMode ? 'bg-zinc-900 border-[#2a2a2a] text-zinc-205' : 'bg-slate-50 border-slate-100 text-slate-705'
                  }`}
                >
                  <option value="id">Bahasa Indonesia (ID)</option>
                  <option value="en">English (US)</option>
                </select>
              </div>
            </div>

            {/* Webhook notification target parameter */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 block font-sans">Target Webhook URL</label>
              <input
                type="text"
                value={webhookUrl}
                onChange={e => setWebhookUrl(e.target.value)}
                placeholder="https://your-server.com/webhooks/youtube"
                className={`w-full px-4 py-2.5 rounded-full border text-xs focus:ring-1 focus:ring-[#FF0000]/30 focus:outline-hidden ${
                  isDarkMode ? 'bg-zinc-900 border-[#2a2a2a] text-zinc-101' : 'bg-slate-50 border-slate-100 text-slate-800'
                }`}
              />
            </div>

            {/* Actions Footer row */}
            <div className="pt-4 border-t border-slate-100/60 dark:border-zinc-800 flex items-center justify-between gap-2.5">
              {savedSuccess && (
                <span className="text-emerald-600 text-xs font-semibold flex items-center gap-1">
                  <Check className="w-4 h-4" /> Pengaturan berhasil disimpan ke sistem!
                </span>
              )}
              <div />
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#FF0000] hover:bg-[#E60000] text-white rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer transition-transform active:scale-95 shadow-md shadow-red-100/50 dark:shadow-none"
              >
                Simpan Konfigurasi
              </button>
            </div>
          </form>
        </div>

        {/* Database backup parameters */}
        <div className="space-y-6">
          <div className={`p-6 rounded-2xl border shadow-2xs ${cardClass} space-y-4`}>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#121212] dark:text-zinc-100 flex items-center gap-1.5 font-sans">
              <Database className="w-4 h-4 text-[#FF0000]" /> Backup & Sync DB
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed font-sans font-medium">
              Ekstrak database internal atau konfigurasikan status enkripsi untuk token-token YouTube Anda secara mudah.
            </p>

            <button
              onClick={handleBackup}
              disabled={isBackingUp}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 border rounded-full text-[10px] uppercase font-bold tracking-wider cursor-pointer transition-colors ${
                isDarkMode 
                  ? 'border-zinc-800 hover:bg-zinc-850 text-zinc-355' 
                  : 'border-[#EFEFEF] hover:bg-slate-50 text-slate-700'
              }`}
            >
              <FileJson className="w-3.5 h-3.5 text-amber-500" />
              {isBackingUp ? 'Memproses Backup...' : 'Ekspor Database'}
            </button>

            <button
              onClick={handleRestore}
              disabled={isRestoring}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 border rounded-full text-[10px] uppercase font-bold tracking-wider cursor-pointer transition-colors ${
                isDarkMode 
                  ? 'border-zinc-800 hover:bg-zinc-850 text-zinc-355' 
                  : 'border-[#EFEFEF] hover:bg-slate-50 text-slate-705'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-500 ${isRestoring ? 'animate-spin' : ''}`} />
              {isRestoring ? 'Memulihkan Data...' : 'Restore Database'}
            </button>

            {backupMessage && (
              <p className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-2 rounded-lg text-center border border-emerald-100 dark:border-emerald-900/40">
                {backupMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
