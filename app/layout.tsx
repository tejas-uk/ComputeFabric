/**
 * @description
 * Root layout for the entire Next.js application.
 * This wraps every route in the `app` directory.
 *
 * Key features:
 * - Imports global styles
 * - Sets metadata for the app
 *
 * @notes
 * - You can add a global header or nav here if desired.
 */

import './globals.css'
import React from 'react'

export const metadata = {
  title: 'ComputeFabric MVP',
  description: 'A decentralized GPU compute platform'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
