import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, FileText, Sparkles, KeyRound, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login({ onLoginSuccess }) {
  const { login, register, googleLogin, forgotPassword, resetPassword } = useAuth();
  
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState('buyer');

  // Input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agentLicense, setAgentLicense] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Password Reset states
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetTokenSent, setResetTokenSent] = useState(false);
  const [resetToken, setResetToken] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (isRegister) {
      const res = await register({ name, email, password, role, agentLicense });
      if (res.success) {
        onLoginSuccess();
      } else {
        setError(res.message);
      }
    } else {
      const res = await login(email, password);
      if (res.success) {
        onLoginSuccess();
      } else {
        setError(res.message);
      }
    }
    setLoading(false);
  };

  // Google OAuth payload simulation trigger
  const handleGoogleSimulate = async () => {
    setError('');
    setLoading(true);
    // Generate simulated Google OAuth profile details
    const randomGoogleProfiles = [
      {
        googleId: 'g10293847',
        email: 'rahul.google@gmail.com',
        name: 'Rahul Sharma',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
        role: 'buyer'
      },
      {
        googleId: 'g98472938',
        email: 'priya.google@gmail.com',
        name: 'Priya Patel',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
        role: 'seller'
      },
      {
        googleId: 'g11023648',
        email: 'vikram.google@gmail.com',
        name: 'Vikram Mehta',
        avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=150&h=150&q=80',
        role: 'agent'
      }
    ];
    
    const randomProfile = randomGoogleProfiles[Math.floor(Math.random() * randomGoogleProfiles.length)];

    const res = await googleLogin(randomProfile);
    if (res.success) {
      onLoginSuccess();
    } else {
      setError(res.message);
    }
    setLoading(false);
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    const res = await forgotPassword(email);
    if (res.success) {
      setSuccess(res.message);
      setResetToken(res.resetToken); // Display token to user for easy entry
      setResetTokenSent(true);
    } else {
      setError(res.message);
    }
    setLoading(false);
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const res = await resetPassword(resetToken, email, password);
    if (res.success) {
      setSuccess(res.message);
      setIsForgotPassword(false);
      setResetTokenSent(false);
    } else {
      setError(res.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto px-6 py-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 rounded-3xl shadow-xl relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.05),transparent_50%)]"></div>

        {/* LOGO */}
        <div className="text-center mb-8 relative">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xl shadow-md mx-auto mb-3">
            EA
          </div>
          <h2 className="font-extrabold text-xl text-slate-800 dark:text-slate-100">
            {isForgotPassword ? 'Reset Password' : isRegister ? 'Join EstateAI' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isForgotPassword ? 'Recover your account details' : isRegister ? 'Register your buyer/seller/agent account' : 'Access your marketplace account'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs rounded-xl mb-4 text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl mb-4 text-center">
            {success}
          </div>
        )}

        {/* 1. FORGOT PASSWORD FLOW */}
        {isForgotPassword ? (
          <form onSubmit={resetTokenSent ? handleResetPasswordSubmit : handleForgotPasswordSubmit} className="flex flex-col gap-4 relative">
            {!resetTokenSent ? (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Registered Email</label>
                <div className="relative">
                  <input 
                    type="email" 
                    placeholder="Enter your registered email..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="premium-input pl-10"
                  />
                  <Mail className="absolute left-3 top-3.5 text-slate-400" size={14} />
                </div>
              </div>
            ) : (
              <>
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 text-xs rounded-xl flex items-start gap-2">
                  <KeyRound size={16} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Simulated resetToken:</span>
                    <code className="block bg-white dark:bg-slate-950 px-2 py-1 rounded text-[10px] mt-1 select-all">{resetToken}</code>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Verifying Token</label>
                  <input 
                    type="text" 
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    required
                    className="premium-input"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">New Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="Minimum 6 characters..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="premium-input pl-10"
                    />
                    <Lock className="absolute left-3 top-3.5 text-slate-400" size={14} />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </>
            )}

            <button type="submit" disabled={loading} className="btn-primary py-3 mt-2">
              {loading ? 'Processing request...' : resetTokenSent ? 'Save New Password' : 'Send Recovery Token'}
            </button>

            <button 
              type="button" 
              onClick={() => { setIsForgotPassword(false); setResetTokenSent(false); }}
              className="text-xs text-indigo-500 font-semibold hover:underline mt-2 self-center"
            >
              Back to Sign In
            </button>
          </form>
        ) : (
          
          // 2. STANDARD SIGN IN / SIGN UP FORM
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative">
            
            {/* Name field on register */}
            {isRegister && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Enter your name..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="premium-input pl-10"
                  />
                  <User className="absolute left-3 top-3.5 text-slate-400" size={14} />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="e.g. name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="premium-input pl-10"
                />
                <Mail className="absolute left-3 top-3.5 text-slate-400" size={14} />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
                {!isRegister && (
                  <button 
                    type="button" 
                    onClick={() => setIsForgotPassword(true)}
                    className="text-[10px] text-slate-400 hover:text-indigo-500 font-semibold transition-colors"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="Enter password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="premium-input pl-10"
                />
                <Lock className="absolute left-3 top-3.5 text-slate-400" size={14} />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Role Selectors on Register */}
            {isRegister && (
              <>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Select User Role</label>
                  <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-950/40 p-1.5 rounded-xl border border-slate-200/20 dark:border-slate-800/20 text-[10px] font-bold">
                    <button 
                      type="button"
                      onClick={() => setRole('buyer')}
                      className={`py-2 rounded-lg uppercase tracking-wider transition-all ${role === 'buyer' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Buyer
                    </button>
                    <button 
                      type="button"
                      onClick={() => setRole('seller')}
                      className={`py-2 rounded-lg uppercase tracking-wider transition-all ${role === 'seller' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Seller
                    </button>
                    <button 
                      type="button"
                      onClick={() => setRole('agent')}
                      className={`py-2 rounded-lg uppercase tracking-wider transition-all ${role === 'agent' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Agent
                    </button>
                  </div>
                </div>

                {role === 'agent' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                  >
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">RERA Agent License Number</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="RERA-XX-XXXX-XXXX"
                        value={agentLicense}
                        onChange={(e) => setAgentLicense(e.target.value)}
                        required
                        className="premium-input pl-10"
                      />
                      <FileText className="absolute left-3 top-3.5 text-slate-400" size={14} />
                    </div>
                  </motion.div>
                )}
              </>
            )}

            <button type="submit" disabled={loading} className="btn-primary py-3 mt-2">
              {loading ? 'Processing...' : isRegister ? 'Register Account' : 'Sign In'}
            </button>

            {/* Google OAuth Simulation Trigger */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-slate-800"></div></div>
              <div className="relative flex justify-center text-[10px] font-bold uppercase"><span className="bg-white dark:bg-slate-900 px-3 text-slate-400">Or connection with</span></div>
            </div>

            <button 
              type="button" 
              onClick={handleGoogleSimulate}
              disabled={loading}
              className="btn-secondary w-full py-3 flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.53 14.98 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.87 3C6.3 7.8 8.95 5.04 12 5.04z"/>
                <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.28 1.48-1.12 2.73-2.38 3.58l3.7 2.87c2.16-1.99 3.41-4.92 3.41-8.6z"/>
                <path fill="#FBBC05" d="M5.37 14.9C5.07 14 4.9 13.02 4.9 12s.17-2 .47-2.9L1.5 6.1C.54 8 0 10.13 0 12s.54 4 1.5 5.9l3.87-3z"/>
                <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.7-2.87c-1.03.69-2.35 1.1-3.96 1.1-3.05 0-5.7-2.76-6.62-5.46L1.5 15.9C3.4 19.75 7.35 23 12 23z"/>
              </svg>
              Simulate Google OAuth Login
            </button>

            {/* Toggle Sign In / Register */}
            <button 
              type="button" 
              onClick={() => { setIsRegister(!isRegister); setError(''); setSuccess(''); }}
              className="text-xs text-slate-500 hover:text-indigo-500 font-semibold mt-4 self-center transition-colors"
            >
              {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>

          </form>
        )}

      </motion.div>
    </div>
  );
}
