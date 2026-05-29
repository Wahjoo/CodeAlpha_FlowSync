import React, { useState } from 'react';

const CreateProject = ({ users = [], onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [inviteEmail, setInviteEmail] = useState('');
  const [error, setError] = useState('');

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2);
  };

  // Build suggested contacts dynamically from database users list
  const suggestedContacts = users.map(u => ({
    name: u.name,
    role: u.email.includes('sarah') ? 'Product Designer' :
          u.email.includes('marcus') ? 'Lead Engineer' :
          u.email.includes('david') ? 'Project Manager' : 'Collaborator',
    email: u.email,
    avatar: getInitials(u.name)
  }));

  const [teamMembers, setTeamMembers] = useState([]);

  // Toggle quick adding of suggested contact
  const handleToggleContact = (contact) => {
    if (teamMembers.some((m) => m.email === contact.email)) {
      setTeamMembers(teamMembers.filter((m) => m.email !== contact.email));
    } else {
      setTeamMembers([...teamMembers, contact]);
    }
  };

  const handleAddEmailInvite = (e) => {
    if (e.key === 'Enter' && inviteEmail.trim()) {
      e.preventDefault();
      const trimmed = inviteEmail.trim();
      if (!teamMembers.some(m => m.email === trimmed)) {
        setTeamMembers([...teamMembers, { name: trimmed.split('@')[0], role: 'Collaborator', email: trimmed, avatar: trimmed.substring(0,2).toUpperCase() }]);
      }
      setInviteEmail('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    onSave({
      name: name.trim(),
      description: description.trim(),
      privacy,
      teamEmails: teamMembers.map(m => m.email)
    });
  };

  return (
    <div className="flex-1 p-stack-lg min-h-[calc(100vh-64px)] bg-background text-on-surface">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-stack-lg flex items-center justify-between">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Create New Project</h2>
            <p className="text-on-surface-variant mt-1 text-sm">Define your goals and assemble your team to start collaborating.</p>
          </div>
          <button 
            className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer" 
            onClick={onCancel}
          >
            <i className="fa-solid fa-xmark text-lg"></i>
            <span className="font-label-md text-label-md">CANCEL</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-error/10 border border-error/20 text-error px-4 py-2.5 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden">
          <div className="p-stack-lg grid grid-cols-1 lg:grid-cols-12 gap-stack-lg">
            
            {/* Left Column: Basic Info */}
            <div className="lg:col-span-7 space-y-stack-lg">
              <div className="space-y-stack-sm">
                <label className="font-label-md text-label-md text-on-surface">Project Name</label>
                <input 
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all text-body-md text-on-surface outline-none" 
                  placeholder="e.g. Q4 Growth Strategy" 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-stack-sm">
                <label className="font-label-md text-label-md text-on-surface">Description (Optional)</label>
                <textarea 
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all text-body-md text-on-surface outline-none resize-none" 
                  placeholder="Briefly describe the purpose of this project..." 
                  rows="4"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              
              <div className="space-y-stack-md">
                <label className="font-label-md text-label-md text-on-surface">Privacy Settings</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
                  <label 
                    onClick={() => setPrivacy('public')}
                    className={`relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      privacy === 'public' 
                        ? 'border-secondary bg-secondary-container/5' 
                        : 'border-outline-variant hover:border-secondary/50'
                    }`}
                  >
                    <input 
                      checked={privacy === 'public'} 
                      onChange={() => setPrivacy('public')}
                      className="absolute top-4 right-4 text-secondary focus:ring-secondary cursor-pointer" 
                      name="privacy" 
                      type="radio" 
                      value="public"
                    />
                    <i className={`fa-solid fa-globe mb-2 text-2xl ${privacy === 'public' ? 'text-secondary' : 'text-on-surface-variant'}`}></i>
                    <span className="font-label-md text-label-md text-on-surface">Public</span>
                    <span className="text-label-sm text-on-surface-variant mt-1 leading-tight text-xs">Visible to everyone in the workspace.</span>
                  </label>

                  <label 
                    onClick={() => setPrivacy('private')}
                    className={`relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      privacy === 'private' 
                        ? 'border-secondary bg-secondary-container/5' 
                        : 'border-outline-variant hover:border-secondary/50'
                    }`}
                  >
                    <input 
                      checked={privacy === 'private'} 
                      onChange={() => setPrivacy('private')}
                      className="absolute top-4 right-4 text-secondary focus:ring-secondary cursor-pointer" 
                      name="privacy" 
                      type="radio" 
                      value="private"
                    />
                    <i className={`fa-solid fa-lock mb-2 text-2xl ${privacy === 'private' ? 'text-secondary' : 'text-on-surface-variant'}`}></i>
                    <span className="font-label-md text-label-md text-on-surface">Private</span>
                    <span className="text-label-sm text-on-surface-variant mt-1 leading-tight text-xs">Only invited members can access.</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Team & Invitations */}
            <div className="lg:col-span-5 bg-surface-container-low/50 rounded-xl p-stack-md space-y-stack-md">
              <div className="space-y-stack-sm">
                <label className="font-label-md text-label-md text-on-surface">Invite Team Members</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-on-surface-variant">
                    <i className="fa-solid fa-user-plus text-[18px]"></i>
                  </span>
                  <input 
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all text-body-md text-on-surface outline-none" 
                    placeholder="Type email & press Enter" 
                    type="text"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    onKeyDown={handleAddEmailInvite}
                  />
                </div>
              </div>

              <div className="space-y-stack-sm">
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-[10px] font-bold">Suggested Contacts</p>
                <div className="space-y-base max-h-64 overflow-y-auto pr-1">
                  {suggestedContacts.map((contact) => {
                    const isAdded = teamMembers.some((m) => m.email === contact.email);
                    return (
                      <div 
                        key={contact.email}
                        onClick={() => handleToggleContact(contact)}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-container-high transition-colors group cursor-pointer"
                      >
                        <div className="flex items-center gap-stack-sm">
                          <div className="w-10 h-10 rounded-full bg-secondary-container/10 text-secondary flex items-center justify-center font-bold text-xs">
                            {contact.avatar}
                          </div>
                          <div>
                            <p className="font-label-md text-label-md text-on-surface font-semibold">{contact.name}</p>
                            <p className="text-label-sm text-on-surface-variant text-xs">{contact.role}</p>
                          </div>
                        </div>
                        <button 
                          type="button"
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            isAdded 
                              ? 'text-green-500 bg-green-500/10' 
                              : 'text-on-surface-variant group-hover:text-secondary group-hover:bg-secondary-container/20'
                          }`}
                        >
                          <i className={`fa-solid ${isAdded ? 'fa-check' : 'fa-plus'} text-sm`}></i>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-stack-md border-t border-outline-variant/10">
                <p className="font-label-sm text-label-sm text-on-surface-variant mb-2 text-xs font-semibold">
                  Team Members ({teamMembers.length})
                </p>
                <div className="flex -space-x-2 flex-wrap gap-y-2">
                  {teamMembers.map((member) => (
                    <div 
                      key={member.email}
                      className="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-primary-container text-white flex items-center justify-center text-[10px] font-bold"
                      title={`${member.name} (${member.role})`}
                    >
                      {member.avatar}
                    </div>
                  ))}
                  {teamMembers.length === 0 && (
                    <span className="text-xs text-on-surface-variant italic">No members added yet.</span>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Form Footer Actions */}
          <div className="px-stack-lg py-stack-md bg-surface-container-low/30 border-t border-outline-variant/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-on-surface-variant text-xs text-center md:text-left">
              <i className="fa-solid fa-circle-info text-[16px]"></i>
              <span>Project templates are available for quick start.</span>
            </div>
            <div className="flex items-center gap-stack-md w-full md:w-auto">
              <button 
                type="button" 
                onClick={onCancel}
                className="flex-1 md:flex-none px-6 py-2.5 rounded-xl font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-high transition-all active:scale-95 cursor-pointer text-sm"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="flex-1 md:flex-none px-8 py-2.5 rounded-xl bg-secondary text-white font-bold hover:bg-secondary/90 active:scale-95 transition-all cursor-pointer text-sm"
              >
                Create Project
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};

export default CreateProject;
