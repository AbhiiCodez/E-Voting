import { ReactNode } from "react";

interface StatusCardProps {
  icon: ReactNode;
  title: string;
  primaryValue: string | number | ReactNode;
  stats: { label: string; value: string | number }[];
  iconBgColor: string;
  iconTextColor: string;
}

export function StatusCard({ 
  icon, 
  title, 
  primaryValue, 
  stats, 
  iconBgColor, 
  iconTextColor 
}: StatusCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-5">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${iconBgColor} ${iconTextColor}`}>
          {icon}
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="text-3xl font-bold">{primaryValue}</p>
        </div>
      </div>
      <div className="mt-4">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <span>{stat.label}:</span>
            <span>{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
