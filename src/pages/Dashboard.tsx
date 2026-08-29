import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardStats, seedSampleData, getProspects } from '../lib/api';
import { Prospect } from '../types';
import { Users, Phone, Target, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    const [dashboardStats, allProspects] = await Promise.all([
      getDashboardStats(user.uid),
      getProspects(user.uid)
    ]);
    setStats(dashboardStats);
    setProspects(allProspects);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleSeed = async () => {
    if (!user) return;
    await seedSampleData(user.uid);
    loadData();
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;
  }

  const funnelData = [
    { name: 'Prospects', value: stats.totalProspects },
    { name: 'Contacted', value: stats.contacted },
    { name: 'Replies', value: stats.replies },
    { name: 'Proposals', value: stats.proposals },
    { name: 'Won', value: stats.won },
  ];

  return (
    <div className="p-8 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tighter text-[#141414]">Dashboard</h1>
          <p className="mt-1 text-[10px] uppercase font-bold opacity-50 tracking-widest text-[#141414]">Overview of acquisition process.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleSeed}
            className="border border-[#141414] bg-transparent px-4 py-2 text-[10px] font-bold uppercase text-[#141414] hover:bg-[#141414] hover:text-[#E4E3E0]"
          >
            Load Sample Data
          </button>
          <Link
            to="/prospects"
            className="border border-[#141414] bg-[#141414] px-4 py-2 text-[10px] font-bold uppercase text-[#E4E3E0] hover:bg-transparent hover:text-[#141414]"
          >
            Add Prospect
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
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
        {/* Today's Tasks */}
        <div className="lg:w-1/3 border border-[#141414] flex flex-col bg-transparent">
          <div className="p-3 border-b border-[#141414] bg-[#141414]/5 flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase text-[#141414]">Today's Priority</span>
          </div>
          <ul className="flex-1 overflow-auto font-mono text-[11px] divide-y divide-[#141414]/20">
            {prospects.slice(0, 5).map(p => (
              <li key={p.id}>
                <Link to={`/prospects/${p.id}`} className="p-3 flex items-center gap-4 hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors cursor-pointer text-[#141414]">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold uppercase">{p.companyName}</p>
                    <p className="truncate text-[9px] opacity-60">STATUS: {p.status}</p>
                  </div>
                  <div>
                    <span className="px-2 py-0.5 border border-[#141414] text-[9px] font-bold uppercase opacity-60">
                      {p.priority}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
            {prospects.length === 0 && (
              <li className="px-6 py-8 text-center text-[10px] uppercase font-bold text-[#141414]/50">
                NO TASKS FOR TODAY.
              </li>
            )}
          </ul>
        </div>

        {/* Funnel Chart */}
        <div className="lg:w-2/3 border border-[#141414] p-4 flex flex-col bg-transparent">
          <h3 className="text-[10px] font-bold uppercase mb-4 text-[#141414]">Sales Funnel</h3>
          <div className="h-72 w-full">
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
  );
}
