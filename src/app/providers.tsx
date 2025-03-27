"use client"
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import ThemeProvider from "./providers/theme-providers";

export function NextAuthProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  

  return <SessionProvider>
    {/* <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    > */}
      <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {children}
        </ThemeProvider>
      </QueryClientProvider>
    {/* </ThemeProvider> */}
  </SessionProvider>
}