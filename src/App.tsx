/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Prospects } from './pages/Prospects';
import { ProspectDetail } from './pages/ProspectDetail';
import { FollowUps } from './pages/FollowUps';
import { Calls } from './pages/Calls';
import { Proposals } from './pages/Proposals';
import { Clients } from './pages/Clients';
import { Revenue } from './pages/Revenue';
import { Analytics } from './pages/Analytics';
import { Review } from './pages/Review';
import { Settings } from './pages/Settings';

export default function App() {
  const { user, signIn, isSigningIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    signIn(email, password);
  };

  if (!user) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#E4E3E0] p-4 text-center text-[#141414]">
        <h1 className="mb-2 text-3xl font-bold tracking-tighter uppercase italic font-serif">Acquisition.OS</h1>
        <p className="mb-8 max-w-md text-[10px] uppercase tracking-widest opacity-60">
          System Authorization Required / Solo Freelancer Unit
        </p>
        <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full max-w-xs text-left">
          <div>
            <label className="block text-[9px] font-bold uppercase mb-1">Email Identifier</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-transparent border border-[#141414] px-3 py-2 text-[10px] font-mono focus:outline-none placeholder-[#141414]/30"
              placeholder="namit@mail.com"
              required
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold uppercase mb-1">Passcode</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-transparent border border-[#141414] px-3 py-2 text-[10px] font-mono focus:outline-none placeholder-[#141414]/30"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isSigningIn}
            className="mt-2 border border-[#141414] bg-[#141414] px-8 py-3 text-[10px] font-bold uppercase tracking-widest text-[#E4E3E0] transition-colors hover:bg-transparent hover:text-[#141414] disabled:opacity-50 disabled:cursor-not-allowed text-center"
          >
            {isSigningIn ? '[ Authenticating... ]' : '[ Initiate Session ]'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="prospects" element={<Prospects />} />
          <Route path="prospects/:id" element={<ProspectDetail />} />
          <Route path="follow-ups" element={<FollowUps />} />
          <Route path="calls" element={<Calls />} />
          <Route path="proposals" element={<Proposals />} />
          <Route path="clients" element={<Clients />} />
          <Route path="revenue" element={<Revenue />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="review" element={<Review />} />
          <Route path="settings" element={<Settings />} />
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

