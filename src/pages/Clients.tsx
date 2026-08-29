
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getProspects } from '../lib/api';
import { Prospect } from '../types';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export function Clients() {
  const { user } = useAuth();
  const [data, setData] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getProspects(user.uid).then(res => {
        const filtered = res.filter(p => p.status === 'Won');
        setData(filtered);
        setLoading(false);
      });
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#141414]" />
      </div>
    );
  }

  return (
    <div className="p-8 flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tighter text-[#141414]">Active Clients</h1>
          <p className="mt-1 text-[10px] uppercase font-bold opacity-50 tracking-widest text-[#141414]">Converted prospects and current clients.</p>
        </div>
      </div>

      <div className="border border-[#141414] overflow-hidden bg-transparent flex-1 flex flex-col">
        <div className="flex-1 overflow-auto">
          <table className="min-w-full divide-y divide-[#141414]">
            <thead className="bg-[#141414]/5 sticky top-0">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-[10px] font-bold uppercase text-[#141414] sm:pl-6 border-r border-[#141414]/20">Company</th>
                <th scope="col" className="px-3 py-3.5 text-left text-[10px] font-bold uppercase text-[#141414] border-r border-[#141414]/20">Status</th>
                <th scope="col" className="px-3 py-3.5 text-left text-[10px] font-bold uppercase text-[#141414] border-r border-[#141414]/20">Priority</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141414]/20 bg-transparent">
              {data.map((item) => (
                <tr key={item.id} className="hover:bg-[#141414]/10 transition-colors">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6 border-r border-[#141414]/20">
                    <div className="font-bold text-[#141414] uppercase text-xs">
                      {item.companyName}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-[10px] font-bold uppercase text-[#141414] border-r border-[#141414]/20">
                    <span className="border border-[#141414] px-2 py-0.5 opacity-80">
                      {item.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-[10px] text-[#141414] font-mono border-r border-[#141414]/20">
                    <span className="font-bold uppercase opacity-70">{item.priority}</span>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-[10px] font-bold uppercase sm:pr-6">
                    <Link to={`/prospects/${item.id}`} className="text-[#141414] hover:underline">
                      [ View ]
                    </Link>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-[10px] font-bold uppercase text-[#141414]/50">
                    NO ACTIVE CLIENTS YET.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
