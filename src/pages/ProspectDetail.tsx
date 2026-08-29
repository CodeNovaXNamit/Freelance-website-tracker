import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getProspect, saveProspect } from '../lib/api';
import { Prospect } from '../types';
import { ArrowLeft, MapPin, Globe, Mail, Phone as PhoneIcon, Building2, Calendar, Target, Plus } from 'lucide-react';
import { clsx } from 'clsx';
import { format } from 'date-fns';

const tabs = [
  { name: 'Info', id: 'info' },
  { name: 'Website Audit', id: 'audit' },
  { name: 'Outreach', id: 'outreach' },
  { name: 'Calls', id: 'calls' },
  { name: 'Proposals', id: 'proposals' },
  { name: 'Deal', id: 'deal' },
];

export function ProspectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    if (user && id) {
      if (id === 'new') {
        // Init empty prospect
        setProspect({
          id: '',
          companyName: '',
          websiteUrl: '',
          industry: '',
          city: '',
          hasWebsite: false,
          websiteQuality: 'None',
          leadScore: 50,
          priority: 'Medium',
          status: 'New',
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
        setLoading(false);
      } else {
        getProspect(user.uid, id).then(data => {
          setProspect(data);
          setLoading(false);
        });
      }
    }
  }, [user, id]);

  const handleSave = async () => {
    if (!user || !prospect) return;
    setSaving(true);
    try {
      await saveProspect(user.uid, prospect);
      alert('Saved successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to save.');
    }
    setSaving(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProspect(prev => prev ? { ...prev, [name]: name === 'leadScore' ? parseInt(value) || 0 : value } : null);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!prospect) return <div className="p-8 text-center text-gray-500">Prospect not found.</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] overflow-hidden bg-[#E4E3E0]">
      <div className="border-b border-[#141414] bg-[#E4E3E0]">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link to="/prospects" className="text-[#141414] hover:opacity-50">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold uppercase tracking-tighter text-[#141414]">{prospect.companyName || 'New Prospect'}</h1>
                <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-6">
                  {prospect.industry && (
                    <div className="mt-2 flex items-center text-[10px] font-mono text-[#141414] uppercase">
                      <Building2 className="mr-1.5 h-3 w-3 flex-shrink-0" />
                      {prospect.industry}
                    </div>
                  )}
                  {prospect.city && (
                    <div className="mt-2 flex items-center text-[10px] font-mono text-[#141414] uppercase">
                      <MapPin className="mr-1.5 h-3 w-3 flex-shrink-0" />
                      {prospect.city}
                    </div>
                  )}
                  {prospect.websiteUrl && (
                    <div className="mt-2 flex items-center text-[10px] font-mono text-[#141414] uppercase">
                      <Globe className="mr-1.5 h-3 w-3 flex-shrink-0" />
                      <a href={`https://${prospect.websiteUrl.replace('https://', '').replace('http://', '')}`} target="_blank" rel="noreferrer" className="hover:underline">
                        {prospect.websiteUrl}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="border border-[#141414] bg-[#141414] px-6 py-2 text-[10px] font-bold uppercase text-[#E4E3E0] hover:bg-transparent hover:text-[#141414] disabled:opacity-50 inline-flex items-center"
              >
                {saving ? 'SAVING...' : 'SAVE PROSPECT'}
              </button>
            </div>
          </div>
        </div>
        <div className="px-8 border-t border-[#141414]">
          <nav className="flex -mb-px divide-x divide-[#141414]">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  activeTab === tab.id
                    ? 'bg-[#141414] text-[#E4E3E0]'
                    : 'text-[#141414] hover:bg-[#141414]/10',
                  'px-6 py-3 text-[10px] font-bold uppercase tracking-wider transition-colors'
                )}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-5xl">
          {activeTab === 'info' && (
            <div className="space-y-8">
              <div className="border border-[#141414] bg-transparent">
                <div className="border-b border-[#141414] bg-[#141414]/5 px-6 py-4">
                  <h3 className="text-[10px] font-bold uppercase text-[#141414]">Basic Information</h3>
                </div>
                <div className="px-6 py-6">
                  <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-bold uppercase text-[#141414]">Company Name</label>
                      <input type="text" name="companyName" value={prospect.companyName} onChange={handleChange} className="mt-2 block w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none" />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-bold uppercase text-[#141414]">Website URL</label>
                      <input type="text" name="websiteUrl" value={prospect.websiteUrl} onChange={handleChange} className="mt-2 block w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold uppercase text-[#141414]">Industry</label>
                      <input type="text" name="industry" value={prospect.industry} onChange={handleChange} className="mt-2 block w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold uppercase text-[#141414]">City</label>
                      <input type="text" name="city" value={prospect.city} onChange={handleChange} className="mt-2 block w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-[#141414] bg-transparent">
                <div className="border-b border-[#141414] bg-[#141414]/5 px-6 py-4">
                  <h3 className="text-[10px] font-bold uppercase text-[#141414]">Lead Status & Priority</h3>
                </div>
                <div className="px-6 py-6">
                  <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-6">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold uppercase text-[#141414]">Status</label>
                      <select name="status" value={prospect.status} onChange={handleChange} className="mt-2 block w-full border border-[#141414] bg-[#E4E3E0] px-3 py-2 text-[10px] font-mono focus:outline-none">
                        <option value="New">New</option>
                        <option value="Researching">Researching</option>
                        <option value="Ready to Contact">Ready to Contact</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Replied">Replied</option>
                        <option value="Interested">Interested</option>
                        <option value="Call Scheduled">Call Scheduled</option>
                        <option value="Proposal Sent">Proposal Sent</option>
                        <option value="Won">Won</option>
                        <option value="Lost">Lost</option>
                        <option value="Not Interested">Not Interested</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold uppercase text-[#141414]">Priority</label>
                      <select name="priority" value={prospect.priority} onChange={handleChange} className="mt-2 block w-full border border-[#141414] bg-[#E4E3E0] px-3 py-2 text-[10px] font-mono focus:outline-none">
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold uppercase text-[#141414]">Lead Score (1-100)</label>
                      <input type="number" name="leadScore" value={prospect.leadScore} onChange={handleChange} className="mt-2 block w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'outreach' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-[10px] font-bold uppercase text-[#141414]">Outreach History</h2>
                <button className="border border-[#141414] bg-[#141414] px-4 py-2 text-[10px] font-bold uppercase text-[#E4E3E0] hover:bg-transparent hover:text-[#141414] inline-flex items-center">
                  <Plus className="-ml-0.5 mr-1.5 h-4 w-4" />
                  Log Attempt
                </button>
              </div>
              <div className="border border-[#141414] bg-transparent">
                <ul className="divide-y divide-[#141414]/20">
                  <li className="px-4 py-6 sm:px-6">
                    <div className="flex justify-center text-[10px] font-bold uppercase text-[#141414]/50">
                      NO OUTREACH ATTEMPTS LOGGED YET.
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          )}
          
          {activeTab === 'proposals' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-[10px] font-bold uppercase text-[#141414]">Proposals & Quotes</h2>
                <button className="border border-[#141414] bg-[#141414] px-4 py-2 text-[10px] font-bold uppercase text-[#E4E3E0] hover:bg-transparent hover:text-[#141414] inline-flex items-center">
                  <Plus className="-ml-0.5 mr-1.5 h-4 w-4" />
                  Generate Proposal
                </button>
              </div>
              <div className="border border-[#141414] bg-transparent">
                <ul className="divide-y divide-[#141414]/20">
                  <li className="px-4 py-6 sm:px-6">
                    <div className="flex justify-center text-[10px] font-bold uppercase text-[#141414]/50">
                      NO PROPOSALS GENERATED YET.
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-[10px] font-bold uppercase text-[#141414]">Internal Notes</h2>
              </div>
              <div className="border border-[#141414] bg-transparent p-4">
                <textarea 
                  className="w-full bg-transparent border-none text-[10px] font-mono focus:outline-none min-h-[200px] resize-y placeholder-[#141414]/30"
                  placeholder="Enter notes about this prospect..."
                />
                <div className="flex justify-end mt-4 pt-4 border-t border-[#141414]/20">
                   <button className="border border-[#141414] bg-transparent px-4 py-2 text-[10px] font-bold uppercase text-[#141414] hover:bg-[#141414] hover:text-[#E4E3E0]">
                     Save Notes
                   </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
