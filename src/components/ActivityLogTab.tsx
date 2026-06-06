import React, { useState } from 'react';
import { 
  Search, 
  History, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Trash2,
  Calendar,
  Filter
} from 'lucide-react';
import { ActivityLog } from '../types';

interface ActivityLogTabProps {
  logs: ActivityLog[];
  onClearLogs?: () => void;
  isDarkMode: boolean;
}

export default function ActivityLogTab({ logs, onClearLogs, isDarkMode }: ActivityLogTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'error' | 'info'>('all');

  // Filter logs appropriately
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.channelName && log.channelName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: 'success' | 'error' | 'info') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500 animate-pulse" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: 'success' | 'error' | 'info') => {
    switch (status) {
      case 'success':
        return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400';
      case 'error':
        return 'bg-red-50 text-red-650 dark:bg-red-950/40 dark:text-red-400';
      default:
        return 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400';
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' ' + d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    } catch {
      return isoString;
    }
  };

  const cardClass = isDarkMode ? 'bg-[#121212] border-zinc-800' : 'bg-white border-[#EFEFEF]';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#EFEFEF] dark:border-zinc-850 pb-6">
        <div>
          <h2 className={`font-serif text-3xl italic leading-tight ${isDarkMode ? 'text-zinc-100' : 'text-[#121212]'}`}>
            Activity Logs
          </h2>
          <p className="text-xs text-slate-500 mt-2">Log audit real-time untuk penambahan channel, refresh metrics, dan respon Google API.</p>
        </div>
      </div>

      {/* Log filter clusters */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center gap-4 ${cardClass}`}>
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Cari logs berdasarkan aktivitas, channel, rincian pesan..."
            className={`w-full pl-10 pr-4 py-2.5 rounded-full border text-xs focus:ring-1 focus:ring-[#FF0000]/30 focus:outline-hidden ${
              isDarkMode 
                ? 'bg-zinc-900 border-[#2a2a2a] text-zinc-105 placeholder-zinc-500' 
                : 'bg-slate-50 border-slate-100/90 text-slate-800 placeholder-slate-400/80'
            }`}
          />
        </div>

        {/* Status Filter buttons */}
        <div className="flex items-center gap-2 shrink-0 overflow-x-auto w-full md:w-auto">
          <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 flex items-center gap-1 font-sans">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-colors ${
              statusFilter === 'all' 
                ? 'bg-slate-100 text-slate-900 border border-slate-200 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800' 
                : isDarkMode ? 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setStatusFilter('success')}
            className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-colors ${
              statusFilter === 'success' 
                ? 'bg-slate-100 text-slate-900 border border-slate-200 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800' 
                : isDarkMode ? 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Success
          </button>
          <button
            onClick={() => setStatusFilter('error')}
            className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-colors ${
              statusFilter === 'error' 
                ? 'bg-slate-100 text-slate-900 border border-slate-200 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800' 
                : isDarkMode ? 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Error
          </button>
        </div>
      </div>

      {/* Audit Log list */}
      <div className={`border rounded-2xl overflow-hidden ${cardClass}`}>
        <div className="divide-y divide-slate-100 dark:divide-zinc-800/60 max-h-[500px] overflow-y-auto">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <div 
                key={log.id} 
                className={`p-4 flex flex-col sm:flex-row sm:items-start gap-3 justify-between hover:bg-slate-50/50 transition-colors ${
                  isDarkMode ? 'hover:bg-zinc-800/20' : ''
                }`}
              >
                <div className="flex gap-3">
                  <div className="pt-0.5 shrink-0">
                    {getStatusIcon(log.status)}
                  </div>
                  <div>
                    {/* Log event title and category badge */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`font-bold text-xs leading-none ${isDarkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
                        {log.action}
                      </span>
                      {log.channelName && (
                        <span className="text-[9px] bg-slate-100 dark:bg-zinc-800 text-slate-500 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                          {log.channelName}
                        </span>
                      )}
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${getStatusBadge(log.status)}`}>
                        {log.status}
                      </span>
                    </div>
                    {/* Log description */}
                    <p className="text-slate-500 mt-1.5 leading-relaxed text-[11px] font-sans font-medium">
                      {log.details}
                    </p>
                  </div>
                </div>

                {/* Log timestamp */}
                <div className="text-[9px] text-slate-400 shrink-0 font-bold uppercase tracking-wider font-mono flex items-center gap-1.5 pl-7 sm:pl-0 sm:text-right">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> {formatTime(log.timestamp)}
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-slate-400 font-medium text-xs">
              Tidak ada log aktivitas yang cocok dengan pencarian Anda.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
