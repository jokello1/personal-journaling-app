'use client'
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { BookOpenText, LogOut, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { ThemeToggle } from './ThemeToggler';

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  return (
    <header className="dark:bg-black border-b border-slate-200 bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <BookOpenText className="h-6 w-6 text-blue-600" />
          <span className="text-xl font-bold">Reflective</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-6 ">
          <Link
            href="/dashboard"
            className={`text-sm font-medium dark:text-white ${
              pathname === '/dashboard' ? 'text-blue-600' : 'text-slate-700 hover:text-blue-600'
            }`}
          >
            Journal
          </Link>
          <Link
            href="/dashboard/analytics"
            className={`text-sm font-medium dark:text-white ${
              pathname === '/dashboard/analytics' ? 'text-blue-600' : 'text-slate-700 hover:text-blue-600'
            }`}
          >
            Analytics
          </Link>
          <Link
            href="/dashboard/settings"
            className={`text-sm font-medium dark:text-white ${
              pathname === '/dashboard/settings' ? 'text-blue-600' : 'text-slate-700 hover:text-blue-600'
            }`}
          >
            Settings
          </Link>
        </nav>
        
        <div className="flex items-center gap-4">
          {/* <ThemeToggle/> */}
          <Link href="/dashboard/entries/new">
            <Button size="sm" className='bg-indigo-600 hover:bg-indigo-700 dark:text-white'>New Entry</Button>
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-full h-8 w-8 p-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={session?.user?.image || ''}
                    alt={session?.user?.name || ''}
                  />
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {session?.user?.name?.charAt(0) || <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}