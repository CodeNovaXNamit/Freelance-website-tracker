const fs = require('fs');

let follows = fs.readFileSync('src/pages/FollowUps.tsx', 'utf8');

follows = follows.replace(
  "import { getEntities, saveEntity } from '../lib/api';",
  "import { getEntities, saveEntity } from '../lib/api';\nimport { Prospect } from '../types';"
);

fs.writeFileSync('src/pages/FollowUps.tsx', follows);
