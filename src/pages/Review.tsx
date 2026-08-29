export function Review() {
  return (
    <div className="p-8 flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tighter text-[#141414]">Weekly Review</h1>
          <p className="mt-1 text-[10px] uppercase font-bold opacity-50 tracking-widest text-[#141414]">Routine system maintenance and reflection.</p>
        </div>
      </div>
      <div className="border border-[#141414] bg-transparent flex-1 p-6 flex flex-col gap-4">
        <div className="p-4 border border-[#141414] flex items-center justify-between">
           <span className="font-mono text-[10px] uppercase">1. Update all stale prospect statuses</span>
           <div className="w-4 h-4 border border-[#141414]"></div>
        </div>
        <div className="p-4 border border-[#141414] flex items-center justify-between">
           <span className="font-mono text-[10px] uppercase">2. Schedule follow-ups for next week</span>
           <div className="w-4 h-4 border border-[#141414]"></div>
        </div>
        <div className="p-4 border border-[#141414] flex items-center justify-between">
           <span className="font-mono text-[10px] uppercase">3. Review lost deals for lessons</span>
           <div className="w-4 h-4 border border-[#141414]"></div>
        </div>
        <div className="p-4 border border-[#141414] flex items-center justify-between">
           <span className="font-mono text-[10px] uppercase">4. Invoice active clients</span>
           <div className="w-4 h-4 border border-[#141414]"></div>
        </div>
      </div>
    </div>
  );
}
