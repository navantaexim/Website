import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin-guard'
import { NextResponse } from 'next/server'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Store, 
  Package, 
  ChevronLeft,
  Settings,
  Bell,
  Search,
  LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/button'

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

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Sellers', href: '/admin/sellers', icon: Store },
    { label: 'Products', href: '/admin/products', icon: Package },
  ]

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-neutral-200/60 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">N</span>
            </div>
            <h2 className="text-xl font-bold text-neutral-900 tracking-tighter">Navanta Admin</h2>
          </div>
          <p className="text-[10px] text-neutral-400 uppercase tracking-[0.2em] font-black italic ml-11">Command Center</p>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-all duration-200 group relative"
            >
              <item.icon className="w-[18px] h-[18px] text-neutral-400 group-hover:text-primary transition-colors" />
              <span className="font-bold text-sm">{item.label}</span>
              <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
              </div>
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-neutral-100">
          <Link href="/dashboard" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-neutral-500 hover:text-neutral-900 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm font-bold">User Dashboard</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-neutral-200/50 sticky top-0 z-10 px-8 flex items-center justify-between">
           <div className="relative max-w-md w-full hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input 
                type="text" 
                placeholder="Search sellers, products, hs codes..." 
                className="w-full pl-10 pr-4 py-2 bg-neutral-100/50 border-none rounded-xl text-sm font-medium focus:ring-2 ring-primary/20 transition-all"
              />
           </div>
           <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="rounded-full text-neutral-500 hover:text-neutral-900">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full text-neutral-500 hover:text-neutral-900">
                <Settings className="w-5 h-5" />
              </Button>
              <div className="h-8 w-[1px] bg-neutral-200 mx-2"></div>
              <div className="flex items-center gap-3 pl-2">
                 <div className="flex flex-col items-end hidden lg:flex">
                    <span className="text-xs font-black text-neutral-900 uppercase tracking-tighter">System Admin</span>
                    <span className="text-[10px] text-emerald-500 font-bold">Online Now</span>
                 </div>
                 <div className="w-10 h-10 rounded-full bg-neutral-100 border-2 border-white shadow-sm overflow-hidden">
                    <img src="https://ui-avatars.com/api/?name=Admin&background=0D0D0D&color=fff" alt="Avatar" />
                 </div>
              </div>
           </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-auto p-8 lg:p-12">
          {children}
        </main>
      </div>
    </div>
  )
}
