/**
 * @description
 * Layout component for the Jobs section of the application.
 * This wraps all pages within the jobs directory.
 *
 * Key features:
 * - Consistent layout for all job-related pages
 * - Passes children through with proper typing
 *
 * @dependencies
 * - Next.js: For app router and server components
 *
 * @notes
 * - This is a server component by default in Next.js app router
 * - Can be extended to include job-specific UI elements shared across job pages
 */

import React from "react";

interface JobsLayoutProps {
  children: React.ReactNode;
}

export default async function JobsLayout({ children }: JobsLayoutProps) {
  return (
    <div className="jobs-layout">
      {children}
    </div>
  );
}