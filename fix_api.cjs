const fs = require('fs');

let api = fs.readFileSync('src/lib/api.ts', 'utf8');

// Remove the appended duplicates
const appendedIndex = api.indexOf('// GENERIC HELPERS');
if (appendedIndex !== -1) {
  api = api.substring(0, appendedIndex);
}

// Export the original ones
api = api.replace(/async function getEntities/g, 'export async function getEntities');
api = api.replace(/async function saveEntity/g, 'export async function saveEntity');

fs.writeFileSync('src/lib/api.ts', api);

