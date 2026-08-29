const fs = require('fs');

let prospects = fs.readFileSync('src/pages/Prospects.tsx', 'utf8');

// Undo the changes I made
prospects = prospects.replace("const [loading, setLoading] = useState(true);\n  const [search, setSearch] = useState('');", "const [loading, setLoading] = useState(true);");

prospects = prospects.replace("const filteredProspects = prospects.filter(p => {\n    if (search && !p.companyName.toLowerCase().includes(search.toLowerCase()) && !p.industry?.toLowerCase().includes(search.toLowerCase())) return false;", "const filteredProspects = prospects.filter(p => {");

prospects = prospects.replace(`<div className="flex gap-4 mb-8">
            <input 
              type="text" 
              placeholder="Search company or industry..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 border border-[#141414] bg-transparent px-4 py-2 text-[10px] font-mono focus:outline-none placeholder-[#141414]/40"
            />`, '<div className="flex gap-4 mb-8">');

fs.writeFileSync('src/pages/Prospects.tsx', prospects);
