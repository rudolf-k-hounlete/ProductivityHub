import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Project, Task } from '../../types';
import * as Icons from 'lucide-react';

const Projects: React.FC = () => {
  const { state, dispatch } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'paused'>('all');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    deadline: ''
  });

  const filteredProjects = state.projects.filter(project => {
    return filter === 'all' || project.status === filter;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const projectData: Project = {
      id: editingProject?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      color: formData.color,
      progress: editingProject?.progress || 0,
      tasks: editingProject?.tasks || [],
      createdAt: editingProject?.createdAt || new Date(),
      deadline: formData.deadline ? new Date(formData.deadline) : undefined,
      status: editingProject?.status || 'active'
    };

    if (editingProject) {
      dispatch({ type: 'UPDATE_PROJECT', payload: projectData });
    } else {
      dispatch({ type: 'ADD_PROJECT', payload: projectData });
    }

    setFormData({ name: '', description: '', color: '#3B82F6', deadline: '' });
    setEditingProject(null);
    setShowModal(false);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      color: project.color,
      deadline: project.deadline ? project.deadline.toISOString().split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleDelete = (projectId: string) => {
    dispatch({ type: 'DELETE_PROJECT', payload: projectId });
    if (selectedProject?.id === projectId) {
      setSelectedProject(null);
    }
  };

  const updateProjectStatus = (project: Project, status: 'active' | 'completed' | 'paused') => {
    dispatch({ type: 'UPDATE_PROJECT', payload: { ...project, status } });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-blue-600 bg-blue-50';
      case 'completed': return 'text-green-600 bg-green-50';
      case 'paused': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const calculateProgress = (project: Project) => {
    if (project.tasks.length === 0) return 0;
    const completedTasks = project.tasks.filter(task => task.completed).length;
    return Math.round((completedTasks / project.tasks.length) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow"
        >
          <Icons.Plus className="h-4 w-4 mr-2 inline" />
          New Project
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Icons.Briefcase className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Projects</p>
              <p className="text-xl font-bold text-gray-900">{state.projects.length}</p>
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
                {state.projects.filter(p => p.status === 'completed').length}
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
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-xl font-bold text-gray-900">
                {state.projects.filter(p => p.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Icons.Target className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Progress</p>
              <p className="text-xl font-bold text-gray-900">
                {Math.round(state.projects.reduce((acc, p) => acc + calculateProgress(p), 0) / state.projects.length || 0)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex bg-white/80 backdrop-blur-sm rounded-lg p-1 border border-gray-200/50 w-fit">
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

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => {
          const progress = calculateProgress(project);
          return (
            <div
              key={project.id}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedProject(project)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                    {project.name}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(project);
                      }}
                      className="p-1 text-gray-400 hover:text-blue-500 rounded"
                    >
                      <Icons.Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(project.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-500 rounded"
                    >
                      <Icons.Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {project.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {project.description}
                </p>
              )}

              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: project.color
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Icons.CheckSquare className="h-4 w-4" />
                  {project.tasks.filter(t => t.completed).length}/{project.tasks.length} tasks
                </span>
                {project.deadline && (
                  <span className="flex items-center gap-1">
                    <Icons.Calendar className="h-4 w-4" />
                    {new Date(project.deadline).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: selectedProject.color }}
                />
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedProject.name}
                </h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedProject.status)}`}>
                  {selectedProject.status}
                </span>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Icons.X className="h-5 w-5" />
              </button>
            </div>

            {selectedProject.description && (
              <p className="text-gray-600 mb-6">{selectedProject.description}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Progress</h4>
                <div className="text-2xl font-bold" style={{ color: selectedProject.color }}>
                  {calculateProgress(selectedProject)}%
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Tasks</h4>
                <div className="text-2xl font-bold text-gray-900">
                  {selectedProject.tasks.filter(t => t.completed).length}/{selectedProject.tasks.length}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Deadline</h4>
                <div className="text-sm text-gray-600">
                  {selectedProject.deadline 
                    ? new Date(selectedProject.deadline).toLocaleDateString()
                    : 'No deadline set'
                  }
                </div>
              </div>
            </div>

            <div className="flex gap-3 mb-6">
              <button
                onClick={() => updateProjectStatus(selectedProject, 'active')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedProject.status === 'active'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Mark Active
              </button>
              <button
                onClick={() => updateProjectStatus(selectedProject, 'completed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedProject.status === 'completed'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Mark Completed
              </button>
              <button
                onClick={() => updateProjectStatus(selectedProject, 'paused')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedProject.status === 'paused'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pause Project
              </button>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Tasks</h3>
              <div className="space-y-3">
                {selectedProject.tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      task.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      task.completed 
                        ? 'bg-green-500 border-green-500' 
                        : 'border-gray-300'
                    }`}>
                      {task.completed && (
                        <Icons.Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        task.completed ? 'line-through text-gray-500' : 'text-gray-900'
                      }`}>
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-sm text-gray-600">{task.description}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      task.priority === 'high' ? 'text-red-600 bg-red-50' :
                      task.priority === 'medium' ? 'text-yellow-600 bg-yellow-50' :
                      'text-green-600 bg-green-50'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
                {selectedProject.tasks.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No tasks in this project yet.</p>
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
                {editingProject ? 'Edit Project' : 'New Project'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingProject(null);
                  setFormData({ name: '', description: '', color: '#3B82F6', deadline: '' });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Icons.X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  Deadline
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-lg hover:shadow-lg transition-shadow"
                >
                  {editingProject ? 'Update Project' : 'Create Project'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProject(null);
                    setFormData({ name: '', description: '', color: '#3B82F6', deadline: '' });
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

export default Projects;