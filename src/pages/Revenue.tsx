import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getEntities } from '../lib/api';
import { Client } from '../types';
import { Loader2, TrendingUp, DollarSign, Calendar as CalendarIcon, ArrowUpRight, Clock } from 'lucide-react';
import { format } from 'date-fns';

export function Revenue() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const cData = await getEntities<Client>(user!.uid, 'clients');
      setClients(cData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#141414]" /></div>;

  const totalValue = clients.reduce((sum, c) => sum + (c.projectValue || 0), 0);
  const collected = clients.reduce((sum, c) => sum + (c.amountPaid || 0), 0);
  const pending = totalValue - collected;

  // Group by month
  const monthlyData = clients.reduce((acc, c) => {
    if (!c.startDate) return acc;
    const month = format(c.startDate, 'MMM yyyy');
    if (!acc[month]) acc[month] = { booked: 0, collected: 0 };
    acc[month].booked += c.projectValue || 0;
    acc[month].collected += c.amountPaid || 0;
    return acc;
  }, {} as Record<string, { booked: number, collected: number }>);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[#141414] bg-[#E4E3E0] px-8 py-6 sticky top-0 z-10 flex-shrink-0 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tighter text-[#141414] flex items-center">
            <TrendingUp className="w-5 h-5 mr-3" /> Revenue
          </h1>
          <p className="text-[10px] font-mono uppercase text-[#141414]/60 mt-1">Real-time financial tracking from clients</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 bg-[#E4E3E0]">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-[#141414] p-6 bg-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-bold uppercase text-[#141414]/60">Total Booked Value</h3>
                <DollarSign className="h-4 w-4 text-[#141414]/40" />
              </div>
              <div className="text-4xl font-bold tracking-tighter text-[#141414]">${totalValue.toLocaleString()}</div>
            </div>
            <div className="border border-[#141414] p-6 bg-[#141414] text-[#E4E3E0]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-bold uppercase text-[#E4E3E0]/60">Total Collected</h3>
                <ArrowUpRight className="h-4 w-4 text-[#E4E3E0]/40" />
              </div>
              <div className="text-4xl font-bold tracking-tighter text-white">${collected.toLocaleString()}</div>
            </div>
            <div className="border border-[#141414] p-6 bg-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-bold uppercase text-[#141414]/60">Pending / Accounts Receivable</h3>
                <Clock className="h-4 w-4 text-[#141414]/40" />
              </div>
              <div className="text-4xl font-bold tracking-tighter text-red-700">${pending.toLocaleString()}</div>
            </div>
          </div>

          <div>
            <h2 className="text-[12px] font-bold uppercase text-[#141414] mb-4 border-b border-[#141414]/20 pb-2">Monthly Breakdown</h2>
            <div className="border border-[#141414] bg-transparent">
              {Object.keys(monthlyData).length === 0 ? (
                <div className="p-8 text-center text-[10px] font-mono uppercase text-[#141414]/50">No revenue data.</div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#141414] bg-[#141414]/5 text-[9px] font-bold uppercase text-[#141414]">
                      <th className="p-4 border-r border-[#141414]/20">Month</th>
                      <th className="p-4 border-r border-[#141414]/20 text-right">Booked</th>
                      <th className="p-4 text-right">Collected</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(monthlyData as Record<string, any>).map(([month, data]) => (
                      <tr key={month} className="border-b border-[#141414]/20 last:border-none text-[10px] font-mono">
                        <td className="p-4 border-r border-[#141414]/20 font-bold">{month}</td>
                        <td className="p-4 border-r border-[#141414]/20 text-right">${data.booked.toLocaleString()}</td>
                        <td className="p-4 text-right text-green-700 font-bold">${data.collected.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-[12px] font-bold uppercase text-[#141414] mb-4 border-b border-[#141414]/20 pb-2">Client Ledger</h2>
            <div className="space-y-4">
              {clients.map(c => (
                <div key={c.id} className="border border-[#141414] p-4 flex justify-between items-center bg-white/30">
                  <div>
                    <div className="text-[12px] font-bold uppercase mb-1">{c.projectName}</div>
                    <div className="text-[9px] font-mono text-[#141414]/60">Status: {c.projectStatus}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[14px] font-bold tracking-tighter text-[#141414]">${c.projectValue.toLocaleString()} Booked</div>
                    <div className="text-[10px] font-mono text-green-700">${c.amountPaid.toLocaleString()} Paid</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
