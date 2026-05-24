import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  try {
    let settings = await prisma.settings.findFirst();
    
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          id: 1,
          shopName: process.env.NEXT_PUBLIC_SHOP_NAME || "श्री मसाला भांडार",
          address: process.env.NEXT_PUBLIC_SHOP_ADDRESS || "पुणे, महाराष्ट्र",
          phone1: process.env.NEXT_PUBLIC_SHOP_PHONE || "+91 98765 43210",
        }
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    const settings = await prisma.settings.upsert({
      where: { id: 1 },
      update: {
        shopName: data.shopName,
        logoUrl: data.logoUrl,
        address: data.address,
        phone1: data.phone1,
        phone2: data.phone2,
        phone3: data.phone3,
        gstNumber: data.gstNumber,
        fssaiNumber: data.fssaiNumber,
      },
      create: {
        id: 1,
        shopName: data.shopName,
        logoUrl: data.logoUrl,
        address: data.address,
        phone1: data.phone1,
        phone2: data.phone2,
        phone3: data.phone3,
        gstNumber: data.gstNumber,
        fssaiNumber: data.fssaiNumber,
      }
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
