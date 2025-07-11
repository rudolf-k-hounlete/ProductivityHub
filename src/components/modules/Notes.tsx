import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Note } from '../../types';
import * as Icons from 'lucide-react';

const Notes: React.FC = () => {
  const { state, dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: ''
  });

  const categories = ['all', ...new Set(state.notes.map(note => note.category).filter(Boolean))];

  const filteredNotes = state.notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const noteData: Note = {
      id: editingNote?.id || Date.now().toString(),
      title: formData.title,
      content: formData.content,
      category: formData.category,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      favorite: editingNote?.favorite || false,
      createdAt: editingNote?.createdAt || new Date(),
      updatedAt: new Date()
    };

    if (editingNote) {
      dispatch({ type: 'UPDATE_NOTE', payload: noteData });
    } else {
      dispatch({ type: 'ADD_NOTE', payload: noteData });
    }

    setFormData({ title: '', content: '', category: '', tags: '' });
    setEditingNote(null);
    setShowModal(false);
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      category: note.category || '',
      tags: note.tags.join(', ')
    });
    setShowModal(true);
  };

  const handleDelete = (noteId: string) => {
    dispatch({ type: 'DELETE_NOTE', payload: noteId });
  };

  const toggleFavorite = (note: Note) => {
    dispatch({ type: 'UPDATE_NOTE', payload: { ...note, favorite: !note.favorite } });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Notes</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow"
        >
          <Icons.Plus className="h-4 w-4 mr-2 inline" />
          New Note
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : category}
            </option>
          ))}
        </select>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                  <span className="flex items-center gap-1">
                    <Icons.FileText className="h-3 w-3" />
                    {note.content.length} chars
                  </span>
                {note.title}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleFavorite(note)}
                  className={`p-1 rounded ${note.favorite ? 'text-yellow-500' : 'text-gray-400'}`}
                >
                  <Icons.Star className="h-4 w-4" fill={note.favorite ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={() => handleEdit(note)}
                  className="p-1 rounded text-gray-400 hover:text-blue-500"
                >
                  <Icons.Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="p-1 rounded text-gray-400 hover:text-red-500"
                >
                  <Icons.Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <p className="text-gray-600 text-sm mb-3 line-clamp-3">
              {note.content}
            </p>
            
            {note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {note.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{note.category}</span>
              <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingNote ? 'Edit Note' : 'New Note'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingNote(null);
                  setFormData({ title: '', content: '', category: '', tags: '' });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Icons.X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Personal, Work, Ideas"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., important, meeting, idea"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-lg hover:shadow-lg transition-shadow"
                >
                  {editingNote ? 'Update Note' : 'Create Note'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingNote(null);
                    setFormData({ title: '', content: '', category: '', tags: '' });
                  }}
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

export default Notes;