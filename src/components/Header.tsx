import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { useTheme } from "./ThemeProvider";
import * as Icons from "lucide-react";
import Search from "./Search";
import { useAuth } from "../hooks/use-auth";

const Header: React.FC = () => {
  const { state, dispatch } = useApp();
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const activeModule = state.modules.find((m) => m.id === state.activeModule);

  const handleThemeChange = (newTheme: any) => {
    setTheme(newTheme);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 ${
          state.sidebarCollapsed ? "ml-16" : "ml-64"
        } transition-all duration-300 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm`}
        style={{ backgroundColor: "var(--color-surface)" }}
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            {activeModule && (
              <>
                {React.createElement(
                  (Icons as any)[activeModule.icon] || Icons.Circle,
                  {
                    size: 24,
                    style: { color: activeModule.color },
                  }
                )}
                <h2 className="text-xl font-semibold text-gray-900">
                  {activeModule.name}
                </h2>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100/50 transition-colors"
            >
              <Icons.Search size={20} />
            </button>
            <div className="relative">
              <select
                onChange={(e) => {
                  const selectedTheme = state.availableThemes.find(
                    (t) => t.id === e.target.value
                  );
                  if (selectedTheme) handleThemeChange(selectedTheme);
                }}
                value={theme.id}
                className="px-3 py-2 bg-white/50 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {state.availableThemes.map((themeOption) => (
                  <option key={themeOption.id} value={themeOption.id}>
                    {themeOption.name}
                  </option>
                ))}
              </select>
            </div>

            <button className="p-2 rounded-lg hover:bg-gray-100/50 transition-colors">
              <Icons.Bell size={20} />
            </button>

            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="p-2 rounded-lg hover:bg-gray-100/50 transition-colors"
              >
                <Icons.User size={20} />
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-2 text-sm text-gray-700">
                    <p className="font-semibold">{user?.email}</p>
                  </div>
                  <div className="border-t border-gray-100"></div>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() =>
                      dispatch({
                        type: "SET_ACTIVE_MODULE",
                        payload: "settings",
                      })
                    }
                  >
                    Settings
                  </a>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={signOut}
                  >
                    Logout
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <Search isOpen={isSearchOpen} setIsOpen={setIsSearchOpen} />
    </>
  );
};

export default Header;
