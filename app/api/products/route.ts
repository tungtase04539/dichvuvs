import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCache, setCache } from "@/lib/cache";

export const dynamic = "force-dynamic";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string | null;
  featured: boolean;
}

// Fast products API with caching
export async function GET() {
  try {
    // Check cache first
    const cached = getCache<Product[]>("products");
    if (cached) {
      return NextResponse.json({ products: cached, cached: true });
    }

    // Query only needed fields
    const products = await prisma.service.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        image: true,
        featured: true,
      },
      orderBy: [{ featured: "desc" }, { name: "asc" }],
    });

    // Cache for 5 minutes
    setCache("products", products, 300);

    return NextResponse.json({ products, cached: false });
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

