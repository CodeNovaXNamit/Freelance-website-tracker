const fs = require('fs');

let content = fs.readFileSync('src/pages/ProspectDetail.tsx', 'utf8');

// Imports
content = content.replace(
  "import { calculateLeadScore } from '../lib/scoring';",
  `import { calculateLeadScore } from '../lib/scoring';
import { CallModal } from '../components/CallModal';
import { ProposalModal } from '../components/ProposalModal';
import { ClientModal } from '../components/ClientModal';
import { OutreachModal } from '../components/OutreachModal';`
);

// State hooks
content = content.replace(
  "const [errors, setErrors] = useState<Record<string, string>>({});",
  `const [errors, setErrors] = useState<Record<string, string>>({});

  const [showCallModal, setShowCallModal] = useState(false);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showOutreachModal, setShowOutreachModal] = useState(false);`
);

// Modal handlers
content = content.replace(
  "const handleDelete = async () => {",
  `const handleSaveOutreach = async (newOutreach: Partial<Outreach>) => {
    const saved = await saveOutreach(user!.uid, newOutreach);
    setOutreachList(prev => [saved, ...prev].sort((a,b) => b.contactDate - a.contactDate));
  };
  
  const handleSaveCall = async (newCall: Partial<Call>) => {
    const saved = await saveCall(user!.uid, newCall);
    setCalls(prev => [saved, ...prev].sort((a,b) => b.scheduledAt - a.scheduledAt));
  };
  
  const handleSaveProposal = async (newProposal: Partial<Proposal>) => {
    const saved = await saveProposal(user!.uid, newProposal);
    setProposals(prev => [saved, ...prev].sort((a,b) => b.proposalDate - a.proposalDate));
  };
  
  const handleSaveClient = async (newClient: Partial<Client>) => {
    const saved = await saveClient(user!.uid, newClient);
    setClient(saved);
    setProspect(prev => ({ ...prev, status: 'Won' }));
    await saveProspect(user!.uid, { ...prospect, status: 'Won' } as Prospect);
  };

  const handleDelete = async () => {`
);

// Quick actions wiring
content = content.replace(
  `<button className="border border-[#141414] py-2 text-[9px] font-bold uppercase hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors flex justify-center items-center"><MessageSquare className="w-3 h-3 mr-2"/> Log Outreach</button>`,
  `<button onClick={() => setShowOutreachModal(true)} className="border border-[#141414] py-2 text-[9px] font-bold uppercase hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors flex justify-center items-center"><MessageSquare className="w-3 h-3 mr-2"/> Log Outreach</button>`
);

content = content.replace(
  `<button className="border border-[#141414] py-2 text-[9px] font-bold uppercase hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors flex justify-center items-center"><Phone className="w-3 h-3 mr-2"/> Log Call</button>`,
  `<button onClick={() => setShowCallModal(true)} className="border border-[#141414] py-2 text-[9px] font-bold uppercase hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors flex justify-center items-center"><Phone className="w-3 h-3 mr-2"/> Log Call</button>`
);

// Proposals wiring
content = content.replace(
  `<button className="flex items-center text-[9px] font-bold uppercase hover:underline"><Plus className="w-3 h-3 mr-1" /> New Proposal</button>`,
  `<button onClick={() => setShowProposalModal(true)} className="flex items-center text-[9px] font-bold uppercase hover:underline"><Plus className="w-3 h-3 mr-1" /> New Proposal</button>`
);

// Convert to Client wiring
content = content.replace(
  `<button className="border border-[#141414] bg-[#141414] px-6 py-2 text-[10px] font-bold uppercase text-[#E4E3E0] hover:bg-transparent hover:text-[#141414] transition-colors">
                        Convert to Client
                      </button>`,
  `<button onClick={() => setShowClientModal(true)} className="border border-[#141414] bg-[#141414] px-6 py-2 text-[10px] font-bold uppercase text-[#E4E3E0] hover:bg-transparent hover:text-[#141414] transition-colors">
                        Convert to Client
                      </button>`
);

// Modals rendering
content = content.replace(
  "</div>\n      </div>\n    </div>\n  );\n}",
  `</div>
      </div>

      {/* Modals */}
      {showOutreachModal && <OutreachModal prospectId={id!} onClose={() => setShowOutreachModal(false)} onSave={handleSaveOutreach} />}
      {showCallModal && <CallModal prospectId={id!} onClose={() => setShowCallModal(false)} onSave={handleSaveCall} />}
      {showProposalModal && <ProposalModal prospectId={id!} onClose={() => setShowProposalModal(false)} onSave={handleSaveProposal} />}
      {showClientModal && <ClientModal prospectId={id!} onClose={() => setShowClientModal(false)} onSave={handleSaveClient} />}

    </div>
  );
}`
);

fs.writeFileSync('src/pages/ProspectDetail.tsx', content);
