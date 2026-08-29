import React, { createContext, useContext, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export interface User {
  uid: string;
  email: string;
  photoURL?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isSigningIn: boolean;
  token: string | null;
  signIn: (email?: string, password?: string) => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('mock_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setToken('mock-token-no-drive-access');
    }
    setLoading(false);
  }, []);

  const signIn = async (email?: string, password?: string) => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay
      
      if (email === 'namit@mail.com' && password === 'password') {
        const mockUser = {
          uid: 'namit-mock-id',
          email: 'namit@mail.com',
          photoURL: `https://ui-avatars.com/api/?name=Namit&background=random`
        };
        setUser(mockUser);
        setToken('mock-token-no-drive-access');
        localStorage.setItem('mock_user', JSON.stringify(mockUser));
      } else {
        alert("Invalid credentials. Please use namit@mail.com and password.");
      }
    } catch (error: any) {
      console.error("Error signing in", error);
      alert(`Sign in failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSigningIn(false);
    }
  };

  const logOut = async () => {
    try {
      setUser(null);
      setToken(null);
      localStorage.removeItem('mock_user');
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#E4E3E0]">
        <Loader2 className="h-8 w-8 animate-spin text-[#141414]" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, isSigningIn, token, signIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
