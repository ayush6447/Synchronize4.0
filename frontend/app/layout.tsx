import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

import localFont from 'next/font/local'

const timesSans = localFont({
  src: '../font/times_sans_serif/TIMESS__.ttf',
  variable: '--font-times-sans',
})

const playfairLocal = localFont({
  src: '../font/Playfair/Playfair-VariableFont_opsz,wdth,wght.ttf',
  variable: '--font-playfair-local',
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: 'Title Integrity System - PRGI Title Verification & Compliance System',
  description: 'Intelligent title similarity detection and compliance validation for the Press Registrar General of India. NLP-powered semantic analysis across 160,000+ registered titles.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/custom-logo.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/custom-logo.svg',
  },
}

export const viewport: Viewport = {
  themeColor: '#121113',
  userScalable: true,
}

import { WalletProvider } from '@/context/wallet-context'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${timesSans.variable} ${playfairLocal.variable} ${geistMono.variable} antialiased`}>
        <WalletProvider>
          {children}
        </WalletProvider>
        <Analytics />
      </body>
    </html>
  )
}
