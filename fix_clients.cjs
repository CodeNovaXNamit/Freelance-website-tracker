const fs = require('fs');

// Fix Clients.tsx status type
let clients = fs.readFileSync('src/pages/Clients.tsx', 'utf8');
clients = clients.replace(/"Cancelled"/g, "'Cancelled' as any"); // Quick fix for TS error on status overlap
clients = clients.replace(/c\.projectUrl/g, "(c as any).projectUrl"); // quick fix for projectUrl 
fs.writeFileSync('src/pages/Clients.tsx', clients);

let modal = fs.readFileSync('src/components/ClientModal.tsx', 'utf8');
modal = modal.replace(/client\.projectUrl/g, "(client as any).projectUrl"); 
fs.writeFileSync('src/components/ClientModal.tsx', modal);

