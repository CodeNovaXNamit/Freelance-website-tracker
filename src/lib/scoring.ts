import { Prospect, WebsiteAudit } from '../types';

export function calculateLeadScore(prospect: Prospect, audit?: WebsiteAudit): number {
  let score = 0;

  if (prospect.hasWebsite === false) {
    score += 20;
  } else if (audit) {
    if (audit.designQuality === 'Poor' || audit.mobileResponsiveness === 'Poor') score += 15;
    if (audit.navigation === 'Poor') score += 5;
    if (prospect.hasClearCta === false) score += 10;
    if (audit.productPresentation === 'Poor') score += 10;
    if (audit.contactExperience === 'Poor') score += 5;
    if (audit.trustSignals === 'Poor') score += 5;
    if (audit.seoBasics === 'Poor') score += 5;
  }

  const b2bIndustries = ['B2B', 'Manufacturing', 'Tech', 'Software', 'Consulting', 'Real Estate'];
  if (prospect.industry && b2bIndustries.includes(prospect.industry)) {
    score += 10;
  }
  
  if (prospect.companySize && prospect.companySize !== '1-10') {
    score += 10;
  }

  if (prospect.contactName && prospect.contactRole && ['owner', 'ceo', 'founder', 'director', 'manager'].some(r => prospect.contactRole?.toLowerCase().includes(r))) {
    score += 5;
  }

  return Math.min(100, Math.max(0, score));
}
