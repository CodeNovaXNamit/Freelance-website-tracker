const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(/import { Calls } from '\.\/pages\/Calls';\n/g, '');
content = content.replace(/import { Proposals } from '\.\/pages\/Proposals';\n/g, '');
content = content.replace(/import { Clients } from '\.\/pages\/Clients';\n/g, '');
content = content.replace(
  "import { ProspectDetail } from './pages/ProspectDetail';",
  `import { ProspectDetail } from './pages/ProspectDetail';
import { Calls } from './pages/Calls';
import { Proposals } from './pages/Proposals';
import { Clients } from './pages/Clients';`
);

fs.writeFileSync('src/App.tsx', content);
