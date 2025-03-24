
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';

interface EntryLengthData {
  date: string;
  wordCount: number;
}

interface EntryLengthChartProps {
  data: EntryLengthData[];
}

export function EntryLengthChart({ data }: EntryLengthChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500">
        No entry length data available
      </div>
    );
  }
  
  const processedData = data.map((item, i) => {
    let sum = 0;
    let count = 0;
    
    for (let j = Math.max(0, i - 6); j <= i; j++) {
      sum += data[j].wordCount;
      count++;
    }
    
    return {
      ...item,
      date: format(parseISO(item.date), 'MMM d'),
      movingAvg: Math.round(sum / count),
    };
  });
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={processedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickFormatter={(value) => value}
          interval={Math.ceil(processedData.length / 10) - 1}
        />
        <YAxis />
        <Tooltip
          formatter={(value) => [`${value} words`, 'Entry Length']}
          labelFormatter={(label) => `Date: ${label}`}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="wordCount"
          stroke="#8884d8"
          dot={false}
          name="Word Count"
        />
        <Line
          type="monotone"
          dataKey="movingAvg"
          stroke="#82ca9d"
          strokeWidth={2}
          dot={false}
          name="7-Day Average"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
