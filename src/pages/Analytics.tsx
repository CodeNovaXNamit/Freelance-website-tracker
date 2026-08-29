export function Analytics() {
  return (
    <div className="p-8 flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tighter text-[#141414]">Analytics Engine</h1>
          <p className="mt-1 text-[10px] uppercase font-bold opacity-50 tracking-widest text-[#141414]">System performance and conversion metrics.</p>
        </div>
      </div>
      <div className="border border-[#141414] bg-[#141414]/5 text-center py-12 flex-1 flex flex-col items-center justify-center">
        <h3 className="text-[10px] font-bold uppercase text-[#141414]">Data Warehouse Syncing</h3>
        <p className="mt-1 text-[10px] font-mono uppercase text-[#141414]/60">Insufficient volume to generate predictive analytics.</p>
      </div>
    </div>
  );
}
