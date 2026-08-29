const fs = require('fs');
const content = `
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getProspect, saveProspect, deleteProspect } from '../lib/api';
import { Prospect, LeadStatus } from '../types';
import { Loader2, ArrowLeft, Save, Trash2, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';

export function ProspectDetail() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [prospect, setProspect] = useState<Partial<Prospect>>({
    companyName: '',
    industry: '',
    status: 'New' as LeadStatus,
    priority: 'Medium',
    leadScore: 0,
    hasWebsite: false,
    websiteQuality: 'None',
    city: ''
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user && !isNew && id) {
      getProspect(user.uid, id).then(data => {
        if (data) {
          setProspect(data);
        } else {
          navigate('/prospects');
        }
        setLoading(false);
      });
    }
  }, [user, id, isNew, navigate]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!prospect.companyName) newErrors.companyName = "Company name is required";
    
    if (prospect.websiteUrl && !/^https?:\\/\\//i.test(prospect.websiteUrl)) {
      if (!prospect.websiteUrl.includes('.')) {
        newErrors.websiteUrl = "Invalid website URL";
      } else {
        // Auto-fix if they just forgot http://
        setProspect(prev => ({ ...prev, websiteUrl: 'https://' + prev.websiteUrl }));
      }
    }
    
    if (prospect.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$/i.test(prospect.email)) {
      newErrors.email = "Invalid email address";
    }
    
    if (prospect.phone && !/^[\\d\\s\\-\\+\\(\\)\\.]{7,20}$/.test(prospect.phone)) {
      newErrors.phone = "Invalid phone format";
    }
    
    if (prospect.leadScore !== undefined && (prospect.leadScore < 0 || prospect.leadScore > 100)) {
      newErrors.leadScore = "Score must be 0-100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let finalValue: any = value;
    
    if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      finalValue = value === '' ? '' : Number(value);
    }
    
    setProspect(prev => ({ ...prev, [name]: finalValue }));
    if (errors[name]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleSave = async () => {
    if (!validate()) {
      alert("Please check the form for errors.");
      return;
    }
    setSaving(true);
    try {
      const saved = await saveProspect(user!.uid, prospect);
      setProspect(saved);
      if (isNew) {
        navigate(\`/prospects/\${saved.id}\`, { replace: true });
      }
    } catch (e) {
      console.error(e);
      alert("Error saving prospect");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to permanently delete this prospect?")) {
      try {
        await deleteProspect(user!.uid, id!);
        navigate('/prospects');
      } catch (e) {
        alert("Error deleting prospect");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#141414]" />
      </div>
    );
  }

  const InputWrapper = ({ label, error, children }: { label: string, error?: string, children: React.ReactNode }) => (
    <div>
      <label className="block text-[9px] font-bold uppercase text-[#141414] mb-1 flex justify-between">
        {label}
        {error && <span className="text-red-600 font-mono tracking-tighter">{error}</span>}
      </label>
      {children}
    </div>
  );

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[#141414] bg-[#E4E3E0] px-8 py-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-4">
            <Link to="/prospects" className="inline-flex items-center text-[10px] font-bold uppercase text-[#141414]/60 hover:text-[#141414]">
              <ArrowLeft className="mr-1 h-3 w-3" />
              Back to Prospects
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold uppercase tracking-tighter text-[#141414]">
                {isNew ? 'New Prospect' : prospect.companyName}
              </h1>
              <div className="mt-1 flex items-center space-x-4 text-[10px] font-mono text-[#141414]/70 uppercase">
                <span>{prospect.industry || 'No Industry'}</span>
                {prospect.websiteUrl && (
                  <div className="flex items-center hover:text-[#141414]">
                    <LinkIcon className="mr-1.5 h-3 w-3 flex-shrink-0" />
                    <a href={prospect.websiteUrl} target="_blank" rel="noreferrer" className="hover:underline">
                      {prospect.websiteUrl.replace(/^https?:\\/\\//i, '')}
                    </a>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              {!isNew && (
                <button
                  onClick={handleDelete}
                  className="border border-red-900/30 bg-transparent px-4 py-2 text-[10px] font-bold uppercase text-red-700 hover:bg-red-50"
                >
                  Delete
                </button>
              )}
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
      </div>

      <div className="flex-1 overflow-y-auto p-8 bg-[#E4E3E0]">
        <div className="mx-auto max-w-5xl space-y-8">
          
          {/* CRITICAL INFO */}
          <div className="border border-[#141414] bg-transparent">
            <div className="border-b border-[#141414] bg-[#141414]/5 px-6 py-4">
              <h3 className="text-[10px] font-bold uppercase text-[#141414]">1. Core Details</h3>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <InputWrapper label="Company Name *" error={errors.companyName}>
                  <input type="text" name="companyName" value={prospect.companyName || ''} onChange={handleChange} className={\`w-full border \${errors.companyName ? 'border-red-500' : 'border-[#141414]'} bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none\`} />
                </InputWrapper>
                <InputWrapper label="Industry">
                  <input type="text" name="industry" value={prospect.industry || ''} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none" />
                </InputWrapper>
                <InputWrapper label="Sub-Industry">
                  <input type="text" name="subIndustry" value={prospect.subIndustry || ''} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none" />
                </InputWrapper>
                <InputWrapper label="Company Size">
                  <select name="companySize" value={prospect.companySize || ''} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none">
                    <option value="">Select...</option>
                    <option value="1-10">1-10 Employees</option>
                    <option value="11-50">11-50 Employees</option>
                    <option value="51-200">51-200 Employees</option>
                    <option value="200+">200+ Employees</option>
                  </select>
                </InputWrapper>
                <div className="sm:col-span-2 lg:col-span-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
                   <InputWrapper label="Business Description">
                    <textarea name="businessDescription" value={prospect.businessDescription || ''} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none min-h-[60px]" placeholder="What do they do?" />
                  </InputWrapper>
                  <InputWrapper label="Target Customer">
                    <textarea name="targetCustomer" value={prospect.targetCustomer || ''} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none min-h-[60px]" placeholder="Who do they sell to?" />
                  </InputWrapper>
                </div>
              </div>
            </div>
          </div>

          {/* CONTACT & LOCATION */}
          <div className="border border-[#141414] bg-transparent">
            <div className="border-b border-[#141414] bg-[#141414]/5 px-6 py-4">
              <h3 className="text-[10px] font-bold uppercase text-[#141414]">2. Contact & Location</h3>
            </div>
            <div className="px-6 py-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <InputWrapper label="Contact Name">
                <input type="text" name="contactName" value={prospect.contactName || ''} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none" />
              </InputWrapper>
              <InputWrapper label="Contact Role">
                <input type="text" name="contactRole" value={prospect.contactRole || ''} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none" />
              </InputWrapper>
              <InputWrapper label="LinkedIn URL">
                <input type="text" name="linkedinUrl" value={prospect.linkedinUrl || ''} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none" />
              </InputWrapper>
              <InputWrapper label="Email" error={errors.email}>
                <input type="email" name="email" value={prospect.email || ''} onChange={handleChange} className={\`w-full border \${errors.email ? 'border-red-500' : 'border-[#141414]'} bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none\`} />
              </InputWrapper>
              <InputWrapper label="Phone" error={errors.phone}>
                <input type="text" name="phone" value={prospect.phone || ''} onChange={handleChange} className={\`w-full border \${errors.phone ? 'border-red-500' : 'border-[#141414]'} bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none\`} />
              </InputWrapper>
              <InputWrapper label="WhatsApp">
                <input type="text" name="whatsapp" value={prospect.whatsapp || ''} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none" />
              </InputWrapper>
              <InputWrapper label="City">
                <input type="text" name="city" value={prospect.city || ''} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none" />
              </InputWrapper>
              <InputWrapper label="State / Province">
                <input type="text" name="state" value={prospect.state || ''} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none" />
              </InputWrapper>
              <InputWrapper label="Country">
                <input type="text" name="country" value={prospect.country || ''} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none" />
              </InputWrapper>
              <div className="sm:col-span-3">
                 <InputWrapper label="Google Maps URL">
                  <input type="text" name="googleMapsUrl" value={prospect.googleMapsUrl || ''} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none" />
                </InputWrapper>
              </div>
            </div>
          </div>

          {/* PIPELINE STATUS */}
          <div className="border border-[#141414] bg-transparent">
            <div className="border-b border-[#141414] bg-[#141414]/5 px-6 py-4 flex items-center justify-between">
              <h3 className="text-[10px] font-bold uppercase text-[#141414]">3. Pipeline Strategy</h3>
              <div className="text-[10px] font-mono uppercase bg-[#141414] text-[#E4E3E0] px-2 py-0.5 font-bold">Sales Stage</div>
            </div>
            <div className="px-6 py-6 grid grid-cols-1 gap-6 sm:grid-cols-4">
              <InputWrapper label="Pipeline Status">
                <select name="status" value={prospect.status || 'New'} onChange={handleChange} className="w-full border border-[#141414] bg-[#E4E3E0] px-3 py-2 text-[10px] font-bold uppercase focus:outline-none">
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
                  <option value="Do Not Contact">Do Not Contact</option>
                  <option value="Follow Up Later">Follow Up Later</option>
                </select>
              </InputWrapper>
              <InputWrapper label="Priority">
                <select name="priority" value={prospect.priority || 'Medium'} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-bold uppercase focus:outline-none">
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </InputWrapper>
              <InputWrapper label="Lead Score (0-100)" error={errors.leadScore}>
                <input type="number" name="leadScore" value={prospect.leadScore || 0} onChange={handleChange} className={\`w-full border \${errors.leadScore ? 'border-red-500' : 'border-[#141414]'} bg-transparent px-3 py-2 text-[10px] font-mono font-bold focus:outline-none\`} />
              </InputWrapper>
              <InputWrapper label="Est. Value ($)">
                <input type="number" name="estimatedProjectValue" value={prospect.estimatedProjectValue || ''} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none" />
              </InputWrapper>
              <div className="sm:col-span-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <InputWrapper label="Why are they a good prospect?">
                  <textarea name="whyGoodProspect" value={prospect.whyGoodProspect || ''} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none min-h-[80px]" placeholder="What triggered this lead?" />
                </InputWrapper>
                <InputWrapper label="Potential Opportunity / Pitch">
                  <textarea name="potentialOpportunity" value={prospect.potentialOpportunity || ''} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none min-h-[80px]" placeholder="What can we sell them?" />
                </InputWrapper>
              </div>
            </div>
          </div>

          {/* WEBSITE AUDIT */}
          <div className="border border-[#141414] bg-transparent">
            <div className="border-b border-[#141414] bg-[#141414]/5 px-6 py-4">
              <h3 className="text-[10px] font-bold uppercase text-[#141414]">4. Web Presence Assessment</h3>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-6">
                 <InputWrapper label="Website URL" error={errors.websiteUrl}>
                  <input type="text" name="websiteUrl" value={prospect.websiteUrl || ''} onChange={handleChange} className={\`w-full border \${errors.websiteUrl ? 'border-red-500' : 'border-[#141414]'} bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none\`} placeholder="https://..." />
                </InputWrapper>
                <InputWrapper label="Website Quality">
                  <select name="websiteQuality" value={prospect.websiteQuality || 'None'} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none">
                    <option value="Good">Good</option>
                    <option value="Average">Average</option>
                    <option value="Poor">Poor</option>
                    <option value="None">None</option>
                  </select>
                </InputWrapper>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                <label className="flex items-center space-x-2 text-[10px] font-bold uppercase">
                  <input type="checkbox" name="hasWebsite" checked={!!prospect.hasWebsite} onChange={handleChange} className="border-[#141414] bg-transparent" />
                  <span>Has Website</span>
                </label>
                <label className="flex items-center space-x-2 text-[10px] font-bold uppercase">
                  <input type="checkbox" name="isMobileFriendly" checked={!!prospect.isMobileFriendly} onChange={handleChange} className="border-[#141414] bg-transparent" />
                  <span>Mobile Friendly</span>
                </label>
                <label className="flex items-center space-x-2 text-[10px] font-bold uppercase">
                  <input type="checkbox" name="hasClearCta" checked={!!prospect.hasClearCta} onChange={handleChange} className="border-[#141414] bg-transparent" />
                  <span>Clear CTA</span>
                </label>
                <label className="flex items-center space-x-2 text-[10px] font-bold uppercase">
                  <input type="checkbox" name="hasEnquiryForm" checked={!!prospect.hasEnquiryForm} onChange={handleChange} className="border-[#141414] bg-transparent" />
                  <span>Has Form</span>
                </label>
                <label className="flex items-center space-x-2 text-[10px] font-bold uppercase">
                  <input type="checkbox" name="hasGoogleBusiness" checked={!!prospect.hasGoogleBusiness} onChange={handleChange} className="border-[#141414] bg-transparent" />
                  <span>Google Business</span>
                </label>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                 <InputWrapper label="Main Website Problem">
                  <textarea name="mainWebsiteProblem" value={prospect.mainWebsiteProblem || ''} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none min-h-[60px]" placeholder="E.g., Outdated design, slow loading..." />
                </InputWrapper>
                <InputWrapper label="Other Technical Problems">
                  <textarea name="otherProblems" value={prospect.otherProblems || ''} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none min-h-[60px]" placeholder="E.g., No SSL, broken links..." />
                </InputWrapper>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync('src/pages/ProspectDetail.tsx', content);
