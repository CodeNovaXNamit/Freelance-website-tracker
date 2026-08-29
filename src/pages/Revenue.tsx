import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Revenue() {
  const data = [
    { name: 'JAN', value: 4000 },
    { name: 'FEB', value: 3000 },
    { name: 'MAR', value: 2000 },
    { name: 'APR', value: 2780 },
    { name: 'MAY', value: 1890 },
    { name: 'JUN', value: 2390 },
  ];

  return (
    <div className="p-8 flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tighter text-[#141414]">Revenue Analysis</h1>
          <p className="mt-1 text-[10px] uppercase font-bold opacity-50 tracking-widest text-[#141414]">Financial metrics and forecasting.</p>
        </div>
      </div>
      
      <div className="border border-[#141414] p-6 bg-transparent flex-1">
        <h3 className="text-[10px] font-bold uppercase mb-6 text-[#141414]">Revenue Trajectory (YTD)</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#141414" strokeOpacity={0.2} />
              <XAxis dataKey="name" tick={{fontSize: 10, fontFamily: 'monospace', fill: '#141414'}} axisLine={{stroke: '#141414'}} tickLine={{stroke: '#141414'}} />
              <YAxis tick={{fontSize: 10, fontFamily: 'monospace', fill: '#141414'}} axisLine={{stroke: '#141414'}} tickLine={{stroke: '#141414'}} />
              <Tooltip 
                cursor={{fill: '#141414', opacity: 0.05}} 
                contentStyle={{borderRadius: '0px', border: '1px solid #141414', boxShadow: 'none', backgroundColor: '#E4E3E0', color: '#141414', fontFamily: 'monospace', fontSize: '10px'}} 
              />
              <Bar dataKey="value" fill="#141414" radius={[0, 0, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
