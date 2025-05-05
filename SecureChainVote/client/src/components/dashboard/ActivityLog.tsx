import { formatDistanceToNow } from "date-fns";

export interface AuditLogEntry {
  id: number;
  action: string;
  userId?: number;
  details?: any;
  timestamp: string;
  user?: {
    fullName: string;
    initials: string;
  }
}

interface ActivityLogProps {
  logs: AuditLogEntry[];
  showViewAll?: boolean;
  onViewAll?: () => void;
}

const getActionBadgeColor = (action: string) => {
  if (action.includes("Vote")) {
    return "bg-blue-100 text-blue-800";
  } else if (action.includes("Verified")) {
    return "bg-purple-100 text-purple-800";
  } else if (action.includes("Block")) {
    return "bg-green-100 text-green-800";
  } else if (action.includes("Election")) {
    return "bg-amber-100 text-amber-800";
  } else {
    return "bg-gray-100 text-gray-800";
  }
};

const getUserIcon = (action: string, initials: string) => {
  if (action.includes("Block")) {
    return (
      <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-green-700">
        <i className="fas fa-cube text-xs"></i>
      </div>
    );
  } else if (action.includes("Vote")) {
    return (
      <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center">
        <span className="text-xs">A*</span>
      </div>
    );
  } else {
    return (
      <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
        <span className="text-xs">{initials}</span>
      </div>
    );
  }
};

export function ActivityLog({ logs, showViewAll = false, onViewAll }: ActivityLogProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
        {showViewAll && (
          <button 
            onClick={onViewAll}
            className="text-primary-600 hover:text-primary-800 text-sm"
          >
            View Full Audit Trail
          </button>
        )}
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {logs.map((log, index) => (
                <tr key={`log-${log.id}-${index}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionBadgeColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    <div className="flex items-center">
                      {getUserIcon(log.action, log.user?.initials || "SY")}
                      <span className="ml-2">
                        {log.action.includes("Vote") ? "Anonymous" : 
                         log.action.includes("Block") ? "System" : 
                         log.user?.fullName || "System"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {log.action.includes("Block") ? (
                      <div className="font-mono text-xs">
                        {log.details?.blockId ? `${log.details.blockId} created with ${log.details.transactionCount} transactions` : 
                         "Block created"}
                      </div>
                    ) : log.action.includes("Vote") ? (
                      <>
                        {log.details?.voter && log.details?.election ? 
                          `${log.details.voter} voted in "${log.details.election}"` : 
                          log.details?.electionTitle || "Vote cast"}
                      </>
                    ) : log.action.includes("Verified") ? (
                      `Verified ${log.details?.count || "new"} voters`
                    ) : log.action.includes("Election") ? (
                      `${log.details?.title || "Election updated"}`
                    ) : (
                      "System action"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
