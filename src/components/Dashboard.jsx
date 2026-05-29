import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';

const Dashboard = ({ 
  projects, 
  users = [],
  onSelectProject, 
  onOpenCreateProject,
  notifications,
  showNotifications,
  setShowNotifications,
  onReadNotification,
  onReadAllNotifications
}) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await api.get('/tasks/analytics/workspace');
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to fetch analytics', error);
      }
    };
    fetchAnalytics();
  }, []);

  // Filter projects by search
  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2);
  };

  // Determine progress offsets for progress-ring circle (radius = 24, circumference = 150.8)
  const getStrokeOffset = (percentage) => {
    const circumference = 150.8;
    return circumference - (percentage / 100) * circumference;
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex-1 min-h-screen bg-background text-on-surface">
      {/* TopNavBar */}
      <header className="flex items-center justify-between px-gutter-mobile md:px-stack-lg sticky top-0 z-50 w-full bg-surface-container-lowest shadow-sm h-16">
        <div className="flex items-center gap-2 md:gap-stack-lg flex-1 mr-2 md:mr-0">
          <div className="relative w-full max-w-md">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"></i>
            <input 
              className="bg-surface-container-low border-none rounded-full pl-10 pr-4 py-2 text-body-md w-full focus:ring-2 focus:ring-secondary/20 transition-all text-on-surface outline-none" 
              placeholder="Search workspace..." 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-stack-md relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors duration-200 active:scale-95 relative cursor-pointer"
          >
            <i className="fa-solid fa-bell text-lg"></i>
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute top-12 right-0 w-80 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-lg z-50 p-4 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-outline-variant/10">
                <h4 className="font-semibold text-sm">Notifications</h4>
                {unreadCount > 0 && (
                  <button onClick={onReadAllNotifications} className="text-xs text-secondary hover:underline font-bold">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <p className="text-xs text-on-surface-variant text-center py-4">No notifications yet.</p>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n._id} 
                      className={`p-2 rounded-lg text-xs cursor-pointer hover:bg-surface-container-low transition-colors ${!n.read ? 'bg-secondary-container/5 font-semibold' : ''}`}
                      onClick={() => onReadNotification(n._id)}
                    >
                      <p className="text-on-surface">{n.title}</p>
                      <p className="text-on-surface-variant font-normal mt-0.5">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <button className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors duration-200 active:scale-95 cursor-pointer">
            <i className="fa-solid fa-circle-info text-lg"></i>
          </button>
          
          <div className="hidden md:block h-8 w-[1px] bg-outline-variant/30 mx-2"></div>
          
          <div className="flex items-center gap-stack-sm cursor-pointer hover:bg-surface-container-low p-1 rounded-full transition-all">
            <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-xs">
              {getInitials(user?.name)}
            </div>
            <span className="font-label-md text-label-md pr-2 hidden lg:block">{user?.name}</span>
          </div>
        </div>
      </header>

      {/* Content Canvas */}
      <div className="p-gutter-mobile md:p-stack-lg max-w-7xl mx-auto space-y-stack-lg">
        {/* Global Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-stack-md">
          <div className="bg-surface-container-lowest p-stack-md rounded-xl shadow-[0_4px_12px_rgba(19,27,46,0.04)] border border-outline-variant/10 flex items-center gap-stack-md">
            <div className="w-12 h-12 rounded-xl bg-secondary-container/10 flex items-center justify-center text-secondary">
              <i className="fa-solid fa-circle-check text-2xl"></i>
            </div>
            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant">Completed Today</p>
              <h3 className="font-headline-md text-headline-md">{analytics ? analytics.completedToday : 0} Tasks</h3>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-stack-md rounded-xl shadow-[0_4px_12px_rgba(19,27,46,0.04)] border border-outline-variant/10 flex items-center gap-stack-md">
            <div className="w-12 h-12 rounded-xl bg-secondary-container/10 flex items-center justify-center text-secondary">
              <i className="fa-solid fa-users text-2xl"></i>
            </div>
            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant">Active Collaborators</p>
              <h3 className="font-headline-md text-headline-md">{users.filter(u => u.status === 'online').length} Online</h3>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-stack-md rounded-xl shadow-[0_4px_12px_rgba(19,27,46,0.04)] border border-outline-variant/10 flex items-center gap-stack-md">
            <div className="w-12 h-12 rounded-xl bg-secondary-container/10 flex items-center justify-center text-secondary">
              <i className="fa-solid fa-clock text-2xl"></i>
            </div>
            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant">Focus Hours</p>
              <h3 className="font-headline-md text-headline-md">{analytics ? analytics.focusHours : '0.0'} hrs</h3>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-stack-md rounded-xl shadow-[0_4px_12px_rgba(19,27,46,0.04)] border border-outline-variant/10 flex items-center gap-stack-md">
            <div className="w-12 h-12 rounded-xl bg-secondary-container/10 flex items-center justify-center text-secondary">
              <i className="fa-solid fa-arrow-trend-up text-2xl"></i>
            </div>
            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant">Team Velocity</p>
              <h3 className="font-headline-md text-headline-md">{analytics ? analytics.teamVelocity : '+0%'}</h3>
            </div>
          </div>
        </section>

        {/* Projects Header */}
        <div className="flex items-center justify-between mt-stack-lg">
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Your Projects</h2>
          <div className="flex items-center gap-stack-sm">
            <button className="bg-surface-container-lowest border border-outline-variant/30 px-stack-md py-2 rounded-lg font-label-md text-label-md hover:bg-surface-container-low transition-all cursor-pointer">Filter</button>
            <button className="bg-surface-container-lowest border border-outline-variant/30 px-stack-md py-2 rounded-lg font-label-md text-label-md hover:bg-surface-container-low transition-all cursor-pointer">Sort</button>
          </div>
        </div>

        {/* Bento-ish Grid for Projects */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-stack-lg">
          {filteredProjects.map((project, idx) => {
            // Seed a visual percentage based on index to fit original UI aesthetics (75%, 30%, 90% etc.)
            const seededPercent = idx % 3 === 0 ? 75 : idx % 3 === 1 ? 30 : 90;
            const progressColor = idx % 3 === 0 ? 'text-secondary' : idx % 3 === 1 ? 'text-error' : 'text-secondary-container';
            const leftBarColor = idx % 3 === 0 ? 'bg-secondary' : idx % 3 === 1 ? 'bg-error' : 'bg-secondary-container';

            return (
              <div 
                key={project._id}
                onClick={() => onSelectProject(project._id)}
                className="group relative bg-surface-container-lowest p-stack-lg rounded-xl shadow-[0_4px_12px_rgba(19,27,46,0.04)] hover:shadow-[0_20px_40px_rgba(19,27,46,0.08)] transition-all duration-300 border border-outline-variant/10 cursor-pointer"
              >
                <div className={`absolute left-0 top-6 bottom-6 w-1 ${leftBarColor} rounded-r-full`}></div>
                <div className="flex justify-between items-start mb-stack-md">
                  <div>
                    <h3 className="font-headline-md text-headline-md group-hover:text-secondary transition-colors text-on-surface">
                      {project.name}
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                      {project.description || 'Collaborative workspace'}
                    </p>
                  </div>
                  
                  <div className="relative inline-flex items-center justify-center overflow-hidden rounded-full flex-shrink-0">
                    <svg className="w-14 h-14">
                      <circle className="text-surface-container-high" cx="28" cy="28" fill="transparent" r="24" stroke="currentColor" strokeWidth="4"></circle>
                      <circle 
                        className={`${progressColor} progress-ring__circle`} 
                        cx="28" 
                        cy="28" 
                        fill="transparent" 
                        r="24" 
                        stroke="currentColor" 
                        strokeDasharray="150.8" 
                        strokeDashoffset={getStrokeOffset(seededPercent)} 
                        strokeLinecap="round" 
                        strokeWidth="4"
                      ></circle>
                    </svg>
                    <span className="absolute text-[10px] font-bold text-on-surface">{seededPercent}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-stack-lg">
                  <div className="flex -space-x-3">
                    {project.members?.slice(0, 3).map((m) => (
                      <div 
                        key={m.user?._id || m.user} 
                        className="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-secondary text-white flex items-center justify-center text-[10px] font-bold"
                        title={m.user?.name}
                      >
                        {getInitials(m.user?.name)}
                      </div>
                    ))}
                    {project.members?.length > 3 && (
                      <div className="w-8 h-8 rounded-full bg-surface-container-high border-2 border-surface-container-lowest flex items-center justify-center text-[10px] font-bold text-on-surface-variant">
                        +{project.members.length - 3}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      // Options click
                    }} 
                    className="text-on-surface-variant hover:text-secondary transition-colors"
                  >
                    <i className="fa-solid fa-ellipsis-vertical text-lg"></i>
                  </button>
                </div>
              </div>
            );
          })}

          {/* Featured Large Card / Analytics Insight */}
          <div className="md:col-span-2 bg-primary-container text-on-primary-container p-stack-lg rounded-xl relative overflow-hidden flex flex-col justify-between h-full min-h-[220px]">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-stack-sm">
                <span className="bg-secondary px-2 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider">Insider View</span>
                <span className="text-label-sm text-on-primary-container/60">Weekly Efficiency Report</span>
              </div>
              <h2 className="font-headline-lg text-headline-lg text-white max-w-md">Your team reached a new milestone in task velocity today.</h2>
              <button className="mt-stack-md bg-white text-primary-container px-stack-lg py-2 rounded-lg font-semibold hover:bg-secondary-fixed transition-all active:scale-95 cursor-pointer">
                View Details
              </button>
            </div>
            <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none">
              <div className="w-64 h-64 bg-secondary rounded-full blur-3xl absolute -right-20 -bottom-20"></div>
              <div className="w-32 h-32 bg-error rounded-full blur-2xl absolute right-20 bottom-10"></div>
            </div>
            <div className="relative z-10 flex items-center gap-stack-lg mt-stack-lg border-t border-on-primary-container/10 pt-stack-md">
              <div>
                <p className="text-label-sm text-on-primary-container/60">Avg. Response</p>
                <p className="font-headline-md text-white">{analytics?.efficiencyReport?.avgResponse || '0 mins'}</p>
              </div>
              <div className="h-8 w-[1px] bg-on-primary-container/10"></div>
              <div>
                <p className="text-label-sm text-on-primary-container/60">Approval Rate</p>
                <p className="font-headline-md text-white">{analytics?.efficiencyReport?.approvalRate || '0%'}</p>
              </div>
            </div>
          </div>

          {/* Placeholder Project Add Card */}
          <div 
            onClick={onOpenCreateProject}
            className="group border-2 border-dashed border-outline-variant hover:border-secondary hover:bg-secondary/5 rounded-xl flex flex-col items-center justify-center p-stack-lg transition-all cursor-pointer min-h-[220px]"
          >
            <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant group-hover:bg-secondary group-hover:text-white transition-all mb-stack-sm">
              <i className="fa-solid fa-plus text-xl"></i>
            </div>
            <p className="font-headline-md text-on-surface-variant group-hover:text-secondary">Create Project</p>
            <p className="font-body-md text-on-surface-variant/60 text-center mt-1">Start a new workflow with your team</p>
          </div>
        </div>

        {/* Active Collaborators Quick List */}
        <section className="bg-surface-container-lowest p-stack-lg rounded-xl shadow-[0_4px_12px_rgba(19,27,46,0.04)] border border-outline-variant/10">
          <div className="flex items-center justify-between mb-stack-lg">
            <h3 className="font-headline-md text-headline-md text-on-surface">Active Collaborators</h3>
            <Link className="text-secondary font-label-md hover:underline font-bold" to="/team">View All Team</Link>
          </div>
          <div className="flex flex-wrap gap-stack-lg">
            {users.slice(0, 10).map((u, index) => (
              <div key={u._id} className={`flex flex-col items-center gap-stack-sm ${index >= 5 ? 'opacity-50' : ''}`}>
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container border-2 border-secondary flex items-center justify-center font-bold text-sm">
                    {getInitials(u.name)}
                  </div>
                  <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${index < 5 ? 'bg-green-500' : 'bg-outline-variant'}`}></div>
                </div>
                <p className="font-label-sm text-label-sm text-on-surface">{u.name.split(' ')[0]}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
