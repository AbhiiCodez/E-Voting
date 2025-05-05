import { Link } from "wouter";

export interface Election {
  id: number;
  electionId: string;
  title: string;
  description?: string;
  status: string;
  startDate: string;
  endDate: string;
  voteCount?: number;
  participation?: number;
  lastTransaction?: string;
  lastTransactionTime?: string;
  registrationPercentage?: number;
  registeredVoters?: number;
  blockchainSetup?: string;
}

interface ElectionCardProps {
  election: Election;
}

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case "in_progress":
      return "bg-green-100 text-green-800";
    case "upcoming":
      return "bg-blue-100 text-blue-800";
    case "completed":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const formatTimeRemaining = (date: string) => {
  const now = new Date();
  const target = new Date(date);
  const diffMs = target.getTime() - now.getTime();
  
  if (diffMs <= 0) return "Ended";
  
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  return `${diffDays} days, ${diffHours} hours`;
};

const formatTimeUntil = (date: string) => {
  const now = new Date();
  const target = new Date(date);
  const diffMs = target.getTime() - now.getTime();
  
  if (diffMs <= 0) return "Started";
  
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  return `${diffDays} days`;
};

export function ElectionCard({ election }: ElectionCardProps) {
  const displayStatus = election.status === "in_progress" ? "In Progress" : 
    election.status === "upcoming" ? "Upcoming" : "Completed";
  
  const timeDisplay = election.status === "in_progress" 
    ? `Ends in ${formatTimeRemaining(election.endDate)}` 
    : election.status === "upcoming" 
      ? `Starts in ${formatTimeUntil(election.startDate)}` 
      : `Ended on ${new Date(election.endDate).toLocaleDateString()}`;
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md mb-4">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-start">
        <div>
          <h3 className="text-lg leading-6 font-medium text-slate-900">{election.title}</h3>
          <p className="mt-1 text-sm text-slate-500">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(election.status)}`}>
              {displayStatus}
            </span>
            <span className="ml-2">{timeDisplay}</span>
          </p>
        </div>
        <div className="flex">
          <Link href={`/elections/${election.id}`}>
            <a className="text-primary-600 hover:text-primary-800 mr-4">
              <i className="fas fa-eye"></i>
            </a>
          </Link>
          <button className="text-slate-600 hover:text-slate-800">
            <i className="fas fa-ellipsis-v"></i>
          </button>
        </div>
      </div>
      <div className="border-t border-slate-200">
        <dl>
          <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-slate-500">Election ID</dt>
            <dd className="mt-1 text-sm text-slate-900 font-mono sm:mt-0 sm:col-span-2">{election.electionId}</dd>
          </div>
          
          {election.status === "in_progress" && (
            <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-slate-50">
              <dt className="text-sm font-medium text-slate-500">Participation</dt>
              <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">
                <div className="flex items-center">
                  <div className="w-full bg-slate-200 rounded-full h-2.5 mr-2">
                    <div 
                      className="bg-primary-600 h-2.5 rounded-full" 
                      style={{ width: `${election.participation || 0}%` }}
                    ></div>
                  </div>
                  <span>{election.participation}% ({election.voteCount} votes)</span>
                </div>
              </dd>
            </div>
          )}
          
          {election.status === "upcoming" && (
            <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-slate-50">
              <dt className="text-sm font-medium text-slate-500">Registration</dt>
              <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">
                <div className="flex items-center">
                  <div className="w-full bg-slate-200 rounded-full h-2.5 mr-2">
                    <div 
                      className="bg-secondary-500 h-2.5 rounded-full" 
                      style={{ width: `${election.registrationPercentage || 0}%` }}
                    ></div>
                  </div>
                  <span>{election.registrationPercentage}% ({election.registeredVoters} registered)</span>
                </div>
              </dd>
            </div>
          )}
          
          {election.status === "in_progress" && (
            <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-slate-500">Last transaction</dt>
              <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">
                <div className="font-mono text-xs overflow-hidden overflow-ellipsis">{election.lastTransaction}</div>
                <div className="text-slate-500 text-xs">{election.lastTransactionTime}</div>
              </dd>
            </div>
          )}
          
          {election.status === "upcoming" && (
            <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-slate-500">Blockchain setup</dt>
              <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <i className="fas fa-check-circle mr-1"></i> {election.blockchainSetup || "Complete"}
                </span>
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
