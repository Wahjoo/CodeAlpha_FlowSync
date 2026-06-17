import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const path = location.pathname;

  const isAdmin = user?.type === 'Admin' || user?.type === 'Superadmin';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[90] md:hidden"
          onClick={onClose}
        ></div>
      )}
      
      <aside className={`fixed left-0 top-0 bottom-0 flex flex-col p-stack-md z-[100] border-r border-outline-variant/30 bg-surface-container-low dark:bg-primary-container h-screen w-64 shadow-sm transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
      <Link 
        to="/"
        className="flex items-center gap-3 mb-10 px-2 cursor-pointer hover:opacity-85 transition-opacity block"
        title="Go to Dashboard"
      >
        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-white">
          <i className="fa-solid fa-rotate text-lg"></i>
        </div>
        <div>
          <h1 className="font-headline-md text-headline-md font-bold text-on-surface dark:text-primary-fixed">FlowSync</h1>
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold leading-none mt-1">Productivity Workspace</p>
        </div>
      </Link>

      <nav className="flex-1 flex flex-col gap-2">
        <Link
          onClick={onClose}
          to="/"
          className={`w-full flex items-center gap-stack-md rounded-lg px-stack-md py-stack-sm cursor-pointer transition-all duration-200 active:translate-x-1 ${
            path === '/' || path === '/dashboard' || path === '/create-project' || path.startsWith('/project')
              ? 'bg-secondary-container text-on-secondary-container font-semibold'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high dark:hover:bg-secondary-container/20'
          }`}
        >
          <i className="fa-solid fa-folder-open w-5 text-center text-lg"></i>
          <span className="font-label-md text-label-md">Projects</span>
        </Link>

        <Link
          onClick={onClose}
          to="/task"
          className={`w-full flex items-center gap-stack-md rounded-lg px-stack-md py-stack-sm cursor-pointer transition-all duration-200 active:translate-x-1 ${
            path.startsWith('/task')
              ? 'bg-secondary-container text-on-secondary-container font-semibold'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high dark:hover:bg-secondary-container/20'
          }`}
        >
          <i className="fa-solid fa-list-check w-5 text-center text-lg"></i>
          <span className="font-label-md text-label-md">Tasks</span>
        </Link>

        <Link
          onClick={onClose}
          to="/team"
          className={`w-full flex items-center gap-stack-md rounded-lg px-stack-md py-stack-sm cursor-pointer transition-all duration-200 active:translate-x-1 ${
            path.startsWith('/team')
              ? 'bg-secondary-container text-on-secondary-container font-semibold'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high dark:hover:bg-secondary-container/20'
          }`}
        >
          <i className="fa-solid fa-users w-5 text-center text-lg"></i>
          <span className="font-label-md text-label-md">Team</span>
        </Link>

        {isAdmin && (
          <>
            <Link
              onClick={onClose}
              to="/users"
              className={`w-full flex items-center gap-stack-md rounded-lg px-stack-md py-stack-sm cursor-pointer transition-all duration-200 active:translate-x-1 ${
                path.startsWith('/users')
                  ? 'bg-secondary-container text-on-secondary-container font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high dark:hover:bg-secondary-container/20'
              }`}
            >
              <i className="fa-solid fa-user-gear w-5 text-center text-lg"></i>
              <span className="font-label-md text-label-md">Users Mgmt</span>
            </Link>
            
            <Link
              onClick={onClose}
              to="/admin"
              className={`w-full flex items-center gap-stack-md rounded-lg px-stack-md py-stack-sm cursor-pointer transition-all duration-200 active:translate-x-1 ${
                path.startsWith('/admin')
                  ? 'bg-secondary-container text-on-secondary-container font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high dark:hover:bg-secondary-container/20'
              }`}
            >
              <i className="fa-solid fa-screwdriver-wrench w-5 text-center text-lg"></i>
              <span className="font-label-md text-label-md">Admin Panel</span>
            </Link>
          </>
        )}

        <Link
          onClick={onClose}
          to="/settings"
          className={`w-full flex items-center gap-stack-md rounded-lg px-stack-md py-stack-sm cursor-pointer transition-all duration-200 active:translate-x-1 ${
            path.startsWith('/settings')
              ? 'bg-secondary-container text-on-secondary-container font-semibold'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high dark:hover:bg-secondary-container/20'
          }`}
        >
          <i className="fa-solid fa-gear w-5 text-center text-lg"></i>
          <span className="font-label-md text-label-md">Settings</span>
        </Link>
      </nav>

      <Link
        to="/create-project"
        className="mt-4 mb-10 w-full bg-secondary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-secondary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
      >
        <i className="fa-solid fa-plus text-sm"></i>
        <span>New Project</span>
      </Link>

      <div className="mt-auto border-t border-outline-variant/20 pt-4 flex flex-col gap-2">
        <Link
          onClick={onClose} 
          to="/support"
          className={`w-full flex items-center gap-stack-md rounded-lg px-stack-md py-stack-sm cursor-pointer transition-all duration-200 active:translate-x-1 ${
            path.startsWith('/support')
              ? 'bg-secondary-container text-on-secondary-container font-semibold'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high dark:hover:bg-secondary-container/20'
          }`}
        >
          <i className="fa-solid fa-circle-question w-5 text-center text-lg"></i>
          <span className="font-label-md text-label-md">Support</span>
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-stack-md text-on-surface-variant hover:text-on-surface px-stack-md py-stack-sm hover:bg-surface-container-high dark:hover:bg-secondary-container/20 transition-all duration-200 cursor-pointer active:translate-x-1"
        >
          <i className="fa-solid fa-right-from-bracket w-5 text-center text-lg"></i>
          <span className="font-label-md text-label-md">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
