import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../ThemeProvider';
import * as Icons from 'lucide-react';

const Settings: React.FC = () => {
  const { state, dispatch } = useApp();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'general' | 'themes' | 'modules' | 'data'>('general');
  const [showCreateTheme, setShowCreateTheme] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const [newTheme, setNewTheme] = useState({
    id: '',
    name: '',
    primary: '#3B82F6',
    secondary: '#1E40AF',
    accent: '#F59E0B',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6'
  });

  const [importData, setImportData] = useState('');

  const handleCreateTheme = () => {
    if (!newTheme.name) return;
    
    const themeData = {
      ...newTheme,
      id: newTheme.name.toLowerCase().replace(/\s+/g, '-')
    };

    // Add to available themes
    dispatch({
      type: 'LOAD_DATA',
      payload: {
        availableThemes: [...state.availableThemes, themeData]
      }
    });

    setNewTheme({
      id: '',
      name: '',
      primary: '#3B82F6',
      secondary: '#1E40AF',
      accent: '#F59E0B',
      background: '#F8FAFC',
      surface: '#FFFFFF',
      text: '#1F2937',
      textSecondary: '#6B7280',
      border: '#E5E7EB',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6'
    });
    setShowCreateTheme(false);
  };

  const toggleModule = (moduleId: string) => {
    dispatch({ type: 'TOGGLE_MODULE', payload: moduleId });
  };

  const exportData = () => {
    const dataToExport = {
      tasks: state.tasks,
      projects: state.projects,
      notes: state.notes,
      events: state.events,
      financialTransactions: state.financialTransactions,
      books: state.books,
      goals: state.goals,
      journalEntries: state.journalEntries,
      prayers: state.prayers,
      bibleReadings: state.bibleReadings,
      academicCourses: state.academicCourses,
      availableThemes: state.availableThemes,
      currentTheme: state.currentTheme,
      modules: state.modules
    };

    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `productivity-app-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  const importDataFromFile = () => {
    try {
      const parsedData = JSON.parse(importData);
      dispatch({ type: 'LOAD_DATA', payload: parsedData });
      setImportData('');
      setShowImportModal(false);
      alert('Data imported successfully!');
    } catch (error) {
      alert('Invalid JSON format. Please check your data.');
    }
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      dispatch({
        type: 'LOAD_DATA',
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
          academicCourses: []
        }
      });
      alert('All data has been cleared.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <div className="flex items-center gap-2">
          <Icons.Settings className="h-6 w-6 text-gray-600" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white/80 backdrop-blur-sm rounded-lg p-1 border border-gray-200/50 w-fit">
        {['general', 'themes', 'modules', 'data'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Preferences</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Sidebar Collapsed</h4>
                  <p className="text-sm text-gray-600">Keep the sidebar in collapsed mode by default</p>
                </div>
                <button
                  onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    state.sidebarCollapsed ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      state.sidebarCollapsed ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Current Theme</h4>
                  <p className="text-sm text-gray-600">Choose your preferred color scheme</p>
                </div>
                <select
                  value={theme.id}
                  onChange={(e) => {
                    const selectedTheme = state.availableThemes.find(t => t.id === e.target.value);
                    if (selectedTheme) setTheme(selectedTheme);
                  }}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {state.availableThemes.map(themeOption => (
                    <option key={themeOption.id} value={themeOption.id}>
                      {themeOption.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Info</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Version:</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Modules:</span>
                <span className="font-medium">{state.modules.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active Modules:</span>
                <span className="font-medium">{state.modules.filter(m => m.enabled).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Available Themes:</span>
                <span className="font-medium">{state.availableThemes.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Theme Settings */}
      {activeTab === 'themes' && (
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Available Themes</h3>
              <button
                onClick={() => setShowCreateTheme(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Icons.Plus className="h-4 w-4 mr-2 inline" />
                Create Theme
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {state.availableThemes.map((themeOption) => (
                <div
                  key={themeOption.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    theme.id === themeOption.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setTheme(themeOption)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{themeOption.name}</h4>
                    {theme.id === themeOption.id && (
                      <Icons.Check className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                  
                  <div className="flex gap-2 mb-3">
                    <div
                      className="w-6 h-6 rounded-full border border-gray-200"
                      style={{ backgroundColor: themeOption.primary }}
                      title="Primary"
                    />
                    <div
                      className="w-6 h-6 rounded-full border border-gray-200"
                      style={{ backgroundColor: themeOption.secondary }}
                      title="Secondary"
                    />
                    <div
                      className="w-6 h-6 rounded-full border border-gray-200"
                      style={{ backgroundColor: themeOption.accent }}
                      title="Accent"
                    />
                    <div
                      className="w-6 h-6 rounded-full border border-gray-200"
                      style={{ backgroundColor: themeOption.background }}
                      title="Background"
                    />
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Click to apply this theme
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Create Theme Modal */}
          {showCreateTheme && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Create Custom Theme</h2>
                  <button
                    onClick={() => setShowCreateTheme(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Icons.X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Theme Name</label>
                    <input
                      type="text"
                      value={newTheme.name}
                      onChange={(e) => setNewTheme({ ...newTheme, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="My Custom Theme"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(newTheme).filter(([key]) => key !== 'id' && key !== 'name').map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={value}
                            onChange={(e) => setNewTheme({ ...newTheme, [key]: e.target.value })}
                            className="w-12 h-10 border border-gray-200 rounded-lg"
                          />
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => setNewTheme({ ...newTheme, [key]: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleCreateTheme}
                      className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                    >
                      Create Theme
                    </button>
                    <button
                      onClick={() => setShowCreateTheme(false)}
                      className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Module Settings */}
      {activeTab === 'modules' && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Module Management</h3>
          <p className="text-sm text-gray-600 mb-6">Enable or disable modules to customize your productivity suite.</p>

          <div className="space-y-4">
            {state.modules.map((module) => (
              <div key={module.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: module.color + '20' }}
                  >
                    {React.createElement((Icons as any)[module.icon] || Icons.Circle, {
                      size: 20,
                      style: { color: module.color }
                    })}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{module.name}</h4>
                    <p className="text-sm text-gray-600 capitalize">{module.id} module</p>
                  </div>
                </div>
                
                <button
                  onClick={() => toggleModule(module.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    module.enabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      module.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Management */}
      {activeTab === 'data' && (
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Export Data</h4>
                  <p className="text-sm text-gray-600">Download all your data as a JSON file</p>
                </div>
                <button
                  onClick={() => setShowExportModal(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Icons.Download className="h-4 w-4 mr-2 inline" />
                  Export
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Import Data</h4>
                  <p className="text-sm text-gray-600">Restore data from a JSON backup file</p>
                </div>
                <button
                  onClick={() => setShowImportModal(true)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Icons.Upload className="h-4 w-4 mr-2 inline" />
                  Import
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                <div>
                  <h4 className="font-medium text-red-900">Clear All Data</h4>
                  <p className="text-sm text-red-600">Permanently delete all your data</p>
                </div>
                <button
                  onClick={clearAllData}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Icons.Trash2 className="h-4 w-4 mr-2 inline" />
                  Clear All
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Statistics</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{state.tasks.length}</div>
                <div className="text-sm text-gray-600">Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{state.projects.length}</div>
                <div className="text-sm text-gray-600">Projects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{state.notes.length}</div>
                <div className="text-sm text-gray-600">Notes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{state.events.length}</div>
                <div className="text-sm text-gray-600">Events</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{state.financialTransactions.length}</div>
                <div className="text-sm text-gray-600">Transactions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{state.books.length}</div>
                <div className="text-sm text-gray-600">Books</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">{state.goals.length}</div>
                <div className="text-sm text-gray-600">Goals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-600">{state.journalEntries.length}</div>
                <div className="text-sm text-gray-600">Journal Entries</div>
              </div>
            </div>
          </div>

          {/* Export Modal */}
          {showExportModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Export Data</h2>
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Icons.X className="h-5 w-5" />
                  </button>
                </div>

                <p className="text-gray-600 mb-6">
                  This will download all your data as a JSON file that you can use to backup or transfer your data.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={exportData}
                    className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                  >
                    Download Backup
                  </button>
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Import Modal */}
          {showImportModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Import Data</h2>
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Icons.X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <p className="text-gray-600">
                    Paste your JSON backup data below to restore your information.
                  </p>

                  <textarea
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Paste your JSON backup data here..."
                  />

                  <div className="flex gap-3">
                    <button
                      onClick={importDataFromFile}
                      className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
                    >
                      Import Data
                    </button>
                    <button
                      onClick={() => setShowImportModal(false)}
                      className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Settings;