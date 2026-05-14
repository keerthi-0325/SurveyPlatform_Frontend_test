import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { authApi } from '../services/api';

// Password strength checker
function strength(pw) {
  let score = 0;
  if (pw.length >= 8)            score++;
  if (pw.length >= 12)           score++;
  if (/[A-Z]/.test(pw))         score++;
  if (/[0-9]/.test(pw))         score++;
  if (/[^A-Za-z0-9]/.test(pw))  score++;
  return score; // 0–5
}

const STRENGTH_LABEL = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
const STRENGTH_COLOR = ['', 'bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 'bg-green-600'];

export default function ResetPasswordPage() {
  const [searchParams]      = useSearchParams();
  const navigate            = useNavigate();
  const token               = searchParams.get('token') || '';
  const email               = searchParams.get('email') || '';

  const [password, setPassword]   = useState('');
  const [confirm,  setConfirm]    = useState('');
  const [showPw,   setShowPw]     = useState(false);
  const [showCf,   setShowCf]     = useState(false);
  const [formError, setFormError] = useState('');

  const pw_strength = strength(password);

  const mutation = useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: () => {
      setTimeout(() => navigate('/login', { state: { message: 'Password reset successfully! Please log in.' } }), 2500);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    if (password.length < 8) return setFormError('Password must be at least 8 characters.');
    if (password !== confirm) return setFormError('Passwords do not match.');
    if (!token || !email) return setFormError('Invalid reset link. Please request a new one.');
    mutation.mutate({ token, email, password });
  };

  // Guard: missing token/email in URL
  if (!token || !email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center space-y-4">
          <AlertCircle size={48} className="text-red-400 mx-auto" />
          <h2 className="text-lg font-semibold text-gray-900">Invalid Reset Link</h2>
          <p className="text-sm text-gray-500">This link is missing required parameters. Please request a new password reset.</p>
          <Link to="/forgot-password" className="btn-primary inline-block">Request New Link</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl shadow-lg mb-4">
            <FileText size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Set New Password</h1>
          <p className="text-sm text-gray-500 mt-1">
            Resetting password for <span className="font-medium text-gray-700">{email}</span>
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">

          {/* Success state */}
          {mutation.isSuccess ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Password Reset!</h2>
              <p className="text-sm text-gray-500">
                Your password has been updated. Redirecting to login…
              </p>
              <Link to="/login" className="btn-primary inline-block">Go to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>

              {/* New password */}
              <div>
                <label className="label">New Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    className="input pl-9 pr-10"
                    placeholder="Min 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoFocus
                  />
                  <button type="button" onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Strength meter */}
                {password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1,2,3,4,5].map((i) => (
                        <div key={i}
                          className={`h-1.5 flex-1 rounded-full transition-all ${i <= pw_strength ? STRENGTH_COLOR[pw_strength] : 'bg-gray-200'}`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs font-medium ${pw_strength <= 2 ? 'text-red-500' : pw_strength === 3 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {STRENGTH_LABEL[pw_strength]}
                    </p>
                  </div>
                )}

                <ul className="mt-2 space-y-0.5">
                  {[
                    { ok: password.length >= 8,           label: 'At least 8 characters' },
                    { ok: /[A-Z]/.test(password),          label: 'One uppercase letter' },
                    { ok: /[0-9]/.test(password),          label: 'One number' },
                    { ok: /[^A-Za-z0-9]/.test(password),  label: 'One special character' },
                  ].map(({ ok, label }) => (
                    <li key={label} className={`text-xs flex items-center gap-1.5 ${ok ? 'text-green-600' : 'text-gray-400'}`}>
                      <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 ${ok ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                        {ok && <span className="text-white text-[8px] font-bold">✓</span>}
                      </span>
                      {label}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Confirm password */}
              <div>
                <label className="label">Confirm Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showCf ? 'text' : 'password'}
                    className={`input pl-9 pr-10 ${confirm && confirm !== password ? 'border-red-400 focus:ring-red-400' : ''}`}
                    placeholder="Repeat your new password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => setShowCf((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showCf ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirm && confirm !== password && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
                {confirm && confirm === password && password && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><CheckCircle size={11} /> Passwords match</p>
                )}
              </div>

              {/* Errors */}
              {(formError || mutation.isError) && (
                <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                  <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                  {formError || mutation.error?.response?.data?.error || 'Reset failed. The link may have expired.'}
                </div>
              )}

              <button
                type="submit"
                disabled={mutation.isPending || password.length < 8 || password !== confirm}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {mutation.isPending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Resetting…
                  </>
                ) : 'Reset Password'}
              </button>

              <div className="text-center">
                <Link to="/forgot-password" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">
                  Request a new reset link
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
