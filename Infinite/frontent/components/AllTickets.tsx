import React, { useState, useEffect } from 'react';
import { Ticket, TicketStatus } from '../types';
import { Layers, Search, Filter, Calendar, ChevronRight, Clock, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../config';

const AllTickets: React.FC = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const auth = JSON.parse(localStorage.getItem('tms_auth') || '{}');

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/tickets`, {
                    headers: { 'Authorization': `Bearer ${auth.token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setTickets(data);
                }
            } catch (err) {
                console.error("Failed to fetch tickets", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    }, [auth.token]);

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
        <div className="p-10 max-w-[1200px] mx-auto">
            <div className="mb-10">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                    <Layers className="w-8 h-8 text-indigo-600" />
                    Global Deliverables
                </h2>
                <p className="text-slate-500 mt-2">Comprehensive view of all infrastructure tasks and their current trajectory.</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50 border-b border-slate-100 text-[11px] text-slate-400 uppercase tracking-widest">
                        <tr>
                            <th className="px-8 py-5 font-bold">Ticket Name</th>
                            <th className="px-8 py-5 font-bold">Assignee</th>
                            <th className="px-8 py-5 font-bold">Status</th>
                            <th className="px-8 py-5 font-bold">Cycle</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {tickets.map(ticket => (
                            <tr key={ticket.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-8 py-5">
                                    <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{ticket.title}</p>
                                    <p className="text-xs text-slate-500 mt-1">{ticket.description.substring(0, 60)}...</p>
                                </td>
                                <td className="px-8 py-5">
                                    <span className="text-sm font-medium text-slate-600">{ticket.assignee_name || 'Unassigned'}</span>
                                </td>
                                <td className="px-8 py-5">
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getStatusStyles(ticket.status)}`}>
                                        {ticket.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {ticket.month} {ticket.year}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AllTickets;
