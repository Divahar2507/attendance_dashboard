
import React, { useState, useMemo } from 'react';
import { User, Ticket, TicketStatus, UserRole, TicketUpdate } from '../TicketTypes.ts';
import {
  Plus,
  Users as UsersIcon,
  Ticket as TicketIcon,
  Search,
  ChevronRight,
  Filter,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Loader2,
  Trash2
} from 'lucide-react';
import { getTicketSummary } from '../../services/gemini.ts';

import { API_BASE_URL } from '../config.ts';

const AdminDashboard: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [summarizing, setSummarizing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTicketTitle, setNewTicketTitle] = useState('');
  const [newTicketDesc, setNewTicketDesc] = useState('');
  const [assignedUserId, setAssignedUserId] = useState<number | ''>('');
  const [filterRole, setFilterRole] = useState<UserRole | ''>('');

  const auth = JSON.parse(localStorage.getItem('tms_auth') || '{}');

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [ticketsRes, usersRes] = await Promise.all([
          fetch(`${API_BASE_URL}/tickets`, {
            headers: { 'Authorization': `Bearer ${auth.token}` }
          }),
          fetch(`${API_BASE_URL}/employees`, {
            headers: { 'Authorization': `Bearer ${auth.token}` }
          })
        ]);

        if (ticketsRes.ok && usersRes.ok) {
          const ticketsData = await ticketsRes.json();
          const usersData = await usersRes.json();
          setTickets(ticketsData);
          setUsers(usersData);
        }
      } catch (err) {
        console.error("Failed to fetch admin data", err);
      } finally {
        setLoading(false);
      }
    };

    if (auth.token) {
      fetchData();
    }
  }, [auth.token]);

  // Group tickets by Month and Year
  const groupedTickets = useMemo(() => {
    const groups: { [key: string]: Ticket[] } = {};
    tickets.forEach(ticket => {
      const key = `${ticket.month} ${ticket.year}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(ticket);
    });
    return groups;
  }, [tickets]);

  const handleSummarize = async (ticket: Ticket) => {
    setSummarizing(true);
    setAiSummary('');
    try {
      const response = await fetch(`${API_BASE_URL}/tickets/${ticket.id}/summary`, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAiSummary(data.summary);
      } else {
        setAiSummary("AI Service is temporarily unavailable.");
      }
    } catch (err) {
      setAiSummary("Failed to connect to AI Service.");
    } finally {
      setSummarizing(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    try {
      const response = await fetch(`${API_BASE_URL}/tickets/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          title: newTicketTitle,
          description: newTicketDesc,
          month: monthNames[now.getMonth()],
          year: now.getFullYear(),
          assignee: assignedUserId === '' ? null : assignedUserId
        }),
      });

      if (response.ok) {
        const newTicket = await response.json();
        setTickets([newTicket, ...tickets]);
        setNewTicketTitle('');
        setNewTicketDesc('');
        setAssignedUserId('');
        setShowCreateModal(false);
      }
    } catch (err) {
      console.error("Failed to create ticket", err);
    }
  };

  const handleDeleteTicket = async (ticketId: number) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      if (response.ok) {
        setTickets(tickets.filter(t => t.id !== ticketId));
        if (selectedTicket?.id === ticketId) setSelectedTicket(null);
      }
    } catch (err) {
      console.error("Failed to delete ticket", err);
    }
  };

  const getStatusStyles = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.OPEN: return 'bg-blue-50 text-blue-600 border-blue-100';
      case TicketStatus.IN_PROGRESS: return 'bg-amber-50 text-amber-600 border-amber-100';
      case TicketStatus.REVIEW: return 'bg-purple-50 text-purple-600 border-purple-100';
      case TicketStatus.COMPLETED: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
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
    <div className="p-10 max-w-[1600px] mx-auto">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Total Tickets', val: tickets.length, icon: TicketIcon, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Active Tasks', val: tickets.filter(t => t.status === 'IN_PROGRESS').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Pending Review', val: tickets.filter(t => t.status === 'REVIEW').length, icon: AlertCircle, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Total Completed', val: tickets.filter(t => t.status === 'COMPLETED').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h4 className="text-2xl font-bold text-slate-900">{stat.val}</h4>
            </div>
            <div className={`${stat.bg} p-3 rounded-xl`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Management Console</h2>
          <p className="text-slate-500 mt-1">Global oversight of all infrastructure tickets and team metrics.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
        >
          <Plus className="w-5 h-5" />
          Create Infrastructure Ticket
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Ticket List Area */}
        <div className="lg:col-span-8 space-y-8">
          {/* Fix: Cast Object.entries to explicitly typed array to avoid 'unknown' member types */}
          {(Object.entries(groupedTickets) as [string, Ticket[]][]).map(([monthYear, monthTickets]) => (
            <div key={monthYear} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-8 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">{monthYear} Deliverables</h3>
                </div>
                {/* Fix: Property 'length' now accessible after explicit casting above */}
                <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded-lg border border-slate-200 uppercase">
                  {monthTickets.length} Tickets
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-[11px] text-slate-400 uppercase tracking-widest bg-white border-b border-slate-50">
                    <tr>
                      <th className="px-8 py-4 font-bold">Ticket Name</th>
                      <th className="px-8 py-4 font-bold">Primary Assignee</th>
                      <th className="px-8 py-4 font-bold">Status</th>
                      <th className="px-8 py-4 font-bold text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {/* Fix: Property 'map' now accessible after explicit casting above */}
                    {monthTickets.map(ticket => {
                      const user = users.find(u => u.id === ticket.assignee);
                      const isSelected = selectedTicket?.id === ticket.id;
                      return (
                        <tr
                          key={ticket.id}
                          className={`hover:bg-slate-50 transition-all cursor-pointer group ${isSelected ? 'bg-indigo-50/30' : ''}`}
                          onClick={() => { setSelectedTicket(ticket); setAiSummary(''); }}
                        >
                          <td className="px-8 py-5">
                            <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{ticket.title}</p>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-1">{ticket.description}</p>
                          </td>
                          <td className="px-8 py-5">
                            {user ? (
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700 border border-white">
                                  {user.name.charAt(0)}
                                </div>
                                <span className="text-sm font-medium text-slate-700">{user.name}</span>
                              </div>
                            ) : (
                              <span className="text-xs font-bold text-slate-300 uppercase italic">Unassigned Pool</span>
                            )}
                          </td>
                          <td className="px-8 py-5">
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getStatusStyles(ticket.status)}`}>
                              {ticket.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <ChevronRight className={`w-5 h-5 ml-auto transition-transform ${isSelected ? 'text-indigo-600 translate-x-1' : 'text-slate-300'}`} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* Action Panel */}
        <div className="lg:col-span-4">
          {selectedTicket ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full sticky top-10 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="p-8 border-b border-slate-100">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block mb-1">Ticket Inspector</span>
                    <h3 className="text-2xl font-bold text-slate-900 leading-tight">{selectedTicket.title}</h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDeleteTicket(selectedTicket.id)}
                      className="text-slate-400 hover:text-red-600 p-1 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => setSelectedTicket(null)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors">
                      <AlertCircle className="w-5 h-5 rotate-45" />
                    </button>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl border border-indigo-100 relative overflow-hidden mb-8 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-bold text-indigo-700 flex items-center gap-2 uppercase tracking-widest">
                      <Sparkles className="w-4 h-4" />
                      Executive Synopsis
                    </h4>
                    <button
                      onClick={() => handleSummarize(selectedTicket)}
                      disabled={summarizing}
                      className="text-[10px] font-bold text-indigo-600 bg-white px-3 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                    >
                      {summarizing ? 'Syncing...' : 'Generate AI Report'}
                    </button>
                  </div>
                  <p className="text-sm text-indigo-900/80 leading-relaxed italic">
                    {summarizing ? 'Analyzing recent updates and system logs...' : (aiSummary || "Request an AI-powered summary to synthesize the current ticket trajectory.")}
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Detailed Scope</h5>
                    <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">{selectedTicket.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Initialized</h5>
                      <p className="text-xs font-bold text-slate-700">{new Date(selectedTicket.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Assigned Month</h5>
                      <p className="text-xs font-bold text-slate-700">{selectedTicket.month} {selectedTicket.year}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-slate-50/30 flex-1">
                <h5 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-6 uppercase tracking-widest text-[11px]">
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                  Collaborative Updates
                </h5>
                <div className="text-center py-12 px-6 border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
                  <TrendingUp className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-[13px] text-slate-400 font-medium">No updates have been pushed for this deliverable yet.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center h-[600px] flex flex-col items-center justify-center sticky top-10">
              <div className="bg-white p-6 rounded-full shadow-sm mb-6">
                <TicketIcon className="w-12 h-12 text-indigo-100" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">Select a Deliverable</h4>
              <p className="text-sm text-slate-500 max-w-[240px] mx-auto leading-relaxed">Select any ticket from the monthly timeline to review technical progress and AI-generated management insights.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <div className="p-10 border-b border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Initialize Infrastructure Ticket</h3>
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
                  <AlertCircle className="w-6 h-6 rotate-45" />
                </button>
              </div>
              <p className="text-slate-500 leading-relaxed">Admin console for deploying new technical deliverables across the infrastructure.</p>
            </div>

            <form onSubmit={handleCreateTicket} className="p-10 space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Deliverable Title</label>
                <input
                  required
                  placeholder="e.g. Server Migration Patch v2.4"
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800"
                  value={newTicketTitle}
                  onChange={(e) => setNewTicketTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Technical Scope</label>
                <textarea
                  required
                  placeholder="Provide a high-level summary of the deliverables and technical requirements..."
                  className="w-full h-32 px-6 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800 leading-relaxed"
                  value={newTicketDesc}
                  onChange={(e) => setNewTicketDesc(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Filter by Department/Role</label>
                <select
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800 capitalize mb-4"
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value as UserRole | '')}
                >
                  <option value="">All Departments</option>
                  {Object.values(UserRole).map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>

                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Assign to Operator</label>
                <select
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800"
                  value={assignedUserId}
                  onChange={(e) => setAssignedUserId(e.target.value ? Number(e.target.value) : '')}
                >
                  <option value="">Leave Unassigned (Pool)</option>
                  {users
                    .filter(u => {
                      // Admin can assign to anyone
                      if (auth.user.role === UserRole.ADMIN) {
                        return !filterRole || u.role === filterRole;
                      }
                      // Team Lead (Manager) can assign to themselves AND users of their dept
                      if (auth.user.role === UserRole.TEAM_LEAD) {
                        return u.id === auth.user.id || (u.department === auth.user.department);
                      }
                      return false;
                    })
                    .map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role}) - {u.department || 'No Dept'}</option>
                    ))}
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-200"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 font-bold bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]"
                >
                  Deploy Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
