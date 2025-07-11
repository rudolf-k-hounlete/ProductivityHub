import React from 'react';
import { useApp } from '../../context/AppContext';
import * as Icons from 'lucide-react';

const Dashboard: React.FC = () => {
  const { state } = useApp();

  const stats = [
    {
      title: 'Total Tasks',
      value: state.tasks.length,
      change: '+12%',
      icon: 'CheckSquare',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Projects',
      value: state.projects.filter(p => p.status === 'active').length,
      change: '+8%',
      icon: 'Briefcase',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Notes',
      value: state.notes.length,
      change: '+15%',
      icon: 'FileText',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Goals Progress',
      value: `${Math.round(state.goals.reduce((acc, goal) => acc + goal.progress, 0) / state.goals.length || 0)}%`,
      change: '+5%',
      icon: 'Target',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  const recentActivities = [
    { id: 1, type: 'task', action: 'Completed', item: 'Review project proposal', time: '2 hours ago' },
    { id: 2, type: 'note', action: 'Created', item: 'Meeting notes for Q4 planning', time: '4 hours ago' },
    { id: 3, type: 'project', action: 'Updated', item: 'Website redesign project', time: '1 day ago' },
    { id: 4, type: 'goal', action: 'Achieved milestone', item: 'Learn React hooks', time: '2 days ago' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const IconComponent = (Icons as any)[stat.icon];
          return (
            <div
              key={stat.title}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <IconComponent className={`h-6 w-6 ${stat.color}`} />
                </div>
                <span className="text-sm font-medium text-green-600">{stat.change}</span>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activities */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50/50 transition-colors">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {activity.action} <span className="text-gray-600">{activity.item}</span>
                </p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => dispatch({ type: 'SET_ACTIVE_MODULE', payload: 'tasks' })}
            className="p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors text-center"
          >
            <Icons.Plus className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-blue-600">New Task</span>
          </button>
          <button 
            onClick={() => dispatch({ type: 'SET_ACTIVE_MODULE', payload: 'projects' })}
            className="p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors text-center"
          >
            <Icons.FolderPlus className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-purple-600">New Project</span>
          </button>
          <button 
            onClick={() => dispatch({ type: 'SET_ACTIVE_MODULE', payload: 'notes' })}
            className="p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors text-center"
          >
            <Icons.PenTool className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-green-600">New Note</span>
          </button>
          <button 
            onClick={() => dispatch({ type: 'SET_ACTIVE_MODULE', payload: 'calendar' })}
            className="p-4 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors text-center"
          >
            <Icons.Calendar className="h-6 w-6 text-orange-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-orange-600">New Event</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;