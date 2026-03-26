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
                incoterms: {
                  include: {
                    incoterm: true // 👈 join with master table
                  }
                },
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

    const sellerData = sellerUser.seller;

    const transformedSeller = {
      ...sellerData,
      exportProfile: sellerData.exportProfile
        ? {
            ...sellerData.exportProfile,
            incoterms: sellerData.exportProfile.incoterms.map(i => ({
              incotermId: i.incoterm.code // 👈 convert ID → CODE
            }))
          }
        : null,
    };

    const mergedSeller = {
      ...transformedSeller,
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