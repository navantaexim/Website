import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sellerUser = await prisma.sellerUser.findFirst({
      where: {
        userId: user.id
      },
      include: {
        seller: {
          include: {
            addresses: true,
            documents: true,
            capabilities: {
              include: {
                engineeringCategories: true,
                machines: true
              }
            },
            certificates: true,
            exportProfile: {
              include: {
                markets: true,
                incoterms: true,
                hsExpertise: true
              }
            }
          }
        }
      }
    });

    if (!sellerUser) {
      return NextResponse.json({ seller: null });
    }

    const mergedSeller = {
      ...sellerUser.seller,
      phone: sellerUser.phone,
      designation: sellerUser.designation,
      whatsapp: sellerUser.whatsapp
    };

    return NextResponse.json({ seller: mergedSeller });

  } catch (error) {
    console.error('Error fetching seller:', error);

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}