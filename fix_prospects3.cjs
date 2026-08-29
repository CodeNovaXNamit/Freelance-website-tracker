const fs = require('fs');

let prospects = fs.readFileSync('src/pages/Prospects.tsx', 'utf8');

// If loading is gone, add it back
if (!prospects.includes('const [loading, setLoading]')) {
  prospects = prospects.replace('const [prospects, setProspects] = useState<Prospect[]>([]);', 'const [prospects, setProspects] = useState<Prospect[]>([]);\n  const [loading, setLoading] = useState(true);');
}

// Remove one of the duplicate search state declarations
let matchCount = 0;
prospects = prospects.replace(/const \[search, setSearch\] = useState\(''\);/g, (match) => {
  matchCount++;
  if (matchCount === 2) return '';
  return match;
});

fs.writeFileSync('src/pages/Prospects.tsx', prospects);
