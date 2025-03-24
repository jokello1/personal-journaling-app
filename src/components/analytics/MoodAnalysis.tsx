import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface MoodData {
  mood: string;
  count: number;
}

interface MoodAnalysisProps {
  data: MoodData[];
}

export function MoodAnalysis({ data }: MoodAnalysisProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500">
        No mood data available. Try adding moods to your entries.
      </div>
    );
  }
  
  const colors = {
    Happy: '#4ade80',
    Calm: '#60a5fa',
    Productive: '#a78bfa',
    Excited: '#f472b6',
    Anxious: '#fb923c',
    Sad: '#94a3b8',
    Tired: '#6b7280',
    Angry: '#ef4444',
    Stressed: '#f97316',
    Neutral: '#d1d5db',
  };
  
  const getColor = (mood: string) => {
    return colors[mood as keyof typeof colors] || '#d1d5db';
  };
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" />
        <YAxis type="category" dataKey="mood" width={100} />
        <Tooltip formatter={(value) => [`${value} entries`, 'Count']} />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getColor(entry.mood)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}