import React, { useState, useEffect } from 'react';
import {
    LogoIcon,
    SearchIcon,
    BellIcon,
    UserIcon,
    SettingsIcon,
    BuildingIcon,
    UserPlusIcon,
    UsersGroupIcon,
    FilterIcon,
    ExportIcon,
    MapPinIcon,
    ShieldCheckIcon,
    FileTextIcon,
    MoreHorizontalIcon,
    FolderIcon,
    BrainIcon
} from './Icons';
import { api } from '../services/api';

const AdminDashboard = ({ user, onLogout }) => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [adminSubTab, setAdminSubTab] = useState('All Employees');
    const [activeView, setActiveView] = useState('admin');

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const data = await api.getEmployees();
            setEmployees(data);
        } catch (err) {
            console.error("Failed to fetch employees", err);
        } finally {
            setLoading(false);
        }
    };

    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [newUserLoading, setNewUserLoading] = useState(false);
    const [newUserError, setNewUserError] = useState('');
    const [formData, setFormData] = useState({
        username: '', email: '', password: '',
        first_name: '', last_name: '', employee_id: '',
        phone_number: '', date_of_birth: ''
    });

    const [allWorkUpdates, setAllWorkUpdates] = useState([]);

    useEffect(() => {
        if (activeView === 'reports') {
            const fetchReports = async () => {
                try {
                    const updates = await api.getWorkUpdates();
                    setAllWorkUpdates(updates);
                } catch (e) { console.error("Failed to fetch reports", e); }
            };
            fetchReports();
        }
    }, [activeView]);


    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setNewUserLoading(true);
        setNewUserError('');
        try {
            await api.createEmployee(formData);
            setShowAddUserModal(false);
            fetchEmployees(); // Refresh list
            // Reset form
            setFormData({
                username: '', email: '', password: '',
                first_name: '', last_name: '', employee_id: '',
                phone_number: '', date_of_birth: ''
            });
        } catch (err) {
            setNewUserError('Failed to create user. Check inputs.');
        } finally {
            setNewUserLoading(false);
        }
    };

    const renderSidebar = () => (
        <aside className="w-[280px] border-r border-slate-100 flex flex-col shrink-0 bg-white sticky top-0 h-screen z-50">
            <div className="p-8 flex items-center gap-3">
                <img src="/logo.png" alt="InfiniteTech" className="h-10 object-contain" />
                <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block leading-none">Admin Portal</span>
                </div>
            </div>
            <div className="px-6 flex-1 space-y-1 overflow-y-auto custom-scrollbar pt-4">
                <SidebarLink icon={<BuildingIcon className="w-5 h-5" />} label="Dashboard" active={activeView === 'admin'} onClick={() => setActiveView('admin')} />
                <SidebarLink icon={<UserIcon className="w-5 h-5" />} label="Employees" active={activeView === 'employees'} onClick={() => setActiveView('employees')} />
                <SidebarLink icon={<FolderIcon className="w-5 h-5" />} label="Reports" active={activeView === 'reports'} onClick={() => setActiveView('reports')} />
                <SidebarLink icon={<SettingsIcon className="w-5 h-5" />} label="System Settings" />
            </div>
            <div className="p-6">
                <button onClick={onLogout} className="text-red-500 text-sm font-bold">Logout</button>
            </div>
        </aside>
    );

    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [empDetails, setEmpDetails] = useState({ attendance: [], work: [], documents: [] });
    const [detailTab, setDetailTab] = useState('profile');

    useEffect(() => {
        if (selectedEmployee) {
            fetchEmployeeDetails(selectedEmployee.id);
        }
    }, [selectedEmployee]);

    const fetchEmployeeDetails = async (id) => {
        try {
            const [att, work, docs] = await Promise.all([
                api.getAttendanceHistory(id),
                api.getWorkUpdates(id),
                api.getDocuments(id)
            ]);
            setEmpDetails({ attendance: att, work, documents: docs });
        } catch (error) {
            console.error("Failed to fetch employee details", error);
        }
    };

    if (selectedEmployee) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col font-['Inter']">
                <header className="h-20 px-10 border-b border-slate-200 bg-white sticky top-0 z-40 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSelectedEmployee(null)} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-all text-slate-500 hover:text-slate-900">← Back</button>
                        <h1 className="text-xl font-bold text-slate-900">Employee Details</h1>
                    </div>
                </header>
                <main className="p-10 max-w-7xl mx-auto w-full space-y-8">
                    {/* Header Card */}
                    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-200 flex items-center gap-8">
                        <div className="w-24 h-24 rounded-2xl bg-slate-100 overflow-hidden shrink-0"><img src={selectedEmployee.profile?.profile_picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedEmployee.username}`} alt="avatar" className="w-full h-full object-cover" /></div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 mb-2">{selectedEmployee.first_name} {selectedEmployee.last_name}</h1>
                            <div className="flex items-center gap-4 text-sm font-bold text-slate-500">
                                <span>{selectedEmployee.employee_id}</span> • <span>{selectedEmployee.profile?.designation}</span> • <span>{selectedEmployee.profile?.department}</span>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2">
                        {['profile', 'attendance', 'work', 'documents'].map(tab => (
                            <button key={tab} onClick={() => setDetailTab(tab)} className={`px-6 py-3 rounded-xl font-bold capitalize transition-all ${detailTab === tab ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-500 hover:text-slate-900'}`}>{tab}</button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-200 min-h-[400px]">
                        {detailTab === 'profile' && (
                            <div className="space-y-8 animate-fade-in">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                        <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><UserIcon className="w-4 h-4 text-slate-400" /> Personal Info</h4>
                                        <div className="space-y-3">
                                            <div><label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Full Name</label><p className="text-sm font-bold text-slate-900">{selectedEmployee.first_name} {selectedEmployee.last_name}</p></div>
                                            <div><label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Email</label><p className="text-sm font-bold text-slate-900">{selectedEmployee.email}</p></div>
                                            <div><label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Phone</label><p className="text-sm font-bold text-slate-900">{selectedEmployee.profile?.phone_number || 'N/A'}</p></div>
                                            <div><label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Status</label><span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-xs font-bold">{selectedEmployee.profile?.status}</span></div>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                        <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><MapPinIcon className="w-4 h-4 text-slate-400" /> Location & Address</h4>
                                        <div className="space-y-3">
                                            <div><label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Work Location</label><p className="text-sm font-bold text-slate-900">{selectedEmployee.profile?.location || 'N/A'}</p></div>
                                            <div><label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Address</label><p className="text-sm text-slate-700">{selectedEmployee.profile?.address_line1 || 'N/A'}</p></div>
                                            <div><label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">City / Zip</label><p className="text-sm text-slate-700">{selectedEmployee.profile?.city || '-'} {selectedEmployee.profile?.zip_code && `(${selectedEmployee.profile.zip_code})`}</p></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                        <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><BuildingIcon className="w-4 h-4 text-slate-400" /> Education</h4>
                                        <div className="space-y-4">
                                            <div className="pb-3 border-b border-slate-200 last:border-0 last:pb-0">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">School</p>
                                                <p className="font-bold text-slate-900">{selectedEmployee.profile?.school_name || '-'}</p>
                                                <p className="text-xs text-slate-500 mt-1">Year: {selectedEmployee.profile?.school_year} • Grade: {selectedEmployee.profile?.school_percentage}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">College</p>
                                                <p className="font-bold text-slate-900">{selectedEmployee.profile?.college_name || '-'}</p>
                                                <p className="text-xs font-bold text-slate-600">{selectedEmployee.profile?.college_degree}</p>
                                                <p className="text-xs text-slate-500 mt-1">Year: {selectedEmployee.profile?.college_year} • CGPA: {selectedEmployee.profile?.college_cgpa}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                        <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><BrainIcon className="w-4 h-4 text-slate-400" /> Skills & Interests</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Skills</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedEmployee.profile?.skills ? selectedEmployee.profile.skills.split(',').map((s, i) => (
                                                        <span key={i} className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600">{s.trim()}</span>
                                                    )) : <span className="text-sm text-slate-400 italic">None listed</span>}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Interests</p>
                                                <p className="text-sm text-slate-700">{selectedEmployee.profile?.hobbies || '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {detailTab === 'attendance' && (
                            <table className="w-full">
                                <thead className="text-left text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100"><tr><th className="pb-4">Date</th><th className="pb-4">Check In</th><th className="pb-4">Check Out</th><th className="pb-4">Status</th><th className="pb-4">Location</th></tr></thead>
                                <tbody className="divide-y divide-slate-50">
                                    {empDetails.attendance.map(rec => (
                                        <tr key={rec.id}>
                                            <td className="py-4 font-bold text-slate-600">{rec.date}</td>
                                            <td className="py-4 font-bold text-slate-900">{rec.check_in_time ? new Date(rec.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                                            <td className="py-4 font-bold text-slate-900">{rec.check_out_time ? new Date(rec.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                                            <td className="py-4"><span className={`text-xs font-black px-2 py-1 rounded border ${rec.status === 'Present' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>{rec.status}</span></td>
                                            <td className="py-4 text-xs font-bold text-slate-500">{rec.location_verified ? 'Verified (Office)' : 'Remote/Unverified'}</td>
                                        </tr>
                                    ))}
                                    {empDetails.attendance.length === 0 && <tr><td colSpan="5" className="py-8 text-center text-slate-400 font-bold">No attendance records found.</td></tr>}
                                </tbody>
                            </table>
                        )}

                        {detailTab === 'work' && (
                            <div className="space-y-6">
                                {empDetails.work.map(update => (
                                    <div key={update.id} className="border border-slate-100 rounded-2xl p-6 bg-slate-50/50">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-slate-900">{update.project_name}</h4>
                                            <span className="text-xs font-bold text-slate-400">{update.date}</span>
                                        </div>
                                        <p className="text-slate-600 text-sm mb-3 leading-relaxed">{update.description}</p>
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border ${update.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>{update.status}</span>
                                    </div>
                                ))}
                                {empDetails.work.length === 0 && <p className="text-center py-8 text-slate-400 font-bold">No work updates logged.</p>}
                            </div>
                        )}

                        {detailTab === 'documents' && (
                            <div className="grid grid-cols-3 gap-6">
                                {empDetails.documents.map(doc => (
                                    <div key={doc.id} className="border border-slate-100 rounded-2xl p-6 hover:shadow-lg transition-all group bg-white">
                                        <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center mb-4"><FileTextIcon className="w-6 h-6" /></div>
                                        <h4 className="font-bold text-slate-900 mb-1 truncate" title={doc.document_type}>{doc.document_type}</h4>
                                        <p className="text-xs font-bold text-slate-400 mb-4">{new Date(doc.uploaded_at).toLocaleDateString()}</p>
                                        <a href={doc.file} target="_blank" rel="noopener noreferrer" className="block text-center py-2 rounded-lg bg-slate-50 text-slate-600 font-bold text-sm group-hover:bg-slate-900 group-hover:text-white transition-all">View Document</a>
                                    </div>
                                ))}
                                {empDetails.documents.length === 0 && <p className="col-span-3 text-center py-8 text-slate-400 font-bold">No documents uploaded.</p>}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        );
    }



    const renderReports = () => (
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
                            <button className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition-all">
                                <FileTextIcon className="w-4 h-4" /> CSV
                            </button>
                            <button className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-indigo-500 hover:text-indigo-500 hover:bg-indigo-50 transition-all">
                                <FileTextIcon className="w-4 h-4" /> DOCX
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
                                            <span>User #{update.user}</span>
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
                            <button className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition-all">
                                <FileTextIcon className="w-4 h-4" /> CSV
                            </button>
                            <button className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-indigo-500 hover:text-indigo-500 hover:bg-indigo-50 transition-all">
                                <FileTextIcon className="w-4 h-4" /> DOCX
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex bg-white font-['Inter']">
            {renderSidebar()}
            <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
                <header className="h-20 px-10 border-b border-slate-100 flex items-center justify-between bg-white z-40 sticky top-0">
                    <div className="flex items-center gap-10">
                        <div className="flex items-center gap-3">
                            <img src="/logo.png" alt="InfiniteTech" className="h-8 object-contain" />
                            <span className="font-bold text-slate-900">Admin</span>
                        </div>
                        <div className="relative w-96">
                            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input type="text" placeholder="Search across employees" className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-11 pr-4 text-sm focus:bg-white focus:ring-2 focus:ring-cyan-500/20 transition-all outline-none" />
                        </div>
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden"><img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'admin'}`} alt="avatar" /></div>
                    </div>
                </header>

                <main className="p-10 flex-1 overflow-y-auto custom-scrollbar relative">
                    {activeView === 'reports' ? renderReports() : (
                        <>
                            <div className="flex items-end justify-between mb-10">
                                <div>
                                    <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">User Management</h1>
                                    <p className="text-slate-500 max-w-xl leading-relaxed">Control access, monitor attendance patterns, and manage permissions for all InfiniteTech personnel globally.</p>
                                </div>
                                <button onClick={() => setShowAddUserModal(true)} className="flex items-center gap-2.5 px-6 py-3.5 bg-[#0097a7] hover:bg-[#00838f] text-white rounded-xl font-bold transition-all shadow-lg shadow-cyan-500/20"><UserPlusIcon className="w-5 h-5" /> Add New User</button>
                            </div>
                            <div className="grid grid-cols-4 gap-6 mb-10">
                                <StatCard icon={<UsersGroupIcon className="text-cyan-500" />} label="TOTAL FORCE" value={employees.length} trend="+12%" />
                                <StatCard icon={<MapPinIcon className="text-cyan-500" />} label="CURRENTLY ON-SITE" value={employees.filter(e => e.profile?.status === 'On-Site').length} badge="Live" />
                                <StatCard icon={<ShieldCheckIcon className="text-cyan-500" />} label="ADMINS" value={employees.filter(e => e.role === 'ADMIN').length} badge="Internal" />
                                <StatCard icon={<FileTextIcon className="text-red-500" />} label="PENDING ACCESS" value="7" badge="Critical" badgeColor="text-red-500" />
                            </div>
                            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden mb-10">
                                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50">
                                    <div className="flex gap-10">
                                        {['All Employees', 'AI Research', 'Cloud Infra', 'Operations'].map(tab => (
                                            <button key={tab} onClick={() => setAdminSubTab(tab)} className={`relative py-2 text-sm font-bold transition-all ${adminSubTab === tab ? 'text-cyan-600' : 'text-slate-400 hover:text-slate-600'}`}>
                                                {tab} {tab === 'All Employees' && <span className="ml-1 text-[10px] opacity-40">{employees.length}</span>}
                                                {adminSubTab === tab && <div className="absolute -bottom-[25px] left-0 right-0 h-1 bg-[#00bcd4] rounded-full" />}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex gap-3">
                                        <button className="flex items-center gap-2 px-4 py-2 border border-slate-100 rounded-xl text-[13px] font-bold text-slate-500 hover:bg-slate-50 transition-all"><FilterIcon className="w-4 h-4" /> Filter</button>
                                        <button className="flex items-center gap-2 px-4 py-2 border border-slate-100 rounded-xl text-[13px] font-bold text-slate-500 hover:bg-slate-50 transition-all"><ExportIcon className="w-4 h-4" /> Export</button>
                                    </div>
                                </div>
                                <table className="w-full">
                                    <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                                        <tr><th className="px-8 py-4">ID</th><th className="px-8 py-4">USER</th><th className="px-8 py-4">EMAIL ADDRESS</th><th className="px-8 py-4 text-center">ROLE & DEPT</th><th className="px-8 py-4">STATUS</th><th className="px-8 py-4 text-right">ACTIONS</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {loading ? (
                                            <tr><td colSpan="6" className="text-center py-10 font-bold text-slate-400">Loading directory...</td></tr>
                                        ) : employees.map((emp) => (
                                            <EmployeeRow
                                                key={emp.id}
                                                id={emp.employee_id || `#IT-${emp.id}`}
                                                name={`${emp.first_name} ${emp.last_name}`}
                                                status={emp.profile?.status || 'Offline'}
                                                email={emp.email}
                                                role={emp.role}
                                                dept={emp.profile?.department || 'Unassigned'}
                                                active={emp.profile?.is_active_employee}
                                                onClick={() => setSelectedEmployee(emp)}
                                            />
                                        ))}
                                        {!loading && employees.length === 0 && (
                                            <tr><td colSpan="6" className="text-center py-10 font-bold text-slate-400">No employees found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {/* Add User Modal */}
                    {showAddUserModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
                            <div className="bg-white rounded-[32px] p-10 w-[500px] shadow-2xl relative">
                                <button onClick={() => setShowAddUserModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900">✕</button>
                                <h2 className="text-2xl font-black text-slate-900 mb-6">Add New User</h2>
                                <form onSubmit={handleAddUser} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <input name="first_name" placeholder="First Name" onChange={handleInputChange} value={formData.first_name} className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold" required />
                                        <input name="last_name" placeholder="Last Name" onChange={handleInputChange} value={formData.last_name} className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold" required />
                                    </div>
                                    <input name="username" placeholder="Username" onChange={handleInputChange} value={formData.username} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold" required />
                                    <input name="email" type="email" placeholder="Email Address" onChange={handleInputChange} value={formData.email} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold" required />
                                    <input name="password" type="password" placeholder="Password" onChange={handleInputChange} value={formData.password} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold" required />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input name="phone_number" placeholder="Phone Number" onChange={handleInputChange} value={formData.phone_number} className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold" required />
                                        <input name="employee_id" placeholder="Employee ID (e.g. IT-001)" onChange={handleInputChange} value={formData.employee_id} className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold" required />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-slate-400 pl-2 mb-1 block">Date of Birth</label>
                                        <input name="date_of_birth" type="date" onChange={handleInputChange} value={formData.date_of_birth} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-600" />
                                    </div>

                                    {newUserError && <p className="text-red-500 text-xs font-bold text-center">{newUserError}</p>}
                                    <button type="submit" disabled={newUserLoading} className="w-full py-4 bg-[#00bcd4] text-white rounded-xl font-bold shadow-lg shadow-cyan-500/20 hover:bg-cyan-600 transition-all mt-4">
                                        {newUserLoading ? 'Creating User...' : 'Create User Account'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

const SidebarLink = ({ icon, label, active, onClick }) => (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${active ? 'bg-[#00bcd4] text-white shadow-lg shadow-cyan-500/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>{icon}<span>{label}</span></button>
);

const StatCard = ({ icon, label, value, trend, badge, badgeColor }) => (
    <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm relative group hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-4"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span><div className={`p-2 rounded-xl bg-slate-50 group-hover:bg-cyan-50 transition-colors`}>{icon}</div></div>
        <div className="flex items-end gap-3"><span className="text-3xl font-black text-slate-900 leading-none">{value}</span>{trend && <span className="text-sm font-black text-emerald-500 mb-0.5">{trend}</span>}{badge && <span className={`text-[11px] font-bold uppercase tracking-widest mb-1 ${badgeColor || 'text-cyan-400'}`}>{badge}</span>}</div>
    </div>
);

const EmployeeRow = ({ id, name, status, email, role, dept, active, onClick }) => (
    <tr onClick={onClick} className="group hover:bg-slate-50/50 transition-all cursor-pointer">
        <td className="px-8 py-5 text-sm font-bold text-slate-400">{id}</td>
        <td className="px-8 py-5"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-100"><img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} alt="avatar" /></div><div><p className="text-sm font-bold text-slate-900 leading-none mb-1.5">{name}</p><div className="flex items-center gap-1.5"><div className={`w-1.5 h-1.5 rounded-full ${status === 'On-Site' ? 'bg-emerald-500' : status === 'Remote' ? 'bg-cyan-400' : 'bg-slate-300'}`} /><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{status}</span></div></div></div></td>
        <td className="px-8 py-5 text-sm font-medium text-slate-500">{email}</td>
        <td className="px-8 py-5 text-center"><span className={`text-[9px] font-black px-2 py-0.5 rounded-md border mb-1 block ${role === 'ADMIN' ? 'bg-cyan-50 border-cyan-100 text-cyan-600' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>{role}</span><span className="text-[11px] font-bold text-slate-400">{dept}</span></td>
        <td className="px-8 py-5"><div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${active ? 'bg-emerald-500' : 'bg-slate-300'}`} /><span className={`text-sm font-bold ${active ? 'text-slate-900' : 'text-slate-400'}`}>{active ? 'Active' : 'Deactivated'}</span></div></td>
        <td className="px-8 py-5 text-right"><MoreHorizontalIcon className="text-slate-300 group-hover:text-slate-900 transition-colors inline-block" /></td>
    </tr>
);

export default AdminDashboard;
