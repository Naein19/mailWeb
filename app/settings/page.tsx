'use client'

import { Settings, Mail, Database, Bell } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    errorAlerts: true,
    darkMode: true,
    autoRefresh: true,
  })

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="border-b border-white/10 glass px-8 py-6 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-amber-500" />
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-gray-400 text-sm">Configure your dashboard preferences</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={container}
        className="flex-1 p-8 overflow-y-auto max-w-2xl"
      >
        {/* Notification Settings */}
        <motion.div variants={item} className="glass border border-white/10 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold">Notifications</h2>
          </div>

          <div className="space-y-4">
            <SettingToggle
              label="Email Notifications"
              description="Receive notifications for new email clusters"
              checked={settings.emailNotifications}
              onChange={() => handleToggle('emailNotifications')}
            />
            <SettingToggle
              label="Error Alerts"
              description="Get notified when processing errors occur"
              checked={settings.errorAlerts}
              onChange={() => handleToggle('errorAlerts')}
            />
          </div>
        </motion.div>

        {/* Display Settings */}
        <motion.div variants={item} className="glass border border-white/10 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Mail className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-semibold">Display</h2>
          </div>

          <div className="space-y-4">
            <SettingToggle
              label="Dark Mode"
              description="Use dark theme for the application"
              checked={settings.darkMode}
              onChange={() => handleToggle('darkMode')}
            />
          </div>
        </motion.div>

        {/* System Settings */}
        <motion.div variants={item} className="glass border border-white/10 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-5 h-5 text-green-500" />
            <h2 className="text-lg font-semibold">System</h2>
          </div>

          <div className="space-y-4">
            <SettingToggle
              label="Auto-Refresh"
              description="Automatically refresh data every 5 minutes"
              checked={settings.autoRefresh}
              onChange={() => handleToggle('autoRefresh')}
            />
          </div>
        </motion.div>

        {/* About Section */}
        <motion.div variants={item} className="glass border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">About</h2>
          <div className="space-y-3 text-sm text-gray-400">
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <span>Application Version</span>
              <span className="font-semibold text-white">1.0.0</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <span>Database Status</span>
              <span className="font-semibold text-green-400">Connected</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Last Updated</span>
              <span className="font-semibold text-white">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
    </div>
  )
}

interface SettingToggleProps {
  label: string
  description: string
  checked: boolean
  onChange: () => void
}

function SettingToggle({ label, description, checked, onChange }: SettingToggleProps) {
  return (
    <div className="flex items-center justify-between pb-4 border-b border-white/5 last:border-b-0">
      <div>
        <p className="font-medium text-white">{label}</p>
        <p className="text-xs text-gray-400 mt-1">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-gray-700'
        }`}
      >
        <motion.div
          animate={{ x: checked ? 24 : 2 }}
          className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
        />
      </button>
    </div>
  )
}
