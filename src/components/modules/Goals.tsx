import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Goal, Milestone } from '../../types';
import * as Icons from 'lucide-react';

const Goals: React.FC = () => {
  const { state, dispatch } = useApp();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'paused'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'academic' | 'professional' | 'personal'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'personal' as 'academic' | 'professional' | 'personal',
    targetDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  const [milestoneForm, setMilestoneForm] = useState({
    title: '',
    dueDate: ''
  });

  const filteredGoals = state.goals.filter(goal => {
    const matchesStatus = filter === 'all' || goal.status === filter;
    const matchesType = typeFilter === 'all' || goal.type === typeFilter;
    return matchesStatus && matchesType;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const goalData: Goal = {
      id: editingGoal?.id || Date.now().toString(),
      title: formData.title,
      description: formData.description,
      type: formData.type,
      targetDate: new Date(formData.targetDate),
      progress: editingGoal?.progress || 0,
      milestones: editingGoal?.milestones || [],
      priority: formData.priority,
      status: editingGoal?.status || 'active'
    };

    if (editingGoal) {
      dispatch({ type: 'UPDATE_GOAL', payload: goalData });
    } else {
      dispatch({ type: 'ADD_GOAL', payload: goalData });
    }

    resetForm();
  };

  const addMilestone = (goalId: string) => {
    if (!milestoneForm.title) return;

    const goal = state.goals.find(g => g.id === goalId);
    if (!goal) return;

    const milestone: Milestone = {
      id: Date.now().toString(),
      title: milestoneForm.title,
      completed: false,
      dueDate: milestoneForm.dueDate ? new Date(milestoneForm.dueDate) : undefined
    };

    const updatedGoal = {
      ...goal,
      milestones: [...goal.milestones, milestone]
    };

    dispatch({ type: 'UPDATE_GOAL', payload: updatedGoal });
    setMilestoneForm({ title: '', dueDate: '' });
  };

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    const goal = state.goals.find(g => g.id === goalId);
    if (!goal) return;

    const updatedMilestones = goal.milestones.map(m => 
      m.id === milestoneId 
        ? { ...m, completed: !m.completed, completedDate: !m.completed ? new Date() : undefined }
        : m
    );

    const completedMilestones = updatedMilestones.filter(m => m.completed).length;
    const progress = Math.round((completedMilestones / updatedMilestones.length) * 100);

    const updatedGoal = {
      ...goal,
      milestones: updatedMilestones,
      progress: updatedMilestones.length > 0 ? progress : 0,
      status: progress === 100 ? 'completed' as const : goal.status
    };

    dispatch({ type: 'UPDATE_GOAL', payload: updatedGoal });
  };

  const updateGoalStatus = (goal: Goal, status: 'active' | 'completed' | 'paused') => {
    dispatch({ type: 'UPDATE_GOAL', payload: { ...goal, status } });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'personal',
      targetDate: '',
      priority: 'medium'
    });
    setEditingGoal(null);
    setShowModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-blue-600 bg-blue-50';
      case 'completed': return 'text-green-600 bg-green-50';
      case 'paused': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'academic': return Icons.GraduationCap;
      case 'professional': return Icons.Briefcase;
      case 'personal': return Icons.User;
      default: return Icons.Target;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Goals</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow"
        >
          <Icons.Plus className="h-4 w-4 mr-2 inline" />
          New Goal
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Icons.Target className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Goals</p>
              <p className="text-2xl font-bold text-blue-600">{state.goals.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-xl">
              <Icons.CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {state.goals.filter(g => g.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-50 rounded-xl">
              <Icons.Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-orange-600">
                {state.goals.filter(g => g.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 rounded-xl">
              <Icons.TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Progress</p>
              <p className="text-2xl font-bold text-purple-600">
                {Math.round(state.goals.reduce((acc, g) => acc + g.progress, 0) / state.goals.length || 0)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex bg-white/80 backdrop-blur-sm rounded-lg p-1 border border-gray-200/50">
          {['all', 'active', 'completed', 'paused'].map((f) => (
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
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as any)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          <option value="academic">Academic</option>
          <option value="professional">Professional</option>
          <option value="personal">Personal</option>
        </select>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGoals.map((goal) => {
          const TypeIcon = getTypeIcon(goal.type);
          const daysLeft = Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          
          return (
            <div
              key={goal.id}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedGoal(goal)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <TypeIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{goal.title}</h3>
                    <p className="text-sm text-gray-600 capitalize">{goal.type}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                    {goal.status}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(goal.priority)}`}>
                    {goal.priority}
                  </span>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{goal.description}</p>

              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{goal.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Icons.Flag className="h-4 w-4" />
                  {goal.milestones.filter(m => m.completed).length}/{goal.milestones.length} milestones
                </span>
                <span className={`flex items-center gap-1 ${daysLeft < 0 ? 'text-red-500' : daysLeft < 7 ? 'text-orange-500' : ''}`}>
                  <Icons.Calendar className="h-4 w-4" />
                  {daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`}
                </span>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingGoal(goal);
                    setFormData({
                      title: goal.title,
                      description: goal.description,
                      type: goal.type,
                      targetDate: goal.targetDate.toISOString().split('T')[0],
                      priority: goal.priority
                    });
                    setShowModal(true);
                  }}
                  className="p-1 text-gray-400 hover:text-blue-500 rounded"
                >
                  <Icons.Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch({ type: 'DELETE_GOAL', payload: goal.id });
                  }}
                  className="p-1 text-gray-400 hover:text-red-500 rounded"
                >
                  <Icons.Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Goal Detail Modal */}
      {selectedGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 rounded-xl">
                  {React.createElement(getTypeIcon(selectedGoal.type), { className: "h-6 w-6 text-blue-600" })}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedGoal.title}</h2>
                  <p className="text-gray-600 capitalize">{selectedGoal.type} Goal</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedGoal(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Icons.X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-4">{selectedGoal.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Progress</h4>
                  <div className="text-2xl font-bold text-blue-600">{selectedGoal.progress}%</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      style={{ width: `${selectedGoal.progress}%` }}
                    />
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Target Date</h4>
                  <div className="text-lg font-semibold text-gray-900">
                    {new Date(selectedGoal.targetDate).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {Math.ceil((new Date(selectedGoal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => updateGoalStatus(selectedGoal, 'active')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedGoal.status === 'active'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Mark Active
                </button>
                <button
                  onClick={() => updateGoalStatus(selectedGoal, 'completed')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedGoal.status === 'completed'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Mark Completed
                </button>
                <button
                  onClick={() => updateGoalStatus(selectedGoal, 'paused')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedGoal.status === 'paused'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Pause Goal
                </button>
              </div>
            </div>

            {/* Milestones */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Milestones</h3>
              
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={milestoneForm.title}
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                    placeholder="Add new milestone..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="date"
                    value={milestoneForm.dueDate}
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, dueDate: e.target.value })}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => addMilestone(selectedGoal.id)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {selectedGoal.milestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      milestone.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                    }`}
                  >
                    <button
                      onClick={() => toggleMilestone(selectedGoal.id, milestone.id)}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        milestone.completed 
                          ? 'bg-green-500 border-green-500' 
                          : 'border-gray-300 hover:border-green-500'
                      }`}
                    >
                      {milestone.completed && (
                        <Icons.Check className="h-3 w-3 text-white" />
                      )}
                    </button>
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        milestone.completed ? 'line-through text-gray-500' : 'text-gray-900'
                      }`}>
                        {milestone.title}
                      </h4>
                      {milestone.dueDate && (
                        <p className="text-sm text-gray-600">
                          Due: {new Date(milestone.dueDate).toLocaleDateString()}
                        </p>
                      )}
                      {milestone.completedDate && (
                        <p className="text-sm text-green-600">
                          Completed: {new Date(milestone.completedDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {selectedGoal.milestones.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No milestones yet. Add one above!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingGoal ? 'Edit Goal' : 'New Goal'}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="personal">Personal</option>
                    <option value="academic">Academic</option>
                    <option value="professional">Professional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Date</label>
                <input
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-lg hover:shadow-lg transition-shadow"
                >
                  {editingGoal ? 'Update Goal' : 'Create Goal'}
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

export default Goals;