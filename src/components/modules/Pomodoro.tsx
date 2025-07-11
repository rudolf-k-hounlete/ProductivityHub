import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PomodoroSession } from '../../types';
import * as Icons from 'lucide-react';

const Pomodoro: React.FC = () => {
  const { state, dispatch } = useApp();
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState<'work' | 'break' | 'longBreak'>('work');
  const [completedSessions, setCompletedSessions] = useState(0);
  const [settings, setSettings] = useState({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    autoStartBreaks: false,
    autoStartWork: false,
    soundEnabled: true,
    notifications: true
  });
  const [selectedTask, setSelectedTask] = useState<string>('');

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSessionComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const handleSessionComplete = () => {
    setIsActive(false);
    
    // Create session record
    const session: PomodoroSession = {
      id: Date.now().toString(),
      duration: getDurationInMinutes(),
      type: sessionType,
      startTime: new Date(Date.now() - (getDurationInMinutes() * 60 * 1000)),
      endTime: new Date(),
      completed: true,
      taskId: selectedTask || undefined
    };

    dispatch({ type: 'ADD_POMODORO_SESSION', payload: session });

    if (sessionType === 'work') {
      setCompletedSessions(prev => prev + 1);
      const shouldTakeLongBreak = (completedSessions + 1) % settings.longBreakInterval === 0;
      
      if (shouldTakeLongBreak) {
        setSessionType('longBreak');
        setTimeLeft(settings.longBreakDuration * 60);
      } else {
        setSessionType('break');
        setTimeLeft(settings.shortBreakDuration * 60);
      }
      
      if (settings.autoStartBreaks) {
        setIsActive(true);
      }
    } else {
      setSessionType('work');
      setTimeLeft(settings.workDuration * 60);
      
      if (settings.autoStartWork) {
        setIsActive(true);
      }
    }

    // Play sound notification
    if (settings.soundEnabled) {
      // Play notification sound
      const audio = new Audio();
      audio.play().catch(() => {
        // Silently fail if audio can't play
      });
    }

    // Show browser notification
    if (settings.notifications && 'Notification' in window) {
      new Notification(`${sessionType === 'work' ? 'Work' : 'Break'} session completed!`, {
        body: `Time for a ${sessionType === 'work' ? 'break' : 'work session'}`,
        icon: '/favicon.ico'
      });
    }
  };

  const getDurationInMinutes = () => {
    switch (sessionType) {
      case 'work':
        return settings.workDuration;
      case 'break':
        return settings.shortBreakDuration;
      case 'longBreak':
        return settings.longBreakDuration;
      default:
        return 25;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionColor = () => {
    switch (sessionType) {
      case 'work':
        return 'text-blue-600 bg-blue-50';
      case 'break':
        return 'text-green-600 bg-green-50';
      case 'longBreak':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const startTimer = () => {
    setIsActive(true);
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(getDurationInMinutes() * 60);
  };

  const skipSession = () => {
    setTimeLeft(0);
  };

  const progress = ((getDurationInMinutes() * 60 - timeLeft) / (getDurationInMinutes() * 60)) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Pomodoro Timer</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sessions completed:</span>
          <span className="text-lg font-bold text-blue-600">{completedSessions}</span>
        </div>
      </div>

      {/* Main Timer */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 shadow-sm text-center">
        <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium mb-6 ${getSessionColor()}`}>
          {sessionType === 'work' ? 'Work Session' : 
           sessionType === 'break' ? 'Short Break' : 'Long Break'}
        </div>
        
        <div className="relative w-64 h-64 mx-auto mb-6">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="2"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-gray-600">
                {Math.round(progress)}% complete
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          {sessionType === 'work' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Working on (optional):
              </label>
              <select
                value={selectedTask}
                onChange={(e) => setSelectedTask(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a task...</option>
                {state.tasks.filter(task => !task.completed).map(task => (
                  <option key={task.id} value={task.id}>{task.title}</option>
                ))}
              </select>
            </div>
          )}

          {!isActive ? (
            <button
              onClick={startTimer}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-shadow flex items-center gap-2"
            >
              <Icons.Play className="h-5 w-5" />
              Start
            </button>
          ) : (
            <button
              onClick={pauseTimer}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-shadow flex items-center gap-2"
            >
              <Icons.Pause className="h-5 w-5" />
              Pause
            </button>
          )}
          
          <button
            onClick={resetTimer}
            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-shadow flex items-center gap-2"
          >
            <Icons.RotateCcw className="h-5 w-5" />
            Reset
          </button>
          
          <button
            onClick={skipSession}
            className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:shadow-lg transition-shadow flex items-center gap-2"
          >
            <Icons.SkipForward className="h-5 w-5" />
            Skip
          </button>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Work Duration (minutes)
            </label>
            <input
              type="number"
              value={settings.workDuration}
              onChange={(e) => setSettings({...settings, workDuration: parseInt(e.target.value)})}
              min="1"
              max="60"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Short Break (minutes)
            </label>
            <input
              type="number"
              value={settings.shortBreakDuration}
              onChange={(e) => setSettings({...settings, shortBreakDuration: parseInt(e.target.value)})}
              min="1"
              max="30"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Long Break (minutes)
            </label>
            <input
              type="number"
              value={settings.longBreakDuration}
              onChange={(e) => setSettings({...settings, longBreakDuration: parseInt(e.target.value)})}
              min="1"
              max="60"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Long Break Interval
            </label>
            <input
              type="number"
              value={settings.longBreakInterval}
              onChange={(e) => setSettings({...settings, longBreakInterval: parseInt(e.target.value)})}
              min="2"
              max="10"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="mt-4 space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.autoStartBreaks}
              onChange={(e) => setSettings({...settings, autoStartBreaks: e.target.checked})}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Auto-start breaks</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.autoStartWork}
              onChange={(e) => setSettings({...settings, autoStartWork: e.target.checked})}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Auto-start work sessions</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => setSettings({...settings, soundEnabled: e.target.checked})}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Enable sound notifications</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Enable browser notifications</span>
          </label>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Statistics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{completedSessions}</div>
            <div className="text-sm text-gray-600">Completed Sessions</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{completedSessions * settings.workDuration}</div>
            <div className="text-sm text-gray-600">Minutes Focused</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.floor(completedSessions / settings.longBreakInterval)}
            </div>
            <div className="text-sm text-gray-600">Long Breaks Taken</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {state.pomodoroSessions?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Total Sessions</div>
          </div>
        </div>
        
        {state.pomodoroSessions && state.pomodoroSessions.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-3">Recent Sessions</h4>
            <div className="space-y-2">
              {state.pomodoroSessions
                .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                .slice(0, 5)
                .map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        session.type === 'work' ? 'bg-blue-500' : 
                        session.type === 'break' ? 'bg-green-500' : 'bg-purple-500'
                      }`} />
                      <span className="text-sm font-medium capitalize">{session.type}</span>
                      {session.taskId && (
                        <span className="text-xs text-gray-500">
                          - {state.tasks.find(t => t.id === session.taskId)?.title}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(session.startTime).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pomodoro;