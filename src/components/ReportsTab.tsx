import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  FileCode, 
  FileText, 
  Download, 
  Calendar, 
  Check, 
  Lightbulb,
  Youtube
} from 'lucide-react';
import { YoutubeChannel } from '../types';

interface ReportsTabProps {
  channels: YoutubeChannel[];
  isDarkMode: boolean;
}

export default function ReportsTab({ channels, isDarkMode }: ReportsTabProps) {
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'excel' | 'pdf' | 'json'>('csv');
  const [exportScope, setExportScope] = useState<'all' | string>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [successExport, setSuccessExport] = useState(false);

  // Download Trigger Handler
  const handleExport = () => {
    setIsExporting(true);
    setSuccessExport(false);

    setTimeout(() => {
      // Assemble export data
      const channelsToExport = exportScope === 'all' 
        ? channels 
        : channels.filter(c => c.channelId === exportScope);

      // We strip sensitive tokens out for export safety
      const exportSafeData = channelsToExport.map(c => ({
        channelId: c.channelId,
        channelName: c.channelName,
        subscriberCount: c.subscriberCount,
        viewCount: c.viewCount,
        videoCount: c.videoCount,
        watchHours: c.watchHours,
        shortsViews: c.shortsViews,
        monthlyViews: c.monthlyViews,
        growthSubscriber: c.growthSubscriber,
        growthViews: c.growthViews,
        country: c.country,
        category: c.category,
        lastSync: c.lastSync
      }));

      let contentStr = '';
      let mimeType = 'text/plain';
      let extension = 'txt';

      if (selectedFormat === 'json') {
        contentStr = JSON.stringify(exportSafeData, null, 2);
        mimeType = 'application/json';
        extension = 'json';
      } else if (selectedFormat === 'csv' || selectedFormat === 'excel') {
        // Generate CSV file formatted safely
        const headers = ['Channel Id', 'Nama Channel', 'Subscriber', 'Total Views', 'Watch Hours', 'Total Videos', 'Kategori', 'Negara', 'Terakhir Sync'];
        const csvRows = [headers.join(',')];

        exportSafeData.forEach(item => {
          const row = [
            `"${item.channelId}"`,
            `"${item.channelName.replace(/"/g, '""')}"`,
            item.subscriberCount,
            item.viewCount,
            item.watchHours,
            item.videoCount,
            `"${item.category}"`,
            `"${item.country}"`,
            `"${item.lastSync}"`
          ];
          csvRows.push(row.join(','));
        });

        contentStr = csvRows.join('\n');
        mimeType = 'text/csv';
        extension = selectedFormat === 'excel' ? 'xls' : 'csv';
      } else {
        // PDF Simulation schema format text
        contentStr = `=========================================\n`;
        contentStr += `YOUTUBE MULTI CHANNEL MANAGER REPORT\n`;
        contentStr += `=========================================\n`;
        contentStr += `Created: ${new Date().toLocaleString()}\n\n`;
        
        exportSafeData.forEach((item, index) => {
          contentStr += `${index + 1}. CHANNEL: ${item.channelName}\n`;
          contentStr += `   ID: ${item.channelId}\n`;
          contentStr += `   Subscriber: ${item.subscriberCount} (${item.growthSubscriber}% growth)\n`;
          contentStr += `   Views: ${item.viewCount} (${item.growthViews}% growth)\n`;
          contentStr += `   Watch Hours: ${item.watchHours} hours\n`;
          contentStr += `   Uploaded Videos: ${item.videoCount}\n`;
          contentStr += `   Category/Geom: ${item.category} / ${item.country}\n`;
          contentStr += `-----------------------------------------\n`;
        });
        
        mimeType = 'text/plain';
        extension = 'pdf';
      }

      // Create download blob
      const blob = new Blob([contentStr], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `YouTube_Studio_Report_${new Date().toISOString().split('T')[0]}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsExporting(false);
      setSuccessExport(true);
    }, 1200);
  };

  const formats = [
    { id: 'csv', label: 'CSV (Comma Separated)', icon: FileSpreadsheet, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 text-[11px]' },
    { id: 'excel', label: 'Excel Worksheet', icon: FileSpreadsheet, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/20 text-[11px]' },
    { id: 'pdf', label: 'PDF Document Printable', icon: FileText, color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/20 text-[11px]' },
    { id: 'json', label: 'JSON Core File', icon: FileCode, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/20 text-[11px]' },
  ] as const;

  const cardClass = isDarkMode ? 'bg-[#121212] border-zinc-800' : 'bg-white border-[#EFEFEF]';

  return (
    <div className="space-y-6">
      {/* Upper header section */}
      <div className="border-b border-[#EFEFEF] dark:border-zinc-850 pb-6">
        <h2 className={`font-serif text-3xl italic leading-tight ${isDarkMode ? 'text-zinc-100' : 'text-[#121212]'}`}>
          Export & Reports
        </h2>
        <p className="text-xs text-slate-500 mt-2">Ekstrak metrics YouTube Studio Anda ke berbagai format file untuk pelaporan atau presentasi.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Column */}
        <div className={`p-6 rounded-2xl border shadow-2xs space-y-6 lg:col-span-2 ${cardClass}`}>
          {/* Export Scope Select */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 block font-sans">Pilih Channel yang Diexport</label>
            <select
              value={exportScope}
              onChange={e => setExportScope(e.target.value)}
              className={`w-full p-3 rounded-xl border text-xs font-bold uppercase tracking-wider focus:outline-hidden focus:ring-1 focus:ring-[#FF0000]/30 ${
                isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-slate-50 border-slate-100 text-slate-650'
              }`}
            >
              <option value="all">Semua Channel YouTube ({channels.length})</option>
              {channels.map(c => (
                <option key={c.channelId} value={c.channelId}>
                  {c.channelName.toUpperCase()} ({c.subscriberCount.toLocaleString('id-ID')} SUBS)
                </option>
              ))}
            </select>
          </div>

          {/* Formats Grid choosing */}
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 block font-sans">Format Dokumen Output</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {formats.map((fmt) => {
                const Icon = fmt.icon;
                const isChosen = selectedFormat === fmt.id;
                return (
                  <button
                    key={fmt.id}
                    onClick={() => {
                      setSelectedFormat(fmt.id);
                      setSuccessExport(false);
                    }}
                    className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      isChosen 
                        ? 'border-[#FF0000] bg-slate-50/70 dark:bg-zinc-900/60' 
                        : isDarkMode ? 'border-zinc-800 hover:bg-zinc-850' : 'border-[#EFEFEF] hover:bg-slate-50/50'
                    }`}
                  >
                    <div className={`p-2 rounded ${fmt.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className={`text-xs font-bold ${isDarkMode ? 'text-zinc-200' : 'text-slate-800'}`}>{fmt.label}</p>
                      <p className="text-[10px] text-zinc-400 font-mono mt-0.5 font-bold uppercase">Format: .{fmt.id === 'excel' ? 'xls' : fmt.id}</p>
                    </div>
                    {isChosen && (
                      <div className="bg-[#FF0000] text-white p-1 rounded-full shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Download Action Gate */}
          <div className="pt-5 border-t border-slate-150/40 dark:border-zinc-800 flex items-center justify-between gap-4">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Rentang: Sejak Pertama Dihubungkan
            </div>

            <button
              onClick={handleExport}
              disabled={isExporting || channels.length === 0}
              className="flex items-center gap-2 bg-[#FF0000] hover:bg-[#E60000] text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full shadow-md active:scale-95 disabled:opacity-50 cursor-pointer transition-colors"
            >
              <Download className={`w-3.5 h-3.5 ${isExporting ? 'animate-bounce' : ''}`} />
              {isExporting ? 'Prosses Unduhan...' : 'Unduh Laporan'}
            </button>
          </div>

          {successExport && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-800/50 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" /> Berhasil mengekstrak dan mengunduh laporan channel YouTube Multi Tube Anda.
            </div>
          )}
        </div>

        {/* Tips Column */}
        <div className="space-y-6">
          <div className={`p-6 rounded-2xl border shadow-2xs ${cardClass}`}>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-[#121212] dark:text-zinc-100 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-[#FF0000]" /> Tips Ekstraksi Data
            </h4>
            <div className="space-y-3.5 text-xs text-slate-500 leading-relaxed font-sans font-medium">
              <p>
                <strong>Gunakan File CSV/Excel:</strong> Jika Anda ingin membuka statistik channel di Microsoft Excel, Google Sheets, atau Tableau.
              </p>
              <p>
                <strong>Format JSON:</strong> Paling cocok jika Anda ingin mengintegrasikan data channel ini ke database internal Anda atau meneruskan data ke bot Telegram otomatis Anda.
              </p>
              <p>
                <strong>Dokumen PDF:</strong> Rekomendasi terbaik jika Anda membutuhkan laporan cetak fisik yang siap diserahkan kepada Pemilik Brand atau Sponsor Content.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
