'use client';

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel
} from '@/components/ui/form';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { UserSettings } from '@/app/lib/services/types/interfaces';
import { useTheme } from 'next-themes';
// const { theme, setTheme } = useTheme()

//  useEffect(() => {
//     console.log("userSettings", userSettings)
//     if (userSettings && userSettings.darkMode) {
//       setTheme('dark')
//     } else {
//         setTheme((theme === 'dark'?'dark':'light'))
//     }
//   }, [userSettings])

const settingsSchema = z.object({
  darkMode: z.boolean().default(false),
  emailNotifications: z.boolean().default(true)
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function Settings() {

  const { data: userSettings, isLoading: userSettingsLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await fetch('/api/user-settings');
      if (!res.ok) throw new Error('Failed to fetch categories');
      return await res.json();
    }
  }
  );
  const { setTheme } = useTheme()

  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      darkMode: userSettings?.darkMode || false,
      emailNotifications: userSettings?.emailNotifications || true
    }
  });

  const onSubmit = async (data: SettingsFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      setTheme(data.darkMode?'dark':'light')
      toast("Your preferences have been successfully saved.",);
    } catch (error) {
      toast("Unable to update settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Account Settings</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="darkMode"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Dark Mode
                      </FormLabel>
                      <FormDescription>
                        Toggle between light and dark themes
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emailNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Email Notifications
                      </FormLabel>
                      <FormDescription>
                        Receive email updates and reminders
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              "Saving..."
            ) : (
              "Save Changes"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}