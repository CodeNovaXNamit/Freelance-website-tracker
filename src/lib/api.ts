import { collection, doc, getDocs, setDoc, query, where, orderBy, getCountFromServer, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Prospect, Outreach, Call, Proposal, Client, Task } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Abstracted helper functions
export const getProspects = async (userId: string) => {
  const q = query(collection(db, `users/${userId}/prospects`), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as Prospect);
};

export const getProspect = async (userId: string, prospectId: string) => {
  const q = query(collection(db, `users/${userId}/prospects`), where('id', '==', prospectId));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as Prospect;
};

export const saveProspect = async (userId: string, prospect: Prospect) => {
  if (!prospect.id) prospect.id = uuidv4();
  await setDoc(doc(db, `users/${userId}/prospects`, prospect.id), prospect);
  return prospect;
};

// Seed sample data
export const seedSampleData = async (userId: string) => {
  const batch = writeBatch(db);
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  const sampleProspects: Prospect[] = [
    {
      id: uuidv4(),
      companyName: "Acme Manufacturing",
      websiteUrl: "acmemanufacturing.example.com",
      industry: "Manufacturing",
      city: "Chicago",
      hasWebsite: true,
      websiteQuality: "Poor",
      leadScore: 85,
      priority: "High",
      status: "Call Scheduled",
      createdAt: now - (10 * day),
      updatedAt: now,
    },
    {
      id: uuidv4(),
      companyName: "Zenith Dental",
      websiteUrl: "zenithdental.example.com",
      industry: "Healthcare",
      city: "New York",
      hasWebsite: true,
      websiteQuality: "Average",
      leadScore: 60,
      priority: "Medium",
      status: "Contacted",
      createdAt: now - (5 * day),
      updatedAt: now,
    },
    {
      id: uuidv4(),
      companyName: "Bayside Cafe",
      websiteUrl: "",
      industry: "Restaurants",
      city: "San Francisco",
      hasWebsite: false,
      websiteQuality: "None",
      leadScore: 90,
      priority: "High",
      status: "Proposal Sent",
      createdAt: now - (15 * day),
      updatedAt: now,
    },
    {
      id: uuidv4(),
      companyName: "Apex Logistics",
      websiteUrl: "apexlogistics.example.com",
      industry: "B2B",
      city: "Dallas",
      hasWebsite: true,
      websiteQuality: "Good",
      leadScore: 40,
      priority: "Low",
      status: "Not Interested",
      createdAt: now - (20 * day),
      updatedAt: now,
    },
    {
      id: uuidv4(),
      companyName: "Rivertown Real Estate",
      websiteUrl: "rivertownre.example.com",
      industry: "Real Estate",
      city: "Austin",
      hasWebsite: true,
      websiteQuality: "Average",
      leadScore: 75,
      priority: "High",
      status: "Won",
      createdAt: now - (30 * day),
      updatedAt: now,
    }
  ];

  sampleProspects.forEach(p => {
    const docRef = doc(db, `users/${userId}/prospects`, p.id);
    batch.set(docRef, p);
  });

  await batch.commit();
};

export const getDashboardStats = async (userId: string) => {
  const prospectsRef = collection(db, `users/${userId}/prospects`);
  const prospectsSnap = await getDocs(prospectsRef);
  
  let totalProspects = 0;
  let contacted = 0;
  let replies = 0;
  let proposals = 0;
  let won = 0;

  prospectsSnap.forEach(doc => {
    const data = doc.data() as Prospect;
    totalProspects++;
    if (['Contacted', 'Replied', 'Interested', 'Call Scheduled', 'Call Completed', 'Proposal Sent', 'Negotiation', 'Won', 'Lost', 'Not Interested'].includes(data.status)) contacted++;
    if (['Replied', 'Interested', 'Call Scheduled', 'Call Completed', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'].includes(data.status)) replies++;
    if (['Proposal Sent', 'Negotiation', 'Won', 'Lost'].includes(data.status)) proposals++;
    if (data.status === 'Won') won++;
  });

  return {
    totalProspects,
    contacted,
    replies,
    proposals,
    won
  };
};
