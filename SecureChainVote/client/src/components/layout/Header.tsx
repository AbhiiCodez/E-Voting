import { Link } from "wouter";

interface User {
  id: number;
  username: string;
  fullName: string;
  role: string;
  email: string;
  verified: boolean;
}

interface HeaderProps {
  user: User | null;
  toggleSidebar: () => void;
}

export function Header({ user, toggleSidebar }: HeaderProps) {
  const initials = user ? user.fullName.split(" ").map(n => n[0]).join("").slice(0, 2) : "";
  
  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center md:hidden">
          <button onClick={toggleSidebar} className="text-slate-800">
            <i className="fas fa-bars text-xl"></i>
          </button>
          <div className="ml-3 flex items-center">
            <svg className="h-6 w-6 mr-2 text-primary-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 9H22M2 15H22M12 3L8 21M16 3L12 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-lg font-semibold">BlockVote</span>
          </div>
        </div>
        
        <div className="flex items-center">
          <button className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <i className="fas fa-bell text-xl"></i>
          </button>
          <button className="ml-3 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <i className="fas fa-question-circle text-xl"></i>
          </button>
          {user && (
            <div className="ml-3 md:hidden">
              <div className="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center text-white">
                <span>{initials}</span>
              </div>
            </div>
          )}
          {!user && (
            <div className="ml-3 md:hidden">
              <Link href="/login">
                <a className="text-sm text-primary-600 hover:text-primary-800">Sign In</a>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
