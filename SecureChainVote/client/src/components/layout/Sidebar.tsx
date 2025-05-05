import { Link, useLocation } from "wouter";
import { useMemo } from "react";

interface User {
  id: number;
  username: string;
  fullName: string;
  role: string;
  email: string;
  verified: boolean;
}

interface SidebarProps {
  user: User | null;
  onLogout: () => void;
}

export function Sidebar({ user, onLogout }: SidebarProps) {
  const [location] = useLocation();
  
  const initials = useMemo(() => {
    if (!user) return "";
    const parts = user.fullName.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`;
    }
    return parts[0].substring(0, 2);
  }, [user]);
  
  return (
    <div className="hidden md:flex md:flex-col md:w-64 bg-slate-800 text-white">
      <div className="px-4 py-6 flex items-center border-b border-slate-700">
        <svg className="h-8 w-8 mr-2 text-primary-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 9H22M2 15H22M12 3L8 21M16 3L12 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="text-xl font-semibold">BlockVote</span>
      </div>
      
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="px-4 py-2 text-sm text-slate-400">
          {user?.role === "admin" ? "Admin Dashboard" : "Voter Dashboard"}
        </div>
        <Link href="/dashboard">
          <a className={`flex items-center px-4 py-3 ${location === "/dashboard" ? "text-white bg-slate-700" : "text-slate-300 hover:bg-slate-700"}`}>
            <i className="fas fa-tachometer-alt w-5 h-5 mr-3"></i>
            <span>Dashboard</span>
          </a>
        </Link>
        <Link href="/elections">
          <a className={`flex items-center px-4 py-3 ${location === "/elections" ? "text-white bg-slate-700" : "text-slate-300 hover:bg-slate-700"}`}>
            <i className="fas fa-vote-yea w-5 h-5 mr-3"></i>
            <span>Elections</span>
          </a>
        </Link>
        {user?.role === "admin" && (
          <Link href="/voters">
            <a className={`flex items-center px-4 py-3 ${location === "/voters" ? "text-white bg-slate-700" : "text-slate-300 hover:bg-slate-700"}`}>
              <i className="fas fa-users w-5 h-5 mr-3"></i>
              <span>Voters</span>
            </a>
          </Link>
        )}
        <Link href="/blockchain">
          <a className={`flex items-center px-4 py-3 ${location === "/blockchain" ? "text-white bg-slate-700" : "text-slate-300 hover:bg-slate-700"}`}>
            <i className="fas fa-link w-5 h-5 mr-3"></i>
            <span>Blockchain</span>
          </a>
        </Link>
        {user?.role === "admin" && (
          <Link href="/audit">
            <a className={`flex items-center px-4 py-3 ${location === "/audit" ? "text-white bg-slate-700" : "text-slate-300 hover:bg-slate-700"}`}>
              <i className="fas fa-history w-5 h-5 mr-3"></i>
              <span>Audit Trail</span>
            </a>
          </Link>
        )}
        <Link href="/settings">
          <a className={`flex items-center px-4 py-3 ${location === "/settings" ? "text-white bg-slate-700" : "text-slate-300 hover:bg-slate-700"}`}>
            <i className="fas fa-cog w-5 h-5 mr-3"></i>
            <span>Settings</span>
          </a>
        </Link>
      </nav>
      
      <div className="p-4 border-t border-slate-700">
        {user ? (
          <>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center text-white">
                <span>{initials}</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{user.fullName}</p>
                <p className="text-xs text-slate-400">{user.role === "admin" ? "System Administrator" : "Verified Voter"}</p>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="mt-4 w-full px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 text-sm flex items-center"
            >
              <i className="fas fa-sign-out-alt mr-2"></i> Logout
            </button>
          </>
        ) : (
          <div className="text-center">
            <Link href="/login">
              <a className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 text-sm inline-block">
                Sign In
              </a>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
