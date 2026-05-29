import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Auth = ({ initialIsLogin = true, onBackToLanding }) => {
  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    }
  };

  const handleToggleMode = (mode) => {
    setIsLogin(mode);
    setError('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-background text-on-surface p-4 relative">
      {onBackToLanding && (
        <button
          onClick={onBackToLanding}
          className="absolute top-6 left-6 flex items-center gap-2 text-on-surface-variant hover:text-secondary transition-all cursor-pointer font-semibold"
        >
          <i className="fa-solid fa-arrow-left text-sm"></i>
          Back to Home
        </button>
      )}

      <div className="w-full max-w-[420px] bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-8 shadow-[0_4px_12px_rgba(19,27,46,0.04)]">
        <div 
          onClick={onBackToLanding}
          className="flex flex-col items-center gap-3 mb-8 text-center cursor-pointer group"
          title="Back to Landing Page"
        >
          <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-white group-hover:scale-105 transition-transform duration-200">
            <i className="fa-solid fa-rotate text-xl"></i>
          </div>
          <div>
            <h1 className="font-headline-md text-headline-md font-bold text-on-surface group-hover:text-secondary transition-colors">FlowSync</h1>
            <p className="text-xs uppercase tracking-widest text-on-surface-variant font-semibold mt-1">
              Productivity Workspace
            </p>
          </div>
        </div>
        
        <p className="text-sm text-on-surface-variant mt-2 text-center">
          {isLogin ? 'Welcome back! Sign in to your workspace' : 'Create an account to get started'}
        </p>

        {error && (
          <div className="mb-4 bg-error/10 border border-error/20 text-error px-4 py-2.5 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1">
              <label className="font-label-md text-label-md text-on-surface">Full Name</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all text-body-md outline-none"
                placeholder="Alex Rivera"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="font-label-md text-label-md text-on-surface">Email Address</label>
            <input
              type="email"
              className="w-full px-4 py-2.5 rounded-lg border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all text-body-md outline-none"
              placeholder="alex@flowsync.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="font-label-md text-label-md text-on-surface">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full pl-4 pr-10 py-2.5 rounded-lg border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all text-body-md outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-on-surface-variant hover:text-primary cursor-pointer w-6 h-6 my-auto select-none"
                tabIndex="-1"
              >
                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-1">
              <label className="font-label-md text-label-md text-on-surface">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="w-full pl-4 pr-10 py-2.5 rounded-lg border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all text-body-md outline-none"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-on-surface-variant hover:text-primary cursor-pointer w-6 h-6 my-auto select-none"
                  tabIndex="-1"
                >
                  <i className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
                </button>
              </div>
            </div>
          )}

          <button type="submit" className="w-full bg-secondary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-secondary/20 hover:scale-[1.02] active:scale-95 transition-all mt-6 cursor-pointer">
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-on-surface-variant">
          {isLogin ? (
            <span>
              Don't have an account?{' '}
              <span className="text-secondary font-semibold cursor-pointer hover:underline" onClick={() => handleToggleMode(false)}>
                Register
              </span>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <span className="text-secondary font-semibold cursor-pointer hover:underline" onClick={() => handleToggleMode(true)}>
                Sign In
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
