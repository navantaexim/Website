import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const categories = await prisma.engineeringCategory.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true }
    });

    const machineCategories = await prisma.machineCategory.findMany({
      orderBy: { name: 'asc' },
      include: {
        machines: {
          orderBy: { name: 'asc' },
          select: { id: true, name: true }
        }
      }
    });

    return NextResponse.json({ categories, machineCategories });
  } catch (error) {
    console.error("Failed to fetch manufacturing options:", error);
    return NextResponse.json({ error: "Failed to fetch manufacturing options" }, { status: 500 });
  }
}
