const fs = require('fs');

const content = `
import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getProspects, deleteProspect } from '../lib/api';
import { Prospect, LeadStatus } from '../types';
import { Search, Plus, Filter, MapPin, ExternalLink, ArrowUpDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export function Prospects() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters and Sorting
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('createdAt_desc');

  useEffect(() => {
    if (user) {
      loadProspects();
    }
  }, [user]);

  const loadProspects = () => {
    setLoading(true);
    getProspects(user!.uid).then(data => {
      setProspects(data);
      setLoading(false);
    });
  };

  const filteredAndSorted = useMemo(() => {
    let result = prospects;

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => 
        p.companyName.toLowerCase().includes(q) || 
        p.industry.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        (p.contactName && p.contactName.toLowerCase().includes(q)) ||
        (p.email && p.email.toLowerCase().includes(q))
      );
    }

    // Filters
    if (statusFilter !== 'All') {
      result = result.filter(p => p.status === statusFilter);
    }
    if (priorityFilter !== 'All') {
      result = result.filter(p => p.priority === priorityFilter);
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'createdAt_desc':
          return b.createdAt - a.createdAt;
        case 'createdAt_asc':
          return a.createdAt - b.createdAt;
        case 'name_asc':
          return a.companyName.localeCompare(b.companyName);
        case 'name_desc':
          return b.companyName.localeCompare(a.companyName);
        case 'score_desc':
          return b.leadScore - a.leadScore;
        case 'score_asc':
          return a.leadScore - b.leadScore;
        default:
          return 0;
      }
    });

    return result;
  }, [prospects, search, statusFilter, priorityFilter, sortBy]);

  if (loading) {
    return <div className="p-8 text-center text-[#141414]/50 text-[10px] uppercase font-bold tracking-widest">Loading database...</div>;
  }

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tighter text-[#141414]">CRM / Pipeline</h1>
          <p className="mt-1 text-[10px] uppercase font-bold opacity-50 tracking-widest text-[#141414]">
            {filteredAndSorted.length} TARGETS FOUND IN DATABASE.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 flex space-x-3">
          <Link
            to="/prospects/new"
            className="border border-[#141414] bg-[#141414] px-4 py-2 text-[10px] font-bold uppercase text-[#E4E3E0] hover:bg-transparent hover:text-[#141414] inline-flex items-center"
          >
            <Plus className="-ml-0.5 mr-1.5 h-4 w-4" />
            New Prospect
          </Link>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="relative sm:col-span-2">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-[#141414]/50" />
          </div>
          <input
            type="text"
            className="block w-full bg-transparent border border-[#141414] rounded-none py-2 pl-10 pr-3 text-[10px] font-mono text-[#141414] placeholder-[#141414]/50 focus:outline-none"
            placeholder="SEARCH BY COMPANY, NAME, EMAIL, CITY..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        
        <div>
          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="block w-full bg-transparent border border-[#141414] rounded-none py-2 px-3 text-[10px] font-bold uppercase text-[#141414] focus:outline-none"
          >
            <option value="All">ALL STATUSES</option>
            <option value="New">New</option>
            <option value="Researching">Researching</option>
            <option value="Ready to Contact">Ready to Contact</option>
            <option value="Contacted">Contacted</option>
            <option value="Replied">Replied</option>
            <option value="Interested">Interested</option>
            <option value="Call Scheduled">Call Scheduled</option>
            <option value="Call Completed">Call Completed</option>
            <option value="Proposal Sent">Proposal Sent</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Won">Won</option>
            <option value="Lost">Lost</option>
            <option value="Not Interested">Not Interested</option>
            <option value="Follow Up Later">Follow Up Later</option>
            <option value="Do Not Contact">Do Not Contact</option>
          </select>
        </div>

        <div>
          <select 
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="block w-full bg-transparent border border-[#141414] rounded-none py-2 px-3 text-[10px] font-bold uppercase text-[#141414] focus:outline-none"
          >
            <option value="createdAt_desc">SORT: NEWEST FIRST</option>
            <option value="createdAt_asc">SORT: OLDEST FIRST</option>
            <option value="score_desc">SORT: HIGHEST SCORE</option>
            <option value="score_asc">SORT: LOWEST SCORE</option>
            <option value="name_asc">SORT: A-Z</option>
            <option value="name_desc">SORT: Z-A</option>
          </select>
        </div>
      </div>

      <div className="border border-[#141414] flex-1 overflow-hidden bg-transparent flex flex-col">
        <div className="flex-1 overflow-auto">
          <table className="min-w-full divide-y divide-[#141414]">
            <thead className="bg-[#141414]/5 sticky top-0 z-10">
              <tr>
                <th scope="col" className="py-3 pl-4 pr-3 text-left text-[10px] font-bold uppercase text-[#141414] sm:pl-6 border-r border-[#141414]/20">Company / Contact</th>
                <th scope="col" className="px-3 py-3 text-left text-[10px] font-bold uppercase text-[#141414] border-r border-[#141414]/20">Status & Priority</th>
                <th scope="col" className="px-3 py-3 text-left text-[10px] font-bold uppercase text-[#141414] border-r border-[#141414]/20">Location & Industry</th>
                <th scope="col" className="px-3 py-3 text-left text-[10px] font-bold uppercase text-[#141414] border-r border-[#141414]/20">Score</th>
                <th scope="col" className="relative py-3 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141414]/20 bg-transparent">
              {filteredAndSorted.map((prospect) => (
                <tr key={prospect.id} className="hover:bg-[#141414]/10 transition-colors">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6 border-r border-[#141414]/20">
                    <div className="flex items-center">
                      <div>
                        <div className="font-bold text-[#141414] uppercase text-[11px] flex items-center">
                          <Link to={\`/prospects/\${prospect.id}\`} className="hover:underline">{prospect.companyName}</Link>
                          {prospect.websiteUrl && (
                            <a href={\`https://\${prospect.websiteUrl.replace('https://', '').replace('http://', '')}\`} target="_blank" rel="noreferrer" className="ml-2 text-[#141414]/50 hover:text-[#141414]">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        {(prospect.contactName || prospect.email) && (
                          <div className="text-[#141414]/70 font-mono text-[9px] mt-1 truncate max-w-[200px]">
                            {prospect.contactName} {prospect.contactName && prospect.email ? ' | ' : ''} {prospect.email}
                          </div>
                        )}
                        <div className="text-[#141414]/50 font-mono text-[8px] mt-0.5">ADDED: {format(prospect.createdAt, 'MMM d, yyyy').toUpperCase()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-[10px] font-bold uppercase text-[#141414] border-r border-[#141414]/20">
                    <div className="flex flex-col items-start gap-1">
                      <span className="border border-[#141414] bg-[#141414]/5 px-2 py-0.5">
                        {prospect.status}
                      </span>
                      <span className={\`text-[9px] px-1 \${prospect.priority === 'High' ? 'text-red-600 font-bold' : prospect.priority === 'Medium' ? 'text-orange-600' : 'opacity-60'}\`}>
                        {prospect.priority} PRIORITY
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-xs font-mono text-[#141414] border-r border-[#141414]/20">
                    <div className="uppercase">{prospect.industry}</div>
                    <div className="flex items-center text-[#141414]/60 mt-0.5 text-[9px] uppercase">
                      <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="truncate max-w-[120px]">{prospect.city}{prospect.country ? \`, \${prospect.country}\` : ''}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-[10px] text-[#141414] font-mono border-r border-[#141414]/20">
                    <div className="flex items-center">
                      <span className="font-bold text-[14px] mr-1">{String(prospect.leadScore || 0).padStart(2, '0')}</span>
                      <span className="opacity-50">/100</span>
                    </div>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-[10px] font-bold uppercase sm:pr-6">
                    <div className="flex flex-col items-end gap-2">
                      <Link to={\`/prospects/\${prospect.id}\`} className="text-[#141414] hover:underline bg-[#141414]/5 px-3 py-1 border border-[#141414]/20">
                        OPEN
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAndSorted.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[10px] font-bold uppercase text-[#141414]/50">
                    NO PROSPECTS MATCHING YOUR CRITERIA.
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
`;
fs.writeFileSync('src/pages/Prospects.tsx', content);
