import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: 'primary' | 'secondary' | 'blue' | 'green' | 'yellow';
}

export function StatsCard({ title, value, icon: Icon, trend, color }: StatsCardProps) {
  const colorClasses = {
    primary: { bg: 'bg-primary-50', text: 'text-primary-600', icon: 'bg-primary-500' },
    secondary: { bg: 'bg-secondary-50', text: 'text-secondary-600', icon: 'bg-secondary-500' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'bg-blue-500' },
    green: { bg: 'bg-green-50', text: 'text-green-600', icon: 'bg-green-500' },
    yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', icon: 'bg-yellow-500' }
  };

  const colors = colorClasses[color];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-secondary-600">{title}</p>
          <p className="text-3xl font-bold text-secondary-900 mt-2">{value}</p>
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              <span>
                {trend.isPositive ? '+' : ''}{trend.value}% this week
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${colors.bg}`}>
          <Icon className={`w-6 h-6 ${colors.text}`} />
        </div>
      </div>
    </div>
  );
}