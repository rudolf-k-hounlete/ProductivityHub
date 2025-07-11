import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
} from "react";
import {
  User,
  Module,
  Theme,
  Task,
  Project,
  Note,
  Event,
  PomodoroSession,
  FinancialTransaction,
  Book,
  Goal,
  JournalEntry,
  Prayer,
  BibleReading,
  AcademicCourse,
} from "../types";
import { DatabaseService } from "../lib/supabase";
import { useAuth } from "../hooks/use-auth";

// --- INTERFACES ---

interface AppState {
  user: User | null;
  modules: Module[];
  currentTheme: Theme;
  availableThemes: Theme[];
  tasks: Task[];
  projects: Project[];
  notes: Note[];
  events: Event[];
  pomodoroSessions: PomodoroSession[];
  financialTransactions: FinancialTransaction[];
  books: Book[];
  goals: Goal[];
  journalEntries: JournalEntry[];
  prayers: Prayer[];
  bibleReadings: BibleReading[];
  academicCourses: AcademicCourse[];
  activeModule: string;
  sidebarCollapsed: boolean;
  notifications: any[];
}

type AppAction =
  | { type: "SET_USER"; payload: User }
  | { type: "SET_THEME"; payload: Theme }
  | { type: "SET_ACTIVE_MODULE"; payload: string }
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "ADD_TASK"; payload: Task }
  | { type: "UPDATE_TASK"; payload: Task }
  | { type: "DELETE_TASK"; payload: string }
  | { type: "ADD_PROJECT"; payload: Project }
  | { type: "UPDATE_PROJECT"; payload: Project }
  | { type: "DELETE_PROJECT"; payload: string }
  | { type: "ADD_NOTE"; payload: Note }
  | { type: "UPDATE_NOTE"; payload: Note }
  | { type: "DELETE_NOTE"; payload: string }
  | { type: "ADD_EVENT"; payload: Event }
  | { type: "UPDATE_EVENT"; payload: Event }
  | { type: "DELETE_EVENT"; payload: string }
  | { type: "ADD_FINANCIAL_TRANSACTION"; payload: FinancialTransaction }
  | { type: "UPDATE_FINANCIAL_TRANSACTION"; payload: FinancialTransaction }
  | { type: "DELETE_FINANCIAL_TRANSACTION"; payload: string }
  | { type: "ADD_BOOK"; payload: Book }
  | { type: "UPDATE_BOOK"; payload: Book }
  | { type: "DELETE_BOOK"; payload: string }
  | { type: "ADD_GOAL"; payload: Goal }
  | { type: "UPDATE_GOAL"; payload: Goal }
  | { type: "DELETE_GOAL"; payload: string }
  | { type: "ADD_JOURNAL_ENTRY"; payload: JournalEntry }
  | { type: "UPDATE_JOURNAL_ENTRY"; payload: JournalEntry }
  | { type: "DELETE_JOURNAL_ENTRY"; payload: string }
  | { type: "ADD_PRAYER"; payload: Prayer }
  | { type: "UPDATE_PRAYER"; payload: Prayer }
  | { type: "DELETE_PRAYER"; payload: string }
  | { type: "ADD_BIBLE_READING"; payload: BibleReading }
  | { type: "UPDATE_BIBLE_READING"; payload: BibleReading }
  | { type: "DELETE_BIBLE_READING"; payload: string }
  | { type: "ADD_ACADEMIC_COURSE"; payload: AcademicCourse }
  | { type: "UPDATE_ACADEMIC_COURSE"; payload: AcademicCourse }
  | { type: "DELETE_ACADEMIC_COURSE"; payload: string }
  | { type: "ADD_POMODORO_SESSION"; payload: PomodoroSession }
  | { type: "TOGGLE_MODULE"; payload: string }
  | { type: "LOAD_DATA"; payload: Partial<AppState> };

// --- DONNÉES PAR DÉFAUT ---

