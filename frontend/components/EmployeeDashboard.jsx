import React, { useState, useRef, useEffect } from 'react';
import {
    LogoIcon,
    BellIcon,
    UserIcon,
    SettingsIcon,
    BuildingIcon,
    MailIcon,
    ClockIcon,
    SparklesIcon,
    CameraIcon,
    MapPinIcon,
    BrainIcon,
    FolderIcon,
    TrashIcon,
    DownloadIcon,
    PlusIcon,
    FileTextIcon
} from './Icons';
import { gemini } from '../services/geminiService';
import { api } from '../services/api';

const EmployeeDashboard = ({ user, onLogout }) => {
    const [activeView, setActiveView] = useState('profile');
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Attendance State
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [todayAttendance, setTodayAttendance] = useState(null);
    const [loadingAttendance, setLoadingAttendance] = useState(false);
    const [attMessage, setAttMessage] = useState('');

    // Documents State
    const [documents, setDocuments] = useState([]);
    const [loadingDocs, setLoadingDocs] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Chat State
    const [chatMessages, setChatMessages] = useState([
        { id: 1, role: 'assistant', content: "Hello! I'm InfiniteAI Assistant. I can help you with your schedule, leave requests, or productivity tips. What's on your mind?" }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isAITyping, setIsAITyping] = useState(false);
    const chatInstance = useRef(null);

    // Profile State
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileData, setProfileData] = useState({});

    // Work Updates State
    const [workUpdates, setWorkUpdates] = useState([]);
    const [newWorkUpdate, setNewWorkUpdate] = useState({ project_name: '', description: '', status: 'In Progress' });
    const [loadingWork, setLoadingWork] = useState(false);

    useEffect(() => {
        chatInstance.current = gemini.createChat();
    }, []);

    useEffect(() => {
        if (activeView === 'attendance' && user?.id) {
            fetchAttendance();
        } else if (activeView === 'documents') {
            fetchDocuments();
        } else if (activeView === 'work') {
            fetchWorkUpdates();
        }
        if (user && user.profile) {
            setProfileData(user.profile);
        }
    }, [activeView, user]);

    const fetchAttendance = async () => {
        setLoadingAttendance(true);
        try {
            const history = await api.getAttendanceHistory(user.id);
            setAttendanceHistory(history);
            // Check if checked in today
            const todayStr = new Date().toISOString().split('T')[0];
            const todayRecord = history.find(h => h.date === todayStr);
            setTodayAttendance(todayRecord);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingAttendance(false);
        }
    };

    const fetchDocuments = async () => {
        setLoadingDocs(true);
        try {
            const docs = await api.getDocuments();
            setDocuments(docs);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingDocs(false);
        }
    };

    const handleMarkAttendance = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }
        setAttMessage("Getting location...");
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                setAttMessage("Marking attendance...");
                const { latitude, longitude } = position.coords;
                const res = await api.markAttendance(user.id, latitude, longitude);
                setAttMessage(res.message);
                fetchAttendance(); // Refresh list
                setTimeout(() => setAttMessage(''), 3000);
            } catch (err) {
                setAttMessage(err.message || "Failed to mark attendance");
            }
        }, (err) => {
            setAttMessage("Error getting location: " + err.message);
        });
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('document_type', file.type.includes('pdf') ? 'PDF Document' : 'Other'); // Simple type inference

        setUploading(true);
        try {
            await api.uploadDocument(formData);
            fetchDocuments();
        } catch (err) {
            alert('Upload failed');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };


    const fetchWorkUpdates = async () => {
        setLoadingWork(true);
        try {
            const data = await api.getWorkUpdates(user.id);
            setWorkUpdates(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingWork(false);
        }
    };

    const handleCreateWorkUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.createWorkUpdate(newWorkUpdate);
            setNewWorkUpdate({ project_name: '', description: '', status: 'In Progress' });
            fetchWorkUpdates();
            alert('Update submitted successfully!');
        } catch (error) {
            alert('Failed to submit update');
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            const updatedUser = await api.updateProfile(profileData);
            alert('Profile updated successfully!');
            setIsEditingProfile(false);
            // Ideally update the global user state here, for now we assume reload or re-fetch might be needed, 
            // but api.updateProfile returns the full user object so we could update it if we had a setUser method passed down.
            // For now, let's just update local state slightly or rely on a page refresh if critical.
            window.location.reload();
        } catch (error) {
            alert('Failed to update profile');
        }
    };

    const handleChatSend = async () => {
        if (!chatInput.trim() || isAITyping) return;
        const userMsg = { id: Date.now(), role: 'user', content: chatInput };
        setChatMessages(prev => [...prev, userMsg]);
        setChatInput('');
        setIsAITyping(true);
        const assistantMsgId = Date.now() + 1;
        setChatMessages(prev => [...prev, { id: assistantMsgId, role: 'assistant', content: '' }]);
        try {
            let fullText = '';
            for await (const chunk of gemini.streamChat(chatInstance.current, userMsg.content)) {
                fullText += chunk;
                setChatMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, content: fullText } : m));
            }
        } catch (err) {
            setChatMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, content: "Error connecting to AI. Check your API key." } : m));
        } finally {
            setIsAITyping(false);
        }
    };

    const renderSidebar = () => (
        <aside className="w-[280px] border-r border-slate-100 flex flex-col shrink-0 bg-white sticky top-0 h-screen z-50">
            <div className="p-8 flex items-center gap-3">
                <img src="/logo.png" alt="InfiniteTech" className="h-10 object-contain" />
                <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block leading-none">Employee Portal</span>
                </div>
            </div>
            <div className="px-6 flex-1 space-y-1 overflow-y-auto custom-scrollbar pt-4">
                <SidebarLink icon={<UserIcon className="w-5 h-5" />} label="My Profile" active={activeView === 'profile'} onClick={() => setActiveView('profile')} />
                <SidebarLink icon={<ClockIcon className="w-5 h-5" />} label="Attendance" active={activeView === 'attendance'} onClick={() => setActiveView('attendance')} />
                <SidebarLink icon={<FileTextIcon className="w-5 h-5" />} label="Documents" active={activeView === 'documents'} onClick={() => setActiveView('documents')} />
                <SidebarLink icon={<FileTextIcon className="w-5 h-5" />} label="Work Updates" active={activeView === 'work'} onClick={() => setActiveView('work')} />
                <SidebarLink icon={<BrainIcon className="w-5 h-5" />} label="AI Assistant" onClick={() => setIsChatOpen(true)} />
                <SidebarLink icon={<SettingsIcon className="w-5 h-5" />} label="Settings" />
            </div>
            <div className="p-6">
                <button onClick={onLogout} className="text-red-500 text-sm font-bold w-full text-left flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center"><SettingsIcon className="w-4 h-4" /></div> Logout</button>
            </div>
        </aside>
    );




    const handleProfilePicUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('profile_picture', file);

        try {
            await api.updateProfile(formData);
            window.location.reload(); // Refresh to show new image
        } catch (err) {
            console.error("Failed to upload profile picture", err);
            alert("Failed to upload profile picture.");
        }
    };

    const renderProfile = () => (
        <div className="grid grid-cols-12 gap-8 animate-fade-in">
            <div className="col-span-8 space-y-8">
                <div className="bg-white rounded-[32px] p-10 border border-slate-100 shadow-sm flex items-center gap-8 group">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-50 shadow-inner">
                            <img
                                src={user?.profile?.profile_picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`}
                                alt="profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <label htmlFor="profile-upload" className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-cyan-500 shadow-sm transition-all cursor-pointer">
                            <CameraIcon />
                        </label>
                        <input id="profile-upload" type="file" className="hidden" accept="image/*" onChange={handleProfilePicUpload} />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-3xl font-bold text-slate-900 mb-1">{user?.first_name} {user?.last_name}</h2>
                                <p className="text-[#00bcd4] font-bold mb-4">{user?.role || 'Employee'}</p>
                            </div>
                            <button onClick={() => setIsEditingProfile(!isEditingProfile)} className="px-5 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all">
                                {isEditingProfile ? 'Cancel Edit' : 'Edit Profile'}
                            </button>
                        </div>
                        <div className="flex gap-6 text-slate-400 text-sm font-medium">
                            <div className="flex items-center gap-2"><BuildingIcon className="w-4 h-4" /> InfiniteTech Corp</div>
                            <div className="flex items-center gap-2"><MailIcon className="w-4 h-4" /> {user?.email}</div>
                        </div>
                    </div>
                </div>

                {isEditingProfile ? (
                    <form onSubmit={handleProfileUpdate} className="space-y-8">
                        {/* School Details */}
                        <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2"><BuildingIcon className="w-4 h-4 text-slate-400" /> School Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <ProfileEditInput label="School Name" value={profileData.school_name} onChange={e => setProfileData({ ...profileData, school_name: e.target.value })} />
                                <ProfileEditInput label="Year" value={profileData.school_year} onChange={e => setProfileData({ ...profileData, school_year: e.target.value })} />
                                <ProfileEditInput label="Percentage / Grade" value={profileData.school_percentage} onChange={e => setProfileData({ ...profileData, school_percentage: e.target.value })} />
                            </div>
                        </div>

                        {/* College Details */}
                        <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2"><BuildingIcon className="w-4 h-4 text-slate-400" /> College Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <ProfileEditInput label="College Name" value={profileData.college_name} onChange={e => setProfileData({ ...profileData, college_name: e.target.value })} />
                                <ProfileEditInput label="Degree" value={profileData.college_degree} onChange={e => setProfileData({ ...profileData, college_degree: e.target.value })} placeholder="e.g. B.Tech" />
                                <ProfileEditInput label="Year" value={profileData.college_year} onChange={e => setProfileData({ ...profileData, college_year: e.target.value })} />
                                <ProfileEditInput label="CGPA" value={profileData.college_cgpa} onChange={e => setProfileData({ ...profileData, college_cgpa: e.target.value })} />
                            </div>
                        </div>

                        {/* Address Details */}
                        <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2"><MapPinIcon className="w-4 h-4 text-slate-400" /> Address Details</h3>
                            <div className="space-y-4">
                                <ProfileEditInput label="Address Line 1" value={profileData.address_line1} onChange={e => setProfileData({ ...profileData, address_line1: e.target.value })} fullWidth />
                                <div className="grid grid-cols-3 gap-4">
                                    <ProfileEditInput label="City" value={profileData.city} onChange={e => setProfileData({ ...profileData, city: e.target.value })} />
                                    <ProfileEditInput label="State" value={profileData.state} onChange={e => setProfileData({ ...profileData, state: e.target.value })} />
                                    <ProfileEditInput label="Zip Code" value={profileData.zip_code} onChange={e => setProfileData({ ...profileData, zip_code: e.target.value })} />
                                </div>
                            </div>
                        </div>

                        {/* Skills & Interests */}
                        <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2"><SparklesIcon className="w-4 h-4 text-slate-400" /> Skills & Interests</h3>
                            <div className="space-y-4">
                                <div className="col-span-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Skills (Comma separated)</label>
                                    <textarea className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all" rows="3" value={profileData.skills} onChange={e => setProfileData({ ...profileData, skills: e.target.value })} placeholder="e.g. React, Python, Design" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Interests & Hobbies</label>
                                    <textarea className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all" rows="3" value={profileData.hobbies} onChange={e => setProfileData({ ...profileData, hobbies: e.target.value })} placeholder="e.g. Reading, Traveling, Chess" />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button type="submit" className="px-8 py-4 bg-[#00bcd4] text-white rounded-2xl font-bold hover:bg-cyan-600 transition-all shadow-lg shadow-cyan-500/20">Save Profile Changes</button>
                        </div>
                    </form>
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                                <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2"><UserIcon className="w-4 h-4 text-slate-400" /> Personal Details</h3>
                                <div className="space-y-4">
                                    <ProfileInput label="FULLNAME" value={`${user?.first_name} ${user?.last_name}`} />
                                    <ProfileInput label="USERNAME" value={user?.username} />
                                    <ProfileInput label="PHONE" value={user?.profile?.phone_number} />
                                    <ProfileInput label="DOB" value={user?.profile?.date_of_birth} />
                                </div>
                            </div>
                            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                                <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2"><MapPinIcon className="w-4 h-4 text-slate-400" /> Location & Address</h3>
                                <div className="bg-slate-50 rounded-2xl p-4 mb-4 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-cyan-500"><BuildingIcon /></div>
                                    <div><p className="text-sm font-bold text-slate-900 leading-none mb-1">Office Location</p><p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{user?.profile?.location}</p></div>
                                </div>
                                <div className="space-y-2 mt-4">
                                    <p className="text-sm text-slate-600"><strong>Address:</strong> {user?.profile?.address_line1 || 'Not set'}</p>
                                    <p className="text-sm text-slate-600"><strong>City:</strong> {user?.profile?.city || 'Not set'} - {user?.profile?.zip_code}</p>
                                </div>
                            </div>
                        </div>

                        {/* Education Details View */}
                        <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2"><BuildingIcon className="w-4 h-4 text-slate-400" /> Education</h3>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="bg-slate-50 p-6 rounded-2xl">
                                    <h4 className="font-bold text-slate-900 mb-2">School</h4>
                                    <p className="text-sm text-slate-600 mb-1">{user?.profile?.school_name || 'Not provided'}</p>
                                    <p className="text-xs text-slate-400">Year: {user?.profile?.school_year} | Grade: {user?.profile?.school_percentage}</p>
                                </div>
                                <div className="bg-slate-50 p-6 rounded-2xl">
                                    <h4 className="font-bold text-slate-900 mb-2">College</h4>
                                    <p className="text-sm text-slate-600 mb-1">{user?.profile?.college_name || 'Not provided'}</p>
                                    <p className="text-xs text-slate-400">{user?.profile?.college_degree} | Year: {user?.profile?.college_year}</p>
                                    <p className="text-xs text-slate-400">CGPA: {user?.profile?.college_cgpa}</p>
                                </div>
                            </div>
                        </div>

                        {/* Skills View */}
                        <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2"><SparklesIcon className="w-4 h-4 text-slate-400" /> Skills & Hobbies</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Skills</p>
                                    <div className="flex flex-wrap gap-2">
                                        {user?.profile?.skills ? user.profile.skills.split(',').map((skill, i) => (
                                            <span key={i} className="px-3 py-1 bg-cyan-50 text-cyan-700 rounded-lg text-xs font-bold">{skill.trim()}</span>
                                        )) : <span className="text-slate-400 text-sm">No skills listed</span>}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Interests</p>
                                    <p className="text-sm text-slate-600">{user?.profile?.hobbies || 'Not provided'}</p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="col-span-4 space-y-8">
                <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-8 flex justify-between items-center">Monthly Attendance <ClockIcon className="text-slate-200" /></h3>
                    <div className="flex justify-center mb-8 relative">
                        <svg className="w-44 h-44 transform -rotate-90"><circle cx="88" cy="88" r="76" stroke="currentColor" strokeWidth="14" fill="transparent" className="text-slate-50" /><circle cx="88" cy="88" r="76" stroke="currentColor" strokeWidth="14" fill="transparent" strokeDasharray="478" strokeDashoffset="28.6" className="text-[#00bcd4]" strokeLinecap="round" /></svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-4xl font-black text-slate-900 leading-none">94%</span><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Attendance</span></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4"><AttendanceBox val="18" label="Office Days" /><AttendanceBox val="3" label="Remote Days" /></div>
                </div>
            </div>
        </div>
    );

    const renderAttendance = () => (
        <div className="space-y-8 animate-fade-in">
            <div className="bg-white rounded-[32px] p-10 border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Today's Status</h2>
                    <p className="text-slate-500">{new Date().toDateString()}</p>
                    {todayAttendance && (
                        <div className="mt-4 flex gap-4">
                            {todayAttendance.check_in_time && <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-bold">Checked In: {new Date(todayAttendance.check_in_time).toLocaleTimeString()}</span>}
                            {todayAttendance.check_out_time && <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-bold">Checked Out: {new Date(todayAttendance.check_out_time).toLocaleTimeString()}</span>}
                        </div>
                    )}
                    {attMessage && <p className="text-blue-500 font-bold mt-2 animate-pulse">{attMessage}</p>}
                </div>
                <div>
                    {!todayAttendance?.check_out_time ? (
                        <button onClick={handleMarkAttendance} className="px-8 py-4 bg-[#00bcd4] text-white rounded-2xl font-bold text-lg shadow-lg shadow-cyan-500/20 hover:bg-cyan-600 transition-all active:scale-95">
                            {todayAttendance?.check_in_time ? "Check Out" : "Check In"}
                        </button>
                    ) : (
                        <button disabled className="px-8 py-4 bg-slate-200 text-slate-400 rounded-2xl font-bold text-lg cursor-not-allowed">
                            Attendance Completed
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-6">Attendance History</h3>
                {loadingAttendance ? <p>Loading...</p> : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-xl">Date</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">In Time</th>
                                    <th className="px-4 py-3">Out Time</th>
                                    <th className="px-4 py-3 rounded-r-xl">Verified</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {attendanceHistory.map((record) => (
                                    <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-slate-900">{record.date}</td>
                                        <td className="px-4 py-3"><span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${record.status === 'Present' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{record.status}</span></td>
                                        <td className="px-4 py-3 text-slate-500">{record.check_in_time ? new Date(record.check_in_time).toLocaleTimeString() : '-'}</td>
                                        <td className="px-4 py-3 text-slate-500">{record.check_out_time ? new Date(record.check_out_time).toLocaleTimeString() : '-'}</td>
                                        <td className="px-4 py-3">{record.location_verified ? <span className="text-green-500">✓</span> : <span className="text-slate-300">-</span>}</td>
                                    </tr>
                                ))}
                                {attendanceHistory.length === 0 && <tr><td colSpan="5" className="text-center py-4 text-slate-400">No records found</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );

    const renderDocuments = () => (
        <div className="space-y-8 animate-fade-in">
            <div className="bg-white rounded-[32px] p-10 border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">My Documents</h2>
                        <p className="text-slate-500">Manage your employment credentials.</p>
                    </div>
                    <div>
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.doc,.docx" />
                        <button onClick={() => fileInputRef.current.click()} disabled={uploading} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2">
                            {uploading ? "Uploading..." : <><PlusIcon className="w-4 h-4" /> Upload New</>}
                        </button>
                    </div>
                </div>

                {loadingDocs ? <p>Loading...</p> : (
                    <div className="grid grid-cols-3 gap-6">
                        {documents.map((doc) => (
                            <div key={doc.id} className="p-6 rounded-2xl border border-slate-100 hover:border-cyan-200 hover:shadow-lg hover:shadow-cyan-500/10 transition-all group bg-slate-50/50">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-red-500"><FolderIcon /></div>
                                    <button className="text-slate-300 hover:text-red-500 transition-colors"><TrashIcon /></button>
                                </div>
                                <h3 className="font-bold text-slate-900 mb-1 truncate" title={doc.file.split('/').pop()}>{doc.document_type}</h3>
                                <p className="text-xs text-slate-400 mb-4">Uploaded on {new Date(doc.uploaded_at).toLocaleDateString()}</p>
                                <a href={doc.file} target="_blank" rel="noreferrer" className="w-full py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 flex items-center justify-center gap-2 hover:bg-slate-50 hover:text-[#00bcd4] hover:border-[#00bcd4] transition-all">
                                    <DownloadIcon className="w-3 h-3" /> View Document
                                </a>
                            </div>
                        ))}
                        {documents.length === 0 && <div className="col-span-3 text-center py-12 text-slate-400">No documents uploaded yet.</div>}
                    </div>
                )}
            </div>
        </div>
    );

    const renderWorkUpdates = () => (
        <div className="space-y-8 animate-fade-in">
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
                <h3 className="text-xl font-black text-slate-900 mb-6">Submit Daily Update</h3>
                <form onSubmit={handleCreateWorkUpdate} className="space-y-4">
                    <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 pl-2 mb-1 block">Project / Task Name</label>
                        <input value={newWorkUpdate.project_name} onChange={e => setNewWorkUpdate({ ...newWorkUpdate, project_name: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold" placeholder="e.g. Frontend Implementation" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] uppercase font-bold text-slate-400 pl-2 mb-1 block">Status</label>
                            <select value={newWorkUpdate.status} onChange={e => setNewWorkUpdate({ ...newWorkUpdate, status: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700" >
                                <option>In Progress</option>
                                <option>Completed</option>
                                <option>On Hold</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 pl-2 mb-1 block">Description / Details</label>
                        <textarea value={newWorkUpdate.description} onChange={e => setNewWorkUpdate({ ...newWorkUpdate, description: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold h-32" placeholder="What did you work on today?" required />
                    </div>
                    <button type="submit" className="px-6 py-3 bg-[#00bcd4] hover:bg-cyan-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-cyan-500/20">Submit Update</button>
                </form>
            </div>

            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-50"><h3 className="text-xl font-black text-slate-900">Work History</h3></div>
                {loadingWork ? <div className="p-8 text-center text-slate-400">Loading updates...</div> : (
                    <table className="w-full">
                        <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                            <tr><th className="px-8 py-4">Date</th><th className="px-8 py-4">Project</th><th className="px-8 py-4">Description</th><th className="px-8 py-4">Status</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {workUpdates.map(update => (
                                <tr key={update.id}>
                                    <td className="px-8 py-5 text-sm font-bold text-slate-500">{update.date}</td>
                                    <td className="px-8 py-5 text-sm font-bold text-slate-900">{update.project_name}</td>
                                    <td className="px-8 py-5 text-sm text-slate-600 max-w-sm truncate">{update.description}</td>
                                    <td className="px-8 py-5"><span className={`text-[10px] font-black px-2 py-1 rounded-md border ${update.status === 'Completed' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-amber-50 border-amber-100 text-amber-600'}`}>{update.status}</span></td>
                                </tr>
                            ))}
                            {workUpdates.length === 0 && <tr><td colSpan="4" className="text-center py-8 text-slate-400 font-bold">No updates yet.</td></tr>}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex bg-white font-['Inter']">
            {renderSidebar()}

            <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
                {/* Header */}
                <header className="h-20 px-10 border-b border-slate-100 flex items-center justify-between bg-white z-40 sticky top-0">
                    <div className="font-bold text-slate-900">Welcome back, {user?.first_name}!</div>
                    <div className="flex items-center gap-6">
                        <button className="p-2 text-indigo-600 bg-indigo-50 rounded-xl transition-colors relative"><BellIcon /><div className="absolute top-1 right-1 w-2 h-2 bg-indigo-600 rounded-full border-2 border-indigo-50" /></button>
                        <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden"><img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} alt="avatar" /></div>
                    </div>
                </header>

                <main className="p-12 overflow-y-auto custom-scrollbar flex-1">
                    <div className="flex items-end justify-between mb-10">
                        <div>
                            <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">
                                {activeView === 'profile' && "My Profile"}
                                {activeView === 'attendance' && "Attendance"}
                                {activeView === 'documents' && "Documents"}
                            </h1>
                            <p className="text-slate-500 text-lg">
                                {activeView === 'profile' && "Manage your professional identity and workspace preferences."}
                                {activeView === 'attendance' && "Track your work hours and location verification."}
                                {activeView === 'documents' && "Securely store and access your employment files."}
                            </p>
                        </div>
                    </div>

                    {activeView === 'profile' && renderProfile()}
                    {activeView === 'attendance' && renderAttendance()}
                    {activeView === 'documents' && renderDocuments()}
                    {activeView === 'work' && renderWorkUpdates()}
                </main>
            </div>

            {/* AI Assistant Drawer */}
            <div className={`fixed inset-0 z-[100] transition-opacity duration-300 ${isChatOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px]" onClick={() => setIsChatOpen(false)} />
                <div className={`absolute right-0 top-0 bottom-0 w-[420px] bg-white shadow-2xl transition-transform duration-500 transform ${isChatOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
                    <div className="p-6 bg-[#1e293b] text-white flex items-center justify-between shrink-0"><div className="flex items-center gap-3"><BrainIcon className="text-cyan-400 w-6 h-6" /><span className="font-bold text-lg">InfiniteAI Assistant</span></div><button onClick={() => setIsChatOpen(false)} className="opacity-60 hover:opacity-100 text-2xl">✕</button></div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 custom-scrollbar">
                        {chatMessages.map(m => (
                            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`p-4 rounded-2xl text-sm max-w-[85%] shadow-sm border border-slate-100 ${m.role === 'user' ? 'bg-[#00bcd4] text-white' : 'bg-white text-slate-700'}`}>{m.content}</div>
                            </div>
                        ))}
                        {isAITyping && <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest animate-pulse">Calculating...</div>}
                    </div>
                    <div className="p-6 bg-white border-t border-slate-100 shrink-0">
                        <div className="flex gap-2">
                            <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleChatSend()} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20" placeholder="Message assistant..." />
                            <button onClick={handleChatSend} className="bg-[#00bcd4] text-white p-3 rounded-xl shadow-lg shadow-cyan-500/20 hover:bg-cyan-500 transition-all"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg></button>
                        </div>
                    </div>
                </div>
            </div>
            <button onClick={() => setIsChatOpen(true)} className="fixed bottom-10 right-10 w-16 h-16 bg-[#00bcd4] text-white rounded-[24px] shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 border-4 border-white"><BrainIcon className="w-8 h-8" /></button>
        </div>
    );
};

const SidebarLink = ({ icon, label, active, onClick }) => (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${active ? 'bg-[#00bcd4] text-white shadow-lg shadow-cyan-500/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>{icon}<span>{label}</span></button>
);

const AttendanceBox = ({ val, label }) => (<div className="bg-slate-50 p-4 rounded-2xl text-center"><p className="text-2xl font-bold text-slate-900 leading-none mb-1">{val}</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p></div>);
const ProfileInput = ({ label, value, type = 'text', placeholder }) => (<div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">{label}</label><input type={type} readOnly defaultValue={value || ''} placeholder={placeholder} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all" /></div>);
const ProfileEditInput = ({ label, value, onChange, type = 'text', placeholder, fullWidth }) => (
    <div className={fullWidth ? "col-span-2" : ""}>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">{label}</label>
        <input
            type={type}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
        />
    </div>
);


export default EmployeeDashboard;
