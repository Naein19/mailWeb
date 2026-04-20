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
        return 'bg-green-500/20 border-green-500/30 text-green-300'
      case 'error':
        return 'bg-red-500/20 border-red-500/30 text-red-300'
      case 'warning':
        return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300'
      default:
        return 'bg-blue-500/20 border-blue-500/30 text-blue-300'
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.2 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-md ${getColors(
              toast.type
            )}`}
          >
            {getIcon(toast.type)}
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 p-1 hover:bg-white/10 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
