import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Team = () => {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Role Edit State
  const [editingMember, setEditingMember] = useState(null);
  const [editRole, setEditRole] = useState('');
  const [editType, setEditType] = useState('Member');
  const [savingRole, setSavingRole] = useState(false);

  const isAdmin = user?.type === 'Admin' || user?.type === 'Superadmin';
  const isSuperadmin = user?.type === 'Superadmin';

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const data = await api.get('/auth/users');
        setTeamMembers(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch team members:', error);
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  const statusColors = {
    online: "bg-green-500",
    away: "bg-amber-500",
    busy: "bg-red-500",
    offline: "bg-slate-300"
  };

  const typeStyles = {
    Superadmin: "bg-primary-fixed text-on-primary-fixed border border-primary/20",
    Admin: "bg-secondary-fixed text-on-secondary-fixed-variant",
    Member: "bg-surface-container-highest text-on-surface-variant"
  };

  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').substring(0, 2);

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
      setTeamMembers(teamMembers.map(m => m._id === data._id ? { ...m, ...data } : m));
      setEditingMember(null);
    } catch (error) {
      console.error('Failed to update role:', error);
      alert('Failed to update user role');
    } finally {
      setSavingRole(false);
    }
  };

  if (loading) return <div className="p-10 max-w-7xl mx-auto w-full flex-1">Loading team...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-stack-lg w-full relative">
      {/* Stats Header (Bento Style) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-surface-container flex items-center gap-6">
          <div className="w-14 h-14 bg-secondary-fixed rounded-2xl flex items-center justify-center text-secondary">
            <i className="fa-solid fa-users text-3xl"></i>
          </div>
          <div>
            <p className="font-label-md text-label-md text-on-surface-variant">Total Members</p>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">{teamMembers.length}</h2>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-surface-container flex items-center gap-6">
          <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
            <i className="fa-solid fa-wifi text-3xl"></i>
          </div>
          <div>
            <p className="font-label-md text-label-md text-on-surface-variant">Online Now</p>
            <div className="flex items-center gap-2">
              <h2 className="font-headline-lg text-headline-lg text-on-surface">
                {teamMembers.filter(m => m.status === 'online').length}
              </h2>
              <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded-full font-label-sm text-label-sm">Active</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-surface-container flex items-center gap-6">
          <div className="w-14 h-14 bg-surface-container-highest rounded-2xl flex items-center justify-center text-on-surface-variant">
            <i className="fa-solid fa-envelope-open-text text-3xl"></i>
          </div>
          <div>
            <p className="font-label-md text-label-md text-on-surface-variant">Pending Invites</p>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">0</h2>
          </div>
        </div>
      </section>

      {/* Directory Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-outline-variant">
        <div className="flex items-center gap-4">
          <button className="font-label-md text-label-md text-secondary border-b-2 border-secondary pb-2 px-1 cursor-pointer">All Members</button>
          <button className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface pb-2 px-1 transition-colors cursor-pointer">Engineering</button>
          <button className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface pb-2 px-1 transition-colors cursor-pointer">Design</button>
          <button className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface pb-2 px-1 transition-colors cursor-pointer">Marketing</button>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-surface-container rounded-lg text-on-surface-variant cursor-pointer">
            <i className="fa-solid fa-grip text-lg"></i>
          </button>
          <button className="p-2 bg-surface-container-highest rounded-lg text-secondary cursor-pointer">
            <i className="fa-solid fa-list text-lg"></i>
          </button>
        </div>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
        {teamMembers.map((member, idx) => (
          <div key={idx} className="group bg-white p-5 rounded-3xl border border-surface-container hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className={`px-3 py-1 rounded-full font-label-sm text-label-sm ${typeStyles[member.type]}`}>
                {member.type}
              </span>
            </div>
            
            <div className="flex flex-col items-center text-center mt-4">
              <div className="relative mb-4">
                <img 
                  src={`https://openui.fly.dev/openui/80x80.svg?text=${member.name.charAt(0)}`}
                  alt={member.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-surface-container-low" 
                />
                <div className={`absolute bottom-1 right-1 w-5 h-5 ${statusColors[member.status]} border-4 border-white rounded-full`}></div>
              </div>
              
              <h3 className="font-headline-md text-headline-md text-on-surface">{member.name}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-4">{member.role}</p>
              
              <div className="flex items-center gap-2 w-full pt-4 border-t border-surface-container">
                {isAdmin ? (
                  <button onClick={() => handleEditClick(member)} className="flex-1 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container-highest font-label-md text-label-md transition-colors text-on-surface cursor-pointer">Edit Role</button>
                ) : (
                  <button className="flex-1 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container-highest font-label-md text-label-md transition-colors text-on-surface cursor-pointer">Profile</button>
                )}
                <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-secondary-fixed text-secondary hover:bg-secondary-container hover:text-white transition-all cursor-pointer">
                  <i className="fa-solid fa-comment-dots text-lg"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-secondary text-on-secondary rounded-2xl shadow-[0_8px_30px_rgb(0,81,213,0.3)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group cursor-pointer">
        <i className="fa-solid fa-plus text-2xl"></i>
        <span className="absolute right-full mr-4 px-3 py-1 bg-on-surface text-on-secondary text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">New Member</span>
      </button>

      {/* Edit Role Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditingMember(null)}></div>
          
          {/* Modal Content */}
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
                  placeholder="e.g. Lead Designer"
                />
              </div>

              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-2">System Privilege Type</label>
                <select 
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-bright focus:ring-2 focus:ring-secondary focus:border-secondary transition-all outline-none text-body-md cursor-pointer appearance-none"
                >
                  <option value="Member">Member (Standard Access)</option>
                  
                  {/* Only Superadmin can elevate others to Admin */}
                  {isSuperadmin && (
                    <option value="Admin">Admin (Can edit Member roles)</option>
                  )}
                  
                  {/* Keep current value in dropdown if editing a user with higher privs we can't change */}
                  {!isSuperadmin && editType === 'Admin' && (
                    <option value="Admin" disabled>Admin</option>
                  )}
                  {!isSuperadmin && editType === 'Superadmin' && (
                    <option value="Superadmin" disabled>Superadmin</option>
                  )}
                </select>
                {!isSuperadmin && <p className="mt-2 text-xs text-on-surface-variant">Only Superadmins can assign or modify the Admin type.</p>}
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setEditingMember(null)}
                className="flex-1 py-3 px-4 rounded-xl font-label-md text-label-md text-on-surface bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveRole}
                disabled={savingRole}
                className="flex-1 py-3 px-4 rounded-xl font-label-md text-label-md text-on-primary bg-primary hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-70 flex justify-center items-center"
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

export default Team;
