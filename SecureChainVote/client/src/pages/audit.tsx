import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityLog, AuditLogEntry } from "@/components/dashboard/ActivityLog";
import { formatDistanceToNow, subDays, format, startOfDay, addDays, isSameDay } from "date-fns";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from "recharts";

interface AuditLogsResponse {
  logs: AuditLogEntry[];
}

export default function Audit() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [timeRange, setTimeRange] = useState("all");
  const [simulatedLogs, setSimulatedLogs] = useState<AuditLogEntry[]>([]);
  
  // Generate initial audit logs if none exist
  const generateInitialAuditLogs = () => {
    const now = Date.now();
    const initialLogs = [
      {
        id: now - 86400000,
        action: 'System Started',
        userId: 0,
        details: { version: '1.0.0', environment: 'production' },
        timestamp: new Date(now - 86400000).toISOString()
      },
      {
        id: now - 82800000,
        action: 'User Login',
        userId: 1,
        details: { username: 'admin', ip: '192.168.1.100', success: true },
        timestamp: new Date(now - 82800000).toISOString()
      },
      {
        id: now - 79200000,
        action: 'Election Created',
        userId: 1,
        details: { title: 'Student Council 2025', startDate: '2025-05-10', endDate: '2025-05-15' },
        timestamp: new Date(now - 79200000).toISOString()
      },
      {
        id: now - 72000000,
        action: 'Voter Registration',
        userId: 0,
        details: { count: 50, event: 'Bulk Registration' },
        timestamp: new Date(now - 72000000).toISOString()
      },
      {
        id: now - 43200000,
        action: 'Voter Verified',
        userId: 1,
        details: { voter: 'James Smith', email: 'james.smith@example.com' },
        timestamp: new Date(now - 43200000).toISOString()
      },
      {
        id: now - 36000000,
        action: 'Block Created',
        userId: 0,
        details: { blockId: 'block-2738291', transactionCount: 5, hash: '000db5...b8e4' },
        timestamp: new Date(now - 36000000).toISOString()
      },
      {
        id: now - 21600000,
        action: 'Vote Cast',
        userId: 0,
        details: { election: 'Student Council 2025', voter: 'Anonymous', transactionId: '0x8f7d61' },
        timestamp: new Date(now - 21600000).toISOString()
      },
      {
        id: now - 18000000,
        action: 'System Settings Updated',
        userId: 1,
        details: { setting: 'vote_verification', value: 'enabled' },
        timestamp: new Date(now - 18000000).toISOString()
      },
      {
        id: now - 3600000,
        action: 'Election Status Changed',
        userId: 0,
        details: { title: 'Student Council 2025', status: 'in_progress', automatic: true },
        timestamp: new Date(now - 3600000).toISOString()
      },
      {
        id: now - 1800000,
        action: 'Vote Batch Processed',
        userId: 0,
        details: { count: 10, blockId: 'block-2738292' },
        timestamp: new Date(now - 1800000).toISOString()
      }
    ];
    return initialLogs;
  };

  // Load simulated audit logs from localStorage
  useEffect(() => {
    const storedLogs = localStorage.getItem('blockvote_audit_logs');
    if (storedLogs) {
      try {
        const parsedLogs = JSON.parse(storedLogs);
        // Process the logs to add user info
        const processedLogs = parsedLogs.map((log: any) => {
          let user = {
            fullName: log.userId === 1 ? "Admin Johnson" : "System",
            initials: log.userId === 1 ? "AJ" : "SY",
          };
          return {
            ...log,
            user,
          };
        });
        setSimulatedLogs(processedLogs);
      } catch (error) {
        console.error("Error parsing audit logs:", error);
      }
    } else {
      // Generate initial logs if none exist
      const initialLogs = generateInitialAuditLogs();
      localStorage.setItem('blockvote_audit_logs', JSON.stringify(initialLogs));
      // Process the logs to add user info
      const processedLogs = initialLogs.map(log => {
        let user = {
          fullName: log.userId === 1 ? "Admin Johnson" : "System",
          initials: log.userId === 1 ? "AJ" : "SY",
        };
        return {
          ...log,
          user,
        };
      });
      setSimulatedLogs(processedLogs);
    }
  }, []);
  
  // Generate random audit log entry
  const generateRandomAuditLog = () => {
    const now = Date.now();
    const actions = [
      { action: 'Vote Cast', userId: 0, details: { election: 'Student Council 2025', voter: 'Anonymous', transactionId: `0x${Math.random().toString(16).substring(2, 10)}` } },
      { action: 'Block Created', userId: 0, details: { blockId: `block-${Math.floor(Math.random() * 1000000)}`, transactionCount: Math.floor(Math.random() * 10) + 1, hash: `000${Math.random().toString(16).substring(2, 10)}` } },
      { action: 'Voter Verified', userId: 1, details: { voter: 'Jane Doe', email: 'jane.doe@example.com' } },
      { action: 'System Health Check', userId: 0, details: { status: 'healthy', nodes: Math.floor(Math.random() * 20) + 30, responseTime: `${Math.floor(Math.random() * 100)}ms` } },
      { action: 'User Login', userId: 1, details: { username: 'admin', ip: '192.168.1.100', success: true } }
    ];
    
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    return {
      id: now,
      ...randomAction,
      timestamp: new Date().toISOString()
    };
  };

  // Add new audit logs periodically
  useEffect(() => {
    const interval = setInterval(() => {
      // 33% chance to generate a new audit log
      if (Math.random() < 0.33) {
        const storedLogs = JSON.parse(localStorage.getItem('blockvote_audit_logs') || '[]');
        const newLog = generateRandomAuditLog();
        const updatedLogs = [newLog, ...storedLogs].slice(0, 100); // Keep last 100 logs
        localStorage.setItem('blockvote_audit_logs', JSON.stringify(updatedLogs));
        
        // Update state directly for immediate render
        setSimulatedLogs(prev => {
          const user = {
            fullName: newLog.userId === 1 ? "Admin Johnson" : "System",
            initials: newLog.userId === 1 ? "AJ" : "SY",
          };
          const processedLog = { ...newLog, user };
          return [processedLog, ...prev].slice(0, 100);
        });
      }
    }, 8000); // Check every 8 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Listen for updates to the audit logs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'blockvote_audit_logs') {
        try {
          const parsedLogs = JSON.parse(event.newValue || '[]');
          // Process the logs to add user info
          const processedLogs = parsedLogs.map((log: any) => {
            let user = {
              fullName: log.userId === 1 ? "Admin Johnson" : "System",
              initials: log.userId === 1 ? "AJ" : "SY",
            };
            return {
              ...log,
              user,
            };
          });
          setSimulatedLogs(processedLogs);
        } catch (error) {
          console.error("Error parsing updated audit logs:", error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  const { data: auditLogsData, isLoading } = useQuery<AuditLogsResponse>({
    queryKey: ["/api/audit-logs"],
  });
  
  // Process the API audit logs
  const apiAuditLogs: AuditLogEntry[] = auditLogsData?.logs?.map((log: any) => {
    // Add user info based on the log
    let user = {
      fullName: log.userId === 1 ? "Admin Johnson" : "System",
      initials: log.userId === 1 ? "AJ" : "SY",
    };
    
    return {
      ...log,
      user,
    };
  }) || [];
  
  // Combine API and simulated logs
  const auditLogs: AuditLogEntry[] = [...apiAuditLogs, ...simulatedLogs].sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  // Data processing function for timeline chart
  const getActivityTimelineData = (logs: AuditLogEntry[]) => {
    const today = new Date();
    const dates = Array.from({ length: 7 }, (_, i) => {
      const date = startOfDay(subDays(today, 6 - i));
      return {
        date: format(date, 'MM/dd'),
        fullDate: date,
        events: 0
      };
    });
    
    // Count events for each date
    logs.forEach(log => {
      const logDate = startOfDay(new Date(log.timestamp));
      const dateEntry = dates.find(d => isSameDay(d.fullDate, logDate));
      if (dateEntry) {
        dateEntry.events += 1;
      }
    });
    
    return dates;
  };

  // Data processing function for activity by type chart
  const getActivityByTypeData = (logs: AuditLogEntry[]) => {
    const actionTypes = {
      'Vote': 0,
      'Block': 0,
      'User': 0,
      'Election': 0,
      'System': 0
    };
    
    logs.forEach(log => {
      if (log.action.includes('Vote')) actionTypes['Vote']++;
      else if (log.action.includes('Block')) actionTypes['Block']++;
      else if (log.action.includes('User') || log.action.includes('Voter')) actionTypes['User']++;
      else if (log.action.includes('Election')) actionTypes['Election']++;
      else actionTypes['System']++;
    });
    
    return Object.entries(actionTypes).map(([name, count]) => ({ name, count }));
  };

  // Data processing function for user activity chart
  const getUserActivityData = (logs: AuditLogEntry[]) => {
    const users: Record<string, number> = {
      'System': 0,
      'Admin': 0,
      'Anonymous': 0
    };
    
    logs.forEach(log => {
      if (log.userId === 1) users['Admin']++;
      else if (log.userId === 0 && log.action.includes('Vote')) users['Anonymous']++;
      else users['System']++;
    });
    
    return Object.entries(users)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0);
  };
  
  // Filter logs
  const filteredLogs = auditLogs.filter(log => {
    // Filter by search term
    if (searchTerm && !log.action.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filter by action type
    if (filterType !== "all") {
      if (filterType === "votes" && !log.action.includes("Vote")) return false;
      if (filterType === "users" && !log.action.includes("User") && !log.action.includes("Voter")) return false;
      if (filterType === "elections" && !log.action.includes("Election")) return false;
      if (filterType === "blockchain" && !log.action.includes("Block")) return false;
    }
    
    // Filter by time range
    if (timeRange !== "all") {
      const logDate = new Date(log.timestamp);
      const now = new Date();
      
      if (timeRange === "today") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (logDate < today) return false;
      } else if (timeRange === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        if (logDate < weekAgo) return false;
      } else if (timeRange === "month") {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        if (logDate < monthAgo) return false;
      }
    }
    
    return true;
  });
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Audit Trail</h1>
        <p className="text-slate-500">Monitor all system activities and events</p>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Audit Log Analytics</CardTitle>
          <CardDescription>Visual trends and patterns in system activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-1">Activity Summary</h3>
              <p className="text-3xl font-bold text-primary-600">{auditLogs.length}</p>
              <p className="text-sm text-slate-500">Total activities logged</p>
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Vote Transactions:</span>
                  <span className="font-medium">{auditLogs.filter(log => log.action.includes("Vote")).length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>User Activities:</span>
                  <span className="font-medium">{auditLogs.filter(log => log.action.includes("User")).length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Blockchain Events:</span>
                  <span className="font-medium">{auditLogs.filter(log => log.action.includes("Block")).length}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white border rounded-lg p-4 md:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Recent Activity Trends</h3>
                <Select defaultValue="day" onValueChange={(value) => console.log('View changed:', value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Select View" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Daily</SelectItem>
                    <SelectItem value="week">Weekly</SelectItem>
                    <SelectItem value="month">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Activity Trends Chart */}
              <Tabs defaultValue="timeline">
                <TabsList className="mb-4">
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="actions">Action Types</TabsTrigger>
                  <TabsTrigger value="users">User Activity</TabsTrigger>
                </TabsList>
                
                <TabsContent value="timeline">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={getActivityTimelineData(auditLogs)}
                        margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                      >
                        <defs>
                          <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                        <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                        <Tooltip 
                          contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.375rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                          itemStyle={{ padding: '2px 0' }}
                          labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                        />
                        <Area type="monotone" dataKey="events" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorEvents)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
                
                <TabsContent value="actions">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={getActivityByTypeData(auditLogs)}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                        <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                        <Tooltip 
                          contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.375rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        />
                        <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
                
                <TabsContent value="users">
                  <div className="h-64 flex flex-row justify-center">
                    <ResponsiveContainer width="60%" height="100%">
                      <PieChart>
                        <Pie
                          data={getUserActivityData(auditLogs)}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          labelLine={false}
                        >
                          {getUserActivityData(auditLogs).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#6366f1', '#22c55e', '#eab308', '#f43f5e', '#64748b'][index % 5]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value, name) => [value, name]}
                          contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.375rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="w-[40%] flex flex-col justify-center">
                      <h4 className="text-sm font-medium mb-2">User Activity Distribution</h4>
                      <div className="space-y-2">
                        {getUserActivityData(auditLogs).map((entry, index) => (
                          <div key={`legend-${index}`} className="flex items-center">
                            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: ['#6366f1', '#22c55e', '#eab308', '#f43f5e', '#64748b'][index % 5] }}></div>
                            <div className="text-sm">{entry.name}: <span className="font-medium">{entry.value}</span></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col md:flex-row gap-4 md:w-4/5">
          <Input
            placeholder="Search audit logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="md:w-1/2"
          />
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="md:w-1/4">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Activities</SelectItem>
              <SelectItem value="votes">Vote Transactions</SelectItem>
              <SelectItem value="users">User Activities</SelectItem>
              <SelectItem value="elections">Election Events</SelectItem>
              <SelectItem value="blockchain">Blockchain Events</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="md:w-1/4">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Past Week</SelectItem>
              <SelectItem value="month">Past Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button variant="outline">
          <i className="fas fa-download mr-2"></i>
          Export Logs
        </Button>
      </div>
      
      <Tabs defaultValue="list" className="mb-6">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredLogs.length > 0 ? (
            <div className="bg-white shadow rounded-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Action
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        User
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Details
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {filteredLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                          <div className="text-xs text-slate-400">
                            {new Date(log.timestamp).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            log.action.includes("Vote") ? "bg-blue-100 text-blue-800" :
                            log.action.includes("Block") ? "bg-green-100 text-green-800" :
                            log.action.includes("Election") ? "bg-amber-100 text-amber-800" :
                            log.action.includes("Verified") ? "bg-purple-100 text-purple-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          <div className="flex items-center">
                            {log.action.includes("Block") ? (
                              <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                                <i className="fas fa-cube text-xs"></i>
                              </div>
                            ) : log.action.includes("Vote") ? (
                              <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center">
                                <span className="text-xs">A*</span>
                              </div>
                            ) : (
                              <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
                                <span className="text-xs">{log.user?.initials || "SY"}</span>
                              </div>
                            )}
                            <span className="ml-2">
                              {log.action.includes("Vote") ? "Anonymous" : 
                              log.action.includes("Block") ? "System" : 
                              log.user?.fullName || "System"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          <div className="max-w-xs truncate">
                            {log.details ? JSON.stringify(log.details) : "No details available"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button variant="ghost" size="sm">
                            <i className="fas fa-eye text-slate-500"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <p className="text-slate-500">No audit logs found matching your criteria</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="timeline">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200"></div>
              
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
                </div>
              ) : filteredLogs.length > 0 ? (
                <div className="space-y-6">
                  {filteredLogs.map((log) => (
                    <div key={log.id} className="relative pl-10">
                      <div className={`absolute left-3 top-1 -ml-px h-7 w-7 rounded-full flex items-center justify-center ${
                        log.action.includes("Vote") ? "bg-blue-100 text-blue-800" :
                        log.action.includes("Block") ? "bg-green-100 text-green-800" :
                        log.action.includes("Election") ? "bg-amber-100 text-amber-800" :
                        log.action.includes("Verified") ? "bg-purple-100 text-purple-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {log.action.includes("Vote") ? <i className="fas fa-vote-yea text-xs"></i> :
                         log.action.includes("Block") ? <i className="fas fa-cube text-xs"></i> :
                         log.action.includes("Election") ? <i className="fas fa-poll text-xs"></i> :
                         log.action.includes("User") ? <i className="fas fa-user text-xs"></i> :
                         <i className="fas fa-history text-xs"></i>}
                      </div>
                      
                      <div className="bg-slate-50 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{log.action}</p>
                            <p className="text-sm text-slate-500">
                              {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                              {" - "}
                              {new Date(log.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center">
                            {log.action.includes("Vote") ? (
                              <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center">
                                <span className="text-xs">A*</span>
                              </div>
                            ) : log.action.includes("Block") ? (
                              <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                                <i className="fas fa-cube text-xs"></i>
                              </div>
                            ) : (
                              <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
                                <span className="text-xs">{log.user?.initials || "SY"}</span>
                              </div>
                            )}
                            <span className="ml-2 text-sm">
                              {log.action.includes("Vote") ? "Anonymous" : 
                              log.action.includes("Block") ? "System" : 
                              log.user?.fullName || "System"}
                            </span>
                          </div>
                        </div>
                        
                        {log.details && (
                          <div className="mt-3 p-3 bg-white rounded border text-sm">
                            <pre className="text-xs overflow-x-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-slate-500">No audit logs found matching your criteria</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
