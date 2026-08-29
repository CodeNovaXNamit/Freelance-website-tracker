import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  Phone, 
  FileText, 
  Briefcase, 
  TrendingUp, 
  BarChart3, 
  CalendarDays, 
  Settings,
  Search,
  Bell,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Prospects', href: '/prospects', icon: Users },
  { name: 'Follow-ups', href: '/follow-ups', icon: CalendarCheck },
  { name: 'Calls', href: '/calls', icon: Phone },
  { name: 'Proposals', href: '/proposals', icon: FileText },
  { name: 'Clients', href: '/clients', icon: Briefcase },
  { name: 'Revenue', href: '/revenue', icon: TrendingUp },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Weekly Review', href: '/review', icon: CalendarDays },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Layout() {
  const { user, logOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#E4E3E0] text-[#141414] overflow-hidden font-sans">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={twMerge(
        "fixed inset-y-0 left-0 z-50 w-56 transform bg-[#E4E3E0] border-r border-[#141414] transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 flex flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col p-6 border-b border-[#141414]">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xs font-bold tracking-tighter uppercase italic font-serif">Acquisition.OS</h1>
              <p className="text-[10px] opacity-60 mt-1 uppercase tracking-widest">v1.0.4 - Solo</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
              <X className="h-5 w-5 text-[#141414]" />
            </button>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 text-[11px] uppercase tracking-wider font-bold">
          {navigation.map((item, index) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) => clsx(
                "group flex items-center px-6 py-3 transition-colors border-b border-[#141414]/10",
                isActive 
                  ? "bg-[#141414] text-[#E4E3E0]" 
                  : "text-[#141414] hover:bg-[#D4D3D0]"
              )}
              onClick={() => setSidebarOpen(false)}
            >
              {({ isActive }) => (
                <>
                  <span className={clsx(
                    "mr-3 opacity-50 font-mono",
                    isActive ? "text-[#E4E3E0]" : "text-[#141414]"
                  )}>[{String(index + 1).padStart(2, '0')}]</span>
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        
        <div className="border-t border-[#141414] p-6">
          <div className="text-[10px] opacity-50 uppercase mb-4">Status</div>
          <button 
            onClick={logOut}
            className="group flex w-full items-center text-[10px] font-bold uppercase transition-colors hover:opacity-70"
          >
            <div className="w-2 h-2 rounded-full bg-red-600 mr-2"></div>
            Terminate Session
          </button>
        </div>
      </div>

      {/* Main content wrapper */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#141414] bg-[#E4E3E0] px-8">
          <div className="flex flex-1 items-center gap-8">
            <button 
              className="mr-4 lg:hidden text-[#141414] focus:outline-none" 
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:block text-[10px] uppercase opacity-50 font-bold">
              User: <span className="text-[#141414] opacity-100 font-mono">{user?.email}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Search */}
            <div className="flex items-center relative hidden sm:flex">
              <input
                type="text"
                placeholder="SEARCH_DATABASE..."
                className="bg-transparent border border-[#141414] px-3 py-1 text-[10px] focus:outline-none w-48 font-mono placeholder-[#141414]/30"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <button className="text-[#141414] hover:opacity-70 relative">
                <span className="absolute -top-1 -right-1 block h-2 w-2 rounded-full bg-red-500 ring-1 ring-[#E4E3E0]" />
                <Bell className="h-5 w-5" />
              </button>
              <div className="w-8 h-8 bg-[#141414] text-[#E4E3E0] flex items-center justify-center text-[10px] font-bold">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-[#E4E3E0]">
          <div className="mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
