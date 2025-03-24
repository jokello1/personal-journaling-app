import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight, LineChart, Lightbulb, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';

interface RecentInsightsProps {
  data?: Array<{
    id: string;
    type: 'trend' | 'pattern' | 'suggestion';
    title: string;
    description: string;
    direction?: 'up' | 'down' | 'neutral';
  }>;
  isLoading: boolean;
}

export function RecentInsights({ data, isLoading }: RecentInsightsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <div className="h-32 flex items-center justify-center text-slate-500">No insights available</div>;
  }

  const getIcon = (type: string, direction?: string) => {
    switch (type) {
      case 'trend':
        if (direction === 'up') return <TrendingUp className="h-6 w-6 text-green-500" />;
        if (direction === 'down') return <TrendingDown className="h-6 w-6 text-red-500" />;
        return <LineChart className="h-6 w-6 text-blue-500" />;
      case 'pattern':
        return <RefreshCw className="h-6 w-6 text-purple-500" />;
      case 'suggestion':
        return <Lightbulb className="h-6 w-6 text-amber-500" />;
      default:
        return <ChevronRight className="h-6 w-6" />;
    }
  };

  return (
    <div className="space-y-4">
      {data.map((insight) => (
        <Card key={insight.id} className="hover:bg-slate-50 transition-colors">
          <CardContent className="p-4 flex items-start gap-4">
            <div className="mt-1">
              {getIcon(insight.type, insight.direction)}
            </div>
            <div>
              <h3 className="font-medium">{insight.title}</h3>
              <p className="text-sm text-slate-600">{insight.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}