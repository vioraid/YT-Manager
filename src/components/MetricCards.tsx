import React from 'react';
import { 
  Users, 
  Tv, 
  Clock, 
  Eye, 
  Flame, 
  TrendingUp, 
  DollarSign, 
  CheckCircle, 
  HelpCircle 
} from 'lucide-react';
import { YoutubeChannel } from '../types';

interface MetricCardsProps {
  channels: YoutubeChannel[];
  isDarkMode: boolean;
}

export default function MetricCards({ channels, isDarkMode }: MetricCardsProps) {
  // Compute aggregated scores
  const totalChannels = channels.length;
  const totalSubscribers = channels.reduce((sum, c) => sum + c.subscriberCount, 0);
  const totalVideos = channels.reduce((sum, c) => sum + c.videoCount, 0);
  const totalWatchHours = channels.reduce((sum, c) => sum + c.watchHours, 0);
  const totalViews = channels.reduce((sum, c) => sum + c.viewCount, 0);

  // Find channel with the highest sub count
  const bestChannel = channels.length > 0 
    ? [...channels].sort((a, b) => b.subscriberCount - a.subscriberCount)[0] 
    : null;

  // Formatting helpers
  const formatCompact = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatIdr = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  // Mock interactive daily stats
  const subToday = channels.length * 324;
  const viewsToday = channels.length * 48200;
  const revenueToday = channels.length * 625000;

  const cardBg = isDarkMode ? 'bg-[#121212] border-zinc-800' : 'bg-white border-[#EFEFEF]';
  const textTitle = isDarkMode ? 'text-zinc-500' : 'text-[#8a8a8a]';
  const textValue = isDarkMode ? 'text-[#FAFAFA]' : 'text-[#121212]';

  return (
    <div className="space-y-6">
      {/* Prime Bento Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Channels */}
        <div className={`p-5 rounded-2xl border shadow-2xs flex items-center gap-4 ${cardBg}`}>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-850 text-slate-500 dark:text-zinc-400">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <p className={`text-[10px] uppercase tracking-wider font-bold ${textTitle}`}>Total Channel</p>
            <h3 className={`text-2xl font-serif italic tracking-tight ${textValue}`}>{totalChannels}</h3>
          </div>
        </div>

        {/* Total Subscriber */}
        <div className={`p-5 rounded-2xl border shadow-2xs flex items-center gap-4 ${cardBg}`}>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-850 text-[#FF0000] dark:text-[#FF0000]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className={`text-[10px] uppercase tracking-wider font-bold ${textTitle}`}>Total Subscriber</p>
            <h3 className={`text-2xl font-serif italic tracking-tight ${textValue}`}>{formatCompact(totalSubscribers)}</h3>
          </div>
        </div>

        {/* Total Views */}
        <div className={`p-5 rounded-2xl border shadow-2xs flex items-center gap-4 ${cardBg}`}>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-850 text-slate-500 dark:text-zinc-400">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <p className={`text-[10px] uppercase tracking-wider font-bold ${textTitle}`}>Total Views</p>
            <h3 className={`text-2xl font-serif italic tracking-tight ${textValue}`}>{formatCompact(totalViews)}</h3>
          </div>
        </div>

        {/* Total Watch Hours */}
        <div className={`p-5 rounded-2xl border shadow-2xs flex items-center gap-4 ${cardBg}`}>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-850 text-slate-500 dark:text-zinc-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className={`text-[10px] uppercase tracking-wider font-bold ${textTitle}`}>Total Jam Tayang</p>
            <h3 className={`text-2xl font-serif italic tracking-tight ${textValue}`}>{formatCompact(totalWatchHours)} Jam</h3>
          </div>
        </div>

        {/* Total Video */}
        <div className={`p-5 rounded-2xl border shadow-2xs flex items-center gap-4 ${cardBg}`}>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-850 text-slate-500 dark:text-zinc-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <p className={`text-[10px] uppercase tracking-wider font-bold ${textTitle}`}>Total Video</p>
            <h3 className={`text-2xl font-serif italic tracking-tight ${textValue}`}>{totalVideos}</h3>
          </div>
        </div>
      </div>

      {/* Auxiliary Statistics and Service Status Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic Daily Counter */}
        <div className={`p-5 rounded-2xl border shadow-2xs ${cardBg} lg:col-span-2`}>
          <div className="flex justify-between items-center mb-4">
            <h4 className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${isDarkMode ? 'text-zinc-200' : 'text-slate-800'}`}>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Estimasi Hari Ini
            </h4>
            <div className="flex items-center gap-1 bg-emerald-50/50 text-emerald-600 text-[9px] px-2 py-0.5 rounded-full font-bold dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/30">
              Live Tracker
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-xl bg-[#FAFAFA] dark:bg-zinc-900 border border-slate-100/60 dark:border-zinc-850">
              <span className={`text-[10px] block font-bold uppercase tracking-wide ${textTitle}`}>Sub Baru</span>
              <span className="text-xl font-serif italic text-emerald-600 dark:text-emerald-400">+{subToday}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#FAFAFA] dark:bg-zinc-900 border border-slate-100/60 dark:border-zinc-850">
              <span className={`text-[10px] block font-bold uppercase tracking-wide ${textTitle}`}>Views</span>
              <span className="text-xl font-serif italic text-red-550 dark:text-red-400">+{formatCompact(viewsToday)}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#FAFAFA] dark:bg-zinc-900 border border-slate-100/60 dark:border-zinc-850">
              <span className={`text-[10px] block font-bold uppercase tracking-wide ${textTitle}`}>Pendapatan</span>
              <span className="text-xl font-serif italic text-amber-500">{formatIdr(revenueToday)}</span>
            </div>
          </div>
        </div>

        {/* API and Google Workspace Auth Gate Indicators */}
        <div className={`p-5 rounded-2xl border shadow-2xs ${cardBg}`}>
          <h4 className={`text-xs font-bold uppercase tracking-widest mb-4 ${isDarkMode ? 'text-zinc-200' : 'text-slate-805'}`}>
            Status YouTube API v3
          </h4>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className={`text-[11px] uppercase font-semibold ${textTitle}`}>YouTube Data API:</span>
              <div className="flex items-center gap-1.5 text-emerald-600 font-bold dark:text-emerald-400 text-[11px] uppercase">
                <CheckCircle className="w-3.5 h-3.5" /> Aktif
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className={`text-[11px] uppercase font-semibold ${textTitle}`}>YouTube Analytics API:</span>
              <div className="flex items-center gap-1.5 text-emerald-600 font-bold dark:text-emerald-400 text-[11px] uppercase">
                <CheckCircle className="w-3.5 h-3.5" /> Aktif
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className={`text-[11px] uppercase font-semibold ${textTitle}`}>Google OAuth App:</span>
              <div className="flex items-center gap-1.5 text-amber-600 font-bold text-[11px] uppercase">
                Otomatis
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
