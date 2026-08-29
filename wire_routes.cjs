const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Imports
content = content.replace(
  "import { Prospects } from './pages/Prospects';",
  `import { Prospects } from './pages/Prospects';
import { Calls } from './pages/Calls';
import { Proposals } from './pages/Proposals';
import { Clients } from './pages/Clients';`
);

// Routes
content = content.replace(
  `<Route path="/settings" element={<Settings />} />`,
  `<Route path="/settings" element={<Settings />} />
          <Route path="/calls" element={<Calls />} />
          <Route path="/proposals" element={<Proposals />} />
          <Route path="/clients" element={<Clients />} />`
);

fs.writeFileSync('src/App.tsx', content);
