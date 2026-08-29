const fs = require('fs');

let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

content = content.replace(
  `{ icon: Phone, label: 'Calls', path: '/calls' },`,
  `{ icon: Phone, label: 'Calls', path: '/calls' },`
);

fs.writeFileSync('src/components/Sidebar.tsx', content);
