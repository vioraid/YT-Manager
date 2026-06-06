export interface ProjectMetadata {
  name: string;
  description: string;
}

export type TabType = 'dashboard' | 'channels' | 'analytics' | 'reports' | 'settings' | 'activity_log' | 'api_settings';

export interface YoutubeChannel {
  channelId: string;
  googleAccountId: string;
  accessToken?: string;
  refreshToken?: string;
  channelName: string;
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  watchHours: number;
  shortsViews: number;
  monthlyViews: number;
  growthSubscriber: number;  // percentage change
  growthViews: number;       // percentage change
  createdAtDate: string;     // ISO or YYYY-MM-DD
  country: string;
  category: string;
  lastSync: string;          // ISO Date-time
  status: 'Connected' | 'Disconnected';
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
}

export interface VideoMetadata {
  id: string;
  title: string;
  views: number;
  watchTime: number;
  subscribersGained: number;
  ctr: number; // Click-through rate in %
  publishedAt: string;
  type: 'Video' | 'Short';
  thumbnail: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  channelId?: string;
  channelName?: string;
  details: string;
  status: 'success' | 'error' | 'info';
  timestamp: string;
}

export interface ApiSettings {
  googleClientId: string;
  googleClientSecret: string;
  youtubeApiKey: string;
  autoSyncInterval: number; // in minutes
  exportFormat: 'csv' | 'excel' | 'pdf' | 'json';
}
