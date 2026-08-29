const fs = require('fs');

let dashboard = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');
dashboard = dashboard.replace(
  "import { getDashboardStats, seedSampleData, getEntities } from '../lib/api';",
  "import { getDashboardStats, seedSampleData, getEntities } from '../lib/api';\nimport { Prospect } from '../types';"
);
fs.writeFileSync('src/pages/Dashboard.tsx', dashboard);
