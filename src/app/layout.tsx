import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Judgement',
  description: 'A trick-taking card game',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-emerald-950 via-green-900 to-teal-950 text-white overflow-x-hidden">
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.15),transparent_50%)] pointer-events-none" />
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  )
}
