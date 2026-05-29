import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Users = ({ onOpenChat }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [editingMember, setEditingMember] = useState(null);
  const [editRole, setEditRole] = useState('');
  const [editType, setEditType] = useState('Member');
  const [savingRole, setSavingRole] = useState(false);

  const isAdmin = user?.type === 'Admin' || user?.type === 'Superadmin';
  const isSuperadmin = user?.type === 'Superadmin';

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await api.get('/auth/users');
        setUsers(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleEditClick = (member) => {
    setEditingMember(member);
    setEditRole(member.role || 'Member');
    setEditType(member.type || 'Member');
  };

  const handleSaveRole = async () => {
    setSavingRole(true);
    try {
      const data = await api.put(`/auth/users/${editingMember._id}/role`, {
        role: editRole,
        type: editType
      });
      setUsers(users.map(m => m._id === data._id ? { ...m, ...data } : m));
      setEditingMember(null);
    } catch (error) {
      console.error('Failed to update role:', error);
      alert('Failed to update user role');
    } finally {
      setSavingRole(false);
    }
  };

  const typeStyles = {
    Superadmin: "bg-primary-fixed text-on-primary-fixed border border-primary/20",
    Admin: "bg-secondary-fixed text-on-secondary-fixed-variant",
    Member: "bg-surface-container-highest text-on-surface-variant"
  };

  const statusColors = {
    online: "bg-green-500",
    away: "bg-amber-500",
    busy: "bg-red-500",
    offline: "bg-slate-300"
  };

  if (!isAdmin) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full text-center">
        <i className="fa-solid fa-lock text-5xl text-on-surface-variant mb-4"></i>
        <h2 className="font-headline-md text-headline-md text-on-surface">Access Denied</h2>
        <p className="text-on-surface-variant mt-2 max-w-md">You need Administrator privileges to access the Users Management page.</p>
      </div>
    );
  }

  if (loading) return <div className="p-10 max-w-7xl mx-auto w-full flex-1">Loading users...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-stack-lg w-full relative h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">Users Management</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Manage team access types and roles.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-surface-container shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-lowest border-b border-outline-variant/30 text-on-surface-variant font-label-md">
                <th className="p-4 font-semibold whitespace-nowrap">User</th>
                <th className="p-4 font-semibold whitespace-nowrap">Email</th>
                <th className="p-4 font-semibold whitespace-nowrap">Job Role</th>
                <th className="p-4 font-semibold whitespace-nowrap">Access Type</th>
                <th className="p-4 font-semibold whitespace-nowrap">Status</th>
                <th className="p-4 font-semibold whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {users.map((member) => (
                <tr key={member._id} className="hover:bg-surface-container-lowest/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img 
                          src={`https://openui.fly.dev/openui/40x40.svg?text=${member.name.charAt(0)}`}
                          alt={member.name}
                          className="w-10 h-10 rounded-full object-cover border border-surface-container" 
                        />
                        <div className={`absolute bottom-0 right-0 w-3 h-3 ${statusColors[member.status]} border-2 border-white rounded-full`}></div>
                      </div>
                      <span className="font-label-md text-on-surface font-semibold">{member.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-on-surface-variant font-body-sm">{member.email}</td>
                  <td className="p-4 text-on-surface-variant font-body-sm">{member.role || 'Member'}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full font-label-sm text-label-sm ${typeStyles[member.type]}`}>
                      {member.type}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="capitalize font-body-sm text-on-surface-variant">{member.status}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => onOpenChat && onOpenChat(member)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-secondary hover:bg-secondary-container transition-colors"
                        title="Chat"
                      >
                        <i className="fa-solid fa-comment-dots"></i>
                      </button>
                      <button 
                        onClick={() => handleEditClick(member)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
                        title="Edit Role"
                      >
                        <i className="fa-solid fa-pen"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Role Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditingMember(null)}></div>
          
          <div className="relative bg-surface rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-outline-variant/20 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-headline-md text-headline-md mb-6 text-on-surface">Edit User Role</h3>
            
            <div className="flex items-center gap-4 mb-6 p-4 bg-surface-container-lowest rounded-2xl">
              <img src={`https://openui.fly.dev/openui/50x50.svg?text=${editingMember.name.charAt(0)}`} className="w-12 h-12 rounded-full" alt="avatar" />
              <div>
                <p className="font-label-lg text-label-lg text-on-surface">{editingMember.name}</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{editingMember.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Job Title / Role</label>
                <input 
                  type="text" 
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-bright focus:ring-2 focus:ring-secondary focus:border-secondary transition-all outline-none text-body-md"
                  placeholder="e.g. Frontend Developer"
                />
              </div>

              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Access Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditType('Member')}
                    className={`py-3 px-4 rounded-xl border font-label-md text-label-md transition-all cursor-pointer ${editType === 'Member' ? 'bg-secondary-container text-on-secondary-container border-secondary/30' : 'bg-surface-bright border-outline-variant text-on-surface-variant hover:bg-surface-container'}`}
                  >
                    Member
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditType('Admin')}
                    disabled={!isSuperadmin && editingMember.type === 'Superadmin'}
                    className={`py-3 px-4 rounded-xl border font-label-md text-label-md transition-all cursor-pointer ${editType === 'Admin' ? 'bg-secondary-container text-on-secondary-container border-secondary/30' : 'bg-surface-bright border-outline-variant text-on-surface-variant hover:bg-surface-container'} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    Admin
                  </button>
                </div>
                {isSuperadmin && (
                  <button
                    type="button"
                    onClick={() => setEditType('Superadmin')}
                    className={`w-full mt-3 py-3 px-4 rounded-xl border font-label-md text-label-md transition-all cursor-pointer ${editType === 'Superadmin' ? 'bg-secondary-container text-on-secondary-container border-secondary/30' : 'bg-surface-bright border-outline-variant text-on-surface-variant hover:bg-surface-container'}`}
                  >
                    Superadmin
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button 
                onClick={() => setEditingMember(null)}
                className="flex-1 py-3 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveRole}
                disabled={savingRole || (editRole === editingMember.role && editType === editingMember.type)}
                className="flex-1 py-3 rounded-xl bg-secondary text-on-secondary font-label-md text-label-md hover:bg-secondary/90 transition-colors disabled:opacity-50 flex items-center justify-center cursor-pointer"
              >
                {savingRole ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
