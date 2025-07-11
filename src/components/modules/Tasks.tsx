import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Task } from '../../types';
import * as Icons from 'lucide-react';

const Tasks: React.FC = () => {
  const { state, dispatch } = useApp();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [priority, setPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: '',
    tags: '',
    projectId: ''
  });

  const filteredTasks = state.tasks.filter(task => {
    const matchesFilter = filter === 'all' || 
                         (filter === 'active' && !task.completed) ||
                         (filter === 'completed' && task.completed);
    const matchesPriority = priority === 'all' || task.priority === priority;
    return matchesFilter && matchesPriority;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const taskData: Task = {
      id: editingTask?.id || Date.now().toString(),
      title: formData.title,
      description: formData.description,
      completed: editingTask?.completed || false,
      priority: formData.priority,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      projectId: formData.projectId || undefined,
      createdAt: editingTask?.createdAt || new Date(),
      updatedAt: new Date()
    };

    if (editingTask) {
      dispatch({ type: 'UPDATE_TASK', payload: taskData });
    } else {
      dispatch({ type: 'ADD_TASK', payload: taskData });
    }

    setFormData({ title: '', description: '', priority: 'medium', dueDate: '', tags: '', projectId: '' });
    setEditingTask(null);
    setShowModal(false);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : '',
      tags: task.tags.join(', '),
      projectId: task.projectId || ''
    });
    setShowModal(true);
  };

  const handleDelete = (taskId: string) => {
    dispatch({ type: 'DELETE_TASK', payload: taskId });
  };

  const toggleComplete = (task: Task) => {
    dispatch({ type: 'UPDATE_TASK', payload: { ...task, completed: !task.completed } });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow"
        >
          <Icons.Plus className="h-4 w-4 mr-2 inline" />
          New Task
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Icons.CheckSquare className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-xl font-bold text-gray-900">{state.tasks.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Icons.CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-xl font-bold text-gray-900">
                {state.tasks.filter(t => t.completed).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Icons.Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-xl font-bold text-gray-900">
                {state.tasks.filter(t => !t.completed).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex bg-white/80 backdrop-blur-sm rounded-lg p-1 border border-gray-200/50">
          {['all', 'active', 'completed'].map((f) => (
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
          value={priority}
          onChange={(e) => setPriority(e.target.value as any)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Priorities</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className={`bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow ${
              task.completed ? 'opacity-75' : ''
            }`}
          >
            <div className="flex items-start gap-4">
              <button
                onClick={() => toggleComplete(task)}
                className={`mt-1 p-1 rounded-full transition-colors ${
                  task.completed
                    ? 'text-green-600 bg-green-50'
                    : 'text-gray-400 hover:text-green-600'
                }`}
              >
                {task.completed ? (
                  <Icons.CheckCircle className="h-5 w-5" />
                ) : (
                  <Icons.Circle className="h-5 w-5" />
                )}
              </button>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`text-lg font-medium ${
                    task.completed ? 'line-through text-gray-500' : 'text-gray-900'
                  }`}>
                    {task.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                
                {task.description && (
                  <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                )}
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {task.dueDate && (
                    <span className="flex items-center gap-1">
                      <Icons.Calendar className="h-4 w-4" />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                  {task.tags.length > 0 && (
                    <div className="flex gap-1">
                      {task.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(task)}
                  className="p-2 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50"
                >
                  <Icons.Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                >
                  <Icons.Trash2 className="h-4 w-4" />
                </button>
              </div>
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
                {editingTask ? 'Edit Task' : 'New Task'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingTask(null);
                  setFormData({ title: '', description: '', priority: 'medium', dueDate: '', tags: '', projectId: '' });
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
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project
                </label>
                <select
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No Project</option>
                  {state.projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
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
                  placeholder="e.g., urgent, work, personal"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-lg hover:shadow-lg transition-shadow"
                >
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTask(null);
                    setFormData({ title: '', description: '', priority: 'medium', dueDate: '', tags: '', projectId: '' });
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

export default Tasks;