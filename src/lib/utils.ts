/**
 * Utility Functions
 * 
 * This file contains common utility functions used throughout the application.
 * Currently provides the `cn` function for merging Tailwind CSS classes
 * using clsx and tailwind-merge for optimal class name handling.
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
