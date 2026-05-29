import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

const Settings = () => {
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    bio: ''
  });
  const [pushEnabled, setPushEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveComplete, setSaveComplete] = useState(false);
  
  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordChangeComplete, setPasswordChangeComplete] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.get('/auth/me');
        setProfileData({
          name: data.name || '',
          email: data.email || '',
          bio: data.bio || ''
        });
        setPushEnabled(data.pushEnabled ?? false);
        setEmailEnabled(data.emailEnabled ?? true);
        setTwoFactorEnabled(data.twoFactorEnabled ?? false);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch profile settings:', error);
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.put('/auth/me', {
        name: profileData.name,
        email: profileData.email,
        bio: profileData.bio,
        pushEnabled,
        emailEnabled
      });
      setIsSaving(false);
      setSaveComplete(true);
      setTimeout(() => setSaveComplete(false), 3000);
    } catch (error) {
      console.error('Failed to update settings:', error);
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError('');
    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      await api.put('/auth/me', {
        currentPassword,
        password: newPassword
      });
      setIsChangingPassword(false);
      setPasswordChangeComplete(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setPasswordChangeComplete(false);
        setShowPasswordChange(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to change password:', error);
      setPasswordError(error.message || 'Failed to change password.');
      setIsChangingPassword(false);
    }
  };

  if (loading) return <div className="p-10 max-w-7xl mx-auto w-full flex-1">Loading settings...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto w-full flex-1">
      <div className="mb-10">
        <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Account Settings</h2>
        <p className="text-on-surface-variant text-body-lg">Manage your profile, notification preferences, and workspace security.</p>
      </div>

      {/* Bento Grid Layout for Settings */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Profile Information (Bento Large) */}
        <section className="col-span-12 lg:col-span-7 bg-surface-container-lowest rounded-3xl p-8 shadow-[0_20px_25px_-5px_rgba(0,81,213,0.06),0_10px_10px_-5px_rgba(0,81,213,0.02)] border border-outline-variant/10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary-container flex items-center justify-center text-on-secondary-container">
                <i className="fa-solid fa-user-pen text-2xl"></i>
              </div>
              <h3 className="font-headline-md text-headline-md">Profile Information</h3>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="flex flex-col gap-2 group">
              <label className="font-label-md text-label-md text-on-surface-variant px-1 group-focus-within:text-secondary transition-colors">Full Name</label>
              <input 
                className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-bright focus:ring-2 focus:ring-secondary focus:border-secondary transition-all outline-none text-body-md" 
                type="text" 
                value={profileData.name}
                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
              />
            </div>
            
            <div className="flex flex-col gap-2 group">
              <label className="font-label-md text-label-md text-on-surface-variant px-1 group-focus-within:text-secondary transition-colors">Email Address</label>
              <input 
                className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-bright focus:ring-2 focus:ring-secondary focus:border-secondary transition-all outline-none text-body-md" 
                type="email" 
                value={profileData.email}
                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
              />
            </div>
            
            <div className="flex flex-col gap-2 group">
              <label className="font-label-md text-label-md text-on-surface-variant px-1 group-focus-within:text-secondary transition-colors">Bio</label>
              <textarea 
                className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-bright focus:ring-2 focus:ring-secondary focus:border-secondary transition-all outline-none text-body-md resize-none" 
                rows="4" 
                value={profileData.bio}
                onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                placeholder="Write a short bio..."
              ></textarea>
            </div>
            
            <div className="pt-4 flex justify-end">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className={`px-8 py-3 rounded-xl font-label-md text-body-md transition-all shadow-[0_4px_12px_-2px_rgba(0,81,213,0.04),0_2px_4px_-1px_rgba(0,81,213,0.02)] cursor-pointer
                  ${isSaving ? 'opacity-70 bg-secondary text-on-secondary' : 
                    saveComplete ? 'bg-on-tertiary-fixed-variant text-white' : 
                    'bg-secondary text-on-secondary hover:opacity-90 active:scale-95'}`}
              >
                {isSaving ? "Updating..." : saveComplete ? "Changes Saved!" : "Save Changes"}
              </button>
            </div>
          </div>
        </section>

        {/* Notifications & Status (Bento Column) */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
          
          {/* Notifications Section */}
          <section className="bg-surface-container-lowest rounded-3xl p-8 shadow-[0_20px_25px_-5px_rgba(0,81,213,0.06),0_10px_10px_-5px_rgba(0,81,213,0.02)] border border-outline-variant/10 flex-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-secondary-container flex items-center justify-center text-on-secondary-container">
                <i className="fa-solid fa-bell text-2xl"></i>
              </div>
              <h3 className="font-headline-md text-headline-md">Notifications</h3>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-low">
                <div>
                  <p className="font-label-md text-label-md text-on-surface">Push Notifications</p>
                  <p className="text-label-sm text-on-surface-variant">Real-time alerts for tasks</p>
                </div>
                <button 
                  onClick={() => setPushEnabled(!pushEnabled)}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${pushEnabled ? 'bg-secondary' : 'bg-outline-variant'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${pushEnabled ? 'translate-x-5' : ''}`}></div>
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-low">
                <div>
                  <p className="font-label-md text-label-md text-on-surface">Email Summary</p>
                  <p className="text-label-sm text-on-surface-variant">Daily digest of activity</p>
                </div>
                <button 
                  onClick={() => setEmailEnabled(!emailEnabled)}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${emailEnabled ? 'bg-secondary' : 'bg-outline-variant'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${emailEnabled ? 'translate-x-5' : ''}`}></div>
                </button>
              </div>
            </div>
          </section>

          {/* Profile Image Card */}
          <section className="bg-primary-container rounded-3xl p-6 flex items-center justify-between text-on-primary-fixed overflow-hidden relative">
            <div className="z-10">
              <p className="font-headline-md text-white mb-1">Personal Brand</p>
              <p className="text-on-primary-container text-label-md mb-4">Visible to team members</p>
              <button className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-lg text-label-md transition-colors cursor-pointer">Edit Brand</button>
            </div>
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-secondary/20 rounded-full blur-3xl"></div>
            <i className="fa-solid fa-wand-magic-sparkles text-6xl text-white/10 absolute right-4 bottom-4 z-0"></i>
          </section>
          
        </div>

        {/* Security Section (Horizontal Long) */}
        <section className="col-span-12 bg-surface-container-lowest rounded-3xl p-8 shadow-[0_20px_25px_-5px_rgba(0,81,213,0.06),0_10px_10px_-5px_rgba(0,81,213,0.02)] border border-outline-variant/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary-container flex items-center justify-center text-on-secondary-container">
                <i className="fa-solid fa-shield-halved text-2xl"></i>
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md">Security & Access</h3>
                <p className="text-on-surface-variant text-body-md">Protect your account and workspace data.</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-surface-container-low border border-outline-variant/10">
                <div className={`w-3 h-3 rounded-full ${twoFactorEnabled ? 'bg-secondary' : 'bg-outline-variant'}`}></div>
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">2FA Status</p>
                  <p className="font-label-md text-label-md text-on-surface">{twoFactorEnabled ? 'Enabled & Secured' : 'Not Enabled'}</p>
                </div>
              </div>
              
              {!showPasswordChange ? (
                <button 
                  onClick={() => setShowPasswordChange(true)}
                  className="px-6 py-4 rounded-2xl bg-surface-bright border border-outline hover:bg-surface-container transition-colors flex items-center gap-2 text-on-surface font-label-md cursor-pointer"
                >
                  <i className="fa-solid fa-key text-lg"></i>
                  Change Password
                </button>
              ) : (
                <div className="w-full mt-4 p-6 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest">
                  <h4 className="font-headline-md mb-4 text-on-surface">Update Password</h4>
                  {passwordError && (
                    <div className="mb-4 p-3 rounded-lg bg-error-container text-on-error-container text-body-sm">
                      {passwordError}
                    </div>
                  )}
                  <div className="flex flex-col gap-4">
                    <input 
                      type="password" 
                      placeholder="Current Password" 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full max-w-sm px-4 py-3 rounded-xl border border-outline-variant bg-surface-bright focus:ring-2 focus:ring-secondary focus:border-secondary transition-all outline-none text-body-md"
                    />
                    <input 
                      type="password" 
                      placeholder="New Password (min 6 characters)" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full max-w-sm px-4 py-3 rounded-xl border border-outline-variant bg-surface-bright focus:ring-2 focus:ring-secondary focus:border-secondary transition-all outline-none text-body-md"
                    />
                    <input 
                      type="password" 
                      placeholder="Confirm New Password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full max-w-sm px-4 py-3 rounded-xl border border-outline-variant bg-surface-bright focus:ring-2 focus:ring-secondary focus:border-secondary transition-all outline-none text-body-md"
                    />
                    <div className="flex items-center gap-3 mt-2">
                      <button 
                        onClick={handlePasswordChange}
                        disabled={isChangingPassword}
                        className={`px-6 py-3 rounded-xl font-label-md text-body-md transition-all cursor-pointer ${isChangingPassword ? 'opacity-70 bg-secondary text-on-secondary' : passwordChangeComplete ? 'bg-on-tertiary-fixed-variant text-white' : 'bg-secondary text-on-secondary hover:opacity-90'}`}
                      >
                        {isChangingPassword ? 'Saving...' : passwordChangeComplete ? 'Password Updated!' : 'Submit'}
                      </button>
                      <button 
                        onClick={() => { 
                          setShowPasswordChange(false); 
                          setCurrentPassword('');
                          setNewPassword(''); 
                          setConfirmPassword('');
                          setPasswordError('');
                        }}
                        className="px-6 py-3 rounded-xl font-label-md text-body-md bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer text-on-surface"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl border border-outline-variant/20 flex items-center gap-4 hover:bg-surface-container-low transition-colors group cursor-pointer">
              <i className="fa-solid fa-laptop-mobile text-on-surface-variant text-xl"></i>
              <div className="flex-1">
                <p className="text-label-md font-label-md">Device Management</p>
                <p className="text-label-sm text-on-surface-variant">3 Active Sessions</p>
              </div>
              <i className="fa-solid fa-chevron-right text-outline group-hover:translate-x-1 transition-transform"></i>
            </div>
            
            <div className="p-4 rounded-2xl border border-outline-variant/20 flex items-center gap-4 hover:bg-surface-container-low transition-colors group cursor-pointer">
              <i className="fa-solid fa-clock-rotate-left text-on-surface-variant text-xl"></i>
              <div className="flex-1">
                <p className="text-label-md font-label-md">Audit Logs</p>
                <p className="text-label-sm text-on-surface-variant">View access history</p>
              </div>
              <i className="fa-solid fa-chevron-right text-outline group-hover:translate-x-1 transition-transform"></i>
            </div>
            
            <div className="p-4 rounded-2xl border border-outline-variant/20 flex items-center gap-4 hover:bg-surface-container-low transition-colors group cursor-pointer">
              <i className="fa-solid fa-code text-on-surface-variant text-xl"></i>
              <div className="flex-1">
                <p className="text-label-md font-label-md">API Tokens</p>
                <p className="text-label-sm text-on-surface-variant">Manage integrations</p>
              </div>
              <i className="fa-solid fa-chevron-right text-outline group-hover:translate-x-1 transition-transform"></i>
            </div>
          </div>
        </section>

        {/* Dangerous Zone (Asymmetric Accent) */}
        <section className="col-span-12 lg:col-span-4 bg-error-container/20 rounded-3xl p-6 border border-error/10">
          <p className="text-error font-label-md flex items-center gap-2 mb-2">
            <i className="fa-solid fa-triangle-exclamation text-lg"></i>
            Danger Zone
          </p>
          <p className="text-on-surface-variant text-label-sm mb-4 leading-relaxed">Deactivating your account will remove all project history and personal data. This cannot be undone.</p>
          <button className="text-error font-label-md hover:underline decoration-error/30 underline-offset-4 cursor-pointer">Deactivate Account...</button>
        </section>
        
        <div className="col-span-12 lg:col-span-8 bg-surface-container p-8 rounded-3xl flex items-center justify-between">
          <div>
            <p className="font-headline-md mb-1">Need help with settings?</p>
            <p className="text-on-surface-variant text-body-md">Our support team is available 24/7 for security inquiries.</p>
          </div>
          <button className="bg-on-surface text-surface px-6 py-3 rounded-xl font-label-md hover:opacity-90 transition-opacity cursor-pointer">Contact Support</button>
        </div>
        
      </div>
      
      {/* Footer Footer (Simple Anchor) */}
      <footer className="mt-8 py-8 border-t border-outline-variant/10 text-center">
        <p className="text-label-sm text-on-surface-variant/50">FlowSync v4.2.0 • Build 2024.11.08 • Secure Workspace Certified</p>
      </footer>
    </div>
  );
};

export default Settings;
