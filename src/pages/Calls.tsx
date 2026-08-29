import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getEntities, saveEntity } from '../lib/api';
import { Call, Prospect } from '../types';
import { Loader2, Phone, Calendar as CalendarIcon, Clock, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export function Calls() {
  const { user } = useAuth();
  const [calls, setCalls] = useState<(Call & { prospectName?: string })[]>([]);
  const [prospects, setProspects] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const uid = user!.uid;
      const [pData, cData] = await Promise.all([
        getEntities<Prospect>(uid, 'prospects'),
        getEntities<Call>(uid, 'calls')
      ]);
      
      const pMap: Record<string, string> = {};
      pData.forEach(p => pMap[p.id!] = p.companyName);
      setProspects(pMap);

      const merged = cData.map(c => ({ ...c, prospectName: pMap[c.prospectId] || 'Unknown' }));
      setCalls(merged.sort((a,b) => b.scheduledAt - a.scheduledAt));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, outcome: Call['outcome']) => {
    const callToUpdate = calls.find(c => c.id === id);
    if (!callToUpdate) return;
    
    const updated = { ...callToUpdate, outcome };
    // Optimistic update
    setCalls(prev => prev.map(c => c.id === id ? updated : c));
    try {
      await saveEntity(user!.uid, 'calls', updated);
    } catch(e) {
      alert("Failed to update status");
      loadData();
    }
  };

  if (loading) return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#141414]" /></div>;

  const upcoming = calls.filter(c => c.scheduledAt > Date.now());
  const past = calls.filter(c => c.scheduledAt <= Date.now());

  const renderCallCard = (c: Call & { prospectName?: string }) => (
    <div key={c.id} className="border border-[#141414] bg-transparent p-4 flex flex-col justify-between hover:bg-white/30 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <div>
          <Link to={`/prospects/${c.prospectId}`} className="text-[12px] font-bold uppercase text-[#141414] hover:underline">
            {c.prospectName}
          </Link>
          <div className="flex items-center space-x-2 text-[9px] font-mono text-[#141414]/70 mt-1">
            <span className="flex items-center"><CalendarIcon className="w-2.5 h-2.5 mr-1"/> {format(c.scheduledAt, 'MMM d, yyyy h:mm a')}</span>
            <span className="flex items-center"><Clock className="w-2.5 h-2.5 mr-1"/> {c.duration} min</span>
          </div>
        </div>
        <span className="px-2 py-1 text-[9px] font-bold uppercase border border-[#141414]">{c.callType}</span>
      </div>
      
      {c.mainRequirement && (
        <div className="text-[10px] font-mono text-[#141414] mb-4 bg-white/40 p-2 border border-[#141414]/10">
          <span className="font-bold uppercase text-[9px]">Requirement: </span>{c.mainRequirement}
        </div>
      )}

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#141414]/10">
        <select 
          value={c.outcome}
          onChange={(e) => handleStatusChange(c.id!, e.target.value as any)}
          className="text-[9px] font-bold uppercase border-none bg-transparent focus:outline-none cursor-pointer text-[#141414]"
        >
          <option value="Interested">Interested</option>
          <option value="Proposal Requested">Proposal Requested</option>
          <option value="Thinking">Thinking</option>
          <option value="Not Interested">Not Interested</option>
          <option value="No Show">No Show</option>
          <option value="Won">Won</option>
          <option value="Lost">Lost</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[#141414] bg-[#E4E3E0] px-8 py-6 sticky top-0 z-10 flex-shrink-0 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tighter text-[#141414] flex items-center">
            <Phone className="w-5 h-5 mr-3" /> Calls
          </h1>
          <p className="text-[10px] font-mono uppercase text-[#141414]/60 mt-1">Manage discovery & sales calls</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 bg-[#E4E3E0]">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div>
            <h2 className="text-[12px] font-bold uppercase text-[#141414] mb-4 border-b border-[#141414]/20 pb-2">Upcoming Calls ({upcoming.length})</h2>
            {upcoming.length === 0 ? (
              <div className="text-center text-[10px] font-mono uppercase text-[#141414]/50 py-8 border border-[#141414]/20 border-dashed">
                No upcoming calls scheduled. Go to a prospect to schedule one.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcoming.map(renderCallCard)}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-[12px] font-bold uppercase text-[#141414] mb-4 border-b border-[#141414]/20 pb-2">Past Calls ({past.length})</h2>
             {past.length === 0 ? (
              <div className="text-center text-[10px] font-mono uppercase text-[#141414]/50 py-8 border border-[#141414]/20 border-dashed">
                No past calls.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {past.map(renderCallCard)}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
