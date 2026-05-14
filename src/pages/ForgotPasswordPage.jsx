import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { authApi } from '../services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail]   = useState('');
  const [devLink, setDevLink] = useState(null); // shown in dev mode only

  const mutation = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: (data) => {
      if (data.dev_reset_link) setDevLink(data.dev_reset_link);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    mutation.mutate({ email });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl shadow-lg mb-4">
            <FileText size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Forgot Password</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">

          {/* Success state */}
          {mutation.isSuccess ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Check your email</h2>
              <p className="text-sm text-gray-500">
                If <span className="font-medium text-gray-700">{email}</span> is registered,
                a password reset link has been sent. Check your inbox (and spam folder).
              </p>
              <p className="text-xs text-gray-400">The link expires in 1 hour.</p>

              {/* Dev mode helper — shows reset link directly in UI */}
              {devLink && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-left">
                  <p className="text-xs font-bold text-amber-700 mb-1">🛠 Dev Mode — Reset Link:</p>
                  <a href={devLink} className="text-xs text-indigo-600 hover:underline break-all">
                    {devLink}
                  </a>
                  <p className="text-xs text-amber-600 mt-1">
                    This is shown because NODE_ENV ≠ production. Remove in production.
                  </p>
                </div>
              )}

              <div className="pt-2 space-y-2">
                <button
                  onClick={() => { mutation.reset(); setEmail(''); setDevLink(null); }}
                  className="w-full btn-secondary text-sm"
                >
                  Send to a different email
                </button>
                <Link to="/login" className="block w-full btn-primary text-center text-sm">
                  Back to Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Email address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    className="input pl-9"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              {mutation.isError && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                  <AlertCircle size={15} />
                  {mutation.error?.response?.data?.error || 'Something went wrong. Please try again.'}
                </div>
              )}

              <button
                type="submit"
                disabled={mutation.isPending || !email}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {mutation.isPending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Sending…
                  </>
                ) : 'Send Reset Link'}
              </button>

              <Link
                to="/login"
                className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft size={14} /> Back to Login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
