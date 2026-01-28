import React from 'react';
import { FileTextIcon, UserIcon, ClockIcon } from './Icons';

const ProjectReport = ({ allWorkUpdates }) => {
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2">Project Execution Feed</h2>
                    <p className="text-slate-500 font-medium">Global stream of technical updates and performance logs across all teams.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {allWorkUpdates.length === 0 ? (
                    <div className="bg-white rounded-[32px] p-20 text-center border border-slate-100 shadow-sm">
                        <FileTextIcon className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                        <h3 className="text-xl font-bold text-slate-400">No work updates have been logged yet.</h3>
                    </div>
                ) : (
                    allWorkUpdates.map((update, index) => (
                        <div key={update.id || index} className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 hover:shadow-md transition-all flex items-start gap-8 group">
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-cyan-50 group-hover:text-cyan-600 transition-colors shrink-0">
                                <FileTextIcon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-xl font-black text-slate-900 leading-none">{update.project_name}</h3>
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border uppercase tracking-widest ${update.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                update.status === 'On Hold' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                    'bg-cyan-50 text-cyan-600 border-cyan-100'
                                            }`}>
                                            {update.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                                        <ClockIcon className="w-3.5 h-3.5" />
                                        {update.date}
                                    </div>
                                </div>

                                <p className="text-slate-600 leading-relaxed mb-6 font-medium bg-slate-50/50 p-4 rounded-2xl border border-slate-50">{update.description}</p>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${update.username || 'user'}`} alt="user" className="w-full h-full object-cover" />
                                        </div>
                                        <span className="text-sm font-bold text-slate-900">{update.full_name || update.username || 'System User'}</span>
                                    </div>
                                    <button className="text-[10px] font-black text-[#00bcd4] uppercase tracking-widest hover:underline">Verify Cycle</button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ProjectReport;
