import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename based on current timestamp
    const ext = file.name.split('.').pop() || 'png';
    const filename = `logo-${Date.now()}.${ext}`;
    
    const uploadDir = join(process.cwd(), "public", "uploads");
    
    // Ensure directory exists
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // directory might already exist
    }

    const path = join(uploadDir, filename);
    await writeFile(path, buffer);

    return NextResponse.json({ 
      success: true, 
      url: `/uploads/${filename}` 
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
