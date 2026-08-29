import React, { useState } from 'react';
import { Proposal } from '../types';
import { X } from 'lucide-react';

interface ProposalModalProps {
  prospectId: string;
  onClose: () => void;
  onSave: (proposal: Partial<Proposal>) => Promise<void>;
}

export function ProposalModal({ prospectId, onClose, onSave }: ProposalModalProps) {
  const [proposal, setProposal] = useState<Partial<Proposal>>({
    prospectId,
    proposalDate: Date.now(),
    amount: 0,
    scope: '',
    status: 'Sent',
    expectedDecisionDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
    notes: ''
  });
  
  const [saving, setSaving] = useState(false);
  
  const dateObj = new Date(proposal.proposalDate || Date.now());
  const dateString = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
  
  const decisionDateObj = new Date(proposal.expectedDecisionDate || Date.now());
  const decisionDateString = `${decisionDateObj.getFullYear()}-${String(decisionDateObj.getMonth() + 1).padStart(2, '0')}-${String(decisionDateObj.getDate()).padStart(2, '0')}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'proposalDate' || name === 'expectedDecisionDate') {
      setProposal({ ...proposal, [name]: new Date(value).getTime() });
    } else if (name === 'amount') {
      setProposal({ ...proposal, amount: Number(value) });
    } else {
      setProposal({ ...proposal, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(proposal);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to save proposal');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#141414]/80 z-50 flex items-center justify-center p-4">
      <div className="bg-[#E4E3E0] border border-[#141414] w-full max-w-lg shadow-2xl">
        <div className="border-b border-[#141414] px-6 py-4 flex justify-between items-center bg-[#141414]/5">
          <h2 className="text-[12px] font-bold uppercase text-[#141414]">New Proposal</h2>
          <button onClick={onClose} className="text-[#141414]/60 hover:text-[#141414]">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-bold uppercase text-[#141414] mb-1">Proposal Date</label>
              <input 
                type="date" 
                name="proposalDate" 
                value={dateString} 
                onChange={handleChange} 
                className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none" 
                required 
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase text-[#141414] mb-1">Status</label>
              <select name="status" value={proposal.status} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-bold uppercase focus:outline-none">
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Viewed">Viewed</option>
                <option value="Negotiating">Negotiating</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase text-[#141414] mb-1">Amount ($)</label>
              <input 
                type="number" 
                name="amount" 
                value={proposal.amount} 
                onChange={handleChange} 
                className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none" 
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase text-[#141414] mb-1">Expected Decision</label>
              <input 
                type="date" 
                name="expectedDecisionDate" 
                value={decisionDateString} 
                onChange={handleChange} 
                className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none" 
                required 
              />
            </div>
          </div>
          
          <div>
            <label className="block text-[9px] font-bold uppercase text-[#141414] mb-1">Scope of Work</label>
            <input type="text" name="scope" value={proposal.scope || ''} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none" placeholder="e.g. 5-Page Website + Basic SEO" required />
          </div>
          
          <div>
            <label className="block text-[9px] font-bold uppercase text-[#141414] mb-1">Proposal URL (Link)</label>
            <input type="text" name="proposalUrl" value={proposal.proposalUrl || ''} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none" />
          </div>

          <div>
            <label className="block text-[9px] font-bold uppercase text-[#141414] mb-1">Internal Notes</label>
            <textarea name="notes" value={proposal.notes || ''} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none min-h-[60px]" />
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-6 py-2 text-[10px] font-bold uppercase text-[#141414] hover:bg-[#141414]/10 transition-colors border border-transparent">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="border border-[#141414] bg-[#141414] px-6 py-2 text-[10px] font-bold uppercase text-[#E4E3E0] hover:bg-transparent hover:text-[#141414] transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Proposal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