const defaultThemes: Theme[] = [
  {
    id: "modern-blue",
    name: "Modern Blue",
    primary: "#3B82F6",
    secondary: "#1E40AF",
    accent: "#F59E0B",
    background: "#F8FAFC",
    surface: "#FFFFFF",
    text: "#1F2937",
    textSecondary: "#6B7280",
    border: "#E5E7EB",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
  },
  {
    id: "elegant-purple",
    name: "Elegant Purple",
    primary: "#8B5CF6",
    secondary: "#7C3AED",
    accent: "#F59E0B",
    background: "#FAFAFA",
    surface: "#FFFFFF",
    text: "#1F2937",
    textSecondary: "#6B7280",
    border: "#E5E7EB",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#8B5CF6",
  },
  {
    id: "nature-green",
    name: "Nature Green",
    primary: "#10B981",
    secondary: "#059669",
    accent: "#F59E0B",
    background: "#F0FDF4",
    surface: "#FFFFFF",
    text: "#1F2937",
    textSecondary: "#6B7280",
    border: "#E5E7EB",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#06B6D4",
  },
  {
    id: "sunset-orange",
    name: "Sunset Orange",
    primary: "#F97316",
    secondary: "#EA580C",
    accent: "#3B82F6",
    background: "#FFF7ED",
    surface: "#FFFFFF",
    text: "#1F2937",
    textSecondary: "#6B7280",
    border: "#E5E7EB",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#06B6D4",
  },
  {
    id: "dark-mode",
    name: "Dark Mode",
    primary: "#3B82F6",
    secondary: "#1E40AF",
    accent: "#F59E0B",
    background: "#111827",
    surface: "#1F2937",
    text: "#F9FAFB",
    textSecondary: "#D1D5DB",
    border: "#374151",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
  },
];

const defaultModules: Module[] = [
  {
    id: "dashboard",
    name: "Dashboard",
    icon: "LayoutDashboard",
    color: "#3B82F6",
    enabled: true,
    order: 0,
    settings: {},
  },
  {
    id: "notes",
    name: "Notes",
    icon: "FileText",
    color: "#10B981",
    enabled: true,
    order: 1,
    settings: {},
  },
  {
    id: "tasks",
    name: "Tasks",
    icon: "CheckSquare",
    color: "#F59E0B",
    enabled: true,
    order: 2,
    settings: {},
  },
  {
    id: "projects",
    name: "Projects",
    icon: "Briefcase",
    color: "#8B5CF6",
    enabled: true,
    order: 3,
    settings: {},
  },
  {
    id: "calendar",
    name: "Calendar",
    icon: "Calendar",
    color: "#EF4444",
    enabled: true,
    order: 4,
    settings: {},
  },
  {
    id: "pomodoro",
    name: "Pomodoro",
    icon: "Clock",
    color: "#F97316",
    enabled: true,
    order: 5,
    settings: {},
  },
  {
    id: "finance",
    name: "Finance",
    icon: "DollarSign",
    color: "#10B981",
    enabled: true,
    order: 6,
    settings: {},
  },
  {
    id: "academic",
    name: "Academic",
    icon: "GraduationCap",
    color: "#3B82F6",
    enabled: true,
    order: 7,
    settings: {},
  },
  {
    id: "goals",
    name: "Goals",
    icon: "Target",
    color: "#8B5CF6",
    enabled: true,
    order: 8,
    settings: {},
  },
  {
    id: "books",
    name: "Books",
    icon: "Book",
    color: "#F59E0B",
    enabled: true,
    order: 9,
    settings: {},
  },
  {
    id: "journal",
    name: "Journal",
    icon: "BookOpen",
    color: "#EF4444",
    enabled: true,
    order: 10,
    settings: {},
  },
  {
    id: "prayers",
    name: "Prayers",
    icon: "Heart",
    color: "#8B5CF6",
    enabled: true,
    order: 11,
    settings: {},
  },
  {
    id: "bible",
    name: "Bible",
    icon: "Book",
    color: "#10B981",
    enabled: true,
    order: 12,
    settings: {},
  },
  {
    id: "planning",
    name: "Planning",
    icon: "Map",
    color: "#06B6D4",
    enabled: true,
    order: 13,
    settings: {},
  },
  {
    id: "settings",
    name: "Settings",
    icon: "Settings",
    color: "#6B7280",
    enabled: true,
    order: 14,
    settings: {},
  },
];

const initialState: AppState = {
  user: null,
  modules: defaultModules,
  currentTheme: defaultThemes[0],
  availableThemes: defaultThemes,
  tasks: [],
  projects: [],
  notes: [],
  events: [],
  pomodoroSessions: [],
  financialTransactions: [],
  books: [],
  goals: [],
  journalEntries: [],
  prayers: [],
  bibleReadings: [],
  academicCourses: [],
  activeModule: "dashboard",
  sidebarCollapsed: false,
  notifications: [],
};

