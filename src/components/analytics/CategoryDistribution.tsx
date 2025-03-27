import React from 'react';
import { XAxis, BarChart, Cell, YAxis,Bar, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface CategoryDistributionProps {
  data?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  isLoading: boolean;
}
export function CategoryDistribution({ data, isLoading }: CategoryDistributionProps) {
  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500">
        No category data available
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data}
          layout="vertical"
          margin={{ left: 20, right: 20, bottom: 5 }}
        >
          <XAxis 
            type="number" 
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            dataKey="name" 
            type="category"
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            formatter={(value, name) => [`${value} entries`, name]}
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.8)', 
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          />
          <Bar 
            dataKey="value" 
            barSize={30}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color} 
                style={{ 
                  opacity: 0.8,
                  transition: 'opacity 0.3s ease-in-out' 
                }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}