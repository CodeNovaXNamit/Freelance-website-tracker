import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getEntities, saveEntity } from '../lib/api';
import { Proposal, Prospect } from '../types';
import { Loader2, FileText, Calendar as CalendarIcon, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export function Proposals() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<(Proposal & { prospectName?: string })[]>([]);
  const [prospects, setProspects] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const uid = user!.uid;
      const [pData, pListData] = await Promise.all([
        getEntities<Prospect>(uid, 'prospects'),
        getEntities<Proposal>(uid, 'proposals')
      ]);
      
      const pMap: Record<string, string> = {};
      pData.forEach(p => pMap[p.id!] = p.companyName);
      setProspects(pMap);

      const merged = pListData.map(p => ({ ...p, prospectName: pMap[p.prospectId] || 'Unknown' }));
      setProposals(merged.sort((a,b) => b.proposalDate - a.proposalDate));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: Proposal['status']) => {
    const proposalToUpdate = proposals.find(p => p.id === id);
    if (!proposalToUpdate) return;
    
    const updated = { ...proposalToUpdate, status };
    // Optimistic update
    setProposals(prev => prev.map(p => p.id === id ? updated : p));
    try {
      await saveEntity(user!.uid, 'proposals', updated);
    } catch(e) {
      alert("Failed to update status");
      loadData();
    }
  };

  if (loading) return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#141414]" /></div>;

  const active = proposals.filter(p => !['Accepted', 'Rejected', 'Expired'].includes(p.status));
  const completed = proposals.filter(p => ['Accepted', 'Rejected', 'Expired'].includes(p.status));

  const totalActiveValue = active.reduce((sum, p) => sum + p.amount, 0);
  const totalWonValue = completed.filter(p => p.status === 'Accepted').reduce((sum, p) => sum + p.amount, 0);

  const renderProposalCard = (p: Proposal & { prospectName?: string }) => (
    <div key={p.id} className="border border-[#141414] bg-transparent p-4 flex flex-col justify-between hover:bg-white/30 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <div>
          <Link to={`/prospects/${p.prospectId}`} className="text-[12px] font-bold uppercase text-[#141414] hover:underline">
            {p.prospectName}
          </Link>
          <div className="flex items-center space-x-2 text-[9px] font-mono text-[#141414]/70 mt-1">
            <span className="flex items-center"><CalendarIcon className="w-2.5 h-2.5 mr-1"/> Sent: {format(p.proposalDate, 'MMM d, yyyy')}</span>
          </div>
        </div>
        <div className="text-[14px] font-bold tracking-tighter text-[#141414]">${p.amount.toLocaleString()}</div>
      </div>
      
      <div className="text-[10px] font-mono text-[#141414] mb-4 bg-white/40 p-2 border border-[#141414]/10 line-clamp-2">
        {p.scope}
      </div>

      <div className="flex justify-between items-center text-[9px] font-mono text-[#141414]/60 mb-3">
        <span>Decision expected by: {format(p.expectedDecisionDate, 'MMM d, yyyy')}</span>
        {p.proposalUrl && (
          <a href={p.proposalUrl.startsWith('http') ? p.proposalUrl : `https://${p.proposalUrl}`} target="_blank" rel="noreferrer" className="flex items-center hover:text-[#141414] hover:underline">
            View Link <ExternalLink className="w-2.5 h-2.5 ml-1" />
          </a>
        )}
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#141414]/10">
        <select 
          value={p.status}
          onChange={(e) => handleStatusChange(p.id!, e.target.value as any)}
          className={`text-[9px] font-bold uppercase border border-[#141414]/20 px-2 py-1 bg-transparent focus:outline-none cursor-pointer ${
            p.status === 'Accepted' ? 'bg-green-100 text-green-800' : 
            p.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'text-[#141414]'
          }`}
        >
          <option value="Draft">Draft</option>
          <option value="Sent">Sent</option>
          <option value="Viewed">Viewed</option>
          <option value="Negotiating">Negotiating</option>
          <option value="Accepted">Accepted</option>
          <option value="Rejected">Rejected</option>
          <option value="Expired">Expired</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[#141414] bg-[#E4E3E0] px-8 py-6 sticky top-0 z-10 flex-shrink-0 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tighter text-[#141414] flex items-center">
            <FileText className="w-5 h-5 mr-3" /> Proposals
          </h1>
          <p className="text-[10px] font-mono uppercase text-[#141414]/60 mt-1">Manage active deals and won projects</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 bg-[#E4E3E0]">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* METRICS */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="border border-[#141414] p-6 bg-white/20">
              <div className="text-[10px] font-bold uppercase text-[#141414]/60 mb-2">Active Pipeline Value</div>
              <div className="text-4xl font-bold tracking-tighter text-[#141414]">${totalActiveValue.toLocaleString()}</div>
            </div>
            <div className="border border-[#141414] p-6 bg-[#141414] text-[#E4E3E0]">
              <div className="text-[10px] font-bold uppercase text-[#E4E3E0]/60 mb-2">Total Won Value</div>
              <div className="text-4xl font-bold tracking-tighter text-white">${totalWonValue.toLocaleString()}</div>
            </div>
          </div>
          
          <div>
            <h2 className="text-[12px] font-bold uppercase text-[#141414] mb-4 border-b border-[#141414]/20 pb-2">Active Proposals ({active.length})</h2>
            {active.length === 0 ? (
              <div className="text-center text-[10px] font-mono uppercase text-[#141414]/50 py-8 border border-[#141414]/20 border-dashed">
                No active proposals.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {active.map(renderProposalCard)}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-[12px] font-bold uppercase text-[#141414] mb-4 border-b border-[#141414]/20 pb-2">Completed / Closed ({completed.length})</h2>
             {completed.length === 0 ? (
              <div className="text-center text-[10px] font-mono uppercase text-[#141414]/50 py-8 border border-[#141414]/20 border-dashed">
                No completed proposals.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {completed.map(renderProposalCard)}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
