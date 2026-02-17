import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-140px)] flex-col items-center justify-center bg-background px-4 py-12 text-center sm:px-6 lg:px-8">
      <div className="space-y-4">
        {/* Large distinctive 404 background */}
        <h1 className="select-none text-9xl font-black text-primary/10 sm:text-[12rem]">
          404
        </h1>
        
        {/* Content overlay */}
        <div className="-mt-16 space-y-4 sm:-mt-24">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Page not found
          </h2>
          <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved, deleted, or possibly never existed.
          </p>
        </div>
      </div>

      <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Button asChild size="lg" className="min-w-[160px]">
          <Link href="/">
            Back to Home
          </Link>
        </Button>
        <Button variant="outline" size="lg" asChild className="min-w-[160px]">
          <Link href="/#contact">
            Contact Support
          </Link>
        </Button>
      </div>
    </div>
  )
}
