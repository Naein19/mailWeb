'use client'

import { Copy, Check, Zap } from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sidebar } from '@/components/sidebar'
import { TopBar } from '@/components/topbar'
import { ProtectedRoute } from '@/components/protected-route'
import { getWebhookUrl, saveWebhookUrl, sendWebhookReply } from '@/lib/webhook'
import { showToast } from '@/lib/toast'
import { cn } from '@/lib/utils'

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
          account_id: 'test-account',
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

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-12 lg:p-16">
          <div className="max-w-2xl mx-auto space-y-16">
            {/* Page Title */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Preferences</h1>
              <p className="text-base text-muted-foreground">Manage your account settings and integration preferences.</p>
            </div>

            {/* Notification Section */}
            <div className="space-y-8">
              <h2 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Notifications</h2>
              <div className="space-y-0">
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
            </div>

            {/* Webhook Integration - Phase 4.3 */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Automation</h2>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-orange-500/10 text-orange-600 text-[10px] font-bold uppercase tracking-wider">
                  <Zap size={10} />
                  n8n Ready
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-foreground mb-3">
                    Webhook URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={webhookInput}
                      onChange={(e) => setWebhookInput(e.target.value)}
                      placeholder="https://webhook.example.com/..."
                      className="flex-1 px-4 py-2 rounded-md bg-secondary/30 border border-border focus:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring text-sm transition-all placeholder:text-muted-foreground/40"
                    />
                    <button
                      onClick={handleSaveWebhook}
                      className="px-6 py-2 bg-foreground text-background hover:opacity-90 rounded-md transition-all text-sm font-bold"
                    >
                      Save
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                    Automated replies are routed through this endpoint. Ensure your n8n workflow is configured to receive POST requests.
                  </p>
                </div>

                {webhookUrl && (
                  <div className="pt-6 border-t border-border/50 space-y-4">
                    <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg border border-border/10">
                      <div className="min-w-0 flex-1 mr-4">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight mb-0.5">Active Gateway</p>
                        <p className="text-xs font-medium text-foreground truncate">{webhookUrl}</p>
                      </div>
                      <button
                        onClick={handleCopyWebhook}
                        className="p-2 hover:bg-secondary rounded-md transition-all shrink-0"
                      >
                        {copied ? (
                          <Check size={14} className="text-emerald-500" />
                        ) : (
                          <Copy size={14} className="text-muted-foreground" />
                        )}
                      </button>
                    </div>

                    <button
                      onClick={handleTestWebhook}
                      disabled={testLoading}
                      className="w-full h-10 flex items-center justify-center gap-2 border border-border hover:bg-secondary rounded-md transition-all text-xs font-bold text-foreground uppercase tracking-widest disabled:opacity-50"
                    >
                      {testLoading ? 'Attempting Connection...' : 'Test Integration'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* About Section */}
            <div className="pt-8 border-t border-border/50">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Version</p>
                  <p className="text-sm font-bold text-foreground">1.0.0-stable</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Instance</p>
                  <p className="text-sm font-bold text-emerald-600">Connected</p>
                </div>
              </div>
            </div>
          </div>
        </div>
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
    <div className="flex items-center justify-between py-6 border-b border-border/50 first:pt-0 last:border-b-0 group">
      <div className="space-y-1">
        <p className="text-sm font-bold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground group-hover:text-foreground/70 transition-colors leading-relaxed">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={cn(
          "relative w-9 h-5 rounded-full transition-all duration-200 outline-none",
          checked ? "bg-foreground" : "bg-secondary"
        )}
      >
        <motion.div
           layout
           transition={{ type: "spring", stiffness: 500, damping: 30 }}
           className={cn(
             "w-3 h-3 rounded-full absolute top-1",
             checked ? "right-1 bg-background" : "left-1 bg-muted-foreground"
           )}
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
