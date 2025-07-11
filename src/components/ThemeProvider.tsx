import React, { createContext, useContext, ReactNode } from 'react';
import { useApp } from '../context/AppContext';

interface ThemeContextType {
  theme: any;
  setTheme: (theme: any) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { state, dispatch } = useApp();

  const setTheme = (theme: any) => {
    dispatch({ type: 'SET_THEME', payload: theme });
  };

  // Apply theme to CSS custom properties
  React.useEffect(() => {
    const root = document.documentElement;
    const theme = state.currentTheme;
    
    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-secondary', theme.secondary);
    root.style.setProperty('--color-accent', theme.accent);
    root.style.setProperty('--color-background', theme.background);
    root.style.setProperty('--color-surface', theme.surface);
    root.style.setProperty('--color-text', theme.text);
    root.style.setProperty('--color-text-secondary', theme.textSecondary);
    root.style.setProperty('--color-border', theme.border);
    root.style.setProperty('--color-success', theme.success);
    root.style.setProperty('--color-warning', theme.warning);
    root.style.setProperty('--color-error', theme.error);
    root.style.setProperty('--color-info', theme.info);
  }, [state.currentTheme]);

  return (
    <ThemeContext.Provider value={{ theme: state.currentTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};