import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useSocket } from './context/SocketContext';
import { api } from './utils/api';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Board from './components/Board';
import CreateProject from './components/CreateProject';
import TaskModal from './components/TaskModal';
import Auth from './components/Auth';
import LandingPage from './components/LandingPage';
import Tasks from './components/Tasks';
import Team from './components/Team';
import Settings from './components/Settings';
import Support from './components/Support';
import { Check } from 'lucide-react';

const App = () => {
  const { user, loading } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();
  const location = useLocation();

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [projectData, setProjectData] = useState(null); // { project, lists, tasks }

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Modals Toggles State
  const [activeTaskDetailsId, setActiveTaskDetailsId] = useState(null);

  // Fetch Projects list
  useEffect(() => {
    if (!user) return;
    const fetchProjects = async () => {
      try {
        const data = await api.getProjects();
        setProjects(data);
      } catch (err) {
        console.error('Error fetching projects:', err);
      }
    };
    fetchProjects();
  }, [user]);

  // Fetch User Notifications
  useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      try {
        const data = await api.getNotifications();
        setNotifications(data);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };
    fetchNotifications();
  }, [user]);

  // Fetch Workspace Users
  useEffect(() => {
    if (!user) return;
    const fetchUsers = async () => {
      try {
        const data = await api.getUsers();
        setUsers(data);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };
    fetchUsers();
  }, [user]);

  // WebSocket Live Sync
  useEffect(() => {
    if (!socket) return;

    const handleProjectUpdated = (data) => {
      if (activeProjectId && (data.project?._id === activeProjectId || data.project === activeProjectId)) {
        setProjectData((prev) => {
          if (!prev) return prev;
          return {
            project: data.project || prev.project,
            lists: data.lists || prev.lists,
            tasks: data.tasks || prev.tasks,
          };
        });

        if (data.project) {
          setProjects((prev) =>
            prev.map((p) => (p._id === data.project._id ? data.project : p))
          );
        }
      }
    };

    const handleNewNotification = (data) => {
      setNotifications((prev) => {
        if (prev.some((n) => n._id === data._id)) return prev;
        return [data, ...prev];
      });
    };

    socket.on('project:updated', handleProjectUpdated);
    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('project:updated', handleProjectUpdated);
      socket.off('notification:new', handleNewNotification);
    };
  }, [socket, activeProjectId]);

  // Sync project with URL
  useEffect(() => {
    if (!user) return;
    const match = location.pathname.match(/^\/project\/([a-zA-Z0-9]+)/);
    if (match) {
      const pId = match[1];
      if (pId !== activeProjectId) {
        const oldId = activeProjectId;
        setActiveProjectId(pId);
        setProjectData(null);
        setActiveTaskDetailsId(null);
        
        api.getProjectById(pId).then(data => {
          setProjectData(data);
          if (socket) {
            if (oldId) socket.emit('project:leave', oldId);
            socket.emit('project:join', pId);
          }
        }).catch(err => {
          console.error('Project load error:', err);
          navigate('/');
        });
      }
    } else {
      if (activeProjectId) {
        if (socket) socket.emit('project:leave', activeProjectId);
        setActiveProjectId(null);
        setProjectData(null);
      }
    }
  }, [location.pathname, activeProjectId, socket, navigate, user]);

  // Navigate to project board
  const handleSelectProject = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  // Submit project creator workspace
  const handleSaveProject = async (projectForm) => {
    try {
      const newProj = await api.createProject(projectForm.name, projectForm.description);
      setProjects((prev) => [newProj, ...prev]);

      // Invite project members
      if (projectForm.teamEmails && projectForm.teamEmails.length > 0) {
        for (const email of projectForm.teamEmails) {
          try {
            await api.addProjectMember(newProj._id, email);
          } catch (e) {
            console.error('Member invite failed:', email, e.message);
          }
        }
      }

      handleSelectProject(newProj._id);
    } catch (err) {
      console.error(err);
    }
  };

  // Lists & Columns Actions
  const handleAddList = async (name) => {
    if (!activeProjectId) return;
    try {
      const newList = await api.createList(activeProjectId, name);
      setProjectData((prev) => ({
        ...prev,
        lists: [...prev.lists, newList],
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteList = async (listId) => {
    try {
      await api.deleteList(listId);
      setProjectData((prev) => ({
        ...prev,
        lists: prev.lists.filter((l) => l._id !== listId),
        tasks: prev.tasks.filter((t) => t.list !== listId),
      }));
    } catch (err) {
      console.error(err);
    }
  };

  // Tasks Actions
  const handleAddTask = async (listId, taskData) => {
    try {
      const newTask = await api.createTask(listId, taskData);
      setProjectData((prev) => ({
        ...prev,
        tasks: [...prev.tasks, newTask],
      }));
    } catch (err) {
      console.error(err);
    }
  };

  // Re-ordering and list moves
  const handleMoveTask = async (taskId, listId, order) => {
    setProjectData((prev) => {
      if (!prev) return prev;
      const movedTask = prev.tasks.find((t) => t._id === taskId);
      if (!movedTask) return prev;

      const sourceListId = movedTask.list.toString();
      const sourceOrder = movedTask.order;
      const destListId = listId.toString();
      const destOrder = order;

      const updatedTasks = prev.tasks.map((t) => ({ ...t }));

      if (sourceListId === destListId) {
        const target = updatedTasks.find((t) => t._id === taskId);
        target.order = destOrder;
        
        updatedTasks.forEach((t) => {
          if (t._id !== taskId && t.list === sourceListId) {
            if (sourceOrder < destOrder) {
              if (t.order > sourceOrder && t.order <= destOrder) t.order -= 1;
            } else {
              if (t.order >= destOrder && t.order < sourceOrder) t.order += 1;
            }
          }
        });
      } else {
        updatedTasks.forEach((t) => {
          if (t.list === sourceListId && t.order > sourceOrder) t.order -= 1;
        });
        updatedTasks.forEach((t) => {
          if (t.list === destListId && t.order >= destOrder) t.order += 1;
        });

        const target = updatedTasks.find((t) => t._id === taskId);
        target.list = destListId;
        target.order = destOrder;
      }

      updatedTasks.sort((a, b) => a.order - b.order);
      return { ...prev, tasks: updatedTasks };
    });

    try {
      await api.moveTask(taskId, listId, order);
    } catch (err) {
      console.error(err);
      const data = await api.getProjectById(activeProjectId);
      setProjectData(data);
    }
  };

  const handleUpdateTask = async (taskId, taskData) => {
    try {
      const updatedTask = await api.updateTask(taskId, taskData);
      setProjectData((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) => (t._id === taskId ? updatedTask : t)),
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.deleteTask(taskId);
      setProjectData((prev) => ({
        ...prev,
        tasks: prev.tasks.filter((t) => t._id !== taskId),
      }));
      setActiveTaskDetailsId(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Notifications Actions
  const handleReadNotification = async (notificationId) => {
    try {
      await api.markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleReadAllNotifications = async () => {
    try {
      await api.markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  // Project Invite Action
  const handleInviteMember = async (email) => {
    try {
      await api.addProjectMember(activeProjectId, email);
      const data = await api.getProjectById(activeProjectId);
      setProjectData(data);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="text-lg font-medium text-on-surface-variant">Loading workspace...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Auth initialIsLogin={true} />} />
        <Route path="/signup" element={<Auth initialIsLogin={false} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const activeTask = projectData?.tasks.find((t) => t._id === activeTaskDetailsId);
  const activeTaskListName = projectData?.lists.find(
    (l) => l._id === activeTask?.list || (activeTask?.list?._id && l._id === activeTask.list._id)
  )?.name;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-on-surface">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main Workspace Frame */}
      <main className="pl-64 flex-grow flex flex-col min-w-0 h-screen overflow-y-auto overflow-x-hidden relative custom-scrollbar">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          <Route path="/signup" element={<Navigate to="/dashboard" replace />} />
          
          <Route path="/dashboard" element={
            <Dashboard
              projects={projects}
              users={users}
              onSelectProject={handleSelectProject}
              onOpenCreateProject={() => navigate('/create-project')}
              notifications={notifications}
              showNotifications={showNotifications}
              setShowNotifications={setShowNotifications}
              onReadNotification={handleReadNotification}
              onReadAllNotifications={handleReadAllNotifications}
            />
          } />

          <Route path="/project/:projectId" element={
            projectData ? (
              <Board
                projectData={projectData}
                onAddList={handleAddList}
                onDeleteList={handleDeleteList}
                onAddTask={handleAddTask}
                onMoveTask={handleMoveTask}
                onOpenTaskDetails={(id) => {
                  setActiveTaskDetailsId(id);
                }}
                onOpenInviteMember={() => {
                  const email = window.prompt("Enter member email to invite:");
                  if (email) handleInviteMember(email.trim());
                }}
                onNavigateBack={() => navigate('/dashboard')}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-stack-lg">
                <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center text-secondary mb-6">
                  <i className="fa-solid fa-spinner fa-spin text-3xl"></i>
                </div>
                <h2 className="font-headline-md text-headline-md font-bold mb-2">Loading Project...</h2>
              </div>
            )
          } />

          <Route path="/create-project" element={
            <CreateProject
              users={users}
              onSave={handleSaveProject}
              onCancel={() => navigate('/dashboard')}
            />
          } />

          <Route path="/task" element={<Tasks />} />
          <Route path="/team" element={<Team />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/support" element={<Support />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>

        {location.pathname.startsWith('/project/') && activeTaskDetailsId && activeTask && (
          <TaskModal
            task={activeTask}
            listName={activeTaskListName}
            projectMembers={projectData?.project?.members}
            onClose={() => {
              setActiveTaskDetailsId(null);
            }}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
          />
        )}
      </main>
    </div>
  );
};

export default App;
