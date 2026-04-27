import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseSenderEmail(sender: string): string {
  // handles "John Doe <john@example.com>" → "john@example.com"
  // handles "john@example.com" → "john@example.com"
  const match = sender.match(/<([^>]+)>/)
  return match ? match[1].trim() : sender.trim()
}

export function parseSenderName(sender: string): string {
  // handles "John Doe <john@example.com>" → "John Doe"
  // handles "john@example.com" → "john@example.com"
  const match = sender.match(/^(.+?)\s*</)
  return match ? match[1].trim() : sender.trim()
}

export function getAvatarColor(email: string): string {
  // Deterministic color from email hash (8-color palette)
  const hash = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const colors = [
    'from-blue-500 to-blue-600',
    'from-purple-500 to-purple-600',
    'from-pink-500 to-pink-600',
    'from-amber-500 to-amber-600',
    'from-emerald-500 to-emerald-600',
    'from-rose-500 to-rose-600',
    'from-indigo-500 to-indigo-600',
    'from-cyan-500 to-cyan-600',
  ]
  return colors[hash % colors.length]
}

export function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]+>/g, '')
}

export function formatDateShort(timestamp: string): string {
  const date = new Date(timestamp)
  const today = new Date()
  const isCurrentYear = date.getFullYear() === today.getFullYear()
  
  if (isCurrentYear) {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

export function decodeHTMLEntities(html: string): string {
  // Decode common HTML entities
  const entities: Record<string, string> = {
    '&nbsp;': ' ',
    '&ndash;': '–',
    '&mdash;': '—',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
  }
  
  let decoded = html
  Object.entries(entities).forEach(([entity, char]) => {
    decoded = decoded.split(entity).join(char)
  })
  
  // Handle numeric entities &#123; and &#x1F;
  decoded = decoded.replace(/&#(\d+);/g, (_match, dec) => String.fromCharCode(parseInt(dec, 10)))
  decoded = decoded.replace(/&#x([a-fA-F0-9]+);/g, (_match, hex) => String.fromCharCode(parseInt(hex, 16)))
  
  return decoded
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
