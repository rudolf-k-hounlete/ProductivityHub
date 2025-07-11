import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { JournalEntry } from '../../types';
import * as Icons from 'lucide-react';

const Journal: React.FC = () => {
  const { state, dispatch } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood: 5,
    weather: '',
    tags: '',
    gratitude: ['', '', '']
  });

  const moodEmojis = ['😢', '😞', '😐', '🙂', '😊', '😄', '🤩', '🥳', '😍', '🤗'];
  const weatherOptions = ['☀️ Sunny', '⛅ Partly Cloudy', '☁️ Cloudy', '🌧️ Rainy', '⛈️ Stormy', '❄️ Snowy', '🌫️ Foggy'];

  const filteredEntries = state.journalEntries.filter(entry => {
    const matchesSearch = entry.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const entryData: JournalEntry = {
      id: editingEntry?.id || Date.now().toString(),
      date: new Date(selectedDate),
      title: formData.title,
      content: formData.content,
      mood: formData.mood,
      weather: formData.weather,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      gratitude: formData.gratitude.filter(item => item.trim() !== '')
    };

    if (editingEntry) {
      dispatch({ type: 'UPDATE_JOURNAL_ENTRY', payload: entryData });
    } else {
      dispatch({ type: 'ADD_JOURNAL_ENTRY', payload: entryData });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      mood: 5,
      weather: '',
      tags: '',
      gratitude: ['', '', '']
    });
    setEditingEntry(null);
    setShowModal(false);
  };

  const getEntryForDate = (date: string) => {
    return state.journalEntries.find(entry => 
      entry.date.toISOString().split('T')[0] === date
    );
  };

  const getMoodStats = () => {
    if (state.journalEntries.length === 0) return { average: 5, trend: 'stable' };
    
    const moods = state.journalEntries.map(entry => entry.mood);
    const average = moods.reduce((sum, mood) => sum + mood, 0) / moods.length;
    
    // Calculate trend (last 7 entries vs previous 7)
    const recent = moods.slice(-7);
    const previous = moods.slice(-14, -7);
    
    if (previous.length === 0) return { average, trend: 'stable' };
    
    const recentAvg = recent.reduce((sum, mood) => sum + mood, 0) / recent.length;
    const previousAvg = previous.reduce((sum, mood) => sum + mood, 0) / previous.length;
    
    const trend = recentAvg > previousAvg + 0.5 ? 'improving' : 
                  recentAvg < previousAvg - 0.5 ? 'declining' : 'stable';
    
    return { average, trend };
  };

  const moodStats = getMoodStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Journal</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow"
        >
          <Icons.Plus className="h-4 w-4 mr-2 inline" />
          New Entry
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Icons.BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Entries</p>
              <p className="text-2xl font-bold text-blue-600">{state.journalEntries.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-xl">
              <Icons.Smile className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Mood</p>
              <p className="text-2xl font-bold text-green-600">
                {moodEmojis[Math.round(moodStats.average) - 1]} {moodStats.average.toFixed(1)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-50 rounded-xl">
              <Icons.TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Mood Trend</p>
              <p className="text-lg font-bold text-orange-600 capitalize">{moodStats.trend}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 rounded-xl">
              <Icons.Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-purple-600">
                {state.journalEntries.filter(entry => 
                  new Date(entry.date).getMonth() === new Date().getMonth() &&
                  new Date(entry.date).getFullYear() === new Date().getFullYear()
                ).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Entry for Today */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Today's Entry</h3>
          <span className="text-sm text-gray-600">{new Date().toLocaleDateString()}</span>
        </div>
        
        {getEntryForDate(new Date().toISOString().split('T')[0]) ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{moodEmojis[getEntryForDate(new Date().toISOString().split('T')[0])!.mood - 1]}</span>
              <div>
                <h4 className="font-medium text-gray-900">
                  {getEntryForDate(new Date().toISOString().split('T')[0])!.title || 'Untitled Entry'}
                </h4>
                <p className="text-sm text-gray-600">
                  Mood: {getEntryForDate(new Date().toISOString().split('T')[0])!.mood}/10
                </p>
              </div>
            </div>
            <p className="text-gray-700 line-clamp-3">
              {getEntryForDate(new Date().toISOString().split('T')[0])!.content}
            </p>
            <button
              onClick={() => {
                const todayEntry = getEntryForDate(new Date().toISOString().split('T')[0])!;
                setEditingEntry(todayEntry);
                setSelectedDate(todayEntry.date.toISOString().split('T')[0]);
                setFormData({
                  title: todayEntry.title || '',
                  content: todayEntry.content,
                  mood: todayEntry.mood,
                  weather: todayEntry.weather || '',
                  tags: todayEntry.tags.join(', '),
                  gratitude: [...todayEntry.gratitude, '', '', ''].slice(0, 3)
                });
                setShowModal(true);
              }}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Edit today's entry
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <Icons.PenTool className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">You haven't written in your journal today.</p>
            <button
              onClick={() => {
                setSelectedDate(new Date().toISOString().split('T')[0]);
                setShowModal(true);
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Write Today's Entry
            </button>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search entries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Entries List */}
      <div className="space-y-4">
        {filteredEntries
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .map((entry) => (
            <div
              key={entry.id}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{moodEmojis[entry.mood - 1]}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {entry.title || 'Untitled Entry'}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{new Date(entry.date).toLocaleDateString()}</span>
                      <span>Mood: {entry.mood}/10</span>
                      {entry.weather && <span>{entry.weather}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingEntry(entry);
                      setSelectedDate(entry.date.toISOString().split('T')[0]);
                      setFormData({
                        title: entry.title || '',
                        content: entry.content,
                        mood: entry.mood,
                        weather: entry.weather || '',
                        tags: entry.tags.join(', '),
                        gratitude: [...entry.gratitude, '', '', ''].slice(0, 3)
                      });
                      setShowModal(true);
                    }}
                    className="p-1 text-gray-400 hover:text-blue-500 rounded"
                  >
                    <Icons.Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'DELETE_JOURNAL_ENTRY', payload: entry.id })}
                    className="p-1 text-gray-400 hover:text-red-500 rounded"
                  >
                    <Icons.Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="text-gray-700 mb-4 whitespace-pre-wrap">{entry.content}</p>

              {entry.gratitude.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Grateful for:</h4>
                  <ul className="space-y-1">
                    {entry.gratitude.map((item, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                        <Icons.Heart className="h-3 w-3 text-red-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {entry.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        
        {filteredEntries.length === 0 && (
          <div className="text-center py-12">
            <Icons.BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No journal entries found</h3>
            <p className="text-gray-600">Start writing to capture your thoughts and memories.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingEntry ? 'Edit Entry' : 'New Journal Entry'}
              </h2>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg">
                <Icons.X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title (optional)</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Give your entry a title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mood ({formData.mood}/10) {moodEmojis[formData.mood - 1]}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.mood}
                  onChange={(e) => setFormData({ ...formData, mood: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Terrible</span>
                  <span>Amazing</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weather</label>
                <select
                  value={formData.weather}
                  onChange={(e) => setFormData({ ...formData, weather: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select weather...</option>
                  {weatherOptions.map(weather => (
                    <option key={weather} value={weather}>{weather}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entry</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What's on your mind today? How are you feeling? What happened?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Three things I'm grateful for:</label>
                <div className="space-y-2">
                  {formData.gratitude.map((item, index) => (
                    <input
                      key={index}
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const newGratitude = [...formData.gratitude];
                        newGratitude[index] = e.target.value;
                        setFormData({ ...formData, gratitude: newGratitude });
                      }}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Grateful for #${index + 1}...`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., work, family, travel, reflection"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-lg hover:shadow-lg transition-shadow"
                >
                  {editingEntry ? 'Update Entry' : 'Save Entry'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Journal;