// --- REDUCER ---

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    // --- GESTION DE L'UI ---
    case "SET_USER":
      return { ...state, user: action.payload };
    case "SET_THEME":
      // Pour une persistance complète, vous pourriez aussi sauvegarder l'ID du thème
      // dans les métadonnées de l'utilisateur sur Supabase.
      return { ...state, currentTheme: action.payload };
    case "SET_ACTIVE_MODULE":
      return { ...state, activeModule: action.payload };
    case "TOGGLE_SIDEBAR":
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };

    // --- GESTION DES DONNÉES ---

    case "LOAD_DATA":
      return { ...state, ...action.payload };

    // Tasks
    case "ADD_TASK":
      DatabaseService.createTask(action.payload);
      return { ...state, tasks: [...state.tasks, action.payload] };
    case "UPDATE_TASK":
      DatabaseService.updateTask(action.payload.id, action.payload);
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      };
    case "DELETE_TASK":
      DatabaseService.deleteTask(action.payload);
      return {
        ...state,
        tasks: state.tasks.filter((t) => t.id !== action.payload),
      };

    // Projects
    case "ADD_PROJECT":
      DatabaseService.createProject(action.payload);
      return { ...state, projects: [...state.projects, action.payload] };
    case "UPDATE_PROJECT":
      DatabaseService.updateProject(action.payload.id, action.payload);
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.payload.id ? action.payload : p
        ),
      };
    case "DELETE_PROJECT":
      DatabaseService.deleteProject(action.payload);
      return {
        ...state,
        projects: state.projects.filter((p) => p.id !== action.payload),
      };

    // Notes
    case "ADD_NOTE":
      DatabaseService.createNote(action.payload);
      return { ...state, notes: [...state.notes, action.payload] };
    case "UPDATE_NOTE":
      DatabaseService.updateNote(action.payload.id, action.payload);
      return {
        ...state,
        notes: state.notes.map((n) =>
          n.id === action.payload.id ? action.payload : n
        ),
      };
    case "DELETE_NOTE":
      DatabaseService.deleteNote(action.payload);
      return {
        ...state,
        notes: state.notes.filter((n) => n.id !== action.payload),
      };

    // Events
    case "ADD_EVENT":
      DatabaseService.createEvent(action.payload);
      return { ...state, events: [...state.events, action.payload] };
    case "UPDATE_EVENT":
      DatabaseService.updateEvent(action.payload.id, action.payload);
      return {
        ...state,
        events: state.events.map((e) =>
          e.id === action.payload.id ? action.payload : e
        ),
      };
    case "DELETE_EVENT":
      DatabaseService.deleteEvent(action.payload);
      return {
        ...state,
        events: state.events.filter((e) => e.id !== action.payload),
      };

    // Financial Transactions
    case "ADD_FINANCIAL_TRANSACTION":
      DatabaseService.createFinancialTransaction(action.payload);
      return {
        ...state,
        financialTransactions: [...state.financialTransactions, action.payload],
      };
    case "UPDATE_FINANCIAL_TRANSACTION":
      DatabaseService.updateFinancialTransaction(
        action.payload.id,
        action.payload
      );
      return {
        ...state,
        financialTransactions: state.financialTransactions.map((f) =>
          f.id === action.payload.id ? action.payload : f
        ),
      };
    case "DELETE_FINANCIAL_TRANSACTION":
      DatabaseService.deleteFinancialTransaction(action.payload);
      return {
        ...state,
        financialTransactions: state.financialTransactions.filter(
          (f) => f.id !== action.payload
        ),
      };

    // Books
    case "ADD_BOOK":
      DatabaseService.createBook(action.payload);
      return { ...state, books: [...state.books, action.payload] };
    case "UPDATE_BOOK":
      DatabaseService.updateBook(action.payload.id, action.payload);
      return {
        ...state,
        books: state.books.map((b) =>
          b.id === action.payload.id ? action.payload : b
        ),
      };
    case "DELETE_BOOK":
      DatabaseService.deleteBook(action.payload);
      return {
        ...state,
        books: state.books.filter((b) => b.id !== action.payload),
      };

    // Goals
    case "ADD_GOAL":
      DatabaseService.createGoal(action.payload);
      return { ...state, goals: [...state.goals, action.payload] };
    case "UPDATE_GOAL":
      DatabaseService.updateGoal(action.payload.id, action.payload);
      return {
        ...state,
        goals: state.goals.map((g) =>
          g.id === action.payload.id ? action.payload : g
        ),
      };
    case "DELETE_GOAL":
      DatabaseService.deleteGoal(action.payload);
      return {
        ...state,
        goals: state.goals.filter((g) => g.id !== action.payload),
      };

    // Journal Entries
    case "ADD_JOURNAL_ENTRY":
      DatabaseService.createJournalEntry(action.payload);
      return {
        ...state,
        journalEntries: [...state.journalEntries, action.payload],
      };
    case "UPDATE_JOURNAL_ENTRY":
      DatabaseService.updateJournalEntry(action.payload.id, action.payload);
      return {
        ...state,
        journalEntries: state.journalEntries.map((j) =>
          j.id === action.payload.id ? action.payload : j
        ),
      };
    case "DELETE_JOURNAL_ENTRY":
      DatabaseService.deleteJournalEntry(action.payload);
      return {
        ...state,
        journalEntries: state.journalEntries.filter(
          (j) => j.id !== action.payload
        ),
      };

    // Prayers
    case "ADD_PRAYER":
      DatabaseService.createPrayer(action.payload);
      return { ...state, prayers: [...state.prayers, action.payload] };
    case "UPDATE_PRAYER":
      DatabaseService.updatePrayer(action.payload.id, action.payload);
      return {
        ...state,
        prayers: state.prayers.map((p) =>
          p.id === action.payload.id ? action.payload : p
        ),
      };
    case "DELETE_PRAYER":
      DatabaseService.deletePrayer(action.payload);
      return {
        ...state,
        prayers: state.prayers.filter((p) => p.id !== action.payload),
      };

    // Bible Readings
    case "ADD_BIBLE_READING":
      DatabaseService.createBibleReading(action.payload);
      return {
        ...state,
        bibleReadings: [...state.bibleReadings, action.payload],
      };
    case "UPDATE_BIBLE_READING":
      DatabaseService.updateBibleReading(action.payload.id, action.payload);
      return {
        ...state,
        bibleReadings: state.bibleReadings.map((b) =>
          b.id === action.payload.id ? action.payload : b
        ),
      };
    case "DELETE_BIBLE_READING":
      DatabaseService.deleteBibleReading(action.payload);
      return {
        ...state,
        bibleReadings: state.bibleReadings.filter(
          (b) => b.id !== action.payload
        ),
      };

    // Academic Courses
    case "ADD_ACADEMIC_COURSE":
      DatabaseService.createAcademicCourse(action.payload);
      return {
        ...state,
        academicCourses: [...state.academicCourses, action.payload],
      };
    case "UPDATE_ACADEMIC_COURSE":
      DatabaseService.updateAcademicCourse(action.payload.id, action.payload);
      return {
        ...state,
        academicCourses: state.academicCourses.map((a) =>
          a.id === action.payload.id ? action.payload : a
        ),
      };
    case "DELETE_ACADEMIC_COURSE":
      DatabaseService.deleteAcademicCourse(action.payload);
      return {
        ...state,
        academicCourses: state.academicCourses.filter(
          (a) => a.id !== action.payload
        ),
      };

    // Pomodoro (généralement local, pas besoin de persistance DB pour chaque session)
    case "ADD_POMODORO_SESSION":
      return {
        ...state,
        pomodoroSessions: [...state.pomodoroSessions, action.payload],
      };

    case "TOGGLE_MODULE":
      return {
        ...state,
        modules: state.modules.map((module) =>
          module.id === action.payload
            ? { ...module, enabled: !module.enabled }
            : module
        ),
      };

    default:
      return state;
  }
}

