import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Judgement',
  description: 'A trick-taking card game',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-green-900 text-white">
        {children}
      </body>
    </html>
  )
}
