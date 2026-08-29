const fs = require('fs');

const content = `import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  getProspect, saveProspect, deleteProspect, 
  getOutreachList, saveOutreach, 
  getTasks, saveTask,
  getCalls, saveCall,
  getProposals, saveProposal,
  getClientByProspectId, saveClient,
  getWebsiteAuditByProspectId, saveWebsiteAudit
} from '../lib/api';
import { Prospect, LeadStatus, Outreach, Task, Call, Proposal, Client, WebsiteAudit } from '../types';
import { Loader2, ArrowLeft, Save, Trash2, Link as LinkIcon, Plus, MessageSquare, Calendar as CalendarIcon, Clock, CheckCircle, Phone, FileText, Briefcase, Activity, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { format, startOfToday } from 'date-fns';
import { calculateLeadScore } from '../lib/scoring';

const InputWrapper = ({ label, error, children }: { label: string, error?: string, children: React.ReactNode }) => (
  <div>
    <label className="block text-[9px] font-bold uppercase text-[#141414] mb-1 flex justify-between">
      {label}
      {error && <span className="text-red-600 font-mono tracking-tighter">{error}</span>}
    </label>
    {children}
  </div>
);

export function ProspectDetail() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'AUDIT' | 'ACTIVITY' | 'DEALS'>('OVERVIEW');

  const [prospect, setProspect] = useState<Partial<Prospect>>({
    companyName: '', industry: '', status: 'New' as LeadStatus, priority: 'Medium', 
    leadScore: 0, automaticScore: 0, hasWebsite: false, websiteQuality: 'None', city: ''
  });
  
  const [outreachList, setOutreachList] = useState<Outreach[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [client, setClient] = useState<Partial<Client> | null>(null);
  const [audit, setAudit] = useState<Partial<WebsiteAudit> | null>(null);
  
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user && !isNew && id) {
      loadData();
    } else if (isNew) {
      setAudit({
        designQuality: 'Average', mobileResponsiveness: 'Average', loadingSpeed: 'Average',
        navigation: 'Average', ctaQuality: 'Average', seoBasics: 'Average', contentQuality: 'Average',
        trustSignals: 'Average', productPresentation: 'Average', contactExperience: 'Average',
        topProblems: [], recommendedImprovements: [], auditCompleted: false
      });
    }
  }, [user, id, isNew, navigate]);

  const loadData = async () => {
    try {
      const uid = user!.uid;
      const pid = id!;
      const [pData, oData, tData, cData, propData, clientData, auditData] = await Promise.all([
        getProspect(uid, pid),
        getOutreachList(uid, pid),
        getTasks(uid, pid),
        getCalls(uid, pid),
        getProposals(uid, pid),
        getClientByProspectId(uid, pid),
        getWebsiteAuditByProspectId(uid, pid)
      ]);
      
      if (pData) {
        setProspect(pData);
        setOutreachList(oData.sort((a,b) => b.contactDate - a.contactDate));
        setTasks(tData.sort((a,b) => a.dueDate - b.dueDate));
        setCalls(cData.sort((a,b) => b.scheduledAt - a.scheduledAt));
        setProposals(propData.sort((a,b) => b.proposalDate - a.proposalDate));
        setClient(clientData);
        if (auditData) setAudit(auditData);
        else setAudit({
          designQuality: 'Average', mobileResponsiveness: 'Average', loadingSpeed: 'Average',
          navigation: 'Average', ctaQuality: 'Average', seoBasics: 'Average', contentQuality: 'Average',
          trustSignals: 'Average', productPresentation: 'Average', contactExperience: 'Average',
          topProblems: [], recommendedImprovements: [], auditCompleted: false
        });
      } else {
        navigate('/prospects');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!prospect.companyName) newErrors.companyName = "Company name required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let finalValue: any = value;
    if (type === 'checkbox') finalValue = (e.target as HTMLInputElement).checked;
    else if (type === 'number') finalValue = value === '' ? '' : Number(value);
    
    setProspect(prev => {
      const next = { ...prev, [name]: finalValue };
      if (name !== 'leadScore' && name !== 'manualScore') {
        const score = calculateLeadScore(next as Prospect, audit as WebsiteAudit);
        next.automaticScore = score;
        next.leadScore = next.manualScore !== undefined ? next.manualScore : score;
      }
      return next;
    });
    if (errors[name]) {
      setErrors(prev => { const copy = { ...prev }; delete copy[name]; return copy; });
    }
  };

  const handleAuditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAudit(prev => {
      const next = { ...prev, [name]: value };
      
      setProspect(pPrev => {
        const pNext = { ...pPrev };
        const score = calculateLeadScore(pNext as Prospect, next as WebsiteAudit);
        pNext.automaticScore = score;
        pNext.leadScore = pNext.manualScore !== undefined ? pNext.manualScore : score;
        return pNext;
      });
      
      return next;
    });
  };

  const handleSave = async () => {
    if (!validate()) { alert("Please check the form for errors."); return; }
    setSaving(true);
    try {
      const pToSave = { ...prospect };
      const score = calculateLeadScore(pToSave as Prospect, audit as WebsiteAudit);
      pToSave.automaticScore = score;
      pToSave.leadScore = pToSave.manualScore !== undefined ? pToSave.manualScore : score;
      
      const saved = await saveProspect(user!.uid, pToSave);
      setProspect(saved);
      
      if (audit) {
        await saveWebsiteAudit(user!.uid, { ...audit, prospectId: saved.id } as WebsiteAudit);
      }
      
      if (isNew) navigate(\`/prospects/\${saved.id}\`, { replace: true });
    } catch (e) { alert("Error saving prospect"); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (window.confirm("Permanently delete this prospect?")) {
      try {
        await deleteProspect(user!.uid, id!);
        navigate('/prospects');
      } catch (e) { alert("Error deleting"); }
    }
  };

  // Generate combined activity timeline
  const timelineEvents = useMemo(() => {
    const events: any[] = [];
    if (prospect.createdAt) events.push({ type: 'CREATED', date: prospect.createdAt, title: 'Prospect Created' });
    outreachList.forEach(o => events.push({ type: 'OUTREACH', date: o.contactDate, title: \`\${o.method} \${o.responseReceived ? '(Replied)' : '(No Reply)'}\`, desc: o.notes || o.messageUsed, ref: o }));
    tasks.filter(t => t.status === 'Done').forEach(t => events.push({ type: 'TASK_COMPLETED', date: t.completedAt || t.dueDate, title: \`Task Completed: \${t.title}\`, ref: t }));
    calls.forEach(c => events.push({ type: 'CALL', date: c.scheduledAt, title: \`\${c.callType} Call (\${c.outcome})\`, desc: c.notes, ref: c }));
    proposals.forEach(p => events.push({ type: 'PROPOSAL', date: p.proposalDate, title: \`Proposal \${p.status}\`, desc: \`$\${p.amount}\`, ref: p }));
    if (client && client.createdAt) events.push({ type: 'CLIENT', date: client.createdAt, title: 'Converted to Client', desc: \`$\${client.projectValue}\`, ref: client });
    
    return events.sort((a, b) => b.date - a.date);
  }, [prospect.createdAt, outreachList, tasks, calls, proposals, client]);

  if (loading) return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#141414]" /></div>;


  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[#141414] bg-[#E4E3E0] px-8 py-6 sticky top-0 z-10 shadow-sm flex-shrink-0">
        <div className="mx-auto max-w-6xl">
          <div className="mb-4">
            <Link to="/prospects" className="inline-flex items-center text-[10px] font-bold uppercase text-[#141414]/60 hover:text-[#141414]">
              <ArrowLeft className="mr-1 h-3 w-3" /> Back
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold uppercase tracking-tighter text-[#141414]">
                  {isNew ? 'New Prospect' : prospect.companyName}
                </h1>
                <span className={\`px-2 py-0.5 text-[10px] font-bold uppercase border \${
                  prospect.status === 'Won' ? 'bg-[#141414] text-[#E4E3E0] border-[#141414]' : 
                  'bg-transparent text-[#141414] border-[#141414]'
                }\`}>{prospect.status}</span>
                <span className={\`px-2 py-0.5 text-[10px] font-bold uppercase border \${
                  prospect.leadScore! >= 80 ? 'border-red-600 text-red-600' :
                  prospect.leadScore! >= 60 ? 'border-orange-500 text-orange-600' :
                  'border-blue-600 text-blue-600'
                }\`}>{prospect.leadScore} SCORE</span>
              </div>
              <div className="mt-1 flex items-center space-x-4 text-[10px] font-mono text-[#141414]/70 uppercase">
                <span>{prospect.industry || 'No Industry'}</span>
                {prospect.city && <span>• {prospect.city}</span>}
                {prospect.websiteUrl && (
                  <div className="flex items-center hover:text-[#141414]">
                    <LinkIcon className="mr-1.5 h-3 w-3 flex-shrink-0" />
                    <a href={prospect.websiteUrl.startsWith('http') ? prospect.websiteUrl : \`https://\${prospect.websiteUrl}\`} target="_blank" rel="noreferrer" className="hover:underline">
                      {prospect.websiteUrl.replace(/^https?:\\/\\//i, '')}
                    </a>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              {!isNew && (
                <button onClick={handleDelete} className="border border-red-900/30 px-4 py-2 text-[10px] font-bold uppercase text-red-700 hover:bg-red-50">Delete</button>
              )}
              <button onClick={handleSave} disabled={saving} className="border border-[#141414] bg-[#141414] px-6 py-2 text-[10px] font-bold uppercase text-[#E4E3E0] hover:bg-transparent hover:text-[#141414] disabled:opacity-50">
                {saving ? 'SAVING...' : 'SAVE PROSPECT'}
              </button>
            </div>
          </div>
          
          {/* TABS */}
          <div className="mt-6 flex space-x-1 border-b border-[#141414]/20 overflow-x-auto">
            {[
              { id: 'OVERVIEW', label: 'Overview', icon: Briefcase },
              { id: 'AUDIT', label: 'Website Audit', icon: FileText },
              { id: 'ACTIVITY', label: 'Activity & Comm', icon: Activity },
              { id: 'DEALS', label: 'Proposals & Deal', icon: CheckCircle }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={\`flex items-center space-x-2 px-4 py-2 text-[10px] font-bold uppercase border-b-2 transition-colors whitespace-nowrap \${
                  activeTab === tab.id ? 'border-[#141414] text-[#141414]' : 'border-transparent text-[#141414]/50 hover:text-[#141414]/80'
                }\`}
              >
                <tab.icon className="w-3 h-3" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 bg-[#E4E3E0]">
        <div className="mx-auto max-w-6xl space-y-8 pb-20">
          
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-8">
              {/* CORE & PIPELINE */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="border border-[#141414] bg-transparent">
                  <div className="border-b border-[#141414] bg-[#141414]/5 px-6 py-4"><h3 className="text-[10px] font-bold uppercase text-[#141414]">Core Details</h3></div>
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <InputWrapper label="Company Name *" error={errors.companyName}>
                        <input type="text" name="companyName" value={prospect.companyName || ''} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none" />
                      </InputWrapper>
                      <InputWrapper label="Website URL">
                        <input type="text" name="websiteUrl" value={prospect.websiteUrl || ''} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none" />
                      </InputWrapper>
                      <InputWrapper label="Industry">
                        <input type="text" name="industry" value={prospect.industry || ''} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none" />
                      </InputWrapper>
                      <InputWrapper label="Sub-Industry">
                        <input type="text" name="subIndustry" value={prospect.subIndustry || ''} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none" />
                      </InputWrapper>
                    </div>
                    <InputWrapper label="Business Description">
                      <textarea name="businessDescription" value={prospect.businessDescription || ''} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none min-h-[60px]" />
                    </InputWrapper>
                    <InputWrapper label="Target Customer">
                      <textarea name="targetCustomer" value={prospect.targetCustomer || ''} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none min-h-[60px]" />
                    </InputWrapper>
                  </div>
                </div>

                <div className="border border-[#141414] bg-transparent">
                  <div className="border-b border-[#141414] bg-[#141414]/5 px-6 py-4"><h3 className="text-[10px] font-bold uppercase text-[#141414]">Pipeline & Strategy</h3></div>
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <InputWrapper label="Pipeline Status">
                        <select name="status" value={prospect.status || 'New'} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-bold uppercase focus:outline-none">
                          <option value="New">New</option><option value="Researching">Researching</option><option value="Ready to Contact">Ready to Contact</option>
                          <option value="Contacted">Contacted</option><option value="Replied">Replied</option><option value="Interested">Interested</option>
                          <option value="Call Scheduled">Call Scheduled</option><option value="Call Completed">Call Completed</option><option value="Proposal Sent">Proposal Sent</option>
                          <option value="Negotiation">Negotiation</option><option value="Won">Won</option><option value="Lost">Lost</option>
                          <option value="Not Interested">Not Interested</option><option value="Do Not Contact">Do Not Contact</option><option value="Follow Up Later">Follow Up Later</option>
                        </select>
                      </InputWrapper>
                      <InputWrapper label="Priority">
                        <select name="priority" value={prospect.priority || 'Medium'} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-bold uppercase focus:outline-none">
                          <option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option>
                        </select>
                      </InputWrapper>
                      <InputWrapper label="Est. Value ($)">
                        <input type="number" name="estimatedProjectValue" value={prospect.estimatedProjectValue || ''} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none" />
                      </InputWrapper>
                      <div className="flex space-x-2">
                        <InputWrapper label="Auto Score">
                          <div className="w-full border border-[#141414]/30 bg-[#141414]/5 px-3 py-2 text-[10px] font-mono">{prospect.automaticScore || 0}</div>
                        </InputWrapper>
                        <InputWrapper label="Manual Score (Override)">
                          <input type="number" name="manualScore" value={prospect.manualScore === undefined ? '' : prospect.manualScore} onChange={handleChange} placeholder="-" className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none" />
                        </InputWrapper>
                      </div>
                    </div>
                    <InputWrapper label="Why are they a good prospect?">
                      <textarea name="whyGoodProspect" value={prospect.whyGoodProspect || ''} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none min-h-[60px]" />
                    </InputWrapper>
                    <InputWrapper label="Potential Opportunity / Pitch">
                      <textarea name="potentialOpportunity" value={prospect.potentialOpportunity || ''} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none min-h-[60px]" />
                    </InputWrapper>
                  </div>
                </div>
              </div>

              {/* CONTACT & LOCATION */}
              <div className="border border-[#141414] bg-transparent">
                <div className="border-b border-[#141414] bg-[#141414]/5 px-6 py-4"><h3 className="text-[10px] font-bold uppercase text-[#141414]">Contact & Location</h3></div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  <InputWrapper label="Contact Name"><input type="text" name="contactName" value={prospect.contactName || ''} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none" /></InputWrapper>
                  <InputWrapper label="Contact Role"><input type="text" name="contactRole" value={prospect.contactRole || ''} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none" /></InputWrapper>
                  <InputWrapper label="Email"><input type="email" name="email" value={prospect.email || ''} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none" /></InputWrapper>
                  <InputWrapper label="Phone"><input type="text" name="phone" value={prospect.phone || ''} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none" /></InputWrapper>
                  <InputWrapper label="WhatsApp"><input type="text" name="whatsapp" value={prospect.whatsapp || ''} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none" /></InputWrapper>
                  <InputWrapper label="LinkedIn URL"><input type="text" name="linkedinUrl" value={prospect.linkedinUrl || ''} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none" /></InputWrapper>
                  <InputWrapper label="City"><input type="text" name="city" value={prospect.city || ''} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none" /></InputWrapper>
                  <InputWrapper label="Google Maps URL"><input type="text" name="googleMapsUrl" value={prospect.googleMapsUrl || ''} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none" /></InputWrapper>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'AUDIT' && audit && (
            <div className="space-y-8">
              <div className="border border-[#141414] bg-transparent p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
                  {/* Boolean toggles */}
                  <label className="flex items-center space-x-2 text-[10px] font-bold uppercase"><input type="checkbox" name="hasWebsite" checked={!!prospect.hasWebsite} onChange={handleChange} className="border-[#141414] bg-transparent" /><span>Has Website</span></label>
                  <label className="flex items-center space-x-2 text-[10px] font-bold uppercase"><input type="checkbox" name="isMobileFriendly" checked={!!prospect.isMobileFriendly} onChange={handleChange} className="border-[#141414] bg-transparent" /><span>Mobile Friendly</span></label>
                  <label className="flex items-center space-x-2 text-[10px] font-bold uppercase"><input type="checkbox" name="hasClearCta" checked={!!prospect.hasClearCta} onChange={handleChange} className="border-[#141414] bg-transparent" /><span>Clear CTA</span></label>
                  <label className="flex items-center space-x-2 text-[10px] font-bold uppercase"><input type="checkbox" name="hasEnquiryForm" checked={!!prospect.hasEnquiryForm} onChange={handleChange} className="border-[#141414] bg-transparent" /><span>Has Form</span></label>
                  <label className="flex items-center space-x-2 text-[10px] font-bold uppercase"><input type="checkbox" name="hasGoogleBusiness" checked={!!prospect.hasGoogleBusiness} onChange={handleChange} className="border-[#141414] bg-transparent" /><span>Google Business</span></label>
                  <label className="flex items-center space-x-2 text-[10px] font-bold uppercase"><input type="checkbox" name="auditCompleted" checked={!!audit.auditCompleted} onChange={(e) => setAudit({...audit, auditCompleted: e.target.checked})} className="border-[#141414] bg-transparent" /><span>Audit Completed</span></label>
                </div>
                
                <h4 className="text-[10px] font-bold uppercase text-[#141414] mb-4 border-b border-[#141414]/20 pb-2">Grading Matrix</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                  {[
                    { name: 'designQuality', label: 'Design Quality' },
                    { name: 'mobileResponsiveness', label: 'Mobile Responsive' },
                    { name: 'loadingSpeed', label: 'Loading Speed' },
                    { name: 'navigation', label: 'Navigation & UX' },
                    { name: 'ctaQuality', label: 'CTA Clarity' },
                    { name: 'seoBasics', label: 'SEO Basics' },
                    { name: 'contentQuality', label: 'Content Quality' },
                    { name: 'trustSignals', label: 'Trust Signals (Reviews, etc)' },
                    { name: 'productPresentation', label: 'Service/Product Pres.' },
                    { name: 'contactExperience', label: 'Contact Experience' }
                  ].map(field => (
                    <div key={field.name}>
                      <InputWrapper label={field.label}>
                        <select name={field.name} value={(audit as any)[field.name] || 'Average'} onChange={handleAuditChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none">
                          <option value="Good">Good</option>
                          <option value="Average">Average</option>
                          <option value="Poor">Poor</option>
                        </select>
                      </InputWrapper>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                   <InputWrapper label="Top Problems (Comma separated)">
                    <textarea name="topProblems" value={audit.topProblems?.join(', ') || ''} onChange={(e) => setAudit({...audit, topProblems: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none min-h-[80px]" />
                  </InputWrapper>
                  <InputWrapper label="Recommended Improvements (Comma separated)">
                    <textarea name="recommendedImprovements" value={audit.recommendedImprovements?.join(', ') || ''} onChange={(e) => setAudit({...audit, recommendedImprovements: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none min-h-[80px]" />
                  </InputWrapper>
                  <div className="lg:col-span-2">
                    <InputWrapper label="General Audit Notes">
                      <textarea name="notes" value={audit.notes || ''} onChange={handleAuditChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none min-h-[80px]" />
                    </InputWrapper>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ACTIVITY' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* TIMELINE */}
              <div className="lg:col-span-2 border border-[#141414] bg-transparent flex flex-col h-[600px]">
                <div className="border-b border-[#141414] bg-[#141414]/5 px-6 py-4 flex items-center justify-between">
                  <h3 className="text-[10px] font-bold uppercase text-[#141414]">Activity Timeline</h3>
                </div>
                <div className="flex-1 p-6 overflow-y-auto relative">
                  {timelineEvents.length === 0 ? (
                    <div className="text-center text-[9px] font-mono uppercase text-[#141414]/50 py-8">No activity recorded.</div>
                  ) : (
                    <div className="absolute left-6 ml-2.5 top-6 bottom-6 w-px bg-[#141414]/20"></div>
                  )}
                  <div className="space-y-6 relative z-10">
                    {timelineEvents.map((evt, idx) => (
                      <div key={idx} className="flex relative pl-10">
                        <div className={\`absolute left-0 w-5 h-5 rounded-full border border-[#141414] flex items-center justify-center bg-[#E4E3E0] \${
                          evt.type === 'CREATED' ? 'bg-[#141414] text-white' :
                          evt.type === 'OUTREACH' ? 'text-blue-600' :
                          evt.type === 'CALL' ? 'text-purple-600' :
                          evt.type === 'PROPOSAL' ? 'text-orange-600' :
                          evt.type === 'CLIENT' ? 'text-green-600' : 'text-[#141414]'
                        }\`}>
                          {evt.type === 'CREATED' ? <Briefcase className="w-2.5 h-2.5" /> :
                           evt.type === 'OUTREACH' ? <MessageSquare className="w-2.5 h-2.5" /> :
                           evt.type === 'CALL' ? <Phone className="w-2.5 h-2.5" /> :
                           evt.type === 'PROPOSAL' ? <FileText className="w-2.5 h-2.5" /> :
                           evt.type === 'CLIENT' ? <CheckCircle className="w-2.5 h-2.5" /> : <Activity className="w-2.5 h-2.5" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-baseline mb-0.5">
                            <span className="text-[10px] font-bold uppercase text-[#141414]">{evt.title}</span>
                            <span className="text-[8px] font-mono text-[#141414]/50">{format(evt.date, 'MMM d, yyyy h:mm a')}</span>
                          </div>
                          {evt.desc && <div className="text-[10px] font-mono text-[#141414]/70 mt-1 bg-white/40 p-2 border border-[#141414]/10">{evt.desc}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* TASKS & QUICK ACTIONS */}
              <div className="space-y-6">
                <div className="border border-[#141414] bg-transparent p-6">
                  <h3 className="text-[10px] font-bold uppercase text-[#141414] mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 gap-2">
                    <button className="border border-[#141414] py-2 text-[9px] font-bold uppercase hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors flex justify-center items-center"><MessageSquare className="w-3 h-3 mr-2"/> Log Outreach</button>
                    <button className="border border-[#141414] py-2 text-[9px] font-bold uppercase hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors flex justify-center items-center"><Phone className="w-3 h-3 mr-2"/> Log Call</button>
                    <button className="border border-[#141414] py-2 text-[9px] font-bold uppercase hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors flex justify-center items-center"><CalendarIcon className="w-3 h-3 mr-2"/> Schedule Task</button>
                  </div>
                </div>

                <div className="border border-[#141414] bg-transparent flex flex-col max-h-[400px]">
                  <div className="border-b border-[#141414] bg-[#141414]/5 px-4 py-3">
                    <h3 className="text-[10px] font-bold uppercase text-[#141414]">Active Tasks</h3>
                  </div>
                  <div className="flex-1 p-4 overflow-y-auto">
                    {tasks.filter(t => t.status !== 'Done' && t.status !== 'Skipped').length === 0 ? (
                      <div className="text-center text-[9px] font-mono uppercase text-[#141414]/50 py-4">No active tasks.</div>
                    ) : (
                      <div className="space-y-3">
                        {tasks.filter(t => t.status !== 'Done' && t.status !== 'Skipped').map(t => (
                          <div key={t.id} className="border border-[#141414]/30 p-2 bg-white/30 text-[9px] font-mono">
                            <div className="font-bold uppercase mb-1">{t.title}</div>
                            <div className="text-[#141414]/60">Due: {format(t.dueDate, 'MMM d')}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'DEALS' && (
            <div className="space-y-8">
              {/* Proposals list would go here */}
              <div className="border border-[#141414] bg-transparent">
                <div className="border-b border-[#141414] bg-[#141414]/5 px-6 py-4 flex justify-between items-center">
                  <h3 className="text-[10px] font-bold uppercase text-[#141414]">Proposals</h3>
                  <button className="flex items-center text-[9px] font-bold uppercase hover:underline"><Plus className="w-3 h-3 mr-1" /> New Proposal</button>
                </div>
                <div className="p-6">
                  {proposals.length === 0 ? (
                    <div className="text-center text-[9px] font-mono uppercase text-[#141414]/50 py-8">No proposals generated yet.</div>
                  ) : (
                    <div className="space-y-4">
                      {proposals.map(p => (
                        <div key={p.id} className="border border-[#141414] p-4 flex justify-between items-center bg-white/30">
                          <div>
                            <div className="text-[12px] font-bold uppercase mb-1">$\\{p.amount}</div>
                            <div className="text-[9px] font-mono text-[#141414]/60">{format(p.proposalDate, 'MMM d, yyyy')} • {p.scope}</div>
                          </div>
                          <span className="px-2 py-1 text-[9px] font-bold uppercase border border-[#141414]">{p.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Client section if won */}
              <div className="border border-[#141414] bg-transparent">
                <div className="border-b border-[#141414] bg-[#141414]/5 px-6 py-4 flex justify-between items-center">
                  <h3 className="text-[10px] font-bold uppercase text-[#141414]">Client Details</h3>
                </div>
                <div className="p-6">
                  {!client ? (
                    <div className="text-center py-8">
                      <p className="text-[9px] font-mono uppercase text-[#141414]/50 mb-4">Prospect has not been converted to a client yet.</p>
                      <button className="border border-[#141414] bg-[#141414] px-6 py-2 text-[10px] font-bold uppercase text-[#E4E3E0] hover:bg-transparent hover:text-[#141414] transition-colors">
                        Convert to Client
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                      <InputWrapper label="Project Name"><div className="px-3 py-2 border border-[#141414]/30 bg-white/50 text-[10px] font-mono">{client.projectName}</div></InputWrapper>
                      <InputWrapper label="Project Value"><div className="px-3 py-2 border border-[#141414]/30 bg-white/50 text-[10px] font-mono">$\\{client.projectValue}</div></InputWrapper>
                      <InputWrapper label="Amount Paid"><div className="px-3 py-2 border border-[#141414]/30 bg-white/50 text-[10px] font-mono">$\\{client.amountPaid}</div></InputWrapper>
                      <InputWrapper label="Status"><div className="px-3 py-2 border border-[#141414]/30 bg-white/50 text-[10px] font-bold uppercase">{client.projectStatus}</div></InputWrapper>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync('src/pages/ProspectDetail.tsx', content);
