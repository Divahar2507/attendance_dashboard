import React from 'react';
import { Settings, Shield, Bell, Cloud, Database, Cpu, ChevronRight } from 'lucide-react';

const SystemSettings: React.FC = () => {
    return (
        <div className="p-10 max-w-[1200px] mx-auto text-slate-900">
            <div className="mb-10">
                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <Settings className="w-8 h-8 text-indigo-600" />
                    System Settings
                </h2>
                <p className="text-slate-500 mt-2">Manage infrastructure environment variables and security profiles.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                {[
                    { label: 'Security & Auth', desc: 'Manage JWT secrets and user privilege levels', icon: Shield },
                    { label: 'Core Infrastructure', desc: 'PostgreSQL connection strings and system timeouts', icon: Database },
                    { label: 'Cloud Resources', desc: 'Sync with AWS/Azure fleets and bucket permissions', icon: Cloud },
                    { label: 'System Logs', desc: 'Real-time performance monitoring and error tracking', icon: Cpu },
                ].map((item, i) => (
                    <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between group cursor-pointer hover:border-indigo-200 transition-all">
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                <item.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{item.label}</h3>
                                <p className="text-sm text-slate-400">{item.desc}</p>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            <ChevronRight className="w-5 h-5" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 p-8 border-2 border-dashed border-slate-200 rounded-[2rem] text-center">
                <p className="text-sm font-bold text-slate-300 uppercase tracking-[0.2em] mb-4 text-[10px]">Security Protocols Active</p>
                <button className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-95 transition-all">
                    Update Production Environment
                </button>
            </div>
        </div>
    );
};

export default SystemSettings;
