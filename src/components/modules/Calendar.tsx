import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Event } from '../../types';
import * as Icons from 'lucide-react';

const Calendar: React.FC = () => {
  const { state, dispatch } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start: '',
    end: '',
    allDay: false,
    category: 'personal',
    color: '#3B82F6',
    location: ''
  });

  const categories = [
    { id: 'personal', name: 'Personal', color: '#3B82F6' },
    { id: 'work', name: 'Work', color: '#10B981' },
    { id: 'academic', name: 'Academic', color: '#F59E0B' },
    { id: 'health', name: 'Health', color: '#EF4444' },
    { id: 'social', name: 'Social', color: '#8B5CF6' }
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    return state.events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const eventData: Event = {
      id: editingEvent?.id || Date.now().toString(),
      title: formData.title,
      description: formData.description,
      start: new Date(formData.start),
      end: new Date(formData.end),
      allDay: formData.allDay,
      category: formData.category,
      color: formData.color,
      location: formData.location,
      reminders: editingEvent?.reminders || []
    };

    if (editingEvent) {
      dispatch({ type: 'UPDATE_EVENT', payload: eventData });
    } else {
      dispatch({ type: 'ADD_EVENT', payload: eventData });
    }

    setFormData({
      title: '',
      description: '',
      start: '',
      end: '',
      allDay: false,
      category: 'personal',
      color: '#3B82F6',
      location: ''
    });
    setEditingEvent(null);
    setShowModal(false);
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      start: event.start.toISOString().slice(0, 16),
      end: event.end.toISOString().slice(0, 16),
      allDay: event.allDay,
      category: event.category,
      color: event.color,
      location: event.location || ''
    });
    setShowModal(true);
  };

  const handleDelete = (eventId: string) => {
    dispatch({ type: 'DELETE_EVENT', payload: eventId });
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setFormData({
      ...formData,
      start: date.toISOString().slice(0, 16),
      end: new Date(date.getTime() + 60 * 60 * 1000).toISOString().slice(0, 16)
    });
    setShowModal(true);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Icons.ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 min-w-[200px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Icons.ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white/80 backdrop-blur-sm rounded-lg p-1 border border-gray-200/50">
            {['month', 'week', 'day'].map((v) => (
              <button
                key={v}
                onClick={() => setView(v as any)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  view === v
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow"
          >
            <Icons.Plus className="h-4 w-4 mr-2 inline" />
            New Event
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-sm">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {dayNames.map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            if (!day) {
              return <div key={index} className="p-2 h-24" />;
            }

            const events = getEventsForDate(day);
            const isToday = day.toDateString() === new Date().toDateString();
            const isSelected = selectedDate?.toDateString() === day.toDateString();

            return (
              <div
                key={day.toISOString()}
                className={`p-2 h-24 border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                  isToday ? 'bg-blue-50 border-blue-200' : ''
                } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => handleDateClick(day)}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isToday ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {day.getDate()}
                </div>
                <div className="space-y-1">
                  {events.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      className="text-xs p-1 rounded truncate"
                      style={{ backgroundColor: event.color + '20', color: event.color }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(event);
                      }}
                    >
                      {event.title}
                    </div>
                  ))}
                  {events.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{events.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
        <div className="space-y-3">
          {state.events
            .filter(event => new Date(event.start) >= new Date())
            .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
            .slice(0, 5)
            .map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: event.color }}
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{event.title}</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(event.start).toLocaleDateString()} at{' '}
                    {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {event.location && (
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Icons.MapPin className="h-3 w-3" />
                      {event.location}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(event)}
                    className="p-1 text-gray-400 hover:text-blue-500 rounded"
                  >
                    <Icons.Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="p-1 text-gray-400 hover:text-red-500 rounded"
                  >
                    <Icons.Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          {state.events.filter(event => new Date(event.start) >= new Date()).length === 0 && (
            <p className="text-gray-500 text-center py-8">No upcoming events.</p>
          )}
        </div>
      </div>

      {/* Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingEvent ? 'Edit Event' : 'New Event'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingEvent(null);
                  setSelectedDate(null);
                  setFormData({
                    title: '',
                    description: '',
                    start: '',
                    end: '',
                    allDay: false,
                    category: 'personal',
                    color: '#3B82F6',
                    location: ''
                  });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Icons.X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title
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
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.start}
                    onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.end}
                    onChange={(e) => setFormData({ ...formData, end: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.allDay}
                    onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">All day event</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full h-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Event location"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-lg hover:shadow-lg transition-shadow"
                >
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingEvent(null);
                    setSelectedDate(null);
                    setFormData({
                      title: '',
                      description: '',
                      start: '',
                      end: '',
                      allDay: false,
                      category: 'personal',
                      color: '#3B82F6',
                      location: ''
                    });
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

export default Calendar;