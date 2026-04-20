'use client'

import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface ResizablePanelProps {
  children: React.ReactNode
  minWidth?: number
  maxWidth?: number
  defaultWidth?: number
  storageKey?: string
}

export function ResizablePanel({
  children,
  minWidth = 300,
  maxWidth = 600,
  defaultWidth = 320,
  storageKey = 'cluster-panel-width',
}: ResizablePanelProps) {
  const [width, setWidth] = useState(defaultWidth)
  const [isResizing, setIsResizing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Load saved width on mount
  useEffect(() => {
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      const parsed = parseInt(saved, 10)
      if (!isNaN(parsed) && parsed >= minWidth && parsed <= maxWidth) {
        setWidth(parsed)
      }
    }
  }, [minWidth, maxWidth, storageKey])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true)
    e.preventDefault()
  }

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const newWidth = e.clientX - rect.left

      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setWidth(newWidth)
        localStorage.setItem(storageKey, String(newWidth))
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, minWidth, maxWidth, storageKey])

  return (
    <div ref={containerRef} style={{ width: `${width}px` }} className="relative flex flex-col">
      {/* Resizable content */}
      <div className="flex-1 overflow-hidden">{children}</div>

      {/* Drag handle */}
      <motion.div
        onMouseDown={handleMouseDown}
        animate={{ opacity: isResizing ? 1 : 0.3, x: isResizing ? 0 : -2 }}
        transition={{ duration: 0.2 }}
        className={`absolute -right-1 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500/0 via-blue-500/50 to-blue-500/0 cursor-col-resize hover:via-blue-500/100 transition-opacity group ${
          isResizing ? 'opacity-100' : ''
        }`}
      >
        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-5 h-10 rounded flex items-center justify-center group-hover:bg-white/5">
          <div className="w-1 h-6 bg-blue-500/50 rounded-full" />
        </div>
      </motion.div>
    </div>
  )
}
