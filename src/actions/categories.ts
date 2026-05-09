"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { Unit } from "@prisma/client";
import * as XLSX from "xlsx";

export async function createCategory(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  if (!name?.trim()) return { error: "श्रेणीचे नाव आवश्यक आहे" };

  const productsDataStr = formData.get("productsData") as string;
  const productsData = productsDataStr ? JSON.parse(productsDataStr) : [];

  const category = await prisma.category.create({
    data: {
      name: name.trim(),
      products: {
        create: productsData.map((p: any, idx: number) => ({
          productId: p.productId,
          price: p.price,
          unit: p.unit,
          proof: p.proof,
          order: idx + 1,
        })),
      },
    },
  });

  revalidatePath("/dashboard/categories");
  return { success: true, id: category.id };
}

export async function updateCategory(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const productsDataStr = formData.get("productsData") as string;
  const productsData = productsDataStr ? JSON.parse(productsDataStr) : [];

  await prisma.categoryProduct.deleteMany({ where: { categoryId: id } });
  await prisma.category.update({
    where: { id },
    data: {
      name: name.trim(),
      products: {
        create: productsData.map((p: any, idx: number) => ({
          productId: p.productId,
          price: p.price,
          unit: p.unit,
          proof: p.proof,
          order: idx + 1,
        })),
      },
    },
  });

  revalidatePath("/dashboard/categories");
  return { success: true };
}

export async function bulkImportCategoryProducts(fileBuffer: ArrayBuffer) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const workbook = XLSX.read(fileBuffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet) as Record<string, string | number>[];

  const importedProducts = [];

  for (const row of rows) {
    const nameHindi = String(row["nameHindi"] || row["name"] || row["Hindi Name"] || "").trim();
    if (!nameHindi) continue;

    const unitStr = String(row["unit"] || "KG").toUpperCase();
    const unit = (Object.values(Unit).includes(unitStr as Unit) ? unitStr : Unit.KG) as Unit;
    const price = parseFloat(String(row["price"] || row["Price"] || "0"));
    const proof = String(row["proof"] || row["प्रमाण"] || row["Proof"] || "").trim() || undefined;

    // Upsert global product
    const product = await prisma.product.upsert({
      where: { nameHindi },
      update: { 
        price, 
        unit,
        proof
      },
      create: {
        nameHindi,
        nameEnglish: String(row["nameEnglish"] || row["English Name"] || "").trim() || undefined,
        unit,
        price,
        proof
      },
    });

    importedProducts.push({
      productId: product.id,
      nameHindi: product.nameHindi,
      nameEnglish: product.nameEnglish,
      unit,
      price,
      proof
    });
  }

  return importedProducts;
}

export async function deleteCategory(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized");

  await prisma.category.delete({ where: { id } });
  revalidatePath("/dashboard/categories");
  return { success: true };
}

export async function getCategoryWithProducts(id: string) {
  return prisma.category.findUnique({
    where: { id },
    include: {
      products: {
        include: { product: true },
        orderBy: { order: "asc" },
      },
    },
  });
}
