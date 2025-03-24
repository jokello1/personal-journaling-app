import React from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface MoodDistributionProps {
  data?: {
    pieData: Array<{
      name: string;
      value: number;
      color: string;
    }>;
    lineData?: Array<{
      date: string;
      [key: string]: any;
    }>;
  };
  isLoading: boolean;
  detailed?: boolean;
}

export function MoodDistribution({ data, isLoading, detailed = false }: MoodDistributionProps) {
  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!data || !data.pieData || data.pieData.length === 0) {
    return <div className="h-64 flex items-center justify-center text-slate-500">No mood data available</div>;
  }

  // Display line chart for detailed view
  if (detailed && data.lineData && data.lineData.length > 0) {
    const moodColors: {[key: string]: string} = {};
    data.pieData.forEach(item => {
      moodColors[item.name] = item.color;
    });

    // Get all moods from the data
    const allMoods = Array.from(
      new Set(
        data.pieData.map(item => item.name)
      )
    );

    return (
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data.lineData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => {
              const date = new Date(value);
              return `${date.getMonth() + 1}/${date.getDate()}`;
            }}
          />
          <YAxis />
          <Tooltip 
            labelFormatter={(label) => {
              const date = new Date(label);
              return date.toLocaleDateString();
            }}
          />
          <Legend />
          {allMoods.map((mood) => (
            <Line 
              key={mood}
              type="monotone" 
              dataKey={mood} 
              stroke={moodColors[mood] || `#${Math.floor(Math.random()*16777215).toString(16)}`}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  // Display pie chart for overview
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data.pieData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value, name) => [`${value} entries`, name]}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}