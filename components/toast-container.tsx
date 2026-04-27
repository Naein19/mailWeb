'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useToastStore } from '@/lib/toast'
import { Check, X, AlertCircle, Info } from 'lucide-react'

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Check className="w-4 h-4" />
      case 'error':
        return <X className="w-4 h-4" />
      case 'warning':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Info className="w-4 h-4" />
    }
  }

  const getColors = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-4 border-emerald-500 bg-emerald-500/10 text-emerald-400'
      case 'error':
        return 'border-l-4 border-red-500 bg-red-500/10 text-red-400'
      case 'warning':
        return 'border-l-4 border-amber-500 bg-amber-500/10 text-amber-400'
      default:
        return 'border-l-4 border-blue-500 bg-blue-500/10 text-blue-400'
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg backdrop-blur-md border border-white/10 bg-background pointer-events-auto ${getColors(
              toast.type
            )}`}
          >
            {getIcon(toast.type)}
            <span className="text-sm font-bold">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-auto p-1 hover:bg-white/10 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
