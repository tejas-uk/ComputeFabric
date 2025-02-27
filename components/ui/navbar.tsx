/**
 * @description
 * Navigation bar component for the ComputeFabric dashboard.
 * Provides links to main sections of the application.
 *
 * Key features:
 * - Responsive design
 * - Active link highlighting
 * - ComputeFabric branding
 *
 * @dependencies
 * - Next.js: For navigation and pathname
 * - lucide-react: For icons
 * - Tailwind CSS: For styling
 *
 * @notes
 * - Fixed to the top of the viewport
 * - Includes logo and main navigation links
 * - Active route is highlighted
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Cpu, LayoutDashboard, List, User } from "lucide-react";

/**
 * Navigation bar component
 */
export function Navbar() {
  // Get current pathname to determine active link
  const pathname = usePathname();

  // Navigation links configuration
  const navLinks = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Jobs",
      href: "/jobs",
      icon: List,
    },
    {
      name: "GPU Owners",
      href: "/gpu-owners",
      icon: User,
    },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand name */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Cpu className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                ComputeFabric
              </span>
            </div>
          </div>

          {/* Navigation links */}
          <div className="flex items-center">
            <div className="hidden md:ml-6 md:flex md:space-x-4">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "inline-flex items-center px-3 py-2 text-sm font-medium rounded-md",
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <Icon className="mr-1.5 h-4 w-4" />
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}