// --- CONTEXTE ET FOURNISSEUR ---

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { user } = useAuth();

  useEffect(() => {
    // Ne charger les données que si un utilisateur est connecté
    if (user) {
      const loadAllData = async () => {
        try {
          console.log("Chargement des données pour l'utilisateur:", user.id);
          const [
            tasks,
            projects,
            notes,
            events,
            financialTransactions,
            books,
            goals,
            journalEntries,
            prayers,
            bibleReadings,
            academicCourses,
          ] = await Promise.all([
            DatabaseService.getTasks(),
            DatabaseService.getProjects(),
            DatabaseService.getNotes(),
            DatabaseService.getEvents(),
            DatabaseService.getFinancialTransactions(),
            DatabaseService.getBooks(),
            DatabaseService.getGoals(),
            DatabaseService.getJournalEntries(),
            DatabaseService.getPrayers(),
            DatabaseService.getBibleReadings(),
            DatabaseService.getAcademicCourses(),
          ]);

          dispatch({
            type: "LOAD_DATA",
            payload: {
              tasks,
              projects,
              notes,
              events,
              financialTransactions,
              books,
              goals,
              journalEntries,
              prayers,
              bibleReadings,
              academicCourses,
            },
          });
        } catch (error) {
          console.error(
            "Erreur lors du chargement des données depuis Supabase:",
            error
          );
        }
      };
      loadAllData();
    } else {
      // Si l'utilisateur se déconnecte, vider les données de l'état
      dispatch({
        type: "LOAD_DATA",
        payload: {
          tasks: [],
          projects: [],
          notes: [],
          events: [],
          financialTransactions: [],
          books: [],
          goals: [],
          journalEntries: [],
          prayers: [],
          bibleReadings: [],
          academicCourses: [],
        },
      });
    }
  }, [user]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
