import type { Metadata } from 'next'
import './globals.css'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'

export const metadata: Metadata = {
  title: '宠伴 PetMate - 宠护90天',
  description: '每天一张行动卡，陪你安心养猫。',
  manifest: '/manifest.json',
  themeColor: '#FF6B6B',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '宠伴 PetMate',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="icon" href="/icons/icon-512.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-screen bg-petmate-bg">
        <ServiceWorkerRegistration />
        <main className="max-w-md mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  )
}