/**
 * @description
 * Utility functions for the ComputeFabric application.
 * 
 * Key features:
 * - Class name merging with conditional logic
 * 
 * @dependencies
 * - clsx: For conditional class name concatenation
 * - tailwind-merge: For merging Tailwind CSS classes properly
 * 
 * @notes
 * - This file should contain only pure utility functions
 * - Add additional utility functions here as needed
 */

import clsx, { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges multiple class names or conditional class objects into a single string
 * Combines clsx for conditionals with tailwind-merge to handle Tailwind class conflicts
 *
 * @param inputs - Array of class strings, objects, or arrays to be merged
 * @returns A merged class string with conflicts resolved
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as currency (USD)
 * 
 * @param amount - The amount to format
 * @returns Formatted string (e.g., "$10.50")
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Truncates a string if it exceeds the specified length
 * 
 * @param str - The string to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated string with ellipsis if needed
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
}