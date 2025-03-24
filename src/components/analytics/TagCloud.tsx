import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface TagCloudProps {
  data?: Array<{
    tag: string;
    count: number;
  }>;
  isLoading: boolean;
}

export function TagCloud({ data, isLoading }: TagCloudProps) {
  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-slate-500">No tag data available</div>;
  }

  // Find the min and max counts to scale the font sizes
  const minCount = Math.min(...data.map(item => item.count));
  const maxCount = Math.max(...data.map(item => item.count));
  const fontRange = maxCount - minCount;

  // Function to calculate font size based on count
  const getFontSize = (count: number) => {
    if (fontRange === 0) return 16;
    const minFontSize = 12;
    const maxFontSize = 32;
    const fontSizeRange = maxFontSize - minFontSize;
    return minFontSize + (count - minCount) / fontRange * fontSizeRange;
  };

  return (
    <div className="h-64 flex flex-wrap justify-center items-center gap-4 p-4">
      {data.map((item, index) => (
        <span
          key={index}
          className="inline-block transition-all hover:scale-110 hover:text-blue-600"
          style={{
            fontSize: `${getFontSize(item.count)}px`,
            opacity: 0.7 + (item.count / maxCount) * 0.3,
            cursor: 'default'
          }}
          title={`${item.tag}: ${item.count} entries`}
        >
          {item.tag}
        </span>
      ))}
    </div>
  );
}