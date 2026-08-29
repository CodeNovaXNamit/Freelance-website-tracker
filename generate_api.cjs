const fs = require('fs');

const content = `import { collection, doc, getDoc, getDocs, setDoc, query, where, orderBy, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Prospect, Outreach, Call, Proposal, Client, Task, WebsiteAudit, UserSettings, WeeklyReview, BaseEntity } from '../types';
import { v4 as uuidv4 } from 'uuid';

// GENERIC CRUD HELPERS
const getCollectionPath = (userId: string, entityType: string) => \`users/\${userId}/\${entityType}\`;

async function getEntities<T extends BaseEntity>(userId: string, entityType: string): Promise<T[]> {
  const q = query(collection(db, getCollectionPath(userId, entityType)), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as T);
}

async function getEntityById<T extends BaseEntity>(userId: string, entityType: string, id: string): Promise<T | null> {
  const docRef = doc(db, getCollectionPath(userId, entityType), id);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) return snapshot.data() as T;
  return null;
}

async function getEntitiesByProspectId<T extends BaseEntity>(userId: string, entityType: string, prospectId: string): Promise<T[]> {
  const q = query(collection(db, getCollectionPath(userId, entityType)), where('prospectId', '==', prospectId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as T);
}

async function saveEntity<T extends BaseEntity>(userId: string, entityType: string, entity: Partial<T>): Promise<T> {
  const isNew = !entity.id;
  const id = entity.id || uuidv4();
  const now = Date.now();
  
  const fullEntity = {
    ...entity,
    id,
    userId,
    createdAt: isNew ? now : (entity.createdAt || now),
    updatedAt: now,
  } as T;
  
  await setDoc(doc(db, getCollectionPath(userId, entityType), id), fullEntity);
  return fullEntity;
}

async function deleteEntity(userId: string, entityType: string, id: string): Promise<void> {
  await deleteDoc(doc(db, getCollectionPath(userId, entityType), id));
}

// PROSPECTS
export const getProspects = (userId: string) => getEntities<Prospect>(userId, 'prospects');
export const getProspect = (userId: string, id: string) => getEntityById<Prospect>(userId, 'prospects', id);
export const saveProspect = (userId: string, prospect: Partial<Prospect>) => saveEntity<Prospect>(userId, 'prospects', prospect);
export const deleteProspect = (userId: string, id: string) => deleteEntity(userId, 'prospects', id);

// OUTREACH
export const getOutreachList = (userId: string, prospectId?: string) => 
  prospectId ? getEntitiesByProspectId<Outreach>(userId, 'outreach', prospectId) : getEntities<Outreach>(userId, 'outreach');
export const saveOutreach = (userId: string, outreach: Partial<Outreach>) => saveEntity<Outreach>(userId, 'outreach', outreach);
export const deleteOutreach = (userId: string, id: string) => deleteEntity(userId, 'outreach', id);

// TASKS
export const getTasks = (userId: string, prospectId?: string) => 
  prospectId ? getEntitiesByProspectId<Task>(userId, 'tasks', prospectId) : getEntities<Task>(userId, 'tasks');
export const saveTask = (userId: string, task: Partial<Task>) => saveEntity<Task>(userId, 'tasks', task);
export const deleteTask = (userId: string, id: string) => deleteEntity(userId, 'tasks', id);

// CALLS
export const getCalls = (userId: string, prospectId?: string) => 
  prospectId ? getEntitiesByProspectId<Call>(userId, 'calls', prospectId) : getEntities<Call>(userId, 'calls');
export const saveCall = (userId: string, call: Partial<Call>) => saveEntity<Call>(userId, 'calls', call);
export const deleteCall = (userId: string, id: string) => deleteEntity(userId, 'calls', id);

// PROPOSALS
export const getProposals = (userId: string, prospectId?: string) => 
  prospectId ? getEntitiesByProspectId<Proposal>(userId, 'proposals', prospectId) : getEntities<Proposal>(userId, 'proposals');
export const saveProposal = (userId: string, proposal: Partial<Proposal>) => saveEntity<Proposal>(userId, 'proposals', proposal);
export const deleteProposal = (userId: string, id: string) => deleteEntity(userId, 'proposals', id);

// CLIENTS
export const getClients = (userId: string) => getEntities<Client>(userId, 'clients');
export const getClient = (userId: string, id: string) => getEntityById<Client>(userId, 'clients', id);
export const getClientByProspectId = async (userId: string, prospectId: string): Promise<Client | null> => {
  const clients = await getEntitiesByProspectId<Client>(userId, 'clients', prospectId);
  return clients.length > 0 ? clients[0] : null;
};
export const saveClient = (userId: string, client: Partial<Client>) => saveEntity<Client>(userId, 'clients', client);
export const deleteClient = (userId: string, id: string) => deleteEntity(userId, 'clients', id);

// WEBSITE AUDITS
export const getWebsiteAudits = (userId: string, prospectId?: string) => 
  prospectId ? getEntitiesByProspectId<WebsiteAudit>(userId, 'audits', prospectId) : getEntities<WebsiteAudit>(userId, 'audits');
export const getWebsiteAuditByProspectId = async (userId: string, prospectId: string): Promise<WebsiteAudit | null> => {
  const audits = await getEntitiesByProspectId<WebsiteAudit>(userId, 'audits', prospectId);
  return audits.length > 0 ? audits[0] : null;
};
export const saveWebsiteAudit = (userId: string, audit: Partial<WebsiteAudit>) => saveEntity<WebsiteAudit>(userId, 'audits', audit);
export const deleteWebsiteAudit = (userId: string, id: string) => deleteEntity(userId, 'audits', id);

// USER SETTINGS
export const getUserSettings = async (userId: string): Promise<UserSettings | null> => {
  const snapshot = await getDoc(doc(db, \`users/\${userId}/settings/profile\`));
  if (snapshot.exists()) return snapshot.data() as UserSettings;
  return null;
};
export const saveUserSettings = async (userId: string, settings: Partial<UserSettings>): Promise<UserSettings> => {
  const fullSettings = {
    ...settings,
    id: 'profile',
    userId,
    createdAt: settings.createdAt || Date.now(),
    updatedAt: Date.now(),
  } as UserSettings;
  await setDoc(doc(db, \`users/\${userId}/settings/profile\`), fullSettings);
  return fullSettings;
};

// WEEKLY REVIEWS
export const getWeeklyReviews = (userId: string) => getEntities<WeeklyReview>(userId, 'weekly_reviews');
export const saveWeeklyReview = (userId: string, review: Partial<WeeklyReview>) => saveEntity<WeeklyReview>(userId, 'weekly_reviews', review);
export const deleteWeeklyReview = (userId: string, id: string) => deleteEntity(userId, 'weekly_reviews', id);

// BATCH OPERATIONS FOR EXPORT/IMPORT
export const exportUserData = async (userId: string) => {
  const [prospects, outreach, tasks, calls, proposals, clients, audits, weeklyReviews, settings] = await Promise.all([
    getProspects(userId),
    getOutreachList(userId),
    getTasks(userId),
    getCalls(userId),
    getProposals(userId),
    getClients(userId),
    getWebsiteAudits(userId),
    getWeeklyReviews(userId),
    getUserSettings(userId),
  ]);
  
  return {
    prospects,
    outreach,
    tasks,
    calls,
    proposals,
    clients,
    audits,
    weeklyReviews,
    settings
  };
};
`;

fs.writeFileSync('src/lib/api.ts', content);
