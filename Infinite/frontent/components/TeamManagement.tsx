import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { Users, UserPlus, Search, Shield, Mail, Loader2, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '../config';

const TeamManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState<UserRole>(UserRole.USER);
    const [newDept, setNewDept] = useState('');
    const auth = JSON.parse(localStorage.getItem('tms_auth') || '{}');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/users`, {
                    headers: { 'Authorization': `Bearer ${auth.token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setUsers(data);
                }
            } catch (err) {
                console.error("Failed to fetch users", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [auth.token]);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.token}`
                },
                body: JSON.stringify({
                    name: newName,
                    email: newEmail,
                    password: newPassword,
                    role: newRole,
                    department: newDept
                }),
            });

            if (response.ok) {
                const newUser = await response.json();
                setUsers([...users, newUser]);
                setShowCreateModal(false);
                setNewName('');
                setNewEmail('');
                setNewPassword('');
                setNewRole(UserRole.USER);
                setNewDept('');
            }
        } catch (err) {
            console.error("Failed to create user", err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="p-10 max-w-[1200px] mx-auto">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <Users className="w-8 h-8 text-indigo-600" />
                        Infrastructure Team
                    </h2>
                    <p className="text-slate-500 mt-2">Manage access controls and team assignments for the technical staff.</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
                >
                    <UserPlus className="w-5 h-5" />
                    Invite Member
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map(user => (
                    <div key={user.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-xl font-bold text-indigo-600">
                                {user.name.charAt(0)}
                            </div>
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${user.role === UserRole.ADMIN ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                                {user.role}
                            </span>
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 mb-1">{user.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                            <Mail className="w-4 h-4" />
                            {user.email}
                        </div>
                        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <Shield className="w-3.5 h-3.5" />
                                {user.role === 'ADMIN' ? 'High Privilege' : 'Standard Access'}
                            </div>
                            <button className="text-slate-300 hover:text-red-600 p-2 transition-colors">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create User Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                        <div className="p-10 border-b border-slate-100">
                            <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Invite Technical Staff</h3>
                            <p className="text-slate-500 leading-relaxed text-sm">Deploy access credentials for new infrastructure operators or administrators.</p>
                        </div>

                        <form onSubmit={handleCreateUser} className="p-10 space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Display Name</label>
                                <input
                                    required
                                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800"
                                    placeholder="Enter full name"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                                <input
                                    required
                                    type="email"
                                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800"
                                    placeholder="operator@infinite.com"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Initial Password</label>
                                <input
                                    required
                                    type="password"
                                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800"
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Access Privilege</label>
                                <select
                                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800 capitalize"
                                    value={newRole}
                                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                                >
                                    <option value={UserRole.USER}>Standard Operator</option>
                                    <option value={UserRole.DEVELOPER}>Infrastructure Developer</option>
                                    <option value={UserRole.DESIGNER}>UX/UI Designer</option>
                                    <option value={UserRole.DM}>Delivery Manager (DM)</option>
                                    <option value={UserRole.TEAM_LEAD}>Team Lead (TL)</option>
                                    <option value={UserRole.ADMIN}>System Administrator</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Department</label>
                                <select
                                    required
                                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800 capitalize"
                                    value={newDept}
                                    onChange={(e) => setNewDept(e.target.value)}
                                >
                                    <option value="">Select Department</option>
                                    <option value="DEVELOPMENT">Development</option>
                                    <option value="DESIGN">Design</option>
                                    <option value="DELIVERY">Delivery</option>
                                    <option value="MANAGEMENT">Management</option>
                                </select>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 font-bold bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]"
                                >
                                    Create Account
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamManagement;
