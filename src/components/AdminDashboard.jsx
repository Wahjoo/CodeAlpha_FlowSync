import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  
  const [data, setData] = useState({
    users: [],
    projects: [],
    tasks: [],
    comments: [],
  });
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.type === 'Admin' || user?.type === 'Superadmin';

  useEffect(() => {
    if (!isAdmin) return;
    
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [users, projects, tasks, comments] = await Promise.all([
          api.adminGetAllUsers(),
          api.adminGetAllProjects(),
          api.adminGetAllTasks(),
          api.adminGetAllComments(),
        ]);
        
        setData({ users, projects, tasks, comments });
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, [isAdmin]);

  const handleDelete = async (type, id) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`);
    if (!isConfirmed) return;

    try {
      if (type === 'user') {
        await api.adminDeleteUser(id);
        setData(prev => ({ ...prev, users: prev.users.filter(item => item._id !== id) }));
      } else if (type === 'project') {
        await api.adminDeleteProject(id);
        setData(prev => ({ ...prev, projects: prev.projects.filter(item => item._id !== id) }));
      } else if (type === 'task') {
        await api.adminDeleteTask(id);
        setData(prev => ({ ...prev, tasks: prev.tasks.filter(item => item._id !== id) }));
      } else if (type === 'comment') {
        await api.adminDeleteComment(id);
        setData(prev => ({ ...prev, comments: prev.comments.filter(item => item._id !== id) }));
      }
    } catch (error) {
      console.error(`Failed to delete ${type}:`, error);
      alert(`Failed to delete ${type}. ${error.message || ''}`);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full text-center">
        <i className="fa-solid fa-shield-halved text-5xl text-error mb-4"></i>
        <h2 className="font-headline-md text-headline-md text-on-surface">Access Denied</h2>
        <p className="text-on-surface-variant mt-2 max-w-md">You need Administrator privileges to view the Admin Panel.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-secondary mb-4">
          <i className="fa-solid fa-spinner fa-spin text-2xl"></i>
        </div>
        <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface-variant">Loading Platform Data...</h2>
      </div>
    );
  }

  const tabs = [
    { id: 'users', label: 'Users', icon: 'fa-users', count: data.users.length },
    { id: 'projects', label: 'Projects', icon: 'fa-folder', count: data.projects.length },
    { id: 'tasks', label: 'Tasks', icon: 'fa-list-check', count: data.tasks.length },
    { id: 'comments', label: 'Comments', icon: 'fa-comments', count: data.comments.length },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-stack-lg w-full h-full flex flex-col relative overflow-hidden">
      <div>
        <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface flex items-center gap-3">
          <i className="fa-solid fa-screwdriver-wrench text-secondary"></i>
          Admin Panel
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Global platform management and override controls.
        </p>
      </div>

      <div className="flex gap-2 p-1 bg-surface-container-low rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-label-md text-label-md transition-all duration-200 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-secondary text-on-secondary shadow-md'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            <i className={`fa-solid ${tab.icon}`}></i>
            {tab.label}
            <span className={`px-2 py-0.5 rounded-full text-[10px] ml-1 ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-surface-container-high text-on-surface-variant'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-surface-container shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-auto flex-1 p-0 custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-surface-container-lowest border-b border-outline-variant/30 text-on-surface-variant font-label-md z-10">
              <tr>
                {activeTab === 'users' && (
                  <>
                    <th className="p-4 font-semibold">Name</th>
                    <th className="p-4 font-semibold">Email</th>
                    <th className="p-4 font-semibold">Role/Type</th>
                  </>
                )}
                {activeTab === 'projects' && (
                  <>
                    <th className="p-4 font-semibold">Project Name</th>
                    <th className="p-4 font-semibold">Owner</th>
                    <th className="p-4 font-semibold">Members</th>
                  </>
                )}
                {activeTab === 'tasks' && (
                  <>
                    <th className="p-4 font-semibold">Task Title</th>
                    <th className="p-4 font-semibold">Project</th>
                    <th className="p-4 font-semibold">Assignee</th>
                  </>
                )}
                {activeTab === 'comments' && (
                  <>
                    <th className="p-4 font-semibold">Content</th>
                    <th className="p-4 font-semibold">Author</th>
                    <th className="p-4 font-semibold">Task</th>
                  </>
                )}
                <th className="p-4 font-semibold text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {data[activeTab].map((item) => (
                <tr key={item._id} className="hover:bg-surface-container-lowest/50 transition-colors group">
                  {activeTab === 'users' && (
                    <>
                      <td className="p-4 font-semibold text-on-surface">
                        <div className="flex items-center gap-3">
                          <img src={`https://openui.fly.dev/openui/32x32.svg?text=${item.name?.charAt(0) || 'U'}`} className="w-8 h-8 rounded-full" alt="avatar" />
                          {item.name}
                        </div>
                      </td>
                      <td className="p-4 text-on-surface-variant text-sm">{item.email}</td>
                      <td className="p-4">
                        <span className="px-2 py-1 text-xs font-semibold rounded-md bg-surface-container-highest text-on-surface">
                          {item.type}
                        </span>
                      </td>
                    </>
                  )}
                  
                  {activeTab === 'projects' && (
                    <>
                      <td className="p-4 font-semibold text-on-surface">{item.name}</td>
                      <td className="p-4 text-on-surface-variant text-sm">{item.owner?.name || 'Unknown'}</td>
                      <td className="p-4 text-on-surface-variant text-sm">{item.members?.length || 0} users</td>
                    </>
                  )}

                  {activeTab === 'tasks' && (
                    <>
                      <td className="p-4 font-semibold text-on-surface truncate max-w-[200px]">{item.title}</td>
                      <td className="p-4 text-on-surface-variant text-sm">{item.project?.name || 'Unknown Project'}</td>
                      <td className="p-4 text-on-surface-variant text-sm">{item.assignee?.name || 'Unassigned'}</td>
                    </>
                  )}

                  {activeTab === 'comments' && (
                    <>
                      <td className="p-4 font-medium text-on-surface truncate max-w-[300px]">{item.content}</td>
                      <td className="p-4 text-on-surface-variant text-sm">{item.user?.name || 'Unknown User'}</td>
                      <td className="p-4 text-on-surface-variant text-sm">{item.task?.title || 'Unknown Task'}</td>
                    </>
                  )}

                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(activeTab.slice(0, -1), item._id)}
                      className="w-8 h-8 rounded-lg bg-error/10 text-error hover:bg-error hover:text-white transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer"
                      title={`Delete ${activeTab.slice(0, -1)}`}
                    >
                      <i className="fa-solid fa-trash-can text-sm"></i>
                    </button>
                  </td>
                </tr>
              ))}
              
              {data[activeTab].length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-on-surface-variant">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <i className="fa-regular fa-folder-open text-3xl opacity-50"></i>
                      <p>No {activeTab} found in the system.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
