import React from "react";
import { useApp } from "../context/AppContext";
import * as Icons from "lucide-react";

const Sidebar: React.FC = () => {
  const { state, dispatch } = useApp();

  const handleModuleClick = (moduleId: string) => {
    dispatch({ type: "SET_ACTIVE_MODULE", payload: moduleId });
  };

  const toggleSidebar = () => {
    dispatch({ type: "TOGGLE_SIDEBAR" });
  };

  const enabledModules = state.modules
    .filter((module) => module.enabled)
    .sort((a, b) => a.order - b.order);

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-white/80 backdrop-blur-xl border-r border-gray-200/50 shadow-2xl transition-all duration-300 z-50 flex flex-col ${
        state.sidebarCollapsed ? "w-16" : "w-64"
      }`}
      style={{ backgroundColor: "var(--color-surface)" }}
    >
      {/* En-tête de la sidebar (reste fixe en haut) */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200/50 flex-shrink-0">
        {!state.sidebarCollapsed && (
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ProductivityHub
          </h1>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100/50 transition-colors"
        >
          {React.createElement(Icons.Menu, { size: 20 })}
        </button>
      </div>

      {/* Zone de navigation (devient scrollable) */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {enabledModules.map((module) => {
          const IconComponent = (Icons as any)[module.icon] || Icons.Circle;
          const isActive = state.activeModule === module.id;

          return (
            <button
              key={module.id}
              onClick={() => handleModuleClick(module.id)}
              title={state.sidebarCollapsed ? module.name : ""}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:scale-[1.02] ${
                isActive
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25"
                  : "hover:bg-gray-100/50 text-gray-700"
              } ${state.sidebarCollapsed ? "justify-center" : ""}`}
            >
              <IconComponent
                size={20}
                style={{ color: isActive ? "white" : module.color }}
              />
              {!state.sidebarCollapsed && (
                <span className="font-medium">{module.name}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Section utilisateur (reste fixe en bas) */}
      <div className="p-4 border-t border-gray-200/50 flex-shrink-0">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-100/50">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">U</span>
          </div>
          {!state.sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">User</p>
              <p className="text-xs text-gray-500 truncate">user@example.com</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
