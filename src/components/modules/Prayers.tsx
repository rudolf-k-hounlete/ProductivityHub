import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Prayer } from '../../types';
import * as Icons from 'lucide-react';

const Prayers: React.FC = () => {
  const { state, dispatch } = useApp();
  const [filter, setFilter] = useState<'all' | 'answered' | 'pending'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingPrayer, setEditingPrayer] = useState<Prayer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: ''
  });

  const categories = ['all', ...new Set(state.prayers.map(prayer => prayer.category).filter(Boolean))];

  const filteredPrayers = state.prayers.filter(prayer => {
    const matchesFilter = filter === 'all' || 
                         (filter === 'answered' && prayer.answered) ||
                         (filter === 'pending' && !prayer.answered);
    const matchesCategory = categoryFilter === 'all' || prayer.category === categoryFilter;
    const matchesSearch = prayer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prayer.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prayer.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesCategory && matchesSearch;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const prayerData: Prayer = {
      id: editingPrayer?.id || Date.now().toString(),
      title: formData.title,
      content: formData.content,
      category: formData.category,
      date: editingPrayer?.date || new Date(),
      answered: editingPrayer?.answered || false,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    };

    if (editingPrayer) {
      dispatch({ type: 'UPDATE_PRAYER', payload: prayerData });
    } else {
      dispatch({ type: 'ADD_PRAYER', payload: prayerData });
    }

    resetForm();
  };

  const toggleAnswered = (prayer: Prayer) => {
    dispatch({ type: 'UPDATE_PRAYER', payload: { ...prayer, answered: !prayer.answered } });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: '',
      tags: ''
    });
    setEditingPrayer(null);
    setShowModal(false);
  };

  const getPrayerStats = () => {
    const total = state.prayers.length;
    const answered = state.prayers.filter(p => p.answered).length;
    const thisMonth = state.prayers.filter(p => {
      const prayerDate = new Date(p.date);
      const now = new Date();
      return prayerDate.getMonth() === now.getMonth() && 
             prayerDate.getFullYear() === now.getFullYear();
    }).length;
    
    return { total, answered, pending: total - answered, thisMonth };
  };

  const stats = getPrayerStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Prayers</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow"
        >
          <Icons.Plus className="h-4 w-4 mr-2 inline" />
          New Prayer
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Icons.Heart className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Prayers</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-xl">
              <Icons.CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Answered</p>
              <p className="text-2xl font-bold text-green-600">{stats.answered}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-50 rounded-xl">
              <Icons.Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
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
              <p className="text-2xl font-bold text-purple-600">{stats.thisMonth}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search prayers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex bg-white/80 backdrop-blur-sm rounded-lg p-1 border border-gray-200/50">
          {['all', 'pending', 'answered'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : category}
            </option>
          ))}
        </select>
      </div>

      {/* Prayers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrayers
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .map((prayer) => (
            <div
              key={prayer.id}
              className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow ${
                prayer.answered ? 'ring-2 ring-green-200' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {prayer.title}
                    </h3>
                    {prayer.answered && (
                      <Icons.CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <span>{new Date(prayer.date).toLocaleDateString()}</span>
                    {prayer.category && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {prayer.category}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAnswered(prayer)}
                    className={`p-1 rounded ${
                      prayer.answered 
                        ? 'text-green-500 hover:text-green-600' 
                        : 'text-gray-400 hover:text-green-500'
                    }`}
                    title={prayer.answered ? 'Mark as pending' : 'Mark as answered'}
                  >
                    <Icons.CheckCircle className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingPrayer(prayer);
                      setFormData({
                        title: prayer.title,
                        content: prayer.content,
                        category: prayer.category,
                        tags: prayer.tags.join(', ')
                      });
                      setShowModal(true);
                    }}
                    className="p-1 text-gray-400 hover:text-blue-500 rounded"
                  >
                    <Icons.Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'DELETE_PRAYER', payload: prayer.id })}
                    className="p-1 text-gray-400 hover:text-red-500 rounded"
                  >
                    <Icons.Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="text-gray-700 text-sm mb-4 line-clamp-4 whitespace-pre-wrap">
                {prayer.content}
              </p>

              {prayer.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {prayer.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Icons.Heart className="h-3 w-3" />
                  Prayer request
                </span>
                <span className={`font-medium ${
                  prayer.answered ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {prayer.answered ? 'Answered' : 'Pending'}
                </span>
              </div>
            </div>
          ))}
      </div>

      {filteredPrayers.length === 0 && (
        <div className="text-center py-12">
          <Icons.Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No prayers found</h3>
          <p className="text-gray-600">Start by adding your first prayer request.</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingPrayer ? 'Edit Prayer' : 'New Prayer'}
              </h2>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg">
                <Icons.X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What are you praying for?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prayer</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Write your prayer here..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Family, Health, Work, Guidance"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., healing, wisdom, protection"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-lg hover:shadow-lg transition-shadow"
                >
                  {editingPrayer ? 'Update Prayer' : 'Save Prayer'}
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

export default Prayers;