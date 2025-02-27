/**
 * @description
 * Root page component that redirects users to the dashboard.
 * In a production app, this might be a landing page for non-logged-in users.
 *
 * Key features:
 * - Redirects to /dashboard
 *
 * @dependencies
 * - Next.js: For redirect
 *
 * @notes
 * - This is a server component by default in Next.js app router
 * - Could be expanded to a full landing page with marketing content
 */

import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/dashboard');
}