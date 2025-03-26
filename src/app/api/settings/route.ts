import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { SettingsService } from "@/app/lib/services/settings-service";
import { NextResponse } from "next/server";

const settingsService = new SettingsService();

export async function PUT(request: Request, {params}: {params: {id: string}}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const { darkMode, emailNotifications } = body;

    const updatedSettings = settingsService.updateOrCreateSettings({
      darkMode,
      emailNotifications,
      userId: session.user.id,
    });

    return NextResponse.json(updatedSettings, { status: 200 });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, {
      status: 500,
    });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const settings = await prisma.settings.findUnique({
      where: { userId: session.user.id },
    });
    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, {
      status: 500,
    });
  }
}
