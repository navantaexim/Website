
import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAuth } from '@/lib/firebase-admin'
import prisma from '@/lib/db'
import { Prisma } from '@prisma/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { CreateProductDialog } from '@/components/seller/products/create-product-dialog'
import { Package, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

async function getSellerData() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')?.value

  if (!sessionCookie) return null

  try {
    const decodedToken = await getAuth().verifySessionCookie(sessionCookie, true)
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
    })

    if (!user) return null

    const seller = await prisma.seller.findFirst({
      where: {
        users: {
          some: {
            userId: user.id
          }
        }
      },
      include: {
        products: {
          orderBy: { updatedAt: 'desc' },
          include: {
            category: true,
            originCountry: true,
          }
        }
      }
    }) as Prisma.SellerGetPayload<{
      include: {
        products: {
          include: {
            category: true,
            originCountry: true,
          }
        }
      }
    }> | null

    return seller
  } catch (error) {
    console.error('Error fetching seller data:', error)
    return null
  }
}

async function getCommonData() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true }
  })
  
  const countries = await prisma.country.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true }
  })

  return { categories, countries }
}

export default async function SellerProductsPage() {
  const seller = await getSellerData()
  const { categories, countries } = await getCommonData()

  if (!seller) {
    redirect('/seller/onboarding')
  }

  // If seller is not verified/active, they might see a limited view or redirect
  // But let's show the list anyway, maybe with disabled actions if needed.
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your product listings and inventory.</p>
        </div>
        <CreateProductDialog sellerId={seller.id} categories={categories} countries={countries} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
          <CardDescription>
            You have {seller.products.length} product(s) listed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {seller.products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-muted/50 p-4 rounded-full mb-4">
                <Package className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No products found</h3>
              <p className="text-muted-foreground mt-1 mb-4 max-w-sm">
                You haven't listed any products yet. Create your first product to start selling globally.
              </p>
              <CreateProductDialog sellerId={seller.id} categories={categories} countries={countries} />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {seller.products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                        <Link href={`/products/${product.id}`} className="hover:underline">
                            {product.name}
                        </Link>
                    </TableCell>
                    <TableCell>{product.category.name}</TableCell>
                    <TableCell>
                      <Badge variant={
                        product.status === 'active' ? 'default' : 
                        product.status === 'draft' ? 'secondary' : 
                        product.status === 'rejected' ? 'destructive' : 'outline'
                      }>
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell>-</TableCell> {/* Price not in schema yet? */}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/products/${product.id}`}>
                                <Edit className="mr-2 h-4 w-4" /> Edit Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
