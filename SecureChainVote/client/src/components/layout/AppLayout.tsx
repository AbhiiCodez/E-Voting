import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  username: string;
  fullName: string;
  role: string;
  email: string;
  verified: boolean;
}

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const [isLoginPage] = useRoute("/login");
  const [isRegisterPage] = useRoute("/register");
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Check if we have a user in localStorage (for prototype mode)
        const storedUser = localStorage.getItem('blockvote_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          setLoading(false);
          return;
        }
        
        // If not in localStorage, try the API
        const res = await fetch("/api/auth/user", {
          credentials: "include"
        });
        
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          // Store in localStorage for prototype
          localStorage.setItem('blockvote_user', JSON.stringify(data.user));
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [location]);

  const handleLogout = async () => {
    try {
      // Remove from localStorage first (for prototype)
      localStorage.removeItem('blockvote_user');
      
      // Then try to log out via API
      await apiRequest("POST", "/api/auth/logout", {});
      setUser(null);
      setLocation("/login");
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      console.error("Error logging out:", error);
      // Even if API call fails, we still want to log out in prototype mode
      setUser(null);
      setLocation("/login");
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Don't apply layout to login and register pages
  if (isLoginPage || isRegisterPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated and not on login/register page
  if (!user && !isLoginPage && !isRegisterPage) {
    setLocation("/login");
    return null;
  }

  return (
    <div className="min-h-screen flex">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-slate-600 bg-opacity-75" onClick={toggleSidebar}></div>
          <div className="fixed inset-y-0 left-0 flex flex-col w-64 max-w-xs bg-slate-800">
            <Sidebar user={user} onLogout={handleLogout} />
          </div>
        </div>
      )}
      
      {/* Desktop sidebar */}
      <Sidebar user={user} onLogout={handleLogout} />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
