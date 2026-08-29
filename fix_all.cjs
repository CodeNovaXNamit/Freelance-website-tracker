const fs = require('fs');

// Fix App.tsx
let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(/import { Calls } from '\.\/pages\/Calls';\n/g, '');
app = app.replace(/import { Proposals } from '\.\/pages\/Proposals';\n/g, '');
app = app.replace(/import { Clients } from '\.\/pages\/Clients';\n/g, '');
app = app.replace(
  "import { ProspectDetail } from './pages/ProspectDetail';",
  `import { ProspectDetail } from './pages/ProspectDetail';
import { Calls } from './pages/Calls';
import { Proposals } from './pages/Proposals';
import { Clients } from './pages/Clients';`
);
fs.writeFileSync('src/App.tsx', app);

// Fix Calls.tsx
let calls = fs.readFileSync('src/pages/Calls.tsx', 'utf8');
calls = calls.replace("import { getEntities, saveEntity } from '../lib/api';", "import { getProspects, getCalls, saveCall } from '../lib/api';");
calls = calls.replace("getEntities<Prospect>(uid, 'prospects')", "getProspects(uid)");
calls = calls.replace("getEntities<Call>(uid, 'calls')", "getCalls(uid)");
calls = calls.replace("saveEntity(user!.uid, 'calls', updated)", "saveCall(user!.uid, updated)");
fs.writeFileSync('src/pages/Calls.tsx', calls);

// Fix Proposals.tsx
let props = fs.readFileSync('src/pages/Proposals.tsx', 'utf8');
props = props.replace("import { getEntities, saveEntity } from '../lib/api';", "import { getProspects, getProposals, saveProposal } from '../lib/api';");
props = props.replace("getEntities<Prospect>(uid, 'prospects')", "getProspects(uid)");
props = props.replace("getEntities<Proposal>(uid, 'proposals')", "getProposals(uid)");
props = props.replace("saveEntity(user!.uid, 'proposals', updated)", "saveProposal(user!.uid, updated)");
fs.writeFileSync('src/pages/Proposals.tsx', props);

// Fix Clients.tsx
let clients = fs.readFileSync('src/pages/Clients.tsx', 'utf8');
clients = clients.replace("import { getEntities, saveEntity } from '../lib/api';", "import { getProspects, getClients, saveClient } from '../lib/api';");
clients = clients.replace("getEntities<Prospect>(uid, 'prospects')", "getProspects(uid)");
clients = clients.replace("getEntities<Client>(uid, 'clients')", "getClients(uid)");
clients = clients.replace("saveEntity(user!.uid, 'clients', updated)", "saveClient(user!.uid, updated)");
clients = clients.replace(/c\.projectUrl/g, "c.projectUrl"); // projectUrl is not on Client type? Let me check types!
fs.writeFileSync('src/pages/Clients.tsx', clients);

