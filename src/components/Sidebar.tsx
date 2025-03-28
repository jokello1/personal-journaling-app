'use client'
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpenText, LineChart, SettingsIcon } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  
  const menuItems = [
    {
      title: 'Journal',
      href: '/dashboard',
      icon: <BookOpenText className="h-5 w-5" />,
    },
    {
      title: 'Analytics',
      href: '/dashboard/analytics',
      icon: <LineChart className="h-5 w-5" />,
    },
    {
      title: 'Settings',
      href: '/dashboard/settings',
      icon: <SettingsIcon className="h-5 w-5" />,
    },
  ];
  
  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 bg-white p-4 dark:bg-gray-800">
      <div className="space-y-4">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md dark:text-white${
                pathname === item.href
                ? 'bg-blue-50 text-blue-600 dark:bg-slate-700 dark:text-white dark:hover:text-blue-400'
                : 'text-slate-700 hover:bg-slate-100 dark:hover:text-slate-700 '
            }`}
          >
            {item.icon}
            <span>{item.title}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
}