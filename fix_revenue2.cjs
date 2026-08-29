const fs = require('fs');
let rev = fs.readFileSync('src/pages/Revenue.tsx', 'utf8');
rev = rev.replace(/\[month, data: any\]/g, '[month, data]');
rev = rev.replace(/Object\.entries\(monthlyData\)\.map/g, 'Object.entries(monthlyData as Record<string, any>).map');
fs.writeFileSync('src/pages/Revenue.tsx', rev);
