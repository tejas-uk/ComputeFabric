/**
 * @description
 * Layout component for the Dashboard section of the application.
 * This wraps all pages within the dashboard directory.
 *
 * Key features:
 * - Consistent layout for all dashboard pages
 * - Passes children through with proper typing
 *
 * @dependencies
 * - Next.js: For app router and server components
 *
 * @notes
 * - This is a server component by default in Next.js app router
 * - Can be extended to include dashboard-specific UI elements shared across dashboard pages
 */

import React from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="dashboard-layout">
      {children}
    </div>
  );
}