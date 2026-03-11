import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/providers/auth-provider'
import ConditionalHeader from '@/components/layout/conditional-header'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Navanta Exim - AI-Driven Global Marketing for Engineering Manufacturers',
  description:
    'Connect with verified global buyers across 50+ countries. AI-powered marketing solutions for engineering goods manufacturers.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className="font-sans antialiased"
        suppressHydrationWarning
      >

        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('scrollRestoration' in history) {
                history.scrollRestoration = 'manual';
              }
            `,
          }}
        />

        <AuthProvider>

          {/* Only show header outside marketplace */}
          <ConditionalHeader />

          {children}

          <Analytics />

        </AuthProvider>
      </body>
    </html>
  )
}