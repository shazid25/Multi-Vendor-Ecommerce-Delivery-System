import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 0,
  }).format(amount)
}

// Add this missing function:
export function formatDate(date: Date | string | number) {
  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date))
}