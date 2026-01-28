import React, { useState } from 'react';
import { LogoIcon, UserIcon, ShieldCheckIcon } from '../components/Icons';
import { api } from '../services/api';

const Login = ({ onLogin }) => {
    const [loginType, setLoginType] = useState('admin'); // 'admin' or 'employee'
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleTypeChange = (type) => {
        setLoginType(type);
        setError('');
        if (type === 'admin') {
            setUsername('');
            setPassword('');
        } else {
            // Default demo employee if needed, or clear fields
            setUsername('');
            setPassword('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = await api.login(username, password);
            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('tms_auth', JSON.stringify({ user: data.user, token: data.token }));
            }
            // Basic role check on frontend to ensure they are logging into the right portal
            // (Optional, but good for UX if they try to login as employee on admin tab)
            if (loginType === 'admin' && data.user.role !== 'ADMIN') {
                setError('Access Denied. You are not an Admin.');
                setLoading(false);
                return;
            }
            if (loginType === 'employee' && data.user.role !== 'EMPLOYEE') {
                setError('Please use the Admin login tab.');
                setLoading(false);
                return;
            }

            onLogin(data.user);
        } catch (err) {
            console.error(err);
            setError('Invalid credentials. Please check your username and password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-[32px] p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
                <div className="flex justify-center mb-8">
                    <img src="/logo.png" alt="InfiniteTech" className="h-16 object-contain" />
                </div>

                <div className="flex bg-slate-100 p-1.5 rounded-xl mb-8">
                    <button
                        onClick={() => handleTypeChange('admin')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${loginType === 'admin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <ShieldCheckIcon className="w-4 h-4" /> Admin
                    </button>
                    <button
                        onClick={() => handleTypeChange('employee')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${loginType === 'employee' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <UserIcon className="w-4 h-4" /> Employee
                    </button>
                </div>

                <h1 className="text-3xl font-black text-center text-slate-900 mb-2">
                    {loginType === 'admin' ? 'Admin Portal' : 'Employee Portal'}
                </h1>
                <p className="text-center text-slate-500 text-sm mb-10">
                    {loginType === 'admin' ? 'Manage your organization securely' : 'Access your dashboard and workspace'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className={`w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 transition-all ${loginType === 'admin' ? 'focus:ring-cyan-500/20' : 'focus:ring-indigo-500/20'}`}
                            placeholder="Enter username"
                        />
                    </div>
                    <div>
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 transition-all ${loginType === 'admin' ? 'focus:ring-cyan-500/20' : 'focus:ring-indigo-500/20'}`}
                            placeholder="Enter password"
                        />
                    </div>

                    {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 text-white rounded-xl font-bold text-sm shadow-lg transition-all active:scale-95 disabled:opacity-50 ${loginType === 'admin' ? 'bg-[#00bcd4] hover:bg-[#00acc1] shadow-cyan-500/20' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'}`}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <p className="text-center mt-8 text-xs text-slate-400 font-medium">
                    Protected by InfiniteTech Secure Auth
                </p>
            </div>
        </div>
    );
};

export default Login;
