"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, BookOpenIcon, BarChartIcon, PenIcon } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { link } from 'fs';


const queryClient = new QueryClient();

export default function Home() {
  const router = useRouter();
  const links = {
    "dashboard": "/dashboard",
    "new-entry": "/dashboard/entries/new",
    "view-entries": "/dashboard",
    "analytics": "/dashboard/analytics",
    "settings": "/dashboard/settings"
  }
  const featuresData = [
    {
      title: "Write Journal Entries",
      description: "Capture your thoughts, experiences, and reflections in a structured format with rich text editing.",
      icon: <PenIcon className="h-10 w-10 text-indigo-500" />,
      action: "New Entry",
      path: links["new-entry"]
    },
    {
      title: "Review Past Entries",
      description: "Browse through your journal history, search by keyword, and filter by categories or tags.",
      icon: <BookOpenIcon className="h-10 w-10 text-emerald-500" />,
      action: "View Entries",
      path: links["view-entries"]
    },
    {
      title: "Track Insights",
      description: "Visualize your journaling habits, mood patterns, and writing consistency over time.",
      icon: <BarChartIcon className="h-10 w-10 text-amber-500" />,
      action: "See Analytics",
      path: links["analytics"]
    },
    {
      title: "Daily Reminders",
      description: "Set up custom reminders to maintain a consistent journaling practice.",
      icon: <CalendarIcon className="h-10 w-10 text-blue-500" />,
      action: "Set Reminders",
      path: links["settings"]
    }
  ];
  
  return (
      <div className="flex flex-col min-h-screen">
        <header className="bg-white border-b border-slate-200 py-4">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-slate-800">MyJournal</h1>
              <div className="flex gap-4">
                <Button variant="ghost" onClick={() => router.push(links["view-entries"])}>
                  Entries
                </Button>
                <Button variant="ghost" onClick={() => router.push(links["analytics"])}>
                  Analytics
                </Button>
                <Button variant="ghost" onClick={() => router.push(links["settings"])}>
                  Settings
                </Button>
                <Button onClick={() => router.push(links["new-entry"])}>
                  New Entry
                </Button>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-grow">
          <section className="bg-gradient-to-b from-indigo-50 to-white py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl font-bold text-slate-900 mb-4">
                  Your Personal Journaling Space
                </h1>
                <p className="text-xl text-slate-600 mb-8">
                  Capture your thoughts, track your growth, and gain insights from your daily reflections.
                </p>
                <div className="flex justify-center gap-4">
                  <Button 
                    size="lg"
                    onClick={() => router.push(links["new-entry"])}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    Start Writing
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => router.push(links["dashboard"])}
                  >
                    Go to Dashboard
                  </Button>
                </div>
              </div>
            </div>
          </section>
          
          <section className="py-16">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-12">Journaling Made Simple</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {featuresData.map((feature, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="mb-4">{feature.icon}</div>
                      <CardTitle>{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => router.push(feature.path)}
                      >
                        {feature.action}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </section>
          
          <section className="bg-slate-50 py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-12">Your Journal Dashboard</h2>
                
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="text-center mb-8">
                    <p className="text-slate-600">
                      Track your writing habits, review insights, and access your recent entries all in one place.
                    </p>
                  </div>
                  
                  <div className="flex justify-center">
                    <Button 
                      size="lg" 
                      onClick={() => router.push(links["dashboard"])}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      View Dashboard
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        
        <footer className="bg-slate-800 text-white py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <h3 className="text-xl font-bold">MyJournal</h3>
                <p className="text-slate-300">Your personal journaling companion</p>
              </div>
              
              <div className="flex gap-6">
                <Button variant="ghost" className="text-white hover:text-white hover:bg-slate-700" onClick={() => router.push('/help')}>
                  Help
                </Button>
                <Button variant="ghost" className="text-white hover:text-white hover:bg-slate-700" onClick={() => router.push('/privacy')}>
                  Privacy
                </Button>
                <Button variant="ghost" className="text-white hover:text-white hover:bg-slate-700" onClick={() => router.push('/terms')}>
                  Terms
                </Button>
              </div>
            </div>
          </div>
        </footer>
      </div>
  );
}