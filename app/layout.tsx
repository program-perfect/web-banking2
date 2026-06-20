import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Press_Start_2P } from 'next/font/google'
import { AppPreferencesProvider } from '@/components/banking/app-preferences'
import { PixelCursor } from '@/components/banking/pixel-cursor'
import './globals.css'
import './globals.css.append.css'
import './globals.mobile-effects.css'
import './globals.cursor-and-celebration.css'
import './globals.pr6-panel-fixes.css'
import './globals.transfer-celebration-fix.css'
import './globals.hover-pattern-motion.css'
import './globals.performance-budget.css'
import './globals.scene-theme.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})
const pressStart = Press_Start_2P({
  variable: '--font-press-start',
  subsets: ['latin'],
  weight: '400',
})

export const metadata: Metadata = {
  title: 'VOXEL',
  description: 'A neo-brutalist pixel interface with settings, cursor controls and localized flows.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#ffffff',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ru"
      className={`light ${geistSans.variable} ${geistMono.variable} ${pressStart.variable} bg-background`}
    >
      <body className="font-mono antialiased">
        <AppPreferencesProvider>
          <PixelCursor />
          {children}
        </AppPreferencesProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
