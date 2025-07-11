import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BibleReading } from '../../types';
import * as Icons from 'lucide-react';

const Bible: React.FC = () => {
  const { state, dispatch } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingReading, setEditingReading] = useState<BibleReading | null>(null);
  const [selectedPlan, setSelectedPlan] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    book: '',
    chapter: 1,
    verses: '',
    notes: '',
    plan: '',
    date: new Date().toISOString().split('T')[0]
  });

  const bibleBooks = [
    // Old Testament
    'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
    '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah',
    'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Songs', 'Isaiah', 'Jeremiah',
    'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah',
    'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
    // New Testament
    'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians',
    'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
    '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter',
    '1 John', '2 John', '3 John', 'Jude', 'Revelation'
  ];

  const readingPlans = [
    'Daily Reading', 'One Year Bible', 'Chronological', 'Topical Study', 'Book Study', 'Personal Study'
  ];

  const plans = ['all', ...new Set(state.bibleReadings.map(reading => reading.plan).filter(Boolean))];

  const filteredReadings = state.bibleReadings.filter(reading => {
    const matchesPlan = selectedPlan === 'all' || reading.plan === selectedPlan;
    const matchesSearch = reading.book.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reading.notes.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPlan && matchesSearch;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const readingData: BibleReading = {
      id: editingReading?.id || Date.now().toString(),
      book: formData.book,
      chapter: formData.chapter,
      verses: formData.verses,
      date: new Date(formData.date),
      notes: formData.notes,
      plan: formData.plan
    };

    if (editingReading) {
      dispatch({ type: 'UPDATE_BIBLE_READING', payload: readingData });
    } else {
      dispatch({ type: 'ADD_BIBLE_READING', payload: readingData });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      book: '',
      chapter: 1,
      verses: '',
      notes: '',
      plan: '',
      date: new Date().toISOString().split('T')[0]
    });
    setEditingReading(null);
    setShowModal(false);
  };

  const getReadingStats = () => {
    const total = state.bibleReadings.length;
    const thisMonth = state.bibleReadings.filter(reading => {
      const readingDate = new Date(reading.date);
      const now = new Date();
      return readingDate.getMonth() === now.getMonth() && 
             readingDate.getFullYear() === now.getFullYear();
    }).length;
    
    const uniqueBooks = new Set(state.bibleReadings.map(reading => reading.book)).size;
    const streak = calculateReadingStreak();
    
    return { total, thisMonth, uniqueBooks, streak };
  };

  const calculateReadingStreak = () => {
    const sortedReadings = state.bibleReadings
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (sortedReadings.length === 0) return 0;
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const reading of sortedReadings) {
      const readingDate = new Date(reading.date);
      readingDate.setHours(0, 0, 0, 0);
      
      const diffTime = currentDate.getTime() - readingDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === streak || (streak === 0 && diffDays <= 1)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };

  const stats = getReadingStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Bible Reading</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow"
        >
          <Icons.Plus className="h-4 w-4 mr-2 inline" />
          New Reading
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Icons.Book className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Readings</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-xl">
              <Icons.Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-green-600">{stats.thisMonth}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-50 rounded-xl">
              <Icons.BookOpen className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Books Read</p>
              <p className="text-2xl font-bold text-orange-600">{stats.uniqueBooks}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 rounded-xl">
              <Icons.Flame className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Reading Streak</p>
              <p className="text-2xl font-bold text-purple-600">{stats.streak} days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Reading Suggestion */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200/50">
        <div className="flex items-center gap-3 mb-4">
          <Icons.Sunrise className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Today's Reading Suggestion</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-1">Psalm of the Day</h4>
            <p className="text-sm text-gray-600">Psalm {new Date().getDate()}</p>
          </div>
          <div className="bg-white/50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-1">Proverbs Wisdom</h4>
            <p className="text-sm text-gray-600">Proverbs {new Date().getDate()}</p>
          </div>
          <div className="bg-white/50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-1">New Testament</h4>
            <p className="text-sm text-gray-600">Continue your reading plan</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search readings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <select
          value={selectedPlan}
          onChange={(e) => setSelectedPlan(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {plans.map(plan => (
            <option key={plan} value={plan}>
              {plan === 'all' ? 'All Plans' : plan}
            </option>
          ))}
        </select>
      </div>

      {/* Readings List */}
      <div className="space-y-4">
        {filteredReadings
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .map((reading) => (
            <div
              key={reading.id}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Icons.BookOpen className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {reading.book} {reading.chapter}
                      {reading.verses && `:${reading.verses}`}
                    </h3>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <span>{new Date(reading.date).toLocaleDateString()}</span>
                    {reading.plan && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {reading.plan}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingReading(reading);
                      setFormData({
                        book: reading.book,
                        chapter: reading.chapter,
                        verses: reading.verses,
                        notes: reading.notes,
                        plan: reading.plan || '',
                        date: reading.date.toISOString().split('T')[0]
                      });
                      setShowModal(true);
                    }}
                    className="p-1 text-gray-400 hover:text-blue-500 rounded"
                  >
                    <Icons.Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'DELETE_BIBLE_READING', payload: reading.id })}
                    className="p-1 text-gray-400 hover:text-red-500 rounded"
                  >
                    <Icons.Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {reading.notes && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Icons.PenTool className="h-4 w-4" />
                    Notes & Reflections
                  </h4>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">{reading.notes}</p>
                </div>
              )}
            </div>
          ))}
        
        {filteredReadings.length === 0 && (
          <div className="text-center py-12">
            <Icons.Book className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No readings found</h3>
            <p className="text-gray-600">Start your Bible reading journey today.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingReading ? 'Edit Reading' : 'New Bible Reading'}
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
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Book</label>
                <select
                  value={formData.book}
                  onChange={(e) => setFormData({ ...formData, book: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a book...</option>
                  {bibleBooks.map(book => (
                    <option key={book} value={book}>{book}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chapter</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.chapter}
                    onChange={(e) => setFormData({ ...formData, chapter: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Verses (optional)</label>
                  <input
                    type="text"
                    value={formData.verses}
                    onChange={(e) => setFormData({ ...formData, verses: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 1-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reading Plan</label>
                <select
                  value={formData.plan}
                  onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No specific plan</option>
                  {readingPlans.map(plan => (
                    <option key={plan} value={plan}>{plan}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes & Reflections</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What did you learn? How did this passage speak to you?"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-lg hover:shadow-lg transition-shadow"
                >
                  {editingReading ? 'Update Reading' : 'Save Reading'}
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

export default Bible;