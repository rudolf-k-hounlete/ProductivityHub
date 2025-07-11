import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import * as Icons from 'lucide-react';

const Planning: React.FC = () => {
  const { state } = useApp();
  const [activeView, setActiveView] = useState<'overview' | 'weekly' | 'monthly' | 'yearly'>('overview');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const getUpcomingTasks = () => {
    return state.tasks
      .filter(task => !task.completed && task.dueDate)
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 5);
  };

  const getUpcomingEvents = () => {
    return state.events
      .filter(event => new Date(event.start) >= new Date())
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
      .slice(0, 5);
  };

  const getActiveGoals = () => {
    return state.goals.filter(goal => goal.status === 'active').slice(0, 3);
  };

  const getWeeklyOverview = () => {
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      
      const dayTasks = state.tasks.filter(task => 
        task.dueDate && 
        new Date(task.dueDate).toDateString() === day.toDateString()
      );
      
      const dayEvents = state.events.filter(event => 
        new Date(event.start).toDateString() === day.toDateString()
      );
      
      weekDays.push({
        date: day,
        tasks: dayTasks,
        events: dayEvents
      });
    }
    
    return weekDays;
  };

  const getMonthlyStats = () => {
    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();
    
    const monthlyTasks = state.tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate.getMonth() === currentMonth && taskDate.getFullYear() === currentYear;
    });
    
    const monthlyEvents = state.events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
    });
    
    const completedTasks = monthlyTasks.filter(task => task.completed).length;
    const completionRate = monthlyTasks.length > 0 ? (completedTasks / monthlyTasks.length) * 100 : 0;
    
    return {
      totalTasks: monthlyTasks.length,
      completedTasks,
      completionRate: Math.round(completionRate),
      totalEvents: monthlyEvents.length
    };
  };

  const getYearlyProgress = () => {
    const currentYear = selectedDate.getFullYear();
    
    const yearlyGoals = state.goals.filter(goal => 
      new Date(goal.targetDate).getFullYear() === currentYear
    );
    
    const completedGoals = yearlyGoals.filter(goal => goal.status === 'completed').length;
    const averageProgress = yearlyGoals.length > 0 
      ? yearlyGoals.reduce((sum, goal) => sum + goal.progress, 0) / yearlyGoals.length 
      : 0;
    
    const yearlyTasks = state.tasks.filter(task => {
      if (!task.createdAt) return false;
      return new Date(task.createdAt).getFullYear() === currentYear;
    });
    
    const completedYearlyTasks = yearlyTasks.filter(task => task.completed).length;
    
    return {
      totalGoals: yearlyGoals.length,
      completedGoals,
      averageProgress: Math.round(averageProgress),
      totalTasks: yearlyTasks.length,
      completedTasks: completedYearlyTasks
    };
  };

  const upcomingTasks = getUpcomingTasks();
  const upcomingEvents = getUpcomingEvents();
  const activeGoals = getActiveGoals();
  const weeklyData = getWeeklyOverview();
  const monthlyStats = getMonthlyStats();
  const yearlyProgress = getYearlyProgress();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Planning</h1>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex bg-white/80 backdrop-blur-sm rounded-lg p-1 border border-gray-200/50 w-fit">
        {['overview', 'weekly', 'monthly', 'yearly'].map((view) => (
          <button
            key={view}
            onClick={() => setActiveView(view as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === view
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Tasks */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
            <div className="flex items-center gap-3 mb-4">
              <Icons.CheckSquare className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h3>
            </div>
            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${
                    task.priority === 'high' ? 'bg-red-500' :
                    task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                    <p className="text-xs text-gray-600">
                      Due: {new Date(task.dueDate!).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {upcomingTasks.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">No upcoming tasks</p>
              )}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
            <div className="flex items-center gap-3 mb-4">
              <Icons.Calendar className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
            </div>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: event.color }}
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">{event.title}</h4>
                    <p className="text-xs text-gray-600">
                      {new Date(event.start).toLocaleDateString()} at{' '}
                      {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {upcomingEvents.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">No upcoming events</p>
              )}
            </div>
          </div>

          {/* Active Goals */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
            <div className="flex items-center gap-3 mb-4">
              <Icons.Target className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Active Goals</h3>
            </div>
            <div className="space-y-3">
              {activeGoals.map((goal) => (
                <div key={goal.id} className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 text-sm mb-2">{goal.title}</h4>
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              ))}
              {activeGoals.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">No active goals</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Weekly View */}
      {activeView === 'weekly' && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Week of {weeklyData[0]?.date.toLocaleDateString()}
          </h3>
          <div className="grid grid-cols-7 gap-4">
            {weeklyData.map((day, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3">
                <div className="text-center mb-3">
                  <h4 className="font-medium text-gray-900 text-sm">
                    {day.date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </h4>
                  <p className="text-xs text-gray-600">{day.date.getDate()}</p>
                </div>
                <div className="space-y-2">
                  {day.tasks.slice(0, 2).map((task) => (
                    <div key={task.id} className="bg-blue-50 p-2 rounded text-xs">
                      <p className="font-medium text-blue-800 truncate">{task.title}</p>
                    </div>
                  ))}
                  {day.events.slice(0, 2).map((event) => (
                    <div key={event.id} className="bg-purple-50 p-2 rounded text-xs">
                      <p className="font-medium text-purple-800 truncate">{event.title}</p>
                    </div>
                  ))}
                  {(day.tasks.length + day.events.length) > 4 && (
                    <p className="text-xs text-gray-500">+{(day.tasks.length + day.events.length) - 4} more</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly View */}
      {activeView === 'monthly' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <Icons.CheckSquare className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Tasks This Month</p>
                  <p className="text-2xl font-bold text-blue-600">{monthlyStats.totalTasks}</p>
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
                  <p className="text-2xl font-bold text-green-600">{monthlyStats.completedTasks}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-50 rounded-xl">
                  <Icons.TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-purple-600">{monthlyStats.completionRate}%</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-50 rounded-xl">
                  <Icons.Calendar className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Events</p>
                  <p className="text-2xl font-bold text-orange-600">{monthlyStats.totalEvents}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Task Progress</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Completed</span>
                    <span>{monthlyStats.completedTasks}/{monthlyStats.totalTasks}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                      style={{ width: `${monthlyStats.completionRate}%` }}
                    />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Monthly Insights</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• {monthlyStats.totalEvents} events scheduled</p>
                  <p>• {monthlyStats.completionRate}% task completion rate</p>
                  <p>• {monthlyStats.totalTasks - monthlyStats.completedTasks} tasks remaining</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Yearly View */}
      {activeView === 'yearly' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <Icons.Target className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Goals This Year</p>
                  <p className="text-2xl font-bold text-blue-600">{yearlyProgress.totalGoals}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-50 rounded-xl">
                  <Icons.Award className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed Goals</p>
                  <p className="text-2xl font-bold text-green-600">{yearlyProgress.completedGoals}</p>
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
                  <p className="text-2xl font-bold text-purple-600">{yearlyProgress.averageProgress}%</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-50 rounded-xl">
                  <Icons.CheckSquare className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Tasks Completed</p>
                  <p className="text-2xl font-bold text-orange-600">{yearlyProgress.completedTasks}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedDate.getFullYear()} Year in Review
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Goal Achievement</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Goals Completed</span>
                    <span>{yearlyProgress.completedGoals}/{yearlyProgress.totalGoals}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                      style={{ 
                        width: `${yearlyProgress.totalGoals > 0 ? (yearlyProgress.completedGoals / yearlyProgress.totalGoals) * 100 : 0}%` 
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Average Progress</span>
                    <span>{yearlyProgress.averageProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                      style={{ width: `${yearlyProgress.averageProgress}%` }}
                    />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Productivity Summary</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• {yearlyProgress.totalTasks} total tasks created</p>
                  <p>• {yearlyProgress.completedTasks} tasks completed</p>
                  <p>• {yearlyProgress.totalGoals} goals set for the year</p>
                  <p>• {yearlyProgress.averageProgress}% average goal progress</p>
                  <p>• {Math.round((yearlyProgress.completedTasks / yearlyProgress.totalTasks) * 100) || 0}% task completion rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Planning;