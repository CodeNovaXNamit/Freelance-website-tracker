import { useAuth } from '../contexts/AuthContext';
import { getProspects } from '../lib/api';

export function Settings() { 
  const { user } = useAuth();
  
  const handleExportLocal = async () => {
    if (!user) return;
    
    try {
      const data = await getProspects(user.uid);
      const fileContent = JSON.stringify(data, null, 2);
      
      const blob = new Blob([fileContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `AcquisitionOS_Backup_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
      alert("An error occurred during export.");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold uppercase tracking-tighter text-[#141414] mb-6">Settings</h1>
      
      <div className="border border-[#141414] bg-transparent mb-8">
        <div className="px-6 py-6">
          <h3 className="text-[10px] font-bold uppercase text-[#141414]">Local Database Export</h3>
          <div className="mt-2 text-[10px] font-mono text-[#141414]/70 uppercase">
            <p>Download a local JSON backup of your entire prospect database.</p>
          </div>
          <div className="mt-6">
            <button
              onClick={handleExportLocal}
              className="border border-[#141414] bg-[#141414] px-6 py-2 text-[10px] font-bold uppercase text-[#E4E3E0] hover:bg-transparent hover:text-[#141414]"
            >
              Export JSON Backup
            </button>
          </div>
        </div>
      </div>
    </div>
  ); 
}
