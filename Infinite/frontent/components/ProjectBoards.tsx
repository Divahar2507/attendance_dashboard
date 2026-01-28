import React from 'react';
import { Briefcase, Zap, Layout, Star, Clock } from 'lucide-react';

const ProjectBoards: React.FC = () => {
    return (
        <div className="p-10 max-w-[1200px] mx-auto">
            <div className="mb-10 text-center py-20 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[3rem] shadow-2xl shadow-indigo-200">
                <div className="bg-white/10 w-20 h-20 rounded-3xl backdrop-blur-md flex items-center justify-center mx-auto mb-8">
                    <Briefcase className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-4xl font-bold text-white tracking-tight">Project Boards</h2>
                <p className="text-indigo-100 mt-4 text-lg max-w-lg mx-auto leading-relaxed">Advanced Kanban and Sprint oversight modules are currently under maintenance for system optimization.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { title: 'Server Fleet Sync', progress: '84%', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
                    { title: 'Core Cluster v4', progress: '12%', icon: Layout, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                    { title: 'Security Hardening', progress: '62%', icon: Star, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                ].map((project, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className={`w-12 h-12 rounded-2xl ${project.bg} flex items-center justify-center mb-6`}>
                            <project.icon className={`w-6 h-6 ${project.color}`} />
                        </div>
                        <h4 className="text-lg font-bold text-slate-800 mb-2">{project.title}</h4>
                        <div className="flex items-center gap-2 mb-6">
                            <Clock className="w-4 h-4 text-slate-300" />
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">Upcoming Cycle</span>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Readiness</span>
                                <span className="text-sm font-bold text-indigo-600">{project.progress}</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-600 rounded-full" style={{ width: project.progress }}></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProjectBoards;
