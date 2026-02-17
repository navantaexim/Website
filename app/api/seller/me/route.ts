
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    // If not logged in, return 401
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the seller linked to this user
    const sellerUser = await prisma.sellerUser.findFirst({
      where: { 
        userId: user.id 
      },
      include: {
        seller: {
          include: {
            addresses: true, // Include addresses
            documents: true, // Include documents
            capabilities: true,
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

    // If no seller account found for this user
    if (!sellerUser) {
      return NextResponse.json({ seller: null });
    }

    // Return the seller details
    return NextResponse.json({ seller: sellerUser.seller });
    
  } catch (error) {
    console.error('Error fetching seller:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
