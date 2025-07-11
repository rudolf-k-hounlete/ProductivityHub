// Types principaux de l'application
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: string;
  language: string;
  notifications: boolean;
  darkMode: boolean;
  compactView: boolean;
}

export interface Module {
  id: string;
  name: string;
  icon: string;
  color: string;
  enabled: boolean;
  order: number;
  settings: Record<string, any>;
}

export interface Theme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  tags: string[];
  projectId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  progress: number;
  tasks: Task[];
  createdAt: Date;
  deadline?: Date;
  status: 'active' | 'completed' | 'paused';
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  category?: string;
  favorite: boolean;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  allDay: boolean;
  category: string;
  color: string;
  location?: string;
  reminders: number[];
}

export interface PomodoroSession {
  id: string;
  duration: number;
  type: 'work' | 'break' | 'longBreak';
  startTime: Date;
  endTime?: Date;
  completed: boolean;
  taskId?: string;
}

export interface FinancialTransaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: Date;
  account?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  totalPages: number;
  currentPage: number;
  status: 'reading' | 'completed' | 'paused' | 'wishlist';
  startDate?: Date;
  endDate?: Date;
  notes: string;
  rating?: number;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  type: 'academic' | 'professional' | 'personal';
  targetDate: Date;
  progress: number;
  milestones: Milestone[];
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'paused';
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
  completedDate?: Date;
}

export interface JournalEntry {
  id: string;
  date: Date;
  mood: number;
  title?: string;
  content: string;
  tags: string[];
  weather?: string;
  gratitude: string[];
}

export interface Prayer {
  id: string;
  title: string;
  content: string;
  category: string;
  date: Date;
  answered: boolean;
  tags: string[];
}

export interface BibleReading {
  id: string;
  book: string;
  chapter: number;
  verses: string;
  date: Date;
  notes: string;
  plan?: string;
}

export interface AcademicCourse {
  id: string;
  name: string;
  code: string;
  credits: number;
  instructor: string;
  schedule: string;
  assignments: Assignment[];
  grades: Grade[];
  color: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  submitted: boolean;
  grade?: number;
  weight: number;
}

export interface Grade {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  weight: number;
  date: Date;
}