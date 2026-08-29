const fs = require('fs');

let calls = fs.readFileSync('src/pages/Calls.tsx', 'utf8');
calls = calls.replace("import { getProspects, getCalls, saveCall } from '../lib/api';", "import { getEntities, saveEntity } from '../lib/api';");
calls = calls.replace("getProspects(uid)", "getEntities<Prospect>(uid, 'prospects')");
calls = calls.replace("getCalls(uid)", "getEntities<Call>(uid, 'calls')");
calls = calls.replace("saveCall(user!.uid, updated)", "saveEntity(user!.uid, 'calls', updated)");
fs.writeFileSync('src/pages/Calls.tsx', calls);

let props = fs.readFileSync('src/pages/Proposals.tsx', 'utf8');
props = props.replace("import { getProspects, getProposals, saveProposal } from '../lib/api';", "import { getEntities, saveEntity } from '../lib/api';");
props = props.replace("getProspects(uid)", "getEntities<Prospect>(uid, 'prospects')");
props = props.replace("getProposals(uid)", "getEntities<Proposal>(uid, 'proposals')");
props = props.replace("saveProposal(user!.uid, updated)", "saveEntity(user!.uid, 'proposals', updated)");
fs.writeFileSync('src/pages/Proposals.tsx', props);

let clients = fs.readFileSync('src/pages/Clients.tsx', 'utf8');
clients = clients.replace("import { getProspects, getClients, saveClient } from '../lib/api';", "import { getEntities, saveEntity } from '../lib/api';");
clients = clients.replace("getProspects(uid)", "getEntities<Prospect>(uid, 'prospects')");
clients = clients.replace("getClients(uid)", "getEntities<Client>(uid, 'clients')");
clients = clients.replace("saveClient(user!.uid, updated)", "saveEntity(user!.uid, 'clients', updated)");
fs.writeFileSync('src/pages/Clients.tsx', clients);

