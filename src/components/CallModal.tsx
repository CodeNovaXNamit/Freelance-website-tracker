import React, { useState } from 'react';
import { Call } from '../types';
import { X } from 'lucide-react';
import { format } from 'date-fns';

interface CallModalProps {
  prospectId: string;
  onClose: () => void;
  onSave: (call: Partial<Call>) => Promise<void>;
}

export function CallModal({ prospectId, onClose, onSave }: CallModalProps) {
  const [call, setCall] = useState<Partial<Call>>({
    prospectId,
    callType: 'Discovery',
    outcome: 'Interested',
    scheduledAt: Date.now(),
    duration: 30,
    mainRequirement: '',
    notes: ''
  });
  
  const [saving, setSaving] = useState(false);
  
  // Format the date for the HTML datetime-local input
  const dateObj = new Date(call.scheduledAt || Date.now());
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const dateString = `${year}-${month}-${day}T${hours}:${minutes}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'scheduledAt') {
      setCall({ ...call, scheduledAt: new Date(value).getTime() });
    } else if (name === 'duration') {
      setCall({ ...call, duration: Number(value) });
    } else {
      setCall({ ...call, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(call);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to save call');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#141414]/80 z-50 flex items-center justify-center p-4">
      <div className="bg-[#E4E3E0] border border-[#141414] w-full max-w-lg shadow-2xl">
        <div className="border-b border-[#141414] px-6 py-4 flex justify-between items-center bg-[#141414]/5">
          <h2 className="text-[12px] font-bold uppercase text-[#141414]">Log Call</h2>
          <button onClick={onClose} className="text-[#141414]/60 hover:text-[#141414]">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-bold uppercase text-[#141414] mb-1">Date & Time</label>
              <input 
                type="datetime-local" 
                name="scheduledAt" 
                value={dateString} 
                onChange={handleChange} 
                className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none" 
                required 
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase text-[#141414] mb-1">Duration (Mins)</label>
              <input 
                type="number" 
                name="duration" 
                value={call.duration} 
                onChange={handleChange} 
                className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none" 
                min="1"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase text-[#141414] mb-1">Call Type</label>
              <select name="callType" value={call.callType} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-bold uppercase focus:outline-none">
                <option value="Discovery">Discovery</option>
                <option value="Sales">Sales</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Closing">Closing</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase text-[#141414] mb-1">Outcome</label>
              <select name="outcome" value={call.outcome} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-bold uppercase focus:outline-none">
                <option value="Interested">Interested</option>
                <option value="Proposal Requested">Proposal Requested</option>
                <option value="Thinking">Thinking</option>
                <option value="Not Interested">Not Interested</option>
                <option value="No Show">No Show</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-[9px] font-bold uppercase text-[#141414] mb-1">Main Requirement</label>
            <input type="text" name="mainRequirement" value={call.mainRequirement || ''} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none" />
          </div>

          <div>
            <label className="block text-[9px] font-bold uppercase text-[#141414] mb-1">Detailed Notes</label>
            <textarea name="notes" value={call.notes || ''} onChange={handleChange} className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none min-h-[100px]" required />
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-6 py-2 text-[10px] font-bold uppercase text-[#141414] hover:bg-[#141414]/10 transition-colors border border-transparent">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="border border-[#141414] bg-[#141414] px-6 py-2 text-[10px] font-bold uppercase text-[#E4E3E0] hover:bg-transparent hover:text-[#141414] transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : 'Log Call'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
