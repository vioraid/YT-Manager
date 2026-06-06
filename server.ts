import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Load environmental variables safely
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory/Simulated Database Cache as robust secondary backup if Firebase connectivity is in pipeline
interface SyncLog {
  id: string;
  timestamp: string;
  action: string;
  channelId?: string;
  channelName?: string;
  details: string;
  status: 'success' | 'error' | 'info';
}

let syncLogs: SyncLog[] = [];
let localChannels: any[] = [];

// Seed Initial Mock/Interactive Demo Channels so user can play instantly before Google Verification
const INITIAL_DEMO_CHANNELS = [
  {
    channelId: 'UC_x55SM_n8ky-vFMz8064JA',
    googleAccountId: 'user123_google',
    channelName: 'Anjaz Coding Academy',
    subscriberCount: 224300,
    viewCount: 14250000,
    videoCount: 148,
    watchHours: 541000,
    shortsViews: 2310000,
    monthlyViews: 412000,
    growthSubscriber: 12.4,
    growthViews: 18.2,
    createdAtDate: '2021-04-12',
    country: 'ID',
    category: 'Sains & Teknologi',
    lastSync: new Date().toISOString(),
    status: 'Connected',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    channelId: 'UC_yt_sim_channel_two',
    googleAccountId: 'user123_google',
    channelName: 'Daily Tech Vlogs',
    subscriberCount: 48900,
    viewCount: 2980000,
    videoCount: 89,
    watchHours: 112000,
    shortsViews: 850000,
    monthlyViews: 124000,
    growthSubscriber: 4.8,
    growthViews: -2.1,
    createdAtDate: '2023-01-15',
    country: 'ID',
    category: 'Entertainment',
    lastSync: new Date().toISOString(),
    status: 'Connected',
    thumbnail: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=150&q=80',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

localChannels = [...INITIAL_DEMO_CHANNELS];

// Seed initial logs
syncLogs.push({
  id: 'log_init',
  timestamp: new Date().toISOString(),
  action: 'Initialize App',
  details: 'YouTube Multi Channel Manager backend loaded successfully.',
  status: 'info'
});

// Helper to log activities
const logActivity = (action: string, channelName: string | undefined, channelId: string | undefined, details: string, status: 'success' | 'error' | 'info') => {
  const log: SyncLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    action,
    channelName,
    channelId,
    details,
    status
  };
  syncLogs.unshift(log);
  if (syncLogs.length > 100) syncLogs.pop(); // Cap at 100
};

// --- YouTube API and OAuth Endpoints ---

// Get active configuration (simulating or reading env)
app.get('/api/settings/config', (req, res) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    youtubeApiKey: process.env.YOUTUBE_API_KEY || '',
    autoSyncInterval: 30,
    exportFormat: 'json',
    appUrl: process.env.APP_URL || 'http://localhost:3000'
  });
});

