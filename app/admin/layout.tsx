import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin-guard'
import { NextResponse } from 'next/server'
import Link from 'next/link'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const adminCheck = await requireAdmin()

  // Redirect to login if not admin (requireAdmin returns NextResponse for 401/403)
  if (adminCheck instanceof NextResponse) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-neutral-200 hidden md:block">
        <div className="p-6">
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Admin Panel</h2>
          <p className="text-xs text-neutral-500 mt-1 uppercase tracking-widest font-semibold italic">Verification Hub</p>
        </div>
        <nav className="px-4 space-y-2">
          <Link
            href="/admin/sellers"
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-neutral-700 hover:bg-neutral-100 transition-all font-medium"
          >
            <span>Sellers</span>
          </Link>
          <Link
            href="/admin/products"
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-neutral-700 hover:bg-neutral-100 transition-all font-medium"
          >
            <span>Products</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
