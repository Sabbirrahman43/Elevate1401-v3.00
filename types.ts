export type Theme = 'light' | 'dark' | 'cyber' | 'reading' | 'ramadan';

export interface User {
  username: string;
  isLoggedIn: boolean;
  preferences: {
    theme: Theme;
    voiceEnabled: boolean;
    voiceGender: 'male' | 'female';
    aiPersona: string; // Custom instructions for AI behavior
    focusDuration: number; // Minutes
  };
}

export interface Task {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  unit?: string; // e.g., "glasses", "pages"
  startTime: number;
  deadline?: string; // Optional HH:mm string
  completedTime?: number;
  isCompleted: boolean;
  createdAt: number;
}

export interface DailyHistory {
  date: string; // YYYY-MM-DD
  tasks: Task[];
  completionRate: number; // 0-100
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  TASKS = 'TASKS',
  HISTORY = 'HISTORY',
  FOCUS = 'FOCUS',
  SETTINGS = 'SETTINGS', // New view for customization
}