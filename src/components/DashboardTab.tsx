import React, { useState, useMemo } from 'react';
import { 
  Search, 
  RefreshCcw, 
  LogOut, 
  BarChart3, 
  Settings, 
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  HelpCircle,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  UserCheck2,
  X,
  Upload
} from 'lucide-react';
import { YoutubeChannel } from '../types';

interface DashboardTabProps {
  channels: YoutubeChannel[];
  onRefresh: (id: string) => Promise<void>;
  onRefreshAll: () => Promise<void>;
  onDisconnect: (id: string) => Promise<void>;
  onSelectChannelForAnalytics: (channel: YoutubeChannel) => void;
  onSimulateChannelAddition: (name: string, category: string, country: string, subCount: string) => Promise<void>;
  isDarkMode: boolean;
}

export default function DashboardTab({
  channels,
  onRefresh,
  onRefreshAll,
  onDisconnect,
  onSelectChannelForAnalytics,
  onSimulateChannelAddition,
  isDarkMode
}: DashboardTabProps) {
  // Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'subscriberCount' | 'viewCount' | 'watchHours' | 'channelName'>('subscriberCount');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Manual Creation dialog
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newChanName, setNewChanName] = useState('');
  const [newChanCat, setNewChanCat] = useState('Sains & Teknologi');
  const [newChanCtry, setNewChanCtry] = useState('ID');
  const [newChanSubs, setNewChanSubs] = useState('152000');
  const [isSubmittingSim, setIsSubmittingSim] = useState(false);

  // Quick Action State for Loading Indicators
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Reset pagination on search/sorting change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Toggle Sorting
  const requestSort = (key: 'subscriberCount' | 'viewCount' | 'watchHours' | 'channelName') => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortBy === key && sortOrder === 'desc') {
      direction = 'asc';
    }
    setSortBy(key);
    setSortOrder(direction);
  };

  // Processed search results & list
  const filteredSortedChannels = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    const result = channels.filter(c => 
      c.channelName.toLowerCase().includes(searchLower) ||
      c.category.toLowerCase().includes(searchLower) ||
      c.country.toLowerCase().includes(searchLower)
    );

    result.sort((a, b) => {
      let aVal: any = a[sortBy];
      let bVal: any = b[sortBy];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [channels, searchTerm, sortBy, sortOrder]);

  // Pagination logic
  const totalPages = Math.ceil(filteredSortedChannels.length / itemsPerPage) || 1;
  const paginatedChannels = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredSortedChannels.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSortedChannels, currentPage]);

  // Formatter utilities
  const numFormatter = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  const getTimeString = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' - ' + d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    } catch {
      return 'Belum Sync';
    }
  };

  const handleSimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChanName.trim()) return;

    setIsSubmittingSim(true);
    try {
      await onSimulateChannelAddition(newChanName, newChanCat, newChanCtry, newChanSubs);
      setIsModalOpen(false);
      // Clean form
      setNewChanName('');
      setNewChanSubs('152000');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingSim(false);
    }
  };

  const triggerRefreshAll = async () => {
    setLoadingAction('refresh-all');
    await onRefreshAll();
    setLoadingAction(null);
  };

  const triggerRefresh = async (id: string) => {
    setLoadingAction(`refresh-${id}`);
    await onRefresh(id);
    setLoadingAction(null);
  };

  return (
    <div className="space-y-6">
      {/* Upper header action cluster */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-[#EFEFEF] dark:border-zinc-850 pb-6">
        <div>
          <h2 className={`font-serif text-3xl italic leading-tight ${isDarkMode ? 'text-zinc-100' : 'text-[#121212]'}`}>
            Connected Channels
          </h2>
          <p className="text-xs text-slate-500 mt-2">Kelola credentials OAuth dan sinkronisasi data YouTube Studio Anda.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Synchronize All Channels */}
          <button
            onClick={triggerRefreshAll}
            disabled={loadingAction === 'refresh-all' || channels.length === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-xs font-bold uppercase tracking-wider cursor-pointer shadow-2xs transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none ${
              isDarkMode 
                ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800' 
                : 'bg-white border-[#EFEFEF] text-slate-700 hover:bg-slate-50'
            }`}
          >
            <RefreshCcw className={`w-3.5 h-3.5 ${loadingAction === 'refresh-all' ? 'animate-spin' : ''}`} />
            Refresh All
          </button>

          {/* Connect YouTube (Add Channel) */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#FF0000] text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md shadow-red-100/50 dark:shadow-none cursor-pointer transition-transform hover:bg-[#E60000] active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            + Add Channel
          </button>
        </div>
      </div>

      {/* Searching and Sorting Controllers */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center gap-4 ${isDarkMode ? 'bg-[#121212] border-zinc-805' : 'bg-white border-[#EFEFEF]'}`}>
        {/* Search input field */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Cari channel berdasarkan nama, kategori, negara..."
            className={`w-full pl-10 pr-4 py-2.5 rounded-full border text-xs focus:ring-1 focus:ring-[#FF0000]/30 focus:outline-hidden ${
              isDarkMode 
                ? 'bg-zinc-900 border-zinc-800 text-zinc-100 placeholder-zinc-500' 
                : 'bg-slate-50 border-slate-100/90 text-slate-800 placeholder-slate-400/80'
            }`}
          />
        </div>

        {/* Sorting selection buttons */}
        <div className="flex items-center gap-2 shrink-0 overflow-x-auto w-full md:w-auto">
          <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 flex items-center gap-1 font-sans">
            <SlidersHorizontal className="w-3 h-3" /> Urutkan:
          </span>
          <button
            onClick={() => requestSort('subscriberCount')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${
              sortBy === 'subscriberCount' 
                ? 'bg-slate-100 text-slate-900 border border-slate-200 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800' 
                : isDarkMode ? 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Subs {sortBy === 'subscriberCount' && (sortOrder === 'desc' ? '↓' : '↑')}
          </button>
          <button
            onClick={() => requestSort('viewCount')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${
              sortBy === 'viewCount' 
                ? 'bg-slate-100 text-slate-900 border border-slate-200 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800' 
                : isDarkMode ? 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Views {sortBy === 'viewCount' && (sortOrder === 'desc' ? '↓' : '↑')}
          </button>
          <button
            onClick={() => requestSort('watchHours')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${
              sortBy === 'watchHours' 
                ? 'bg-slate-100 text-slate-900 border border-slate-200 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800' 
                : isDarkMode ? 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Hours {sortBy === 'watchHours' && (sortOrder === 'desc' ? '↓' : '↑')}
          </button>
        </div>
      </div>

      {/* Main Channels Table */}
      <div className={`border rounded-2xl overflow-hidden shadow-2xs ${isDarkMode ? 'bg-[#121212] border-zinc-800' : 'bg-white border-[#EFEFEF]'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b text-xs ${isDarkMode ? 'bg-zinc-900/50 border-zinc-800 text-zinc-400' : 'bg-slate-50 border-[#EFEFEF] text-slate-400'}`}>
                <th className="py-4 px-4 w-12 text-center text-[10px] uppercase tracking-widest font-bold">No</th>
                <th className="py-4 px-4 text-[10px] uppercase tracking-widest font-bold">Nama Channel</th>
                <th className="py-4 px-4 text-right text-[10px] uppercase tracking-widest font-bold">Subscriber</th>
                <th className="py-4 px-4 text-center text-[10px] uppercase tracking-widest font-bold">Video</th>
                <th className="py-4 px-4 text-right text-[10px] uppercase tracking-widest font-bold">Jam Tayang</th>
                <th className="py-4 px-4 text-right text-[10px] uppercase tracking-widest font-bold">Views</th>
                <th className="py-4 px-4 text-center text-[10px] uppercase tracking-widest font-bold">Monetisasi</th>
                <th className="py-4 px-4 text-center text-[10px] uppercase tracking-widest font-bold">Koneksi</th>
                <th className="py-4 px-4 text-center text-[10px] uppercase tracking-widest font-bold">Sync Akhir</th>
                <th className="py-4 px-4 text-center text-[10px] uppercase tracking-widest font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-zinc-800/60 text-xs">
              {paginatedChannels.length > 0 ? (
                paginatedChannels.map((channel, idx) => {
                  const sequenceNum = (currentPage - 1) * itemsPerPage + idx + 1;
                  // In YouTube Partner eligibility check: > 1000 subscribers and > 4000 watch hours
                  const isMonetized = channel.subscriberCount >= 1000 && channel.watchHours >= 4000;

                  return (
                    <tr 
                      key={channel.channelId} 
                      className={`hover:bg-slate-50/50 transition-colors ${
                        isDarkMode ? 'hover:bg-zinc-800/40' : ''
                      }`}
                    >
                      {/* SEQUENCE ID */}
                      <td className="py-4 px-4 text-center text-slate-400 font-mono text-[11px]">
                        {sequenceNum < 10 ? `0${sequenceNum}` : sequenceNum}
                      </td>

                      {/* CHANNEL AVATAR + TITLE */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={channel.thumbnail}
                            alt={channel.channelName}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-full object-cover border border-[#EFEFEF] dark:border-zinc-800"
                          />
                          <div>
                            <span className="font-bold block text-sm tracking-tight text-slate-900 dark:text-zinc-100">
                              {channel.channelName}
                            </span>
                            <span className="text-[10px] text-slate-400 block uppercase font-semibold tracking-wider mt-0.5">
                              {channel.category} • {channel.country}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* SUBSCRIBERS */}
                      <td className="py-4 px-4 text-right font-serif italic text-sm font-semibold text-slate-800 dark:text-zinc-200">
                        {numFormatter(channel.subscriberCount)}
                      </td>

                      {/* VIDEO COUNT */}
                      <td className="py-4 px-4 text-center font-mono text-zinc-500">
                        {channel.videoCount}
                      </td>

                      {/* WATCH TIME (HOURS) */}
                      <td className="py-4 px-4 text-right font-serif italic text-sm text-slate-800 dark:text-zinc-200">
                        {numFormatter(channel.watchHours)} J
                      </td>

                      {/* TOTAL VIEWS */}
                      <td className="py-4 px-4 text-right font-serif italic text-sm font-semibold text-slate-800 dark:text-zinc-200">
                        {numFormatter(channel.viewCount)}
                      </td>

                      {/* MONETIZATION STATUS */}
                      <td className="py-4 px-4 text-center">
                        {isMonetized ? (
                          <span className="text-[9px] font-bold px-2 py-1 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 rounded uppercase tracking-wider">
                            Approved
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold px-2 py-1 bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 rounded uppercase tracking-wider">
                            Pending
                          </span>
                        )}
                      </td>

                      {/* CONNECTION STATE */}
                      <td className="py-4 px-4 text-center">
                        {channel.status === 'Connected' ? (
                          <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-emerald-500 uppercase">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Connected
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-red-500 uppercase">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Disconnected
                          </div>
                        )}
                      </td>

                      {/* LAST SYNC */}
                      <td className="py-4 px-4 text-center text-slate-400 font-mono text-[9px] uppercase">
                        {getTimeString(channel.lastSync)}
                      </td>

                      {/* ACTIONS ROW */}
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Sync details */}
                          <button
                            onClick={() => triggerRefresh(channel.channelId)}
                            title="Sinkronisasi manual"
                            className="p-1.5 rounded-full hover:bg-slate-100 text-[#8a8a8a] hover:text-[#121212] dark:hover:bg-zinc-800/50 dark:text-zinc-400"
                          >
                            <RefreshCcw className={`w-3.5 h-3.5 ${loadingAction === `refresh-${channel.channelId}` ? 'animate-spin' : ''}`} />
                          </button>

                          {/* Analytics Detail view */}
                          <button
                            onClick={() => onSelectChannelForAnalytics(channel)}
                            title="Buka Analytics"
                            className="p-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-800 dark:text-zinc-200"
                          >
                            <BarChart3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Disconnect Channel */}
                          <button
                            onClick={() => onDisconnect(channel.channelId)}
                            title="Disconnect Channel"
                            className="p-1.5 rounded-full hover:bg-red-50 text-red-500"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-slate-400 font-medium">
                    Tidak ada channel yang terhubung. Cari atau tambahkan channel YouTube Anda!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination Control footer */}
        {totalPages > 1 && (
          <div className={`p-4 border-t flex items-center justify-between text-xs ${isDarkMode ? 'border-[#2a2a2a] bg-zinc-900/10' : 'border-[#EFEFEF] bg-slate-50/50'}`}>
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
              Halaman {currentPage} dari {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded text-[10px] font-bold uppercase disabled:opacity-50"
              >
                Prev
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded text-[10px] font-bold uppercase disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Connection Drawer / Simulation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className={`w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
            isDarkMode ? 'bg-[#18181b] border border-zinc-800 text-zinc-100' : 'bg-white text-zinc-800'
          }`}>
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-red-100 text-red-600 p-2 rounded-lg dark:bg-red-950/40">
                  <Upload className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-neutral-900 dark:text-zinc-100 text-sm">Hubungkan Channel YouTube</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSimSubmit} className="p-6 space-y-4">
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-850 text-[11px] leading-relaxed text-zinc-500">
                <p className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Sandbox Integrasi</p>
                Anda sedang membuka antarmuka integrasi. Di Google Cloud, Google OAuth2.0 Client Credentials dapat dikelola via panel <span className="font-bold">Settings</span>. Anda dapat langsung menguji visual dengan membuat simulasi custom channel di bawah.
              </div>

              {/* Form Nama */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-400 block uppercase tracking-wider">Nama Channel YouTube</label>
                <input
                  type="text"
                  required
                  value={newChanName}
                  onChange={e => setNewChanName(e.target.value)}
                  placeholder="Contoh: Anjaz Gaming, Indocoding"
                  className={`w-full p-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-red-500/20 focus:outline-hidden ${
                    isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-zinc-50 border-zinc-200'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Kategori */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-400 block uppercase tracking-wider">Kategori</label>
                  <select
                    value={newChanCat}
                    onChange={e => setNewChanCat(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-red-500/20 focus:outline-hidden ${
                      isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-zinc-50 border-zinc-200'
                    }`}
                  >
                    <option value="Sains & Teknologi">Sains & Teknologi</option>
                    <option value="Pendidikan">Pendidikan</option>
                    <option value="Game">Game</option>
                    <option value="Hiburan">Hiburan</option>
                    <option value="Vlog">Vlog</option>
                  </select>
                </div>

                {/* Country code */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-400 block uppercase tracking-wider">Negara Asal</label>
                  <select
                    value={newChanCtry}
                    onChange={e => setNewChanCtry(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-red-500/20 focus:outline-hidden ${
                      isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-zinc-50 border-zinc-200'
                    }`}
                  >
                    <option value="ID">Indonesia (ID)</option>
                    <option value="US">United States (US)</option>
                    <option value="SG">Singapore (SG)</option>
                    <option value="JP">Japan (JP)</option>
                  </select>
                </div>
              </div>

              {/* Initial subs count simulation */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-400 block uppercase tracking-wider">Jumlah Subscriber</label>
                <input
                  type="number"
                  value={newChanSubs}
                  onChange={e => setNewChanSubs(e.target.value)}
                  placeholder="152000"
                  className={`w-full p-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-red-500/20 focus:outline-hidden ${
                    isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-zinc-50 border-zinc-200'
                  }`}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`flex-1 p-2.5 rounded-xl text-xs font-semibold border transition-colors ${
                    isDarkMode ? 'border-zinc-800 text-zinc-300 hover:bg-neutral-800' : 'border-zinc-200 text-neutral-600 hover:bg-zinc-50'
                  }`}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSim}
                  className="flex-1 p-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-600/10 disabled:opacity-50"
                >
                  {isSubmittingSim ? 'Menghubungkan...' : 'Hubungkan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
