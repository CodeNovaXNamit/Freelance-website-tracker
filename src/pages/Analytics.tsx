import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getEntities } from '../lib/api';
import { Outreach, Prospect } from '../types';
import { Loader2, BarChart3, PieChart } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function Analytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [outreachData, setOutreachData] = useState<any[]>([]);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const uid = user!.uid;
      const [outreachList] = await Promise.all([
        getEntities<Outreach>(uid, 'outreach')
      ]);

      // Group by method
      const methodCounts: Record<string, { method: string, sent: number, replied: number }> = {};
      
      outreachList.forEach(o => {
        if (!methodCounts[o.method]) {
          methodCounts[o.method] = { method: o.method, sent: 0, replied: 0 };
        }
        methodCounts[o.method].sent += 1;
        if (o.responseReceived && o.responseType && o.responseType !== 'No Response') {
          methodCounts[o.method].replied += 1;
        }
      });

      setOutreachData(Object.values(methodCounts));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#141414]" /></div>;

  return (
    <div className="p-8 flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tighter text-[#141414] flex items-center">
            <BarChart3 className="w-5 h-5 mr-3" /> Analytics Engine
          </h1>
          <p className="mt-1 text-[10px] uppercase font-bold opacity-50 tracking-widest text-[#141414]">System performance and conversion metrics.</p>
        </div>
      </div>

      {outreachData.length > 0 ? (
        <div className="flex-1 flex flex-col gap-6">
          <div className="border border-[#141414] p-6 bg-transparent h-96">
            <h3 className="text-[10px] font-bold uppercase mb-6 text-[#141414]">Outreach Performance</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={outreachData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#141414" strokeOpacity={0.2} />
                  <XAxis dataKey="method" tick={{fontSize: 10, fontFamily: 'monospace', fill: '#141414'}} axisLine={{stroke: '#141414'}} tickLine={{stroke: '#141414'}} />
                  <YAxis tick={{fontSize: 10, fontFamily: 'monospace', fill: '#141414'}} axisLine={{stroke: '#141414'}} tickLine={{stroke: '#141414'}} />
                  <Tooltip 
                    cursor={{fill: '#141414', opacity: 0.05}} 
                    contentStyle={{borderRadius: '0px', border: '1px solid #141414', boxShadow: 'none', backgroundColor: '#E4E3E0', color: '#141414', fontFamily: 'monospace', fontSize: '10px'}} 
                  />
                  <Bar dataKey="sent" fill="#141414" radius={[0, 0, 0, 0]} name="Sent" />
                  <Bar dataKey="replied" fill="#141414" fillOpacity={0.5} radius={[0, 0, 0, 0]} name="Replied" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-[#141414] bg-[#141414]/5 text-center py-12 flex-1 flex flex-col items-center justify-center">
          <h3 className="text-[10px] font-bold uppercase text-[#141414]">Data Warehouse Syncing</h3>
          <p className="mt-1 text-[10px] font-mono uppercase text-[#141414]/60">Insufficient volume to generate predictive analytics. Add some outreach.</p>
        </div>
      )}
    </div>
  );
}
