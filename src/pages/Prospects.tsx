import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getProspects } from '../lib/api';
import { Prospect, LeadStatus } from '../types';
import { Search, Plus, Filter, MoreHorizontal, MapPin, Globe, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { format } from 'date-fns';

export function Prospects() {
  const { user } = useAuth();
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user) {
      getProspects(user.uid).then(data => {
        setProspects(data);
        setLoading(false);
      });
    }
  }, [user]);

  const filteredProspects = prospects.filter(p => 
    p.companyName.toLowerCase().includes(search.toLowerCase()) || 
    p.industry.toLowerCase().includes(search.toLowerCase()) ||
    p.city.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: LeadStatus) => {
    switch(status) {
      case 'New': return 'bg-gray-100 text-gray-800';
      case 'Researching': return 'bg-purple-100 text-purple-800';
      case 'Contacted': return 'bg-blue-100 text-blue-800';
      case 'Replied': return 'bg-indigo-100 text-indigo-800';
      case 'Interested': return 'bg-yellow-100 text-yellow-800';
      case 'Call Scheduled': return 'bg-orange-100 text-orange-800';
      case 'Proposal Sent': return 'bg-teal-100 text-teal-800';
      case 'Won': return 'bg-green-100 text-green-800';
      case 'Lost': 
      case 'Not Interested': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading prospects...</div>;
  }

  return (
    <div className="p-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tighter text-[#141414]">Prospects</h1>
          <p className="mt-1 text-[10px] uppercase font-bold opacity-50 tracking-widest text-[#141414]">
            A list of all the businesses in your database.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 flex space-x-3">
          <button className="border border-[#141414] bg-transparent px-4 py-2 text-[10px] font-bold uppercase text-[#141414] hover:bg-[#141414] hover:text-[#E4E3E0] inline-flex items-center">
            <Filter className="-ml-0.5 mr-1.5 h-4 w-4" />
            Filter
          </button>
          <Link
            to="/prospects/new"
            className="border border-[#141414] bg-[#141414] px-4 py-2 text-[10px] font-bold uppercase text-[#E4E3E0] hover:bg-transparent hover:text-[#141414] inline-flex items-center"
          >
            <Plus className="-ml-0.5 mr-1.5 h-4 w-4" />
            Add Prospect
          </Link>
        </div>
      </div>

      <div className="mb-6 max-w-md relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-5 w-5 text-[#141414]/50" />
        </div>
        <input
          type="text"
          className="block w-full bg-transparent border border-[#141414] rounded-none py-2.5 pl-10 pr-3 text-[10px] font-mono text-[#141414] placeholder-[#141414]/50 focus:outline-none"
          placeholder="SEARCH BY COMPANY, INDUSTRY, OR CITY..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="border border-[#141414] overflow-hidden bg-transparent">
        <table className="min-w-full divide-y divide-[#141414]">
          <thead className="bg-[#141414]/5">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-[10px] font-bold uppercase text-[#141414] sm:pl-6 border-r border-[#141414]/20">Company</th>
              <th scope="col" className="px-3 py-3.5 text-left text-[10px] font-bold uppercase text-[#141414] border-r border-[#141414]/20">Status</th>
              <th scope="col" className="px-3 py-3.5 text-left text-[10px] font-bold uppercase text-[#141414] border-r border-[#141414]/20">Industry / City</th>
              <th scope="col" className="px-3 py-3.5 text-left text-[10px] font-bold uppercase text-[#141414] border-r border-[#141414]/20">Lead Score</th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#141414]/20 bg-transparent">
            {filteredProspects.map((prospect) => (
              <tr key={prospect.id} className="hover:bg-[#141414]/10 transition-colors">
                <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6 border-r border-[#141414]/20">
                  <div className="flex items-center">
                    <div>
                      <div className="font-bold text-[#141414] uppercase text-xs flex items-center">
                        <Link to={`/prospects/${prospect.id}`} className="hover:underline">{prospect.companyName}</Link>
                        {prospect.websiteUrl && (
                          <a href={`https://${prospect.websiteUrl.replace('https://', '').replace('http://', '')}`} target="_blank" rel="noreferrer" className="ml-2 text-[#141414]/50 hover:text-[#141414]">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                      <div className="text-[#141414]/60 font-mono text-[9px] mt-0.5">{format(prospect.createdAt, 'MMM d, yyyy').toUpperCase()}</div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-[10px] font-bold uppercase text-[#141414] border-r border-[#141414]/20">
                  <span className="border border-[#141414] px-2 py-0.5 opacity-80">
                    {prospect.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-xs font-mono text-[#141414] border-r border-[#141414]/20">
                  <div className="uppercase">{prospect.industry}</div>
                  <div className="flex items-center text-[#141414]/60 mt-0.5 text-[9px] uppercase">
                    <MapPin className="h-3 w-3 mr-1" />
                    {prospect.city}
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-[10px] text-[#141414] font-mono border-r border-[#141414]/20">
                  <div className="flex items-center">
                    <span className="font-bold mr-2">{String(prospect.leadScore).padStart(2, '0')}/100</span>
                    <span className="opacity-70">{prospect.leadScore >= 80 ? 'HIGH' : prospect.leadScore >= 50 ? 'MED' : 'LOW'}</span>
                  </div>
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-[10px] font-bold uppercase sm:pr-6">
                  <Link to={`/prospects/${prospect.id}`} className="text-[#141414] hover:underline">
                    [ View ]<span className="sr-only">, {prospect.companyName}</span>
                  </Link>
                </td>
              </tr>
            ))}
            {filteredProspects.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-[10px] font-bold uppercase text-[#141414]/50">
                  NO PROSPECTS FOUND.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
