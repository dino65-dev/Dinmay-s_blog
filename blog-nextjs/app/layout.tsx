import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster } from '@/components/providers/toaster'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Dinmay's Blog - Thoughts, Ideas & Stories",
  description: "A modern blog about technology, coding, and life. Built with Next.js and Appwrite.",
  keywords: ["blog", "technology", "coding", "web development", "programming"],
  authors: [{ name: "Dinmay" }],
  openGraph: {
    title: "Dinmay's Blog",
    description: "Sharing thoughts, ideas, and stories about technology, coding, and life.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
