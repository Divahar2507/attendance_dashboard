
import React, { useState, useMemo } from 'react';
import { User, Ticket, TicketStatus, TicketUpdate } from '../TicketTypes.ts';
import {
  CheckCircle2,
  Clock,
  FileText,
  Send,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  X,
  Target,
  Sparkles,
  Zap,
  Layers,
  Calendar,
  Plus,
  Loader2
} from 'lucide-react';

import { API_BASE_URL } from '../config';

interface UserDashboardProps {
  user: User;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user }) => {
  const [activeView, setActiveView] = useState<'mine' | 'pool'>('mine');
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [updateText, setUpdateText] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const auth = JSON.parse(localStorage.getItem('tms_auth') || '{}');

  const fetchTickets = async () => {
    try {
      const url = activeView === 'mine' ? `${API_BASE_URL}/my-tickets` : `${API_BASE_URL}/tickets`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAllTickets(data);
      }
    } catch (err) {
      console.error("Failed to fetch tickets", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchTickets();
  }, [activeView, auth.token]);

  // Form State for new ticket
  const [newTicketTitle, setNewTicketTitle] = useState('');
  const [newTicketDesc, setNewTicketDesc] = useState('');

  const myTickets = useMemo(() => allTickets.filter(t => t.assignee === user.id), [allTickets, user.id]);
  const poolTickets = useMemo(() => allTickets.filter(t => !t.assignee), [allTickets]);

  // Grouped Tickets for "My Assigned" view
  const groupedMyTickets = useMemo(() => {
    const groups: { [key: string]: Ticket[] } = {};
    myTickets.forEach(ticket => {
      const key = `${ticket.month} ${ticket.year}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(ticket);
    });
    return groups;
  }, [myTickets]);

  const handleSelfAssign = async (ticketId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({ assignee: user.id, status: 'In_Progress' }), // Self-assign starts work
      });

      if (response.ok) {
        const updatedTicket = await response.json();
        setAllTickets(prev => prev.map(t => t.id === ticketId ? updatedTicket : t));
        setSelectedTicket(updatedTicket);
        setActiveView('mine');
      }
    } catch (err) {
      console.error("Failed to self-assign", err);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    try {
      const response = await fetch(`${API_BASE_URL}/tickets`, {
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
          assignee: user.id,
          status: 'Open'
        }),
      });

      if (response.ok) {
        const newTicket = await response.json();
        setAllTickets([newTicket, ...allTickets]);
        setNewTicketTitle('');
        setNewTicketDesc('');
        setShowCreateModal(false);
        setSelectedTicket(newTicket);
        setActiveView('mine');
      }
    } catch (err) {
      console.error("Failed to create ticket", err);
    }
  };

  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !updateText) return;
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('ticketId', selectedTicket.id);
      formData.append('updateText', updateText);
      if (screenshotFile) {
        formData.append('screenshot', screenshotFile);
      }

      const response = await fetch(`${API_BASE_URL}/updates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.token}`
        },
        body: formData,
      });

      if (response.ok) {
        if (selectedTicket.status === TicketStatus.OPEN) {
          setAllTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, status: TicketStatus.IN_PROGRESS } : t));
          setSelectedTicket(prev => prev ? { ...prev, status: TicketStatus.IN_PROGRESS } : null);
        }
        setUpdateText('');
        setScreenshot(null);
        setScreenshotFile(null);
      }
    } catch (err) {
      console.error("Failed to submit update", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.OPEN: return <Target className="w-5 h-5 text-blue-500" />;
      case TicketStatus.IN_PROGRESS: return <Zap className="w-5 h-5 text-amber-500" />;
      case TicketStatus.REVIEW: return <Sparkles className="w-5 h-5 text-purple-500" />;
      case TicketStatus.COMPLETED: return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
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
    <div className="max-w-[1400px] mx-auto p-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Operations Center</h2>
          <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-[11px]">Workflow for <span className="text-indigo-600 font-bold">{user.name}</span></p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex p-1 bg-slate-200/50 rounded-2xl w-fit border border-slate-200 shadow-inner">
            <button
              onClick={() => { setActiveView('mine'); setSelectedTicket(null); }}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeView === 'mine' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              My Workflow
            </button>
            <button
              onClick={() => { setActiveView('pool'); setSelectedTicket(null); }}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeView === 'pool' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Ticket Pool
              {poolTickets.length > 0 && <span className="ml-2 bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-md text-[10px]">{poolTickets.length}</span>}
            </button>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-95"
          >
            <Plus className="w-5 h-5" />
            New Task
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Monthly Timeline */}
        <div className="lg:col-span-4 space-y-8">
          {activeView === 'mine' ? (
            Object.entries(groupedMyTickets).length > 0 ? (
              /* Fix: Cast Object.entries to explicitly typed array to avoid 'unknown' member types */
              (Object.entries(groupedMyTickets) as [string, Ticket[]][]).map(([monthYear, tickets]) => (
                <div key={monthYear} className="space-y-4">
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-2">
                    <Calendar className="w-4 h-4" />
                    {monthYear}
                  </h3>
                  <div className="space-y-3">
                    {/* Fix: Property 'map' now accessible after explicit casting above */}
                    {tickets.map(ticket => (
                      <button
                        key={ticket.id}
                        onClick={() => setSelectedTicket(ticket)}
                        className={`w-full text-left p-6 rounded-2xl border transition-all relative overflow-hidden group ${selectedTicket?.id === ticket.id
                          ? 'bg-white border-indigo-600 shadow-xl shadow-indigo-100 ring-1 ring-indigo-600 translate-x-1'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                          }`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-50 text-slate-400 rounded uppercase tracking-tighter">
                            TKT-{ticket.id}
                          </span>
                          {getStatusIcon(ticket.status)}
                        </div>
                        <h4 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors leading-snug">{ticket.title}</h4>
                        <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed">{ticket.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white border-2 border-slate-100 border-dashed rounded-3xl p-12 text-center">
                <p className="text-sm text-slate-400 font-medium italic">No active deliverables in your workflow. Start by creating a task or browsing the pool.</p>
              </div>
            )
          ) : (
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-2">
                <Layers className="w-4 h-4" />
                Available in Pool
              </h3>
              {poolTickets.length > 0 ? (
                poolTickets.map(ticket => (
                  <button
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`w-full text-left p-6 rounded-2xl border transition-all group ${selectedTicket?.id === ticket.id
                      ? 'bg-white border-indigo-600 shadow-xl shadow-indigo-100 ring-1 ring-indigo-600'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                      }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-500 rounded uppercase tracking-tighter">
                        {ticket.month} {ticket.year}
                      </span>
                      <AlertCircle className="w-5 h-5 text-slate-300" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors leading-snug">{ticket.title}</h4>
                    <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed">{ticket.description}</p>
                  </button>
                ))
              ) : (
                <div className="bg-white border-2 border-slate-100 border-dashed rounded-3xl p-12 text-center">
                  <p className="text-sm text-slate-400 font-medium italic">The ticket pool is currently dry. Check back later for new deliverables.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Interaction Workspace */}
        <div className="lg:col-span-8">
          {selectedTicket ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="p-10 border-b border-slate-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                  <div>
                    <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest mb-2 block">Active Delivery</span>
                    <h3 className="text-3xl font-bold text-slate-900 leading-tight tracking-tight">{selectedTicket.title}</h3>
                  </div>
                  {selectedTicket.userId !== user.id ? (
                    <button
                      onClick={() => handleSelfAssign(selectedTicket.id)}
                      className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95 whitespace-nowrap"
                    >
                      <Zap className="w-5 h-5 fill-white" />
                      Claim Deliverable
                    </button>
                  ) : (
                    <div className={`px-5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest border shadow-sm ${selectedTicket.status === TicketStatus.REVIEW ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-slate-50 text-slate-600 border-slate-100'
                      }`}>
                      {selectedTicket.status.replace('_', ' ')}
                    </div>
                  )}
                </div>
                <p className="text-slate-600 text-lg leading-relaxed max-w-3xl bg-slate-50/50 p-6 rounded-2xl border border-slate-100">{selectedTicket.description}</p>
              </div>

              {selectedTicket.userId === user.id && (
                <div className="flex-1 overflow-y-auto p-10 bg-slate-50/30">
                  <form onSubmit={handleSubmitUpdate} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm mb-12">
                    <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-3 text-lg">
                      <div className="p-2 bg-indigo-50 rounded-lg">
                        <Send className="w-5 h-5 text-indigo-600" />
                      </div>
                      Sync Performance Update
                    </h4>
                    <textarea
                      value={updateText}
                      onChange={(e) => setUpdateText(e.target.value)}
                      placeholder="Detail the technical milestones achieved, blockers identified, and current trajectory..."
                      className="w-full h-44 p-6 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-base mb-8 placeholder:text-slate-300 leading-relaxed"
                      required
                    />

                    <div className="flex flex-wrap items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <input
                          type="file" id="screenshot-upload" className="hidden" accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setScreenshotFile(file);
                              const reader = new FileReader();
                              reader.onloadend = () => setScreenshot(reader.result as string);
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <label
                          htmlFor="screenshot-upload"
                          className="flex items-center gap-3 px-6 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 cursor-pointer transition-all hover:border-slate-400"
                        >
                          <ImageIcon className="w-5 h-5" />
                          {screenshot ? 'Swap Image' : 'Attach Technical Proof'}
                        </label>
                        {screenshot && (
                          <div className="relative group w-24 h-14 rounded-xl overflow-hidden border-2 border-indigo-200 shadow-md">
                            <img src={screenshot} alt="Preview" className="w-full h-full object-cover" />
                            <button
                              type="button" onClick={() => setScreenshot(null)}
                              className="absolute inset-0 bg-red-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </div>

                      <button
                        type="submit" disabled={isSubmitting}
                        className="bg-slate-900 text-white px-12 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-indigo-600 transition-all disabled:opacity-50 shadow-xl"
                      >
                        {isSubmitting ? (
                          <Clock className="w-5 h-5 animate-spin" />
                        ) : 'Log Progress Cycle'}
                      </button>
                    </div>
                  </form>

                  <div className="space-y-6">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-4 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Session History
                    </h4>
                    <div className="text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-slate-200">
                      <FileText className="w-14 h-14 text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-400 font-medium italic">Your daily work cycles will appear here once logged.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center p-20 text-center animate-in fade-in zoom-in-95 duration-500">
              <div className="bg-white p-8 rounded-full shadow-sm mb-8 border border-slate-100">
                <FileText className="w-20 h-20 text-indigo-50" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">System Ready</h3>
              <p className="text-slate-500 max-w-sm mx-auto text-lg leading-relaxed">Select a deliverable from your monthly workflow or initialize a new technical task to begin performance logging.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Ticket Modal */}
      {
        showCreateModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
              <div className="p-10 border-b border-slate-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Initialize New Deliverable</h3>
                  <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-slate-500 leading-relaxed">Define your technical task for this month. It will be automatically assigned to your workflow.</p>
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
                    Create Deliverable
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default UserDashboard;
