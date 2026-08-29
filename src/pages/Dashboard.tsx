import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardStats, seedSampleData, getEntities } from '../lib/api';
import { Prospect } from '../types';
import { Loader2, Plus } from 'lucide-react';
import { Task, Call } from '../types';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalProspects: 0, contacted: 0, replies: 0, proposals: 0, won: 0 });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const uid = user!.uid;
      const [statsData, tData, cData] = await Promise.all([
        getDashboardStats(uid),
        getEntities<Task>(uid, 'tasks'),
        getEntities<Call>(uid, 'calls')
      ]);
      setStats(statsData);
      setTasks(tData.sort((a,b) => a.dueDate - b.dueDate).filter(t => t.status !== 'Done' && t.status !== 'Skipped'));
      setCalls(cData.sort((a,b) => a.scheduledAt - b.scheduledAt).filter(c => c.scheduledAt > Date.now()));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    try {
      await seedSampleData(user!.uid);
      await loadData();
    } catch (e) {
      alert("Error seeding data");
    }
  };

  if (loading) return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#141414]" /></div>;

  const funnelData = [
    { name: 'Prospects', value: stats.totalProspects },
    { name: 'Contacted', value: stats.contacted },
    { name: 'Replies', value: stats.replies },
    { name: 'Proposals', value: stats.proposals },
    { name: 'Won', value: stats.won },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[#141414] bg-[#E4E3E0] px-8 py-6 sticky top-0 z-10 flex-shrink-0 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tighter text-[#141414]">Dashboard</h1>
          <p className="text-[10px] font-mono uppercase text-[#141414]/60 mt-1">Overview of acquisition process.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleSeed}
            className="border border-[#141414] bg-transparent px-4 py-2 text-[10px] font-bold uppercase text-[#141414] hover:bg-[#141414] hover:text-[#E4E3E0]"
          >
            Load Sample Data
          </button>
          <Link to="/prospects/new" className="border border-[#141414] bg-[#141414] px-4 py-2 text-[9px] font-bold uppercase text-[#E4E3E0] hover:bg-transparent hover:text-[#141414] transition-colors flex items-center">
            <Plus className="w-3 h-3 mr-1" /> New Prospect
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 bg-[#E4E3E0]">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <section className="grid grid-cols-2 lg:grid-cols-5 border border-[#141414]">
            <div className="p-4 border-r border-[#141414] bg-transparent">
              <div className="text-[9px] uppercase opacity-50 font-bold mb-1 text-[#141414]">Total Prospects</div>
              <div className="text-2xl font-mono text-[#141414]">{stats.totalProspects}</div>
            </div>
            <div className="p-4 border-r border-[#141414] bg-transparent">
              <div className="text-[9px] uppercase opacity-50 font-bold mb-1 text-[#141414]">Contacted</div>
              <div className="text-2xl font-mono text-[#141414]">{stats.contacted}</div>
            </div>
            <div className="p-4 border-r border-[#141414] bg-[#141414] text-[#E4E3E0]">
              <div className="text-[9px] uppercase opacity-50 font-bold mb-1 text-[#E4E3E0]/70">Replies</div>
              <div className="text-2xl font-mono text-[#E4E3E0]">{stats.replies}</div>
            </div>
            <div className="p-4 border-r border-[#141414] bg-transparent">
              <div className="text-[9px] uppercase opacity-50 font-bold mb-1 text-[#141414]">Proposals Sent</div>
              <div className="text-2xl font-mono text-[#141414]">{stats.proposals}</div>
            </div>
            <div className="p-4 bg-transparent">
              <div className="text-[9px] uppercase opacity-50 font-bold mb-1 text-[#141414]">Clients Won</div>
              <div className="text-2xl font-mono text-[#141414]">{stats.won}</div>
            </div>
          </section>

          <div className="flex flex-col lg:flex-row gap-6 items-stretch">
            {/* Today's Tasks & Calls */}
            <div className="lg:w-1/3 flex flex-col gap-6">
              
              <div className="border border-[#141414] flex flex-col bg-transparent">
                <div className="p-3 border-b border-[#141414] bg-[#141414]/5 flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase text-[#141414]">Upcoming Calls</span>
                  <Link to="/calls" className="text-[9px] font-bold uppercase hover:underline">View All</Link>
                </div>
                <div className="p-0">
                  {calls.length === 0 ? (
                    <div className="p-6 text-center text-[9px] font-mono uppercase text-[#141414]/50">No upcoming calls.</div>
                  ) : (
                    <div className="divide-y divide-[#141414]/10 max-h-48 overflow-y-auto">
                      {calls.slice(0, 5).map(c => (
                        <div key={c.id} className="p-3 flex justify-between items-center hover:bg-white/30 transition-colors">
                          <div>
                            <Link to={`/prospects/${c.prospectId}`} className="text-[10px] font-bold uppercase hover:underline">View Prospect</Link>
                            <div className="text-[9px] font-mono text-[#141414]/60">{format(c.scheduledAt, 'MMM d, h:mm a')} • {c.callType}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="border border-[#141414] flex flex-col bg-transparent">
                <div className="p-3 border-b border-[#141414] bg-[#141414]/5 flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase text-[#141414]">Active Tasks</span>
                  <Link to="/follow-ups" className="text-[9px] font-bold uppercase hover:underline">Manage</Link>
                </div>
                <div className="p-0">
                  {tasks.length === 0 ? (
                    <div className="p-6 text-center text-[9px] font-mono uppercase text-[#141414]/50">No active tasks.</div>
                  ) : (
                    <div className="divide-y divide-[#141414]/10 max-h-48 overflow-y-auto">
                      {tasks.slice(0, 5).map(t => (
                        <div key={t.id} className="p-3 flex justify-between items-center hover:bg-white/30 transition-colors">
                          <div>
                            <div className="text-[10px] font-bold uppercase">{t.title}</div>
                            <div className="text-[9px] font-mono text-[#141414]/60">Due: {format(t.dueDate, 'MMM d')}</div>
                          </div>
                          <span className="px-2 py-0.5 border border-[#141414] text-[8px] font-bold uppercase opacity-60">{t.type}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Funnel Chart */}
            <div className="lg:w-2/3 border border-[#141414] p-4 flex flex-col bg-transparent">
              <h3 className="text-[10px] font-bold uppercase mb-4 text-[#141414]">Sales Funnel</h3>
              <div className="flex-1 min-h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#141414" strokeOpacity={0.2} />
                    <XAxis dataKey="name" tick={{fontSize: 10, fontFamily: 'monospace', fill: '#141414'}} axisLine={{stroke: '#141414'}} tickLine={{stroke: '#141414'}} />
                    <YAxis tick={{fontSize: 10, fontFamily: 'monospace', fill: '#141414'}} axisLine={{stroke: '#141414'}} tickLine={{stroke: '#141414'}} />
                    <Tooltip 
                      cursor={{fill: '#141414', opacity: 0.05}} 
                      contentStyle={{borderRadius: '0px', border: '1px solid #141414', boxShadow: 'none', backgroundColor: '#E4E3E0', color: '#141414', fontFamily: 'monospace', fontSize: '10px'}} 
                    />
                    <Bar dataKey="value" fill="#141414" radius={[0, 0, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
