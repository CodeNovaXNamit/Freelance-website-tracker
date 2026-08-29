export interface Prospect {
  id: string;
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
  
  createdAt: number;
  updatedAt: number;
}

export type LeadStatus = 
  | 'New' | 'Researching' | 'Ready to Contact' | 'Contacted' 
  | 'Replied' | 'Interested' | 'Call Scheduled' | 'Call Completed' 
  | 'Proposal Sent' | 'Negotiation' | 'Won' | 'Lost' 
  | 'Not Interested' | 'Do Not Contact' | 'Follow Up Later';

export interface Outreach {
  id: string;
  prospectId: string;
  contactDate: number;
  method: string;
  messageUsed?: string;
  personalizationUsed?: string;
  responseReceived: boolean;
  responseDate?: number;
  responseType?: string;
}

export interface Task {
  id: string;
  title: string;
  prospectId?: string;
  dueDate: number;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Todo' | 'In Progress' | 'Done';
  notes?: string;
  isFollowUp?: boolean;
}

export interface Call {
  id: string;
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

export interface Proposal {
  id: string;
  prospectId: string;
  proposalDate: number;
  amount: number;
  scope?: string;
  status: 'Draft' | 'Sent' | 'Viewed' | 'Negotiating' | 'Accepted' | 'Rejected' | 'Expired';
}

export interface Client {
  id: string;
  prospectId: string;
  clientName: string;
  projectName: string;
  projectValue: number;
  amountPaid: number;
  status: 'Not Started' | 'In Progress' | 'Waiting for Client' | 'Review' | 'Completed' | 'Maintenance';
  monthlyRecurringRevenue?: number;
}

export interface WebsiteAudit {
  id: string;
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
