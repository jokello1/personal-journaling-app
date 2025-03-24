import React from 'react';
import { format, parseISO, eachDayOfInterval, subDays } from 'date-fns';

interface ConsistencyData {
  date: string;
  count: number;
}

interface CalendarHeatmapProps {
  data: ConsistencyData[];
}

export function CalendarHeatmap({ data }: CalendarHeatmapProps) {
  const today = new Date();
  const dates = eachDayOfInterval({
    start: subDays(today, 90),
    end: today,
  });
  
  const countMap = new Map(
    data?.map((item) => [item.date, item.count]) || []
  );
  
  const maxCount = Math.max(...(data?.map((item) => item.count) || [0]));
  
  const getColorIntensity = (count: number) => {
    if (count === 0) return 'bg-slate-100';
    const intensity = Math.min(Math.ceil((count / maxCount) * 4), 4);
    
    switch (intensity) {
      case 1:
        return 'bg-blue-100';
      case 2:
        return 'bg-blue-200';
      case 3:
        return 'bg-blue-300';
      case 4:
        return 'bg-blue-400';
      default:
        return 'bg-slate-100';
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-xs text-center text-slate-500">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {dates.map((date) => {
          const dateStr = format(date, 'yyyy-MM-dd');
          const count = countMap.get(dateStr) || 0;
          
          return (
            <div
              key={dateStr}
              className={`h-10 rounded-sm ${getColorIntensity(count)}`}
              title={`${format(date, 'MMM d')}: ${count} entries`}
            />
          );
        })}
      </div>
      
      <div className="flex justify-end items-center gap-2 text-xs text-slate-500">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 bg-slate-100 rounded-sm" />
          <div className="w-3 h-3 bg-blue-100 rounded-sm" />
          <div className="w-3 h-3 bg-blue-200 rounded-sm" />
          <div className="w-3 h-3 bg-blue-300 rounded-sm" />
          <div className="w-3 h-3 bg-blue-400 rounded-sm" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}