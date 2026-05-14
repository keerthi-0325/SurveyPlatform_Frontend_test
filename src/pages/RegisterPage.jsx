import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FileText } from 'lucide-react';
import { authApi } from '../services/api';
import useAuthStore from '../store/authStore';
import { Spinner } from '../components/ui';

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      const res = await authApi.register(data);
      setAuth(res.token, res.user);
      navigate('/app/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-4">
            <FileText size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 mt-2">Set up your organization on SurveyPro</p>
        </div>

        <div className="card">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">{error}</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Organization Info */}
            <div>
              <h3 className="text-sm font-semibold text-indigo-700 uppercase tracking-wide mb-3 pb-1 border-b border-indigo-100">Organization Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">Organization Name *</label>
                  <input className="input" placeholder="Acme Inc." {...register('org_name', { required: 'Required' })} />
                  {errors.org_name && <p className="text-red-500 text-xs mt-1">{errors.org_name.message}</p>}
                </div>
                <div>
                  <label className="label">Industry</label>
                  <select className="input" {...register('industry')}>
                    <option value="">Select industry…</option>
                    <option value="technology">Technology</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="education">Education</option>
                    <option value="finance">Finance</option>
                    <option value="retail">Retail</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="consulting">Consulting</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="label">Country</label>
                  <input className="input" placeholder="India" {...register('country')} />
                </div>
                <div>
                  <label className="label">Website</label>
                  <input className="input" placeholder="https://acme.com" {...register('website')} />
                </div>
                <div>
                  <label className="label">Timezone</label>
                  <select className="input" {...register('timezone')}>
                    <option value="UTC">UTC</option>
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                    <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Admin User Info */}
            <div>
              <h3 className="text-sm font-semibold text-indigo-700 uppercase tracking-wide mb-3 pb-1 border-b border-indigo-100">Admin Account</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Your Full Name *</label>
                  <input className="input" placeholder="Jane Doe" {...register('name', { required: 'Required' })} />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="label">Job Title</label>
                  <input className="input" placeholder="Product Manager" {...register('job_title')} />
                </div>
                <div>
                  <label className="label">Work Email *</label>
                  <input type="email" className="input" placeholder="jane@acme.com" {...register('email', { required: 'Required' })} />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input className="input" placeholder="+91 98765 43210" {...register('phone')} />
                </div>
                <div>
                  <label className="label">Department</label>
                  <input className="input" placeholder="Operations" {...register('department')} />
                </div>
                <div>
                  <label className="label">Password *</label>
                  <input type="password" className="input" placeholder="Min 8 characters"
                    {...register('password', { required: 'Required', minLength: { value: 8, message: 'Min 8 characters' } })} />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              {loading && <Spinner size={16} />}
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
