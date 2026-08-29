const fs = require('fs');

let rev = fs.readFileSync('src/pages/Revenue.tsx', 'utf8');

rev = rev.replace(
  "import { Loader2, TrendingUp, DollarSign, Calendar as CalendarIcon, ArrowUpRight } from 'lucide-react';",
  "import { Loader2, TrendingUp, DollarSign, Calendar as CalendarIcon, ArrowUpRight, Clock } from 'lucide-react';"
);

rev = rev.replace(
  "// Adding Clock import manually since it wasn't there\nimport { Clock } from 'lucide-react';\n",
  ""
);

fs.writeFileSync('src/pages/Revenue.tsx', rev);
