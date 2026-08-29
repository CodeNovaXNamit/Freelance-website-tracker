import React, { useState } from 'react';
import { Outreach } from '../types';
import { X } from 'lucide-react';

interface OutreachModalProps {
  prospectId: string;
  onClose: () => void;
  onSave: (outreach: Partial<Outreach>) => Promise<void>;
}

export function OutreachModal({ prospectId, onClose, onSave }: OutreachModalProps) {
  const [outreach, setOutreach] = useState<Partial<Outreach>>({
    prospectId,
    contactDate: Date.now(),
    method: 'Email',
    responseReceived: false,
    messageUsed: '',
    personalizationUsed: '',
    notes: ''
  });
  
  const [saving, setSaving] = useState(false);
  
  const dateObj = new Date(outreach.contactDate || Date.now());
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const dateString = `${year}-${month}-${day}T${hours}:${minutes}`;
  
  const responseDateString = outreach.responseDate ? 
    new Date(outreach.responseDate).toISOString().slice(0, 16) : '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'contactDate' || name === 'responseDate') {
      setOutreach({ ...outreach, [name]: value ? new Date(value).getTime() : undefined });
    } else if (type === 'checkbox') {
      setOutreach({ ...outreach, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setOutreach({ ...outreach, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(outreach);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to save outreach');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#141414]/80 z-50 flex items-center justify-center p-4">
      <div className="bg-[#E4E3E0] border border-[#141414] w-full max-w-lg shadow-2xl">
        <div className="border-b border-[#141414] px-6 py-4 flex justify-between items-center bg-[#141414]/5">
          <h2 className="text-[12px] font-bold uppercase text-[#141414]">Log Outreach Attempt</h2>
          <button onClick={onClose} className="text-[#141414]/60 hover:text-[#141414]">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-bold uppercase text-[#141414] mb-1">Contact Date</label>
              <input 
                type="datetime-local" 
                name="contactDate" 
                value={dateString} 
                onChange={handleChange} 
                className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none" 
                required 
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase text-[#141414] mb-1">Method</label>
              <select name="method" value={outreach.method} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-bold uppercase focus:outline-none">
                <option value="Email">Email</option>
                <option value="Cold Call">Cold Call</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Instagram">Instagram</option>
                <option value="Google Maps">Google Maps</option>
                <option value="Referral">Referral</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center space-x-2 text-[10px] font-bold uppercase cursor-pointer">
              <input type="checkbox" name="responseReceived" checked={outreach.responseReceived || false} onChange={handleChange} className="border-[#141414] bg-transparent" />
              <span>Response Received?</span>
            </label>
          </div>

          {outreach.responseReceived && (
            <div className="grid grid-cols-2 gap-4 border border-[#141414]/20 p-4 bg-white/30">
              <div>
                <label className="block text-[9px] font-bold uppercase text-[#141414] mb-1">Response Type</label>
                <select name="responseType" value={outreach.responseType || ''} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-bold uppercase focus:outline-none">
                  <option value="">Select Response...</option>
                  <option value="Interested">Interested</option>
                  <option value="Not Interested">Not Interested</option>
                  <option value="Maybe Later">Maybe Later</option>
                  <option value="Already Have Developer">Already Have Developer</option>
                  <option value="Too Expensive">Too Expensive</option>
                  <option value="No Budget">No Budget</option>
                  <option value="Asked for Portfolio">Asked for Portfolio</option>
                  <option value="Asked for Call">Asked for Call</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-bold uppercase text-[#141414] mb-1">Response Date</label>
                <input 
                  type="datetime-local" 
                  name="responseDate" 
                  value={responseDateString} 
                  onChange={handleChange} 
                  className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none" 
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[9px] font-bold uppercase text-[#141414] mb-1">Message / Script Used</label>
            <textarea name="messageUsed" value={outreach.messageUsed || ''} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none min-h-[60px]" />
          </div>

          <div>
            <label className="block text-[9px] font-bold uppercase text-[#141414] mb-1">Personalization Snippet</label>
            <input type="text" name="personalizationUsed" value={outreach.personalizationUsed || ''} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none" placeholder="e.g. Mentioned their recent blog post" />
          </div>

          <div>
            <label className="block text-[9px] font-bold uppercase text-[#141414] mb-1">Additional Notes</label>
            <textarea name="notes" value={outreach.notes || ''} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none min-h-[60px]" />
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-6 py-2 text-[10px] font-bold uppercase text-[#141414] hover:bg-[#141414]/10 transition-colors border border-transparent">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="border border-[#141414] bg-[#141414] px-6 py-2 text-[10px] font-bold uppercase text-[#E4E3E0] hover:bg-transparent hover:text-[#141414] transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : 'Log Outreach'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
