'use client'

import { Settings, Mail, Database, Bell, Copy, Check, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/sidebar'
import { ProtectedRoute } from '@/components/protected-route'
import { getWebhookUrl, saveWebhookUrl, sendWebhookReply } from '@/lib/webhook'
import { showToast } from '@/lib/toast'

function SettingsContent() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    errorAlerts: true,
    darkMode: true,
    autoRefresh: true,
  })
  const [webhookUrl, setWebhookUrl] = useState('')
  const [webhookInput, setWebhookInput] = useState('')
  const [testLoading, setTestLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  // Load webhook URL on mount
  useEffect(() => {
    const url = getWebhookUrl()
    if (url) {
      setWebhookUrl(url)
      setWebhookInput(url)
    }
  }, [])

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSaveWebhook = () => {
    if (!webhookInput.trim()) {
      showToast('Webhook URL cannot be empty', 'warning')
      return
    }

    // Validate URL format
    try {
      new URL(webhookInput)
    } catch {
      showToast('Invalid webhook URL format', 'error')
      return
    }

    saveWebhookUrl(webhookInput)
    setWebhookUrl(webhookInput)
    showToast('Webhook URL saved successfully', 'success')
  }

  const handleTestWebhook = async () => {
    if (!webhookUrl) {
      showToast('Please save a webhook URL first', 'warning')
      return
    }

    try {
      setTestLoading(true)
      const result = await sendWebhookReply(
        {
          cluster_id: 'test-cluster-id',
          cluster_title: 'Test Cluster',
          subject: 'Re: Test Email',
          recipients: ['test@example.com'],
          original_email_data: [{
            id: 'test-email-id',
            sender: 'Test User',
            sender_email: 'test@example.com',
            subject: 'Test Email',
            body: 'This is a test email for webhook verification.',
            timestamp: new Date().toISOString(),
          }],
          email_count: 1,
          timestamp: new Date().toISOString(),
        },
        webhookUrl
      )

      if (result.success) {
        showToast('Webhook connection successful!', 'success')
      } else {
        showToast(result.message || 'Webhook test failed', 'error')
      }
    } catch (error) {
      showToast('Error testing webhook', 'error')
    } finally {
      setTestLoading(false)
    }
  }

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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

        {/* Webhook Integration */}
        <motion.div variants={item} className="glass border border-white/10 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Mail className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold">n8n Webhook Integration</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Webhook URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={webhookInput}
                  onChange={(e) => setWebhookInput(e.target.value)}
                  placeholder="https://webhook.example.com/..."
                  className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm transition-all duration-200"
                />
                <button
                  onClick={handleSaveWebhook}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 text-sm font-medium"
                >
                  Save
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Configure your n8n webhook URL to enable automated reply functionality
              </p>
            </div>

            {webhookUrl && (
              <div className="pt-4 border-t border-white/5 space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-sm text-gray-300">Current Webhook:</span>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-black/30 px-2 py-1 rounded truncate max-w-xs">
                      {webhookUrl}
                    </code>
                    <button
                      onClick={handleCopyWebhook}
                      className="p-1 hover:bg-white/10 rounded transition-colors duration-200"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleTestWebhook}
                  disabled={testLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed rounded-lg transition-colors duration-200 text-sm font-medium"
                >
                  <Zap className="w-4 h-4" />
                  {testLoading ? 'Testing...' : 'Test Webhook'}
                </button>
              </div>
            )}
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

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  )
}
