/**
 * @description
 * Root layout for the entire Next.js application.
 * This wraps every route in the `app` directory.
 *
 * Key features:
 * - Imports global styles
 * - Sets metadata for the app
 * - Includes the global navigation
 * - Provides consistent layout for all pages
 *
 * @dependencies
 * - Next.js: For app router
 * - components/ui/navbar: For site navigation
 * 
 * @notes
 * - The body has padding-top to accommodate the fixed navbar
 * - Main content is contained in a max-width container with proper padding
 * - This is a server component by default in Next.js app router
 */

import './globals.css'
import React from 'react'
import { Navbar } from '@/components/ui/navbar'

export const metadata = {
  title: 'ComputeFabric MVP',
  description: 'A decentralized GPU compute platform'
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        {/* Global navigation */}
        <Navbar />
        
        {/* Main content area with padding for fixed navbar */}
        <main className="pt-20 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {children}
        </main>
      </body>
    </html>
  )
}