import React from 'react';
import { ClockIcon, FolderIcon, FileTextIcon } from './Icons';

const Reports = ({ allWorkUpdates }) => {
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2">System Reports</h2>
                    <p className="text-slate-500">Generate and export detailed insights about workforce and projects.</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
                {/* Attendance Reports */}
                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 flex flex-col">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center"><ClockIcon className="w-6 h-6" /></div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Attendance Reports</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Workforce Presence Analytics</p>
                        </div>
                    </div>

                    <div className="flex gap-2 mb-8 bg-slate-50 p-1.5 rounded-xl">
                        {['Daily', 'Weekly', 'Monthly', 'Custom'].map(range => (
                            <button key={range} className="flex-1 py-2 rounded-lg text-xs font-bold text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm transition-all focus:bg-white focus:text-cyan-600 focus:shadow-md">
                                {range}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4 mb-8 flex-1">
                        <div className="flex justify-between items-center p-4 border border-slate-100 rounded-xl">
                            <span className="text-sm font-bold text-slate-600">Average Check-in Time</span>
                            <span className="text-sm font-black text-slate-900">09:14 AM</span>
                        </div>
                        <div className="flex justify-between items-center p-4 border border-slate-100 rounded-xl">
                            <span className="text-sm font-bold text-slate-600">On-Time Percentage</span>
                            <span className="text-sm font-black text-emerald-500">92%</span>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Export Data As</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-red-500 hover:text-red-500 hover:bg-red-50 transition-all">
                                <FileTextIcon className="w-4 h-4" /> PDF
                            </button>
                            <button className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-50 transition-all">
                                <FileTextIcon className="w-4 h-4" /> Excel
                            </button>
                        </div>
                    </div>
                </div>

                {/* Project Status Reports */}
                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 flex flex-col">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center"><FolderIcon className="w-6 h-6" /></div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Project Status</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Work Updates & Progress</p>
                        </div>
                    </div>

                    <div className="flex gap-2 mb-8 bg-slate-50 p-1.5 rounded-xl">
                        {['Daily', 'Weekly', 'Monthly', 'Custom'].map(range => (
                            <button key={range} className="flex-1 py-2 rounded-lg text-xs font-bold text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm transition-all focus:bg-white focus:text-cyan-600 focus:shadow-md">
                                {range}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4 mb-8 flex-1 overflow-y-auto custom-scrollbar pr-2 max-h-80">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="p-4 border border-slate-100 rounded-xl">
                                <span className="block text-xs font-bold text-slate-400 uppercase">Total</span>
                                <span className="text-xl font-black text-slate-900">{allWorkUpdates.length}</span>
                            </div>
                            <div className="p-4 border border-slate-100 rounded-xl">
                                <span className="block text-xs font-bold text-slate-400 uppercase">Pending</span>
                                <span className="text-xl font-black text-amber-500">{allWorkUpdates.filter(u => u.status !== 'Completed').length}</span>
                            </div>
                        </div>

                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Recent Updates</h4>
                        {allWorkUpdates.length === 0 ? <p className="text-sm text-slate-400 italic">No updates found.</p> : (
                            <div className="space-y-3">
                                {allWorkUpdates.map(update => (
                                    <div key={update.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-bold text-sm text-slate-900 line-clamp-1">{update.project_name}</span>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${update.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{update.status}</span>
                                        </div>
                                        <p className="text-xs text-slate-600 line-clamp-2 mb-1">{update.description}</p>
                                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                                            <span>{update.date}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Export Data As</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-red-500 hover:text-red-500 hover:bg-red-50 transition-all">
                                <FileTextIcon className="w-4 h-4" /> PDF
                            </button>
                            <button className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-50 transition-all">
                                <FileTextIcon className="w-4 h-4" /> Excel
                            </button>
                        </div>
                    </div>
                </div>
                {/* Ticket Analytics */}
                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 flex flex-col">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-500 flex items-center justify-center">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Ticket Analytics</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">TMS Performance Metrics</p>
                        </div>
                    </div>

                    <div className="flex gap-2 mb-8 bg-slate-50 p-1.5 rounded-xl">
                        {['Overall', 'By Status', 'By Team', 'AI Insights'].map(tab => (
                            <button key={tab} className="flex-1 py-2 rounded-lg text-xs font-bold text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm transition-all focus:bg-white focus:text-cyan-600 focus:shadow-md">
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4 mb-8 flex-1">
                        <div className="flex justify-between items-center p-4 border border-slate-100 rounded-xl">
                            <span className="text-sm font-bold text-slate-600">Total Force Tickets</span>
                            <span className="text-sm font-black text-slate-900">24</span>
                        </div>
                        <div className="flex justify-between items-center p-4 border border-slate-100 rounded-xl">
                            <span className="text-sm font-bold text-slate-600">Completion Rate</span>
                            <span className="text-sm font-black text-cyan-500">78%</span>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Export Data As</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-red-500 hover:text-red-500 hover:bg-red-50 transition-all">
                                <FileTextIcon className="w-4 h-4" /> PDF
                            </button>
                            <button className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-50 transition-all">
                                <FileTextIcon className="w-4 h-4" /> Excel
                            </button>
                        </div>
                    </div>
                </div>

                {/* Project Readiness */}
                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 flex flex-col">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Project Readiness</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Kanban Module Oversight</p>
                        </div>
                    </div>

                    <div className="space-y-6 flex-1 mb-8 overflow-y-auto max-h-72 pr-2">
                        {[
                            { name: 'Server Fleet Sync', progress: 84, color: 'bg-amber-500' },
                            { name: 'Core Cluster v4', progress: 12, color: 'bg-indigo-500' },
                            { name: 'Security Hardening', progress: 62, color: 'bg-emerald-500' },
                            { name: 'Cloud Migration', progress: 45, color: 'bg-cyan-500' }
                        ].map((p, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-sm font-bold text-slate-700">{p.name}</span>
                                    <span className="text-xs font-bold text-slate-400">{p.progress}%</span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className={`h-full ${p.color} rounded-full transition-all duration-1000`} style={{ width: `${p.progress}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-slate-800 transition-all">
                        View Detailed Boards
                    </button>
                </div>

                {/* Team Performance */}
                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 flex flex-col">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><polyline points="17 11 19 13 23 9" /></svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Team Performance</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Individual Member Stats</p>
                        </div>
                    </div>

                    <div className="space-y-4 flex-1 mb-8 overflow-y-auto max-h-72 pr-2">
                        {[
                            { name: 'Arun Kumar', role: 'Developer', tickets: 12, done: 10 },
                            { name: 'Priya Dharshini', role: 'Designer', tickets: 8, done: 8 },
                            { name: 'Siva Perumal', role: 'Team Lead', tickets: 5, done: 4 },
                            { name: 'Divya Bharathi', role: 'DM', tickets: 15, done: 12 }
                        ].map((m, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                        {m.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{m.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{m.role}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-slate-900">{m.done}/{m.tickets}</p>
                                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Resolved</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
                            Performance Log
                        </button>
                        <button className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
                            Efficiency Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
