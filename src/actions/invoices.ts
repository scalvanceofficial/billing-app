"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { generateInvoiceNo } from "@/lib/utils";
import { Unit } from "@prisma/client";

export interface InvoiceItemInput {
  productId?: string;
  nameHindi: string;
  nameEnglish?: string;
  unit: Unit;
  proof?: string;
  quantity: number;
  rate: number;
  amount: number;
}

export async function createInvoice(data: {
  customerName: string;
  phone?: string;
  address?: string;
  gstin?: string;
  gstRate: number;
  notes?: string;
  items: InvoiceItemInput[];
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const subtotal = data.items.reduce((sum, item) => sum + item.amount, 0);
  const gstAmount = (subtotal * data.gstRate) / 100;
  const grandTotal = subtotal + gstAmount;

  try {
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNo: generateInvoiceNo(),
        customerName: data.customerName,
        phone: data.phone,
        address: data.address,
        gstin: data.gstin,
        subtotal,
        gstRate: data.gstRate,
        gstAmount,
        grandTotal,
        notes: data.notes,
        createdById: session.user.id,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            nameHindi: item.nameHindi,
            nameEnglish: item.nameEnglish,
            unit: item.unit,
            proof: item.proof,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount,
          })),
        },
      },
      include: { items: true, createdBy: true },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/invoices");
    return { success: true, invoice };
  } catch (error: any) {
    console.error("❌ [CREATE INVOICE ERROR]:", error);
    
    // Check for Prisma foreign key error
    if (error.code === 'P2003') {
      return { 
        success: false, 
        error: "Session Error: Your login session might be outdated due to a system restart. Please LOGOUT and LOGIN again to continue." 
      };
    }
    
    return { success: false, error: error.message || "Failed to create invoice" };
  }
}

export async function getInvoice(id: string) {
  return prisma.invoice.findUnique({
    where: { id },
    include: { items: true, createdBy: true },
  });
}

export async function getInvoices(page = 1, search?: string) {
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  const where = search
    ? {
        OR: [
          { customerName: { contains: search, mode: "insensitive" as const } },
          { invoiceNo: { contains: search, mode: "insensitive" as const } },
          { phone: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: { createdBy: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.invoice.count({ where }),
  ]);

  return { invoices, total, pages: Math.ceil(total / pageSize) };
}

export async function getDashboardStats(days = 30) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const rangeStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  const [todaySales, monthSales, yearSales, recentInvoices, topProducts, topCategories] =
    await Promise.all([
      prisma.invoice.aggregate({
        where: { createdAt: { gte: todayStart } },
        _sum: { grandTotal: true },
        _count: true,
      }),
      prisma.invoice.aggregate({
        where: { createdAt: { gte: monthStart } },
        _sum: { grandTotal: true },
        _count: true,
      }),
      prisma.invoice.aggregate({
        where: { createdAt: { gte: yearStart } },
        _sum: { grandTotal: true },
        _count: true,
      }),
      prisma.invoice.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { createdBy: { select: { name: true } } },
      }),
      prisma.invoiceItem.groupBy({
        by: ["nameHindi"],
        where: { invoice: { createdAt: { gte: rangeStart } } },
        _sum: { amount: true, quantity: true },
        orderBy: { _sum: { amount: "desc" } },
        take: 5,
      }),
      prisma.category.findMany({
        include: {
          products: {
            include: {
              product: {
                include: {
                  invoiceItems: {
                    where: { invoice: { createdAt: { gte: rangeStart } } },
                    select: { amount: true },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

  // Compute category totals
  const categoryTotals = topCategories
    .map((cat: any) => ({
      name: cat.name,
      total: cat.products.reduce(
        (sum: number, cp: any) =>
          sum + cp.product.invoiceItems.reduce((s: number, ii: any) => s + ii.amount, 0),
        0
      ),
    }))
    .sort((a: any, b: any) => b.total - a.total)
    .slice(0, 5);

  return {
    today: { total: todaySales._sum.grandTotal || 0, count: todaySales._count },
    month: { total: monthSales._sum.grandTotal || 0, count: monthSales._count },
    year: { total: yearSales._sum.grandTotal || 0, count: yearSales._count },
    recentInvoices,
    topProducts: topProducts.map((p: any) => ({
      name: p.nameHindi,
      amount: p._sum.amount || 0,
      quantity: p._sum.quantity || 0,
    })),
    topCategories: categoryTotals,
  };
}
