import prisma  from '@/lib/prisma';
import { UserSettings } from './types/interfaces';

export class SettingsService {
  async getSettings(get_settings:any) {
    const { userId } = get_settings;
    const result = await prisma.settings.findUnique({
        where: { userId }
      });
    if (!result) { throw new Error("Settings not found"); }
    return result;
  }

  async updateOrCreateSettings(settings_request: UserSettings) {
    const { darkMode, emailNotifications, userId,id } = settings_request;
    const result =await prisma.settings.upsert({
        where: { userId },
        update: {
          darkMode,
          emailNotifications
        },
        create: {
          userId,
          darkMode,
          emailNotifications
        }
      });
      if (!result) { throw new Error("Settings update failed"); }
    return result;
  }

}