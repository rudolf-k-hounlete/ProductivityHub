import React from 'react';
import { useApp } from '../context/AppContext';
import Dashboard from './modules/Dashboard';
import Notes from './modules/Notes';
import Tasks from './modules/Tasks';
import Projects from './modules/Projects';
import Calendar from './modules/Calendar';
import Pomodoro from './modules/Pomodoro';
import Finance from './modules/Finance';
import Academic from './modules/Academic';
import Goals from './modules/Goals';
import Books from './modules/Books';
import Journal from './modules/Journal';
import Prayers from './modules/Prayers';
import Bible from './modules/Bible';
import Planning from './modules/Planning';
import Settings from './modules/Settings';

const ModuleRouter: React.FC = () => {
  const { state } = useApp();

  const renderModule = () => {
    switch (state.activeModule) {
      case 'dashboard':
        return <Dashboard />;
      case 'notes':
        return <Notes />;
      case 'tasks':
        return <Tasks />;
      case 'projects':
        return <Projects />;
      case 'calendar':
        return <Calendar />;
      case 'pomodoro':
        return <Pomodoro />;
      case 'finance':
        return <Finance />;
      case 'academic':
        return <Academic />;
      case 'goals':
        return <Goals />;
      case 'books':
        return <Books />;
      case 'journal':
        return <Journal />;
      case 'prayers':
        return <Prayers />;
      case 'bible':
        return <Bible />;
      case 'planning':
        return <Planning />;
      case 'settings':
        return <Settings />;
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Module Coming Soon
            </h2>
            <p className="text-gray-600">
              This module is currently under development and will be available soon.
            </p>
          </div>
        );
    }
  };

  return (
    <div
      className={`flex-1 ${
        state.sidebarCollapsed ? 'ml-16' : 'ml-64'
      } transition-all duration-300`}
    >
      <div className="p-6 min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
        {renderModule()}
      </div>
    </div>
  );
};

export default ModuleRouter;