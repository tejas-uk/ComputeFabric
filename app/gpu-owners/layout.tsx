/**
 * @description
 * Layout component for the GPU Owners section of the application.
 * This wraps all pages within the gpu-owners directory.
 *
 * Key features:
 * - Consistent layout for all GPU owner related pages
 * - Passes children through with proper typing
 *
 * @dependencies
 * - Next.js: For app router and server components
 *
 * @notes
 * - This is a server component by default in Next.js app router
 * - Can be extended to include GPU owner specific UI elements shared across pages
 */

import React from "react";

interface GPUOwnersLayoutProps {
  children: React.ReactNode;
}

export default async function GPUOwnersLayout({ children }: GPUOwnersLayoutProps) {
  return (
    <div className="gpu-owners-layout">
      {children}
    </div>
  );
}