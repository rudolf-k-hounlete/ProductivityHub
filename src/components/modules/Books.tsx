import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Book } from '../../types';
import * as Icons from 'lucide-react';

const Books: React.FC = () => {
  const { state, dispatch } = useApp();
  const [filter, setFilter] = useState<'all' | 'reading' | 'completed' | 'paused' | 'wishlist'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    totalPages: 0,
    currentPage: 0,
    status: 'wishlist' as 'reading' | 'completed' | 'paused' | 'wishlist',
    notes: '',
    rating: 0
  });

  const filteredBooks = state.books.filter(book => {
    const matchesFilter = filter === 'all' || book.status === filter;
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const bookData: Book = {
      id: editingBook?.id || Date.now().toString(),
      title: formData.title,
      author: formData.author,
      totalPages: formData.totalPages,
      currentPage: formData.currentPage,
      status: formData.status,
      notes: formData.notes,
      rating: formData.rating,
      startDate: editingBook?.startDate || (formData.status === 'reading' ? new Date() : undefined),
      endDate: editingBook?.endDate || (formData.status === 'completed' ? new Date() : undefined)
    };

    if (editingBook) {
      dispatch({ type: 'UPDATE_BOOK', payload: bookData });
    } else {
      dispatch({ type: 'ADD_BOOK', payload: bookData });
    }

    resetForm();
  };

  const updateProgress = (book: Book, newPage: number) => {
    const updatedBook = {
      ...book,
      currentPage: Math.min(newPage, book.totalPages),
      status: newPage >= book.totalPages ? 'completed' as const : book.status,
      endDate: newPage >= book.totalPages ? new Date() : book.endDate
    };
    dispatch({ type: 'UPDATE_BOOK', payload: updatedBook });
  };

  const updateStatus = (book: Book, status: 'reading' | 'completed' | 'paused' | 'wishlist') => {
    const updatedBook = {
      ...book,
      status,
      startDate: status === 'reading' && !book.startDate ? new Date() : book.startDate,
      endDate: status === 'completed' ? new Date() : undefined,
      currentPage: status === 'completed' ? book.totalPages : book.currentPage
    };
    dispatch({ type: 'UPDATE_BOOK', payload: updatedBook });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      totalPages: 0,
      currentPage: 0,
      status: 'wishlist',
      notes: '',
      rating: 0
    });
    setEditingBook(null);
    setShowModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reading': return 'text-blue-600 bg-blue-50';
      case 'completed': return 'text-green-600 bg-green-50';
      case 'paused': return 'text-yellow-600 bg-yellow-50';
      case 'wishlist': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getProgressPercentage = (book: Book) => {
    return book.totalPages > 0 ? Math.round((book.currentPage / book.totalPages) * 100) : 0;
  };

  const getReadingStats = () => {
    const currentYear = new Date().getFullYear();
    const booksThisYear = state.books.filter(book => 
      book.endDate && new Date(book.endDate).getFullYear() === currentYear
    );
    
    const totalPages = booksThisYear.reduce((sum, book) => sum + book.totalPages, 0);
    const averageRating = booksThisYear.length > 0 
      ? booksThisYear.reduce((sum, book) => sum + (book.rating || 0), 0) / booksThisYear.length 
      : 0;

    return {
      booksThisYear: booksThisYear.length,
      totalPages,
      averageRating: averageRating.toFixed(1)
    };
  };

  const stats = getReadingStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Books</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow"
        >
          <Icons.Plus className="h-4 w-4 mr-2 inline" />
          Add Book
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
              <p className="text-sm font-medium text-gray-600">Total Books</p>
              <p className="text-2xl font-bold text-blue-600">{state.books.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-xl">
              <Icons.CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">This Year</p>
              <p className="text-2xl font-bold text-green-600">{stats.booksThisYear}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-50 rounded-xl">
              <Icons.FileText className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pages Read</p>
              <p className="text-2xl font-bold text-orange-600">{stats.totalPages}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 rounded-xl">
              <Icons.Star className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-purple-600">{stats.averageRating}</p>
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
            placeholder="Search books..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex bg-white/80 backdrop-blur-sm rounded-lg p-1 border border-gray-200/50">
          {['all', 'reading', 'completed', 'paused', 'wishlist'].map((f) => (
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
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBooks.map((book) => {
          const progress = getProgressPercentage(book);
          
          return (
            <div
              key={book.id}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-1">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(book.status)}`}>
                    {book.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingBook(book);
                      setFormData({
                        title: book.title,
                        author: book.author,
                        totalPages: book.totalPages,
                        currentPage: book.currentPage,
                        status: book.status,
                        notes: book.notes,
                        rating: book.rating || 0
                      });
                      setShowModal(true);
                    }}
                    className="p-1 text-gray-400 hover:text-blue-500 rounded"
                  >
                    <Icons.Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'DELETE_BOOK', payload: book.id })}
                    className="p-1 text-gray-400 hover:text-red-500 rounded"
                  >
                    <Icons.Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {book.status !== 'wishlist' && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{book.currentPage}/{book.totalPages} pages ({progress}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  
                  {book.status === 'reading' && (
                    <div className="flex gap-2 mt-2">
                      <input
                        type="number"
                        value={book.currentPage}
                        onChange={(e) => updateProgress(book, parseInt(e.target.value) || 0)}
                        max={book.totalPages}
                        min={0}
                        className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => updateProgress(book, book.currentPage + 10)}
                        className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                      >
                        +10
                      </button>
                    </div>
                  )}
                </div>
              )}

              {book.rating && book.rating > 0 && (
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Icons.Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= book.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-1">({book.rating}/5)</span>
                </div>
              )}

              <div className="flex gap-2">
                {book.status === 'wishlist' && (
                  <button
                    onClick={() => updateStatus(book, 'reading')}
                    className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100"
                  >
                    Start Reading
                  </button>
                )}
                {book.status === 'reading' && (
                  <>
                    <button
                      onClick={() => updateStatus(book, 'paused')}
                      className="flex-1 bg-yellow-50 text-yellow-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-yellow-100"
                    >
                      Pause
                    </button>
                    <button
                      onClick={() => updateStatus(book, 'completed')}
                      className="flex-1 bg-green-50 text-green-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-100"
                    >
                      Finish
                    </button>
                  </>
                )}
                {book.status === 'paused' && (
                  <button
                    onClick={() => updateStatus(book, 'reading')}
                    className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100"
                  >
                    Resume
                  </button>
                )}
              </div>

              {book.notes && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700 line-clamp-3">{book.notes}</p>
                </div>
              )}

              <div className="mt-3 text-xs text-gray-500">
                {book.startDate && (
                  <p>Started: {new Date(book.startDate).toLocaleDateString()}</p>
                )}
                {book.endDate && (
                  <p>Finished: {new Date(book.endDate).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingBook ? 'Edit Book' : 'Add Book'}
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
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Pages</label>
                  <input
                    type="number"
                    value={formData.totalPages}
                    onChange={(e) => setFormData({ ...formData, totalPages: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Page</label>
                  <input
                    type="number"
                    value={formData.currentPage}
                    onChange={(e) => setFormData({ ...formData, currentPage: parseInt(e.target.value) || 0 })}
                    max={formData.totalPages}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="wishlist">Wishlist</option>
                    <option value="reading">Reading</option>
                    <option value="completed">Completed</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={0}>No rating</option>
                    <option value={1}>1 star</option>
                    <option value={2}>2 stars</option>
                    <option value={3}>3 stars</option>
                    <option value={4}>4 stars</option>
                    <option value={5}>5 stars</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your thoughts, quotes, or notes about this book..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-lg hover:shadow-lg transition-shadow"
                >
                  {editingBook ? 'Update Book' : 'Add Book'}
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

export default Books;