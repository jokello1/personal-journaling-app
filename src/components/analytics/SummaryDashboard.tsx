// import React from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Skeleton } from '@/components/ui/skeleton';
// import { CalendarHeatmap } from './CalendarHeatmap';
// import { CategoryDistribution } from './CategoryDistribution';
// import { EntryLengthChart } from './EntryLengthChart';
// import { MoodAnalysis } from './MoodAnalysis';
// import { useQuery } from '@tanstack/react-query';

// interface SummaryDashboardProps {
//   timeframe: '30days' | '90days' | '365days' | 'alltime';
// }

// export function SummaryDashboard({ timeframe: initialTimeframe }: SummaryDashboardProps) {
//   const [timeframe, setTimeframe] = React.useState<'30days' | '90days' | '365days' | 'alltime'>(
//     initialTimeframe || '30days'
//   );

//   const { data, isLoading, error } = useQuery({
//     queryKey:['entrySummary'],
//     queryFn:async () => {
//       const res = await fetch(`/api/analytics/summary?timeframe=${timeframe}`);
//       if (!res.ok) throw new Error('Failed to fetch summary data');
//       return res.json();
//     }
//   });

//   if (error) {
//     return (
//       <div className="p-4 text-red-500">
//         Error loading analytics. Please try again later.
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h2 className="text-2xl font-bold">Journal Insights</h2>

//         <Tabs value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
//           <TabsList>
//             <TabsTrigger value="30days">30 Days</TabsTrigger>
//             <TabsTrigger value="90days">90 Days</TabsTrigger>
//             <TabsTrigger value="365days">Year</TabsTrigger>
//             <TabsTrigger value="alltime">All Time</TabsTrigger>
//           </TabsList>
//         </Tabs>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <Card>
//           <CardHeader>
//             <CardTitle>Writing Consistency</CardTitle>
//           </CardHeader>
//           <CardContent>
//             {isLoading ? (
//               <Skeleton className="h-64 w-full " />
//             ) : (
//               <CalendarHeatmap data={data?.consistency} />
//             )}
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Category Distribution</CardTitle>
//           </CardHeader>
//           <CardContent>
//             {isLoading ? (
//               <Skeleton className="h-64 w-full" />
//             ) : (
//               <CategoryDistribution data={data?.categoryDistribution} />
//             )}
//           </CardContent>
//         </Card>

// <Card>
//   <CardHeader>
//     <CardTitle>Entry Length Over Time</CardTitle>
//   </CardHeader>
//   <CardContent>
//     {isLoading ? (
//       <Skeleton className="h-64 w-full" />
//     ) : (
//       <EntryLengthChart data={data?.entryLength} />
//     )}
//   </CardContent>
// </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Mood Analysis</CardTitle>
//           </CardHeader>
//           <CardContent>
//             {isLoading ? (
//               <Skeleton className="h-64 w-full" />
//             ) : (
//               <MoodAnalysis data={data?.moodAnalysis} />
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }
// src/components/analytics/SummaryDashboard.tsx
import React, { useState } from 'react';
import { CategoryDistribution } from './CategoryDistribution';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { TagCloud } from './TagCloud';
import { MoodDistribution } from './MoodDistribution';
import { RecentInsights } from './RecentInsight';
import { EntryFrequency } from './EntryFrequency';
import { Skeleton } from '../ui/skeleton';
import { CalendarHeatmap } from './CalendarHeatmap';
import { EntryLengthChart } from './EntryLengthChart';

interface SummaryDashboardProps {
  timeframe: '7days' | '30days' | '90days' | 'year' | 'all';
}

export function SummaryDashboard({ timeframe: initialTimeframe }: SummaryDashboardProps) {
  const [timeframe, setTimeframe] = useState<'7days' | '30days' | '90days' | 'year' | 'all'>(initialTimeframe);
  const [activeTab, setActiveTab] = useState('overview');

  // const { data: analyticsData, isLoading } = useQuery(
  //   ['analytics', timeframe],
  //   async () => {
  //     const res = await fetch(`/api/analytics?timeframe=${timeframe}`);
  //     if (!res.ok) throw new Error('Failed to fetch analytics');
  //     return res.json();
  //   }
  // );
  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ['entrySummary'],
    queryFn: async () => {
      const res = await fetch(`/api/analytics?timeframe=${timeframe}`);
      if (!res.ok) throw new Error('Failed to fetch summary data');
      return res.json();
    }
  });

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>

        <Tabs value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
          <TabsList>
            <TabsTrigger value="30days">30 Days</TabsTrigger>
            <TabsTrigger value="90days">90 Days</TabsTrigger>
            <TabsTrigger value="365days">Year</TabsTrigger>
            <TabsTrigger value="alltime">All Time</TabsTrigger>
          </TabsList>
        </Tabs>

      </div>
      <div className="flex flex-col space-y-2 md:flex-row md:space-x-3 md:space-y-0 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full md:w-3/4">
          <Card>
            <CardHeader>
              <CardTitle>Entry Length Over Time</CardTitle>
            </CardHeader>
            <CardContent className='mx-2 px-2'>
              {isLoading ? (
                <Skeleton className="h-64 w-max" />
              ) : (
                <EntryLengthChart data={analyticsData?.entryLength} />
              )}
            </CardContent>
          </Card>

          <Card className='px-2'>
            <CardHeader>
              <CardTitle>Mood Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <MoodDistribution data={analyticsData?.moodDistribution} isLoading={isLoading} />
            </CardContent>
          </Card>
          <div className='flex-wrap space-y-4'>
            <Card className='h-max'>
              <CardHeader>
                <CardTitle>Mood Over Time</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <MoodDistribution
                  data={analyticsData?.moodDistribution}
                  isLoading={isLoading}
                  detailed
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Tag Cloud</CardTitle>
              </CardHeader>
              <CardContent>
                <TagCloud data={analyticsData?.tagCloud} isLoading={isLoading} />
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Writing Consistency</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-64 w-full " />
              ) : (
                <CalendarHeatmap data={analyticsData?.consistency} />
              )}
            </CardContent>
          </Card>
        </div>

        <Card className='w-full md:w-1/4'>
          <CardHeader>
            <CardTitle>Recent Insights</CardTitle>
          </CardHeader>
          <CardContent className='mx-1 px-1'>
            <RecentInsights data={analyticsData?.recentInsights} isLoading={isLoading} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}