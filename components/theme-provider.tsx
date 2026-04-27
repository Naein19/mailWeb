'use client'

import { useEffect } from 'react'
import { useDashboardStore } from '@/lib/store'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useDashboardStore((state) => state.theme)

  useEffect(() => {
    const root = window.document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  return <>{children}</>
}
