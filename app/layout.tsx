import type { Metadata } from 'next'
import { Open_Sans } from 'next/font/google'
import { Providers } from '@/components/providers'
import './globals.css'
import { Analytics } from "@vercel/analytics/next"
import { GoogleAnalytics } from '@next/third-parties/google'
import { Suspense } from 'react'
import { AnalyticsReporter } from '@/components/analytics-reporter'

const openSans = Open_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-open-sans',
})

export const metadata: Metadata = {
  title: 'Amoga App',
  description: 'Demo Company',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en' suppressHydrationWarning className={openSans.variable}>
      <body className={openSans.className} suppressHydrationWarning>
        <Providers>
          <Suspense fallback={null}>
            <AnalyticsReporter />
          </Suspense>
          {children}
          <Analytics />
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ''} />
        </Providers>
      </body>
    </html>
  )
}