// Endpoint to construct and fetch OAuth authorization URL
app.get('/api/auth/url', (req, res) => {
  const { clientId, redirectUri, isSimulated } = req.query;

  // If Simulated or no configuration is in place, we can return a flag that client-side handles
  if (isSimulated === 'true' || (!process.env.GOOGLE_CLIENT_ID && !clientId)) {
    return res.json({
      url: 'SIMULATED',
      message: 'Using simulation auth popup'
    });
  }

  const oauthClientId = (clientId as string) || process.env.GOOGLE_CLIENT_ID;
  const finalRedirectUri = (redirectUri as string) || `${process.env.APP_URL || 'http://localhost:3000'}/auth/callback`;

  // We request Google YouTube scope
  const scopes = [
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/yt-analytics.readonly',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ];

  const params = new URLSearchParams({
    client_id: oauthClientId!,
    redirect_uri: finalRedirectUri,
    response_type: 'code',
    scope: scopes.join(' '),
    access_type: 'offline',
    prompt: 'consent'
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  res.json({ url: authUrl });
});

// OAuth Callback Route
app.get(['/auth/callback', '/auth/callback/'], async (req, res) => {
  const { code, state, error } = req.query;

  if (error) {
    logActivity('OAuth Error', undefined, undefined, `Google Auth redirected with error: ${error}`, 'error');
    return res.send(`
      <html>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #FFF5F5; color: #C53030; text-align: center;">
          <div>
            <h2>Koneksi Gagal</h2>
            <p>${error}</p>
            <button onclick="window.close()" style="margin-top: 15px; padding: 8px 16px; background: #E53E3E; color: white; border: none; border-radius: 4px; cursor: pointer;">Tutup Jendela</button>
          </div>
        </body>
      </html>
    `);
  }

  // Token exchange fallback simulation or real API execution
  try {
    // Return HTML that posts success message
    res.send(`
      <html>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #F0FFF4; color: #22543D; text-align: center;">
          <div>
            <div style="font-size: 40px; margin-bottom: 10px;">🟢</div>
            <h2>Otorisasi Berhasil!</h2>
            <p>Channel YouTube Anda sedang disinkronisasi...</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({ 
                  type: 'OAUTH_AUTH_SUCCESS',
                  code: '${code || ''}'
                }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
          </div>
        </body>
      </html>
    `);
  } catch (err: any) {
    res.status(500).send(`Server error during authenticating: ${err.message}`);
  }
});

// REST API Endpoints for Data Processing

// List local cached channels
app.get('/api/channels', (req, res) => {
  res.json({ channels: localChannels });
});

// Add Simulated Channel
app.post('/api/channels/simulate', (req, res) => {
  const { name, category, country, subCount } = req.body;
  const finalName = name || `Simulated Channel ${Math.floor(Math.random() * 100)}`;
  const channelId = `UC_sim_${Date.now()}`;
  const subscribers = subCount ? parseInt(subCount) : Math.floor(Math.random() * 800000) + 1500;
  const views = subscribers * (Math.floor(Math.random() * 50) + 10);
  const vCount = Math.floor(Math.random() * 300) + 30;

  const newChannel = {
    channelId,
    googleAccountId: 'simulated_account',
    channelName: finalName,
    subscriberCount: subscribers,
    viewCount: views,
    videoCount: vCount,
    watchHours: Math.floor(views / 30),
    shortsViews: Math.floor(views * 0.4),
    monthlyViews: Math.floor(views / 12),
    growthSubscriber: parseFloat((Math.random() * 25 - 5).toFixed(1)),
    growthViews: parseFloat((Math.random() * 30 - 10).toFixed(1)),
    createdAtDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * (Math.random() * 1500 + 365)).toISOString().split('T')[0],
    country: country || 'ID',
    category: category || 'Sains & Teknologi',
    lastSync: new Date().toISOString(),
    status: 'Connected',
    thumbnail: `https://images.unsplash.com/photo-${1600000000000 + Math.floor(Math.random()*2000000)}?auto=format&fit=crop&w=150&q=80`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  localChannels.unshift(newChannel);
  logActivity('Hubungkan Channel Baru', newChannel.channelName, newChannel.channelId, `Berhasil menghubungkan channel ${newChannel.channelName} via Google Google Service.`, 'success');
  res.json({ success: true, channel: newChannel });
});

// Connect / Save Channel details manually/API
app.post('/api/channels', (req, res) => {
  const { channel } = req.body;
  if (!channel || !channel.channelId) {
    return res.status(400).json({ error: 'Data channel tidak valid' });
  }
  
  // Exclude duplicate
  localChannels = localChannels.filter(c => c.channelId !== channel.channelId);
  localChannels.unshift(channel);

  logActivity('Hubungkan Channel Baru', channel.channelName, channel.channelId, `Menghubungkan channel baru: ${channel.channelName}`, 'success');
  res.json({ success: true, channel });
});

// Manual Sync/Refresh a channel
app.post('/api/channels/:id/refresh', (req, res) => {
  const { id } = req.params;
  const channel = localChannels.find(c => c.channelId === id);

  if (!channel) {
    return res.status(404).json({ error: 'Channel tidak ditemukan' });
  }

  // Simulate updated numbers (slight positive growth)
  const subIncrement = Math.floor(Math.random() * 50) + 5;
  const viewIncrement = Math.floor(subIncrement * 15) + 20;

  channel.subscriberCount += subIncrement;
  channel.viewCount += viewIncrement;
  channel.watchHours += Math.floor(viewIncrement / 28);
  channel.lastSync = new Date().toISOString();
  channel.updatedAt = new Date().toISOString();

  logActivity('Sinkronisasi Channel', channel.channelName, channel.channelId, `Sinkronisasi selesai. +${subIncrement} subscriber baru didapatkan.`, 'success');
  res.json({ success: true, channel });
});

// Disconnect/Remove a Channel
app.post('/api/channels/:id/disconnect', (req, res) => {
  const { id } = req.params;
  const channel = localChannels.find(c => c.channelId === id);

  if (channel) {
    logActivity('Desingkronisasi Channel', channel.channelName, channel.channelId, `Memutuskan koneksi dari channel ${channel.channelName}.`, 'info');
    localChannels = localChannels.filter(c => c.channelId !== id);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Channel tidak ditemukan' });
  }
});

// Refresh All channels
app.post('/api/channels/refresh-all', (req, res) => {
  localChannels.forEach(channel => {
    const subIncrement = Math.floor(Math.random() * 120) + 12;
    const viewIncrement = Math.floor(subIncrement * 22) + 33;
    
    channel.subscriberCount += subIncrement;
    channel.viewCount += viewIncrement;
    channel.watchHours += Math.floor(viewIncrement / 28);
    channel.lastSync = new Date().toISOString();
    channel.updatedAt = new Date().toISOString();
  });

  logActivity('Sinkronisasi Semua', 'Semua Channel', undefined, `Berhasil memperbarui metrics untuk semua (${localChannels.length}) channel yang terkoneksi.`, 'success');
  res.json({ success: true, channels: localChannels });
});

// List logs
app.get('/api/activity-logs', (req, res) => {
  res.json({ logs: syncLogs });
});

// Pure Mock video catalog generators specifically for detail analytics queries
app.get('/api/channels/:id/videos', (req, res) => {
  const { id } = req.params;
  // Dynamic metrics depending on the mock channel views
  const channel = localChannels.find(c => c.channelId === id) || localChannels[0];
  const maxViews = channel ? channel.viewCount : 3000000;

  const mockVideos = [
    {
      id: 'vid1',
      title: 'Tutorial Lengkap Full Stack Developer Modern',
      views: Math.floor(maxViews * 0.15),
      watchTime: Math.floor(maxViews * 0.15 * 6),
      subscribersGained: Math.floor(maxViews * 0.003),
      ctr: 8.4,
      publishedAt: '2026-05-20',
      type: 'Video',
      thumbnail: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=300&q=80'
    },
    {
      id: 'vid2',
      title: 'Setup Workspace idaman Programmer Indonesia 🇮🇩',
      views: Math.floor(maxViews * 0.11),
      watchTime: Math.floor(maxViews * 0.11 * 4),
      subscribersGained: Math.floor(maxViews * 0.002),
      ctr: 9.1,
      publishedAt: '2026-05-15',
      type: 'Video',
      thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=300&q=80'
    },
    {
      id: 'vid3',
      title: 'Cara Cepat Belajar Framework CSS React dalam 15 Menit',
      views: Math.floor(maxViews * 0.08),
      watchTime: Math.floor(maxViews * 0.08 * 14.5),
      subscribersGained: Math.floor(maxViews * 0.0015),
      ctr: 7.2,
      publishedAt: '2026-05-10',
      type: 'Video',
      thumbnail: 'https://images.unsplash.com/photo-1510519138101-570d1dca3d66?auto=format&fit=crop&w=300&q=80'
    },
    {
      id: 'vid4',
      title: 'Coding ASMR: Ngoding Tailwind CSS tanpa ngomong',
      views: Math.floor(maxViews * 0.05),
      watchTime: Math.floor(maxViews * 0.05 * 28),
      subscribersGained: Math.floor(maxViews * 0.0008),
      ctr: 6.8,
      publishedAt: '2026-05-01',
      type: 'Video',
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=300&q=80'
    },
    {
      id: 'vid_short1',
      title: 'Kehidupan Web Developer di Jakarta 🏢 #shorts',
      views: Math.floor(maxViews * 0.25),
      watchTime: Math.floor(maxViews * 0.25 * 0.4),
      subscribersGained: Math.floor(maxViews * 0.004),
      ctr: 12.5,
      publishedAt: '2026-05-25',
      type: 'Short',
      thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=300&q=80'
    }
  ];

  res.json({ videos: mockVideos });
});

// Mount Vite in Dec Mode, or statically serve build in Prod
const startServer = async () => {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server YouTube Multi Channel Manager running on http://localhost:${PORT}`);
  });
};

startServer();
