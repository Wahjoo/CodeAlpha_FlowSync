import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await api.get('/tasks/all');
        setTasks(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const getPriorityStyles = (priority, dueDate) => {
    if (dueDate && new Date(dueDate) < new Date()) {
      return { class: "bg-error-container text-on-error-container", label: "Overdue" };
    }
    switch(priority) {
      case 'HIGH': return { class: "bg-secondary-fixed text-on-secondary-fixed-variant", label: "High Priority" };
      case 'MEDIUM': return { class: "bg-surface-variant text-on-surface-variant", label: "Medium Priority" };
      case 'LOW': return { class: "bg-surface-container text-on-tertiary-container", label: "Low Priority" };
      default: return { class: "bg-surface-variant text-on-surface-variant", label: "Task" };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const upcomingTasks = tasks
    .filter(t => t.dueDate && new Date(t.dueDate) >= new Date())
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 3);

  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 3);

  const completionVelocity = (tasks.length / 7).toFixed(1);

  // Group tasks by project
  const projectStats = tasks.reduce((acc, task) => {
    const pName = task.project?.name || 'Unknown Project';
    if (!acc[pName]) acc[pName] = 0;
    acc[pName]++;
    return acc;
  }, {});

  if (loading) return <div className="p-10 max-w-7xl mx-auto w-full flex-1">Loading tasks...</div>;

  return (
    <div className="p-8 w-full">
      <div className="max-w-7xl mx-auto space-y-stack-lg">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Task Overview</h2>
            <p className="text-on-surface-variant mt-1">Manage and track your team's workflow momentum.</p>
          </div>
          <div className="flex bg-surface-container p-1 rounded-xl overflow-x-auto max-w-full custom-scrollbar pb-1">
            <button className="px-4 py-1.5 rounded-lg bg-surface-container-lowest shadow-sm font-label-md text-secondary transition-all whitespace-nowrap">All Tasks</button>
            <button className="px-4 py-1.5 rounded-lg font-label-md text-on-surface-variant hover:text-on-surface transition-all whitespace-nowrap">To Do</button>
            <button className="px-4 py-1.5 rounded-lg font-label-md text-on-surface-variant hover:text-on-surface transition-all whitespace-nowrap">In Progress</button>
            <button className="px-4 py-1.5 rounded-lg font-label-md text-on-surface-variant hover:text-on-surface transition-all whitespace-nowrap">Done</button>
          </div>
        </div>

        {/* Bento Layout Content */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">
          {/* Main Tasks Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Task Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tasks.map(task => {
                const pStyle = getPriorityStyles(task.priority, task.dueDate);
                return (
                  <div key={task._id} className="bg-surface-container-lowest p-5 rounded-xl border-l-4 border-secondary shadow-sm hover:-translate-y-1 hover:shadow-md transition-all group cursor-pointer">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`${pStyle.class} px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider`}>
                        {pStyle.label}
                      </span>
                      <i className="fa-solid fa-ellipsis-vertical text-on-surface-variant text-lg opacity-0 group-hover:opacity-100 transition-opacity"></i>
                    </div>
                    <h3 className="font-headline-md text-on-surface group-hover:text-secondary transition-colors">{task.title}</h3>
                    <p className="text-body-md text-on-surface-variant mt-2 line-clamp-2">{task.description}</p>
                    <div className="mt-4 pt-4 border-t border-outline-variant/30 flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {task.assignee && (
                          <img alt={task.assignee.name} className="w-7 h-7 rounded-full border-2 border-surface-container-lowest bg-surface-container" src={task.assignee.avatarUrl || `https://openui.fly.dev/openui/80x80.svg?text=${task.assignee.name.charAt(0)}`} />
                        )}
                      </div>
                      <div className={`flex items-center gap-1.5 ${pStyle.label === 'Overdue' ? 'text-error' : 'text-on-surface-variant'}`}>
                        <i className={`fa-regular ${pStyle.label === 'Overdue' ? 'fa-clock' : 'fa-calendar'} text-[14px]`}></i>
                        <span className="text-label-sm">{formatDate(task.dueDate)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar Content (Upcoming & Success Log) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Upcoming Tasks */}
            <section className="bg-surface-container-low p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <i className="fa-regular fa-calendar text-secondary text-xl"></i>
                <h4 className="font-headline-md text-on-surface">Upcoming</h4>
              </div>
              <div className="space-y-4">
                {upcomingTasks.length === 0 ? (
                  <p className="text-label-sm text-on-surface-variant">No upcoming tasks scheduled.</p>
                ) : (
                  upcomingTasks.map(t => {
                    const d = new Date(t.dueDate);
                    return (
                      <div key={t._id} className="flex gap-4 group cursor-pointer">
                        <div className="flex flex-col items-center">
                          <span className="text-label-sm font-bold text-secondary">{d.getDate()}</span>
                          <span className="text-[10px] uppercase font-bold text-on-surface-variant">
                            {d.toLocaleString('default', { month: 'short' })}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <p className="font-label-md text-on-surface group-hover:text-secondary transition-colors line-clamp-1">{t.title}</p>
                          <p className="text-label-sm text-on-surface-variant">{t.project?.name || 'Workspace'}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <button className="w-full py-2 text-label-md text-secondary border border-secondary/20 rounded-lg hover:bg-secondary/5 transition-colors cursor-pointer">View Calendar</button>
              </div>
            </section>

            {/* Success Log */}
            <section className="bg-primary-container p-6 rounded-2xl shadow-lg relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-secondary opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="flex items-center gap-2 mb-4 relative z-10">
                <i className="fa-solid fa-circle-check text-on-secondary text-xl"></i>
                <h4 className="font-headline-md text-on-secondary">Success Log</h4>
              </div>
              <div className="space-y-4 relative z-10">
                {recentTasks.length === 0 ? (
                  <p className="text-label-sm text-on-primary-container">No recent activity.</p>
                ) : (
                  recentTasks.map((t, idx) => (
                    <div key={t._id} className={`flex items-start gap-3 ${idx > 0 ? `opacity-${100 - idx*20}` : ''}`}>
                      <div className={`mt-1 w-2 h-2 rounded-full ${idx === 0 ? 'bg-secondary shadow-[0_0_8px_rgba(49,107,243,0.8)]' : 'bg-secondary/50'}`}></div>
                      <div className="space-y-1">
                        <p className="text-label-md text-on-secondary line-clamp-1">{t.title}</p>
                        <p className="text-[11px] text-on-primary-container">{formatDate(t.updatedAt)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-6 pt-4 border-t border-on-primary-container/20 relative z-10">
                <div className="flex justify-between items-center text-on-secondary mb-2">
                  <span className="text-label-sm">Weekly Goal Momentum</span>
                  <span className="text-label-sm font-bold">84%</span>
                </div>
                <div className="h-1.5 w-full bg-on-primary-container/20 rounded-full">
                  <div className="h-full bg-secondary rounded-full shadow-[0_0_10px_rgba(49,107,243,0.4)]" style={{width: '84%'}}></div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Task Progress Asymmetric Layout */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-12">
          <div className="col-span-1 md:col-span-12">
            <h4 className="font-headline-md text-on-surface mb-4">Productivity Pulse</h4>
          </div>
          
          <div className="col-span-1 md:col-span-4 bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10">
            <div className="text-on-surface-variant text-label-md mb-2">Completion Velocity</div>
            <div className="text-[40px] font-bold text-on-surface leading-none">{completionVelocity} <span className="text-secondary text-label-md">tasks/day</span></div>
            <p className="text-label-sm text-secondary mt-4 flex items-center gap-1">
              <i className="fa-solid fa-arrow-trend-up text-[14px]"></i> 14% increase from last week
            </p>
          </div>
          
          <div className="col-span-1 md:col-span-8 bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10 flex items-center justify-between">
            <div className="space-y-4 flex-1 pr-12 max-h-32 overflow-y-auto custom-scrollbar">
              {Object.keys(projectStats).length === 0 ? (
                <p className="text-label-sm text-on-surface-variant">No project data available.</p>
              ) : (
                Object.entries(projectStats).slice(0, 3).map(([pName, count], idx) => {
                  // Generate visual variation for progress
                  const pct = Math.min(100, Math.max(10, count * 15));
                  const bgColors = ['bg-secondary', 'bg-on-tertiary-container', 'bg-error'];
                  return (
                    <div key={pName}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-label-sm font-bold text-on-surface">{pName}</span>
                        <span className="text-label-sm text-on-surface-variant">{count} tasks</span>
                      </div>
                      <div className="h-2 w-full bg-surface-container rounded-full">
                        <div className={`h-full ${bgColors[idx % bgColors.length]} rounded-full`} style={{width: `${pct}%`}}></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="w-[1px] h-12 bg-outline-variant/20 mx-6"></div>
            <div className="flex flex-col items-center px-4">
              <div className="w-12 h-12 rounded-full border-4 border-secondary border-t-transparent animate-spin flex items-center justify-center">
                <span className="text-secondary font-bold text-[10px]">SYNC</span>
              </div>
              <span className="text-[10px] text-on-surface-variant mt-2 text-center uppercase tracking-tighter">Live<br/>Optimization</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Tasks;
