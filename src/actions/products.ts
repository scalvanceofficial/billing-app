"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Unit } from "@prisma/client"; // Enum for product units
import * as XLSX from "xlsx";

const productSchema = z.object({
  nameHindi: z.string().min(1, "हिंदी नाव आवश्यक आहे"),
  nameEnglish: z.string().optional(),
  unit: z.nativeEnum(Unit),
  price: z.number().positive("किंमत शून्यापेक्षा जास्त असणे आवश्यक आहे"),
  proof: z.string().optional(),
  description: z.string().optional(),
});

export async function createProduct(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const data = {
    nameHindi: formData.get("nameHindi") as string,
    nameEnglish: (formData.get("nameEnglish") as string) || undefined,
    unit: formData.get("unit") as Unit,
    price: parseFloat(formData.get("price") as string),
    proof: (formData.get("proof") as string) || undefined,
    description: (formData.get("description") as string) || undefined,
  };

  const parsed = productSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten() };

  await prisma.product.create({ data: parsed.data });
  revalidatePath("/dashboard/products");
  return { success: true };
}

export async function updateProduct(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const data = {
    nameHindi: formData.get("nameHindi") as string,
    nameEnglish: (formData.get("nameEnglish") as string) || undefined,
    unit: formData.get("unit") as Unit,
    price: parseFloat(formData.get("price") as string),
    proof: (formData.get("proof") as string) || undefined,
    description: (formData.get("description") as string) || undefined,
  };

  const parsed = productSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten() };

  await prisma.product.update({ where: { id }, data: parsed.data });
  revalidatePath("/dashboard/products");
  return { success: true };
}

export async function deleteProduct(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized");

  await prisma.product.delete({ where: { id } });
  revalidatePath("/dashboard/products");
  return { success: true };
}

export async function getProducts(search?: string, unit?: Unit) {
  const where = {
    ...(search && {
      OR: [
        { nameHindi: { contains: search, mode: "insensitive" as const } },
        { nameEnglish: { contains: search, mode: "insensitive" as const } },
      ],
    }),
    ...(unit && { unit }),
  };

  return prisma.product.findMany({
    where,
    orderBy: { nameHindi: "asc" },
  });
}

export async function bulkImportProducts(fileBuffer: ArrayBuffer) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized");

  const workbook = XLSX.read(fileBuffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet) as Record<string, string | number>[];

  let imported = 0;
  const errors: string[] = [];

  for (const row of rows) {
    try {
      const nameHindi = String(row["nameHindi"] || row["name"] || row["Hindi Name"] || "").trim();
      if (!nameHindi) continue;

      const unit = String(row["unit"] || "KG").toUpperCase() as Unit;
      const price = parseFloat(String(row["price"] || row["Price"] || "0"));

      await prisma.product.upsert({
        where: { nameHindi } as never,
        update: { 
          price, 
          unit: unit in Unit ? unit : Unit.KG,
          proof: String(row["proof"] || row["प्रमाण"] || row["Proof"] || "").trim() || undefined,
        },
        create: {
          nameHindi,
          nameEnglish: String(row["nameEnglish"] || row["English Name"] || "").trim() || undefined,
          unit: unit in Unit ? unit : Unit.KG,
          price,
          proof: String(row["proof"] || row["प्रमाण"] || row["Proof"] || "").trim() || undefined,
          description: String(row["description"] || "").trim() || undefined,
        },
      });
      imported++;
    } catch (e: any) {
      errors.push(String(e));
    }
  }

  revalidatePath("/dashboard/products");
  return { imported, errors };
}
