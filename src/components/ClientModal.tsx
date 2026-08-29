import React, { useState } from 'react';
import { Client } from '../types';
import { X } from 'lucide-react';

interface ClientModalProps {
  prospectId: string;
  onClose: () => void;
  onSave: (client: Partial<Client>) => Promise<void>;
}

export function ClientModal({ prospectId, onClose, onSave }: ClientModalProps) {
  const [client, setClient] = useState<Partial<Client>>({
    prospectId,
    projectName: '',
    projectValue: 0,
    amountPaid: 0,
    projectStatus: 'Onboarding',
    startDate: Date.now(),
    projectUrl: ''
  });
  
  const [saving, setSaving] = useState(false);
  
  const startDateObj = new Date(client.startDate || Date.now());
  const startDateString = `${startDateObj.getFullYear()}-${String(startDateObj.getMonth() + 1).padStart(2, '0')}-${String(startDateObj.getDate()).padStart(2, '0')}`;
  
  let launchDateString = '';
  if (client.launchDate) {
    const d = new Date(client.launchDate);
    launchDateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'startDate' || name === 'launchDate') {
      setClient({ ...client, [name]: value ? new Date(value).getTime() : undefined });
    } else if (name === 'projectValue' || name === 'amountPaid') {
      setClient({ ...client, [name]: Number(value) });
    } else {
      setClient({ ...client, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(client);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to save client details');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#141414]/80 z-50 flex items-center justify-center p-4">
      <div className="bg-[#E4E3E0] border border-[#141414] w-full max-w-lg shadow-2xl">
        <div className="border-b border-[#141414] px-6 py-4 flex justify-between items-center bg-[#141414]/5">
          <h2 className="text-[12px] font-bold uppercase text-[#141414]">Convert to Client</h2>
          <button onClick={onClose} className="text-[#141414]/60 hover:text-[#141414]">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div>
            <label className="block text-[9px] font-bold uppercase text-[#141414] mb-1">Project Name</label>
            <input type="text" name="projectName" value={client.projectName || ''} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-bold uppercase text-[#141414] mb-1">Total Value ($)</label>
              <input 
                type="number" 
                name="projectValue" 
                value={client.projectValue} 
                onChange={handleChange} 
                className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none" 
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase text-[#141414] mb-1">Amount Paid ($)</label>
              <input 
                type="number" 
                name="amountPaid" 
                value={client.amountPaid} 
                onChange={handleChange} 
                className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none" 
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase text-[#141414] mb-1">Project Status</label>
              <select name="projectStatus" value={client.projectStatus} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-bold uppercase focus:outline-none">
                <option value="Onboarding">Onboarding</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Paused">Paused</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase text-[#141414] mb-1">Start Date</label>
              <input 
                type="date" 
                name="startDate" 
                value={startDateString} 
                onChange={handleChange} 
                className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none" 
                required 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-bold uppercase text-[#141414] mb-1">Staging / Live URL</label>
              <input type="text" name="projectUrl" value={(client as any).projectUrl || ''} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none" />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase text-[#141414] mb-1">Launch Date (Optional)</label>
              <input 
                type="date" 
                name="launchDate" 
                value={launchDateString} 
                onChange={handleChange} 
                className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none" 
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-6 py-2 text-[10px] font-bold uppercase text-[#141414] hover:bg-[#141414]/10 transition-colors border border-transparent">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="border border-[#141414] bg-[#141414] px-6 py-2 text-[10px] font-bold uppercase text-[#E4E3E0] hover:bg-transparent hover:text-[#141414] transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : 'Confirm Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
