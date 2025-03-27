// 'use client';

// import { ThemeProvider as NextThemesProvider } from 'next-themes';
// import { type ThemeProviderProps } from 'next-themes';

// export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
//   return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
// }
"use client";

import { useQuery } from "@tanstack/react-query";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { ReactNode, useEffect, useState } from "react";
import { UserSettings } from "../lib/services/types/interfaces";

interface ThemeProviderProps {
  children: ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false);
  const {setTheme} = useTheme()
  const { data: userSettings } = useQuery<UserSettings>({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await fetch('/api/user-settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      return await res.json();
    }
  }
  );

  useEffect(() => {
    setMounted(true);
    setTheme(userSettings?.darkMode ?'dark': 'light')
    console.log("Usersettings: ",userSettings)
  }, [userSettings]);

  if (!mounted) {
    return <>{children}</>; 
  }

  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemesProvider>
  );
}
