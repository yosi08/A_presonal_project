export interface Session {
  id: number;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  subject: string;
  color: string;
}

export interface Note {
  id: number;
  title: string;
  subject: string;
  date: string;
  color: string;
  cues: string;
  notes: string;
  summary: string;
  content?: string;
}

export interface NotificationSettings {
  emailReminders: boolean;
  studyReminders: boolean;
  weeklyReport: boolean;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  notifications: NotificationSettings;
}

export interface TimerPreset {
  id: string;
  name: string;
  studyMinutes: number;
  breakMinutes: number;
  totalCycles: number;
}

export interface UserInfo {
  name: string;
  email: string;
  image?: string;
  id: string;
}

export const COLOR_MAP: Record<string, string> = {
  'bg-blue-600': '#2563EB',
  'bg-red-600': '#DC2626',
  'bg-green-600': '#16A34A',
  'bg-purple-600': '#9333EA',
  'bg-orange-600': '#EA580C',
  'bg-pink-600': '#DB2777',
};

export const SUBJECTS = [
  { name: 'Mathematics', color: 'rgb(99, 102, 241)' },
  { name: 'Physics', color: 'rgb(244, 63, 94)' },
  { name: 'Chemistry', color: 'rgb(34, 197, 94)' },
  { name: 'Biology', color: 'rgb(168, 85, 247)' },
  { name: 'Computer Science', color: 'rgb(59, 130, 246)' },
  { name: 'Other', color: 'rgb(100, 116, 139)' },
];

export const SESSION_COLORS = [
  { name: 'Blue', value: '#2563EB' },
  { name: 'Red', value: '#DC2626' },
  { name: 'Green', value: '#16A34A' },
  { name: 'Purple', value: '#9333EA' },
  { name: 'Orange', value: '#EA580C' },
  { name: 'Pink', value: '#DB2777' },
];

export function getSessionColor(color: string): string {
  return COLOR_MAP[color] || color;
}
