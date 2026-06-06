import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  Clock, 
  DollarSign, 
  PlaySquare, 
  Globe2, 
  Smartphone, 
  Award, 
  ArrowLeftRight,
  Tv2
} from 'lucide-react';
import { YoutubeChannel, VideoMetadata } from '../types';

interface AnalyticsTabProps {
  channels: YoutubeChannel[];
  selectedChannel: YoutubeChannel | null;
  onSelectChannel: (channel: YoutubeChannel) => void;
  isDarkMode: boolean;
}

export default function AnalyticsTab({
  channels,
  selectedChannel,
  onSelectChannel,
  isDarkMode
}: AnalyticsTabProps) {
  // Select active channel from dropdown list if null, fallback first channels
  const activeChannel = selectedChannel || (channels.length > 0 ? channels[0] : null);
  const [videos, setVideos] = useState<VideoMetadata[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [metricTab, setMetricTab] = useState<'views' | 'subscribers' | 'watch_hours' | 'revenue'>('views');

  // Fetch mock videos matching specific view thresholds
  useEffect(() => {
    if (!activeChannel) return;
    setIsLoadingVideos(true);
    fetch(`/api/channels/${activeChannel.channelId}/videos`)
      .then(res => res.json())
      .then(data => {
        if (data.videos) {
          setVideos(data.videos);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoadingVideos(false));
  }, [activeChannel]);

  if (!activeChannel) {
    return (
      <div className="text-center py-24 border rounded-2xl border-dashed border-zinc-200 dark:border-zinc-800">
        <Tv2 className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
        <h3 className="font-semibold text-zinc-700 dark:text-zinc-300">Belum Ada Analytics Terkoneksi</h3>
        <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">Silakan hubungkan channel YouTube terlebih dahulu di halaman Dashboard.</p>
      </div>
    );
  }

  // Generate beautiful historical chart data based on selected channel statistics
  const viewsFactor = activeChannel.viewCount / 30;
  const subsFactor = activeChannel.subscriberCount / 22;
  const hoursFactor = activeChannel.watchHours / 30;
  // Estimated Rp 15.000 per 1000 views
  const estimatedRevenue = (activeChannel.viewCount / 1000) * 15000;

  const chartData = [
    { name: 'Sen', views: Math.floor(viewsFactor * 0.8), subs: Math.floor(subsFactor * 0.7), hours: Math.floor(hoursFactor * 0.8), revenue: Math.floor(estimatedRevenue / 30 * 0.8) },
    { name: 'Sel', views: Math.floor(viewsFactor * 0.95), subs: Math.floor(subsFactor * 1.1), hours: Math.floor(hoursFactor * 0.9), revenue: Math.floor(estimatedRevenue / 30 * 0.9) },
    { name: 'Rab', views: Math.floor(viewsFactor * 1.2), subs: Math.floor(subsFactor * 1.4), hours: Math.floor(hoursFactor * 1.2), revenue: Math.floor(estimatedRevenue / 30 * 1.25) },
    { name: 'Kam', views: Math.floor(viewsFactor * 1.05), subs: Math.floor(subsFactor * 0.85), hours: Math.floor(hoursFactor * 1.1), revenue: Math.floor(estimatedRevenue / 30 * 1.0) },
    { name: 'Jum', views: Math.floor(viewsFactor * 1.15), subs: Math.floor(subsFactor * 1.2), hours: Math.floor(hoursFactor * 1.0), revenue: Math.floor(estimatedRevenue / 30 * 1.1) },
    { name: 'Sab', views: Math.floor(viewsFactor * 1.4), subs: Math.floor(subsFactor * 1.8), hours: Math.floor(hoursFactor * 1.5), revenue: Math.floor(estimatedRevenue / 30 * 1.5) },
    { name: 'Min', views: Math.floor(viewsFactor * 1.65), subs: Math.floor(subsFactor * 2.1), hours: Math.floor(hoursFactor * 1.8), revenue: Math.floor(estimatedRevenue / 30 * 1.7) },
  ];

  const formatCurrencyIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  const numberFormatter = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  // Demographics datasets
  const trafficSources = [
    { name: 'YouTube Search', value: 42 },
    { name: 'Suggested Videos', value: 28 },
    { name: 'External / Google', value: 15 },
    { name: 'Others', value: 15 },
  ];

  const devicesData = [
    { name: 'Smartphone', value: 72 },
    { name: 'Desktop/PC', value: 20 },
    { name: 'Tablets & TV', value: 8 },
  ];

  const countriesData = [
    { name: 'Indonesia', percentage: 76 },
    { name: 'Malaysia', percentage: 12 },
    { name: 'Singapura', percentage: 6 },
    { name: 'Lainnya', percentage: 6 },
  ];

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#64748b'];

  const cardClass = isDarkMode ? 'bg-[#121212] border-zinc-800' : 'bg-white border-[#EFEFEF]';
  const textTitleColor = isDarkMode ? 'text-zinc-500' : 'text-[#8a8a8a]';

  return (
    <div className="space-y-6">
      {/* Top Channel Selector Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-[#EFEFEF] dark:border-zinc-850 pb-6">
        <div>
          <h2 className={`font-serif text-3xl italic leading-tight ${isDarkMode ? 'text-zinc-100' : 'text-[#121212]'}`}>
            Channel Analytics
          </h2>
          <p className="text-xs text-slate-500 mt-2">Analisis traffic, audiens, dan performa video real-time Anda.</p>
        </div>

        <div>
          <select
            value={activeChannel.channelId}
            onChange={(e) => {
              const matched = channels.find(c => c.channelId === e.target.value);
              if (matched) onSelectChannel(matched);
            }}
            className={`p-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider focus:ring-1 focus:ring-[#FF0000]/30 focus:outline-hidden ${
              isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            {channels.map((chan) => (
              <option key={chan.channelId} value={chan.channelId}>
                {chan.channelName.toUpperCase()} ({numberFormatter(chan.subscriberCount)} SUBS)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Channel Metadata Banner */}
      <div className={`p-6 rounded-2xl border shadow-2xs ${cardClass}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={activeChannel.thumbnail}
              alt={activeChannel.channelName}
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-full border border-slate-200 dark:border-zinc-850 object-cover"
            />
            <div>
              <h3 className="text-base font-bold text-slate-905 dark:text-zinc-100 flex items-center gap-2">
                {activeChannel.channelName}
                <span className="bg-slate-100 text-slate-755 px-2 py-0.5 rounded text-[9px] uppercase font-bold dark:bg-zinc-800 dark:text-zinc-300">
                  {activeChannel.category}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 uppercase tracking-wider font-semibold font-sans">Negara: {activeChannel.country} • Synced 30m ago</p>
            </div>
          </div>

          {/* Quick Metrics Header Cluster */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-left border-t md:border-t-0 pt-4 md:pt-0">
            <div>
              <span className={`text-[10px] block uppercase font-bold tracking-wider ${textTitleColor}`}>Subscriber</span>
              <span className="text-xl font-serif italic text-slate-900 dark:text-zinc-100 leading-none mt-1.5 block">{numberFormatter(activeChannel.subscriberCount)}</span>
            </div>
            <div>
              <span className={`text-[10px] block uppercase font-bold tracking-wider ${textTitleColor}`}>Total Views</span>
              <span className="text-xl font-serif italic text-slate-900 dark:text-zinc-100 leading-none mt-1.5 block">{numberFormatter(activeChannel.viewCount)}</span>
            </div>
            <div>
              <span className={`text-[10px] block uppercase font-bold tracking-wider ${textTitleColor}`}>Video Upload</span>
              <span className="text-xl font-serif italic text-slate-900 dark:text-zinc-100 leading-none mt-1.5 block">{activeChannel.videoCount}</span>
            </div>
            <div>
              <span className={`text-[10px] block uppercase font-bold tracking-wider ${textTitleColor}`}>Estimasi Revenue</span>
              <span className="text-xl font-serif italic text-emerald-600 dark:text-emerald-400 leading-none mt-1.5 block">{formatCurrencyIDR(estimatedRevenue)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Charts Panel */}
      <div className={`p-6 rounded-2xl border shadow-2xs ${cardClass}`}>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h4 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-slate-800 dark:text-zinc-100">
            <TrendingUp className="w-4 h-4 text-[#FF0000]" />
            Grafik Pertumbuhan
          </h4>

          {/* Metric graph switcher links */}
          <div className="flex items-center gap-1 p-1 bg-slate-50 dark:bg-zinc-900/60 rounded-lg border border-slate-100/60 dark:border-zinc-850">
            <button
              onClick={() => setMetricTab('views')}
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-colors ${
                metricTab === 'views' 
                  ? 'bg-white shadow-2xs text-[#FF0000] dark:bg-zinc-800 dark:text-[#FF0000]' 
                  : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400'
              }`}
            >
              Views
            </button>
            <button
              onClick={() => setMetricTab('subscribers')}
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-colors ${
                metricTab === 'subscribers' 
                  ? 'bg-white shadow-2xs text-[#FF0000] dark:bg-zinc-800 dark:text-[#FF0000]' 
                  : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400'
              }`}
            >
              Subscribers
            </button>
            <button
              onClick={() => setMetricTab('watch_hours')}
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-colors ${
                metricTab === 'watch_hours' 
                  ? 'bg-white shadow-2xs text-[#FF0000] dark:bg-zinc-800 dark:text-[#FF0000]' 
                  : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400'
              }`}
            >
              Jam Tayang
            </button>
            <button
              onClick={() => setMetricTab('revenue')}
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-colors ${
                metricTab === 'revenue' 
                  ? 'bg-white shadow-2xs text-[#FF0000] dark:bg-zinc-800 dark:text-[#FF0000]' 
                  : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400'
              }`}
            >
              Pendapatan
            </button>
          </div>
        </div>

        {/* Dynamic Graph Render Area */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="metricGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#27272a' : '#f4f4f5'} />
              <XAxis dataKey="name" fontSize={11} stroke="#a1a1aa" tickLine={false} />
              <YAxis fontSize={11} stroke="#a1a1aa" tickFormatter={(v) => typeof v === 'number' ? numberFormatter(v) : v} tickLine={false} />
              <Tooltip 
                formatter={(value: any) => [
                  metricTab === 'revenue' ? formatCurrencyIDR(value) : numberFormatter(value), 
                  metricTab.toUpperCase()
                ]}
                contentStyle={{ background: isDarkMode ? '#18181b' : 'white', borderColor: isDarkMode ? '#3f3f46' : '#e4e4e7', borderRadius: '12px', fontSize: '12px' }}
              />
              <Area 
                type="monotone" 
                dataKey={metricTab === 'views' ? 'views' : metricTab === 'subscribers' ? 'subs' : metricTab === 'watch_hours' ? 'hours' : 'revenue'} 
                stroke="#dc2626" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#metricGrad)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Demographics segment and Traffic source indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Traffic Sources list */}
        <div className={`p-5 rounded-2xl border shadow-2xs ${cardClass}`}>
          <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-[#121212] dark:text-zinc-100 flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-[#FF0000]" /> Sumber Traffic Utama
          </h4>
          <div className="space-y-4">
            {trafficSources.map((source, index) => (
              <div key={source.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-zinc-300">{source.name}</span>
                  <span className="text-slate-400 font-mono text-[11px]">{source.value}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full" 
                    style={{ width: `${source.value}%`, backgroundColor: index === 0 ? '#FF0000' : index === 1 ? '#e2e8f0' : '#cbd5e1' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device distributions */}
        <div className={`p-5 rounded-2xl border shadow-2xs ${cardClass}`}>
          <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-[#121212] dark:text-zinc-100 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#FF0000]" /> Distribusi Perangkat
          </h4>
          <div className="space-y-4">
            {devicesData.map((device, index) => (
              <div key={device.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-zinc-300">{device.name}</span>
                  <span className="text-slate-400 font-mono text-[11px]">{device.value}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-slate-900 dark:bg-zinc-500" 
                    style={{ width: `${device.value}%`, backgroundColor: index === 0 ? '#121212' : '#94a3b8' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Countries demographics */}
        <div className={`p-5 rounded-2xl border shadow-2xs ${cardClass}`}>
          <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-[#121212] dark:text-zinc-100 flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-[#FF0000]" /> Geografi Terbanyak
          </h4>
          <div className="space-y-3.5">
            {countriesData.map((country) => (
              <div key={country.name} className="flex justify-between items-center text-xs pb-2.5 border-b border-slate-100 dark:border-zinc-850">
                <span className="font-bold text-slate-700 dark:text-zinc-300">{country.name}</span>
                <span className="font-serif italic font-semibold text-slate-800 dark:text-zinc-200">{country.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Videos List: Top Performing Videos */}
      <div className={`p-6 rounded-2xl border shadow-2xs ${cardClass}`}>
        <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-[#121212] dark:text-zinc-100 flex items-center gap-2">
          <Award className="w-4 h-4 text-[#FF0000]" /> Performa Video Terbaik
        </h4>

        {isLoadingVideos ? (
          <div className="space-y-3">
            <div className="h-10 bg-slate-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
            <div className="h-10 bg-slate-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#EFEFEF] dark:border-zinc-800 text-slate-450">
                  <th className="py-3 text-[10px] uppercase tracking-widest font-bold text-slate-400">Video Utama</th>
                  <th className="py-3 text-right text-[10px] uppercase tracking-widest font-bold text-slate-400">Views</th>
                  <th className="py-3 text-right text-[10px] uppercase tracking-widest font-bold text-slate-400">Durasi Tonton</th>
                  <th className="py-3 text-right text-[10px] uppercase tracking-widest font-bold text-slate-400">Sub Gained</th>
                  <th className="py-3 text-center text-[10px] uppercase tracking-widest font-bold text-slate-400">CTR</th>
                  <th className="py-3 text-center text-[10px] uppercase tracking-widest font-bold text-slate-400">Tipe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-zinc-800/60">
                {videos.map(vid => (
                  <tr key={vid.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-850/50">
                    <td className="py-3">
                      <div className="flex items-center gap-2.5 max-w-sm">
                        <img 
                          src={vid.thumbnail} 
                          alt={vid.title} 
                          referrerPolicy="no-referrer"
                          className="w-12 h-8 rounded-md object-cover border border-[#EFEFEF] dark:border-zinc-800" 
                        />
                        <span className="font-bold truncate block text-slate-900 dark:text-zinc-100" title={vid.title}>
                          {vid.title}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-right font-serif italic text-sm font-semibold text-slate-800 dark:text-zinc-200">
                      {numberFormatter(vid.views)}
                    </td>
                    <td className="py-3 text-right font-serif italic text-sm text-slate-750 dark:text-zinc-300">
                      {numberFormatter(vid.watchTime)} J
                    </td>
                    <td className="py-3 text-right text-emerald-650 dark:text-emerald-400 font-serif italic text-sm font-bold">
                      +{numberFormatter(vid.subscribersGained)}
                    </td>
                    <td className="py-3 text-center font-serif italic font-semibold text-slate-805 dark:text-zinc-200">
                      {vid.ctr}%
                    </td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider ${
                        vid.type === 'Short' 
                          ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/25 dark:text-purple-400 border border-purple-100/60 dark:border-purple-900/30' 
                          : 'bg-blue-50 text-blue-600 dark:bg-blue-950/25 dark:text-blue-400 border border-blue-100/60 dark:border-blue-900/30'
                      }`}>
                        {vid.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
