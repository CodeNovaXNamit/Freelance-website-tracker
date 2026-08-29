const fs = require('fs');

const content = `
export interface BaseEntity {
  id: string;
  userId: string;
  createdAt: number;
  updatedAt: number;
}

export interface Prospect extends BaseEntity {
  companyName: string;
  websiteUrl: string;
  googleMapsUrl?: string;
  industry: string;
  subIndustry?: string;
  city: string;
  state?: string;
  country?: string;
  companySize?: string;
  contactName?: string;
  contactRole?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  linkedinUrl?: string;
  
  // Business info
  businessDescription?: string;
  targetCustomer?: string;
  hasWebsite: boolean;
  websiteQuality: 'Good' | 'Average' | 'Poor' | 'None';
  isMobileFriendly?: boolean;
  hasClearCta?: boolean;
  hasWhatsapp?: boolean;
  hasEnquiryForm?: boolean;
  hasGoogleBusiness?: boolean;

  // Assessment
  leadScore: number;
  priority: 'High' | 'Medium' | 'Low';
  whyGoodProspect?: string;
  mainWebsiteProblem?: string;
  otherProblems?: string;
  potentialOpportunity?: string;
  estimatedProjectValue?: number;
  status: LeadStatus;
}

export type LeadStatus = 
  | 'New' | 'Researching' | 'Ready to Contact' | 'Contacted' 
  | 'Replied' | 'Interested' | 'Call Scheduled' | 'Call Completed' 
  | 'Proposal Sent' | 'Negotiation' | 'Won' | 'Lost' 
  | 'Not Interested' | 'Do Not Contact' | 'Follow Up Later';

export interface Outreach extends BaseEntity {
  prospectId: string;
  contactDate: number;
  method: string;
  messageUsed?: string;
  personalizationUsed?: string;
  responseReceived: boolean;
  responseDate?: number;
  responseType?: string;
  notes?: string;
}

export interface Task extends BaseEntity {
  title: string;
  prospectId?: string;
  dueDate: number;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Todo' | 'In Progress' | 'Done' | 'Skipped';
  notes?: string;
  isFollowUp?: boolean;
  followUpNumber?: number;
  method?: string;
  completedAt?: number;
}

export interface Call extends BaseEntity {
  prospectId: string;
  callDate: number;
  duration?: number; // minutes
  callType: string;
  peopleInvolved?: string;
  mainRequirement?: string;
  budgetMentioned?: number;
  outcome: string;
  notes?: string;
}

export interface Proposal extends BaseEntity {
  prospectId: string;
  proposalDate: number;
  amount: number;
  scope?: string;
  status: 'Draft' | 'Sent' | 'Viewed' | 'Negotiating' | 'Accepted' | 'Rejected' | 'Expired';
}

export interface Client extends BaseEntity {
  prospectId: string;
  clientName: string;
  projectName: string;
  projectValue: number;
  amountPaid: number;
  status: 'Not Started' | 'In Progress' | 'Waiting for Client' | 'Review' | 'Completed' | 'Maintenance';
  monthlyRecurringRevenue?: number;
}

export interface WebsiteAudit extends BaseEntity {
  prospectId: string;
  designQuality: 'Good' | 'Average' | 'Poor';
  mobileResponsiveness: 'Good' | 'Average' | 'Poor';
  loadingSpeed: 'Good' | 'Average' | 'Poor';
  navigation: 'Good' | 'Average' | 'Poor';
  ctaQuality: 'Good' | 'Average' | 'Poor';
  seoBasics: 'Good' | 'Average' | 'Poor';
  contentQuality: 'Good' | 'Average' | 'Poor';
  topProblems: string[];
  recommendedImprovements: string[];
  auditCompleted: boolean;
  auditUrl?: string;
  notes?: string;
}
`;
fs.writeFileSync('src/types/index.ts', content);
