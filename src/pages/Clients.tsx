import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getEntities, saveEntity } from '../lib/api';
import { Client, Prospect } from '../types';
import { Loader2, Briefcase, Calendar as CalendarIcon, Link as LinkIcon, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export function Clients() {
  const { user } = useAuth();
  const [clients, setClients] = useState<(Client & { companyName?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const uid = user!.uid;
      const [pData, cData] = await Promise.all([
        getEntities<Prospect>(uid, 'prospects'),
        getEntities<Client>(uid, 'clients')
      ]);
      
      const pMap: Record<string, string> = {};
      pData.forEach(p => pMap[p.id!] = p.companyName);

      const merged = cData.map(c => ({ ...c, companyName: pMap[c.prospectId] || 'Unknown Company' }));
      setClients(merged.sort((a,b) => b.startDate - a.startDate));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, projectStatus: Client['projectStatus']) => {
    const clientToUpdate = clients.find(c => c.id === id);
    if (!clientToUpdate) return;
    
    const updated = { ...clientToUpdate, projectStatus };
    setClients(prev => prev.map(c => c.id === id ? updated : c));
    try {
      await saveEntity(user!.uid, 'clients', updated);
    } catch(e) {
      alert("Failed to update status");
      loadData();
    }
  };

  if (loading) return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#141414]" /></div>;

  const active = clients.filter(c => !['Completed', 'Cancelled'].includes(c.projectStatus));
  const completed = clients.filter(c => ['Completed', 'Cancelled'].includes(c.projectStatus));

  const renderClientCard = (c: Client & { companyName?: string }) => {
    const progress = c.projectValue > 0 ? (c.amountPaid / c.projectValue) * 100 : 0;
    
    return (
      <div key={c.id} className="border border-[#141414] bg-transparent p-4 flex flex-col justify-between hover:bg-white/30 transition-colors">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-[12px] font-bold uppercase text-[#141414] mb-0.5">{c.projectName}</h3>
            <Link to={`/prospects/${c.prospectId}`} className="text-[9px] font-mono text-[#141414]/70 hover:underline hover:text-[#141414]">
              {c.companyName}
            </Link>
          </div>
          <select 
            value={c.projectStatus}
            onChange={(e) => handleStatusChange(c.id!, e.target.value as any)}
            className={`text-[9px] font-bold uppercase border border-[#141414]/20 px-2 py-1 bg-transparent focus:outline-none cursor-pointer ${
              c.projectStatus === 'Completed' ? 'bg-[#141414] text-[#E4E3E0]' : 
              c.projectStatus === 'Cancelled' ? 'bg-red-100 text-red-800' : 'text-[#141414]'
            }`}
          >
            <option value="Onboarding">Onboarding</option>
            <option value="In Progress">In Progress</option>
            <option value="Review">Review</option>
            <option value="Completed">Completed</option>
            <option value="Paused">Paused</option>
            <option value='Cancelled' as any>Cancelled</option>
          </select>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-[9px] font-bold uppercase text-[#141414]/50 mb-1">Total Value</div>
            <div className="text-[14px] font-bold tracking-tighter">${c.projectValue.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[9px] font-bold uppercase text-[#141414]/50 mb-1">Amount Paid</div>
            <div className="text-[14px] font-bold tracking-tighter text-green-700">${c.amountPaid.toLocaleString()}</div>
          </div>
        </div>

        <div className="w-full bg-[#141414]/10 h-1.5 mb-4 relative">
          <div className="absolute top-0 left-0 h-full bg-[#141414]" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="flex justify-between items-center text-[9px] font-mono text-[#141414]/60">
          <span className="flex items-center"><CalendarIcon className="w-2.5 h-2.5 mr-1"/> Started: {format(c.startDate, 'MMM d, yyyy')}</span>
          {(c as any).projectUrl && (
            <a href={(c as any).projectUrl.startsWith('http') ? (c as any).projectUrl : `https://${(c as any).projectUrl}`} target="_blank" rel="noreferrer" className="flex items-center hover:text-[#141414] hover:underline">
              <LinkIcon className="w-2.5 h-2.5 mr-1" /> View Link
            </a>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[#141414] bg-[#E4E3E0] px-8 py-6 sticky top-0 z-10 flex-shrink-0 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tighter text-[#141414] flex items-center">
            <Briefcase className="w-5 h-5 mr-3" /> Clients & Projects
          </h1>
          <p className="text-[10px] font-mono uppercase text-[#141414]/60 mt-1">Manage active engagements and project statuses</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 bg-[#E4E3E0]">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div>
            <h2 className="text-[12px] font-bold uppercase text-[#141414] mb-4 border-b border-[#141414]/20 pb-2">Active Projects ({active.length})</h2>
            {active.length === 0 ? (
              <div className="text-center text-[10px] font-mono uppercase text-[#141414]/50 py-8 border border-[#141414]/20 border-dashed">
                No active projects.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {active.map(renderClientCard)}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-[12px] font-bold uppercase text-[#141414] mb-4 border-b border-[#141414]/20 pb-2">Completed / Archived ({completed.length})</h2>
             {completed.length === 0 ? (
              <div className="text-center text-[10px] font-mono uppercase text-[#141414]/50 py-8 border border-[#141414]/20 border-dashed">
                No completed projects.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completed.map(renderClientCard)}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
