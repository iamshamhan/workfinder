'use client'

import { useState } from 'react'
import {
  Settings,
  Shield,
  Bell,
  User,
  Palette,
  Globe,
  Database,
  Mail,
  Lock,
  Loader2,
  Save,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectOption } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Toast, ToastContainer, toast } from '@/components/ui/Toast'
import { Tabs } from '@/components/ui/Tabs'
import { cn } from '@/lib/utils'

interface SettingsTab {
  value: string
  label: string
  icon: React.ReactNode
}

const settingsTabs: SettingsTab[] = [
  { value: 'general', label: 'General', icon: <Settings className="w-5 h-5" /> },
  { value: 'security', label: 'Security', icon: <Shield className="w-5 h-5" /> },
  { value: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
  { value: 'appearance', label: 'Appearance', icon: <Palette className="w-5 h-5" /> },
  { value: 'localization', label: 'Localization', icon: <Globe className="w-5 h-5" /> },
  { value: 'database', label: 'Database', icon: <Database className="w-5 h-5" /> },
  { value: 'email', label: 'Email', icon: <Mail className="w-5 h-5" /> },
  { value: 'api', label: 'API', icon: <Lock className="w-5 h-5" /> },
]

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Settings saved successfully')
      setSaved(true)
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <ToastContainer />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Admin Settings</h1>
          <p className="text-secondary-600 mt-1">Configure platform-wide settings and preferences</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Saved
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <Tabs.List className="grid grid-cols-4 sm:grid-cols-8 gap-1">
          {settingsTabs.map((tab) => (
            <Tabs.Trigger key={tab.value} value={tab.value} className="flex items-center justify-center gap-2 px-4 py-3">
              <span className="sr-only">{tab.label}</span>
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <Card variant="outlined" padding="lg">
            <CardHeader>
              <CardTitle>Platform Information</CardTitle>
              <CardDescription>Basic information about your platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="platform_name" className="block text-sm font-medium text-secondary-700 mb-1">Platform Name</label>
                  <Input id="platform_name" name="platform_name" defaultValue="WorkFinder" placeholder="WorkFinder" />
                </div>
                <div>
                  <label htmlFor="platform_url" className="block text-sm font-medium text-secondary-700 mb-1">Platform URL</label>
                  <Input id="platform_url" name="platform_url" type="url" defaultValue="https://workfinder.lk" placeholder="https://workfinder.lk" />
                </div>
                <div>
                  <label htmlFor="support_email" className="block text-sm font-medium text-secondary-700 mb-1">Support Email</label>
                  <Input id="support_email" name="support_email" type="email" defaultValue="support@workfinder.lk" placeholder="support@workfinder.lk" />
                </div>
                <div>
                  <label htmlFor="admin_email" className="block text-sm font-medium text-secondary-700 mb-1">Admin Email</label>
                  <Input id="admin_email" name="admin_email" type="email" defaultValue="admin@workfinder.lk" placeholder="admin@workfinder.lk" />
                </div>
              </div>
              <div>
                <label htmlFor="platform_description" className="block text-sm font-medium text-secondary-700 mb-1">Platform Description</label>
                <textarea
                  id="platform_description"
                  name="platform_description"
                  rows={3}
                  className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  defaultValue="Sri Lanka's leading service marketplace connecting customers with trusted providers."
                />
              </div>
            </CardContent>
          </Card>

          <Card variant="outlined" padding="lg">
            <CardHeader>
              <CardTitle>Default Settings</CardTitle>
              <CardDescription>Default values for new users and providers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="default_currency" className="block text-sm font-medium text-secondary-700 mb-1">Default Currency</label>
                  <Select
                    id="default_currency"
                    name="default_currency"
                    placeholder="Select currency"
                    options={[
                      { value: 'LKR', label: 'Sri Lankan Rupee (LKR)' },
                      { value: 'USD', label: 'US Dollar (USD)' },
                      { value: 'EUR', label: 'Euro (EUR)' },
                    ]}
                    value="LKR"
                    onChange={() => {}}
                  />
                </div>
                <div>
                  <label htmlFor="default_timezone" className="block text-sm font-medium text-secondary-700 mb-1">Default Timezone</label>
                  <Select
                    id="default_timezone"
                    name="default_timezone"
                    placeholder="Select timezone"
                    options={[
                      { value: 'Asia/Colombo', label: 'Sri Lanka (UTC+5:30)' },
                      { value: 'UTC', label: 'UTC' },
                      { value: 'America/New_York', label: 'Eastern Time (UTC-5)' },
                    ]}
                    value="Asia/Colombo"
                    onChange={() => {}}
                  />
                </div>
                <div>
                  <label htmlFor="default_language" className="block text-sm font-medium text-secondary-700 mb-1">Default Language</label>
                  <Select
                    id="default_language"
                    name="default_language"
                    placeholder="Select language"
                    options={[
                      { value: 'en', label: 'English' },
                      { value: 'si', label: 'Sinhala (සිංහල)' },
                      { value: 'ta', label: 'Tamil (தமிழ்)' },
                    ]}
                    value="en"
                    onChange={() => {}}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="session_timeout" className="block text-sm font-medium text-secondary-700 mb-1">Session Timeout (minutes)</label>
                  <Input id="session_timeout" name="session_timeout" type="number" defaultValue="60" min="5" max="1440" />
                </div>
                <div>
                  <label htmlFor="max_login_attempts" className="block text-sm font-medium text-secondary-700 mb-1">Max Login Attempts</label>
                  <Input id="max_login_attempts" name="max_login_attempts" type="number" defaultValue="5" min="1" max="20" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="outlined" padding="lg">
            <CardHeader>
              <CardTitle>Feature Toggles</CardTitle>
              <CardDescription>Enable or disable platform features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { id: 'enable_reviews', label: 'Enable Reviews', description: 'Allow customers to leave reviews for providers' },
                { id: 'enable_ratings', label: 'Enable Ratings', description: 'Show star ratings on provider profiles and listings' },
                { id: 'enable_chat', label: 'Enable Chat', description: 'Allow direct messaging between customers and providers' },
                { id: 'enable_job_requests', label: 'Enable Job Requests', description: 'Allow customers to post job requests' },
                { id: 'enable_quotations', label: 'Enable Quotations', description: 'Allow providers to send quotations for job requests' },
                { id: 'enable_verification', label: 'Enable Provider Verification', description: 'Require admin verification for new providers' },
                { id: 'enable_analytics', label: 'Enable Analytics', description: 'Track platform usage and performance metrics' },
                { id: 'maintenance_mode', label: 'Maintenance Mode', description: 'Put platform in maintenance mode (admins only)' },
              ].map((feature) => (
                <div key={feature.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-secondary-900">{feature.label}</p>
                    <p className="text-sm text-secondary-500">{feature.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Security Settings */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <Card variant="outlined" padding="lg">
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
              <CardDescription>Configure authentication and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password_min_length" className="block text-sm font-medium text-secondary-700 mb-1">Minimum Password Length</label>
                  <Input id="password_min_length" name="password_min_length" type="number" defaultValue="8" min="6" max="32" />
                </div>
                <div>
                  <label htmlFor="password_require_special" className="block text-sm font-medium text-secondary-700 mb-1">Require Special Characters</label>
                  <Select
                    id="password_require_special"
                    name="password_require_special"
                    placeholder="Select option"
                    options={[
                      { value: 'true', label: 'Yes' },
                      { value: 'false', label: 'No' },
                    ]}
                    value="true"
                    onChange={() => {}}
                  />
                </div>
                <div>
                  <label htmlFor="enable_2fa" className="block text-sm font-medium text-secondary-700 mb-1">Two-Factor Authentication</label>
                  <Select
                    id="enable_2fa"
                    name="enable_2fa"
                    placeholder="Select option"
                    options={[
                      { value: 'optional', label: 'Optional' },
                      { value: 'required_admin', label: 'Required for Admins' },
                      { value: 'required_all', label: 'Required for All' },
                      { value: 'disabled', label: 'Disabled' },
                    ]}
                    value="optional"
                    onChange={() => {}}
                  />
                </div>
                <div>
                  <label htmlFor="session_duration" className="block text-sm font-medium text-secondary-700 mb-1">Session Duration (days)</label>
                  <Input id="session_duration" name="session_duration" type="number" defaultValue="30" min="1" max="365" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-secondary-900">Rate Limiting</p>
                    <p className="text-sm text-secondary-500">Enable API rate limiting</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-secondary-900">CSRF Protection</p>
                    <p className="text-sm text-secondary-500">Enable CSRF protection for forms</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="outlined" padding="lg">
            <CardHeader>
              <CardTitle>API Keys & Integrations</CardTitle>
              <CardDescription>Manage API keys for third-party integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                <div>
                  <p className="font-medium text-secondary-900">Supabase</p>
                  <p className="text-sm text-secondary-500">Database and authentication</p>
                </div>
                <Badge variant="success" size="sm">Connected</Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                <div>
                  <p className="font-medium text-secondary-900">Stripe</p>
                  <p className="text-sm text-secondary-500">Payment processing</p>
                </div>
                <Badge variant="secondary" size="sm">Not Configured</Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                <div>
                  <p className="font-medium text-secondary-900">SendGrid</p>
                  <p className="text-sm text-secondary-500">Email delivery</p>
                </div>
                <Badge variant="secondary" size="sm">Not Configured</Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                <div>
                  <p className="font-medium text-secondary-900">Twilio</p>
                  <p className="text-sm text-secondary-500">SMS notifications</p>
                </div>
                <Badge variant="secondary" size="sm">Not Configured</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notifications Settings */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <Card variant="outlined" padding="lg">
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Configure when emails are sent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { id: 'email_new_user', label: 'New User Registration', description: 'Notify admins when a new user registers' },
                { id: 'email_new_provider', label: 'New Provider Registration', description: 'Notify admins when a new provider registers' },
                { id: 'email_provider_verification', label: 'Provider Verification Request', description: 'Notify admins when a provider requests verification' },
                { id: 'email_new_listing', label: 'New Listing Submitted', description: 'Notify admins when a listing is submitted for approval' },
                { id: 'email_new_review', label: 'New Review Submitted', description: 'Notify admins when a review is submitted' },
                { id: 'email_new_report', label: 'New Report Filed', description: 'Notify admins when a report is filed' },
                { id: 'email_daily_summary', label: 'Daily Summary', description: 'Send daily platform summary to admins' },
                { id: 'email_weekly_report', label: 'Weekly Report', description: 'Send weekly analytics report to admins' },
              ].map((notification) => (
                <div key={notification.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-secondary-900">{notification.label}</p>
                    <p className="text-sm text-secondary-500">{notification.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={!['email_daily_summary', 'email_weekly_report'].includes(notification.id)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card variant="outlined" padding="lg">
            <CardHeader>
              <CardTitle>In-App Notifications</CardTitle>
              <CardDescription>Configure in-app notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { id: 'notify_new_enquiry', label: 'New Enquiry', description: 'Notify providers of new enquiries' },
                { id: 'notify_new_message', label: 'New Message', description: 'Notify users of new messages' },
                { id: 'notify_new_quotation', label: 'New Quotation', description: 'Notify customers of new quotations' },
                { id: 'notify_quotation_accepted', label: 'Quotation Accepted', description: 'Notify providers when quotation is accepted' },
                { id: 'notify_listing_approved', label: 'Listing Approved', description: 'Notify providers when listing is approved' },
                { id: 'notify_listing_rejected', label: 'Listing Rejected', description: 'Notify providers when listing is rejected' },
                { id: 'notify_review_received', label: 'Review Received', description: 'Notify providers of new reviews' },
                { id: 'notify_report_filed', label: 'Report Filed', description: 'Notify admins when a report is filed' },
              ].map((notification) => (
                <div key={notification.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-secondary-900">{notification.label}</p>
                    <p className="text-sm text-secondary-500">{notification.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Appearance Settings */}
      {activeTab === 'appearance' && (
        <div className="space-y-6">
          <Card variant="outlined" padding="lg">
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>Customize platform appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="primary_color" className="block text-sm font-medium text-secondary-700 mb-1">Primary Color</label>
                  <Input id="primary_color" name="primary_color" type="color" defaultValue="#2563eb" />
                </div>
                <div>
                  <label htmlFor="secondary_color" className="block text-sm font-medium text-secondary-700 mb-1">Secondary Color</label>
                  <Input id="secondary_color" name="secondary_color" type="color" defaultValue="#64748b" />
                </div>
                <div>
                  <label htmlFor="accent_color" className="block text-sm font-medium text-secondary-700 mb-1">Accent Color</label>
                  <Input id="accent_color" name="accent_color" type="color" defaultValue="#f59e0b" />
                </div>
                <div>
                  <label htmlFor="success_color" className="block text-sm font-medium text-secondary-700 mb-1">Success Color</label>
                  <Input id="success_color" name="success_color" type="color" defaultValue="#10b981" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="logo_light" className="block text-sm font-medium text-secondary-700 mb-1">Logo (Light Mode)</label>
                  <Input id="logo_light" name="logo_light" type="url" placeholder="https://example.com/logo-light.png" />
                </div>
                <div>
                  <label htmlFor="logo_dark" className="block text-sm font-medium text-secondary-700 mb-1">Logo (Dark Mode)</label>
                  <Input id="logo_dark" name="logo_dark" type="url" placeholder="https://example.com/logo-dark.png" />
                </div>
                <div>
                  <label htmlFor="favicon" className="block text-sm font-medium text-secondary-700 mb-1">Favicon</label>
                  <Input id="favicon" name="favicon" type="url" placeholder="https://example.com/favicon.ico" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="outlined" padding="lg">
            <CardHeader>
              <CardTitle>Theme Settings</CardTitle>
              <CardDescription>Configure default theme preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="default_theme" className="block text-sm font-medium text-secondary-700 mb-1">Default Theme</label>
                  <Select
                    id="default_theme"
                    name="default_theme"
                    placeholder="Select theme"
                    options={[
                      { value: 'light', label: 'Light' },
                      { value: 'dark', label: 'Dark' },
                      { value: 'system', label: 'System Preference' },
                    ]}
                    value="system"
                    onChange={() => {}}
                  />
                </div>
                <div>
                  <label htmlFor="font_family" className="block text-sm font-medium text-secondary-700 mb-1">Font Family</label>
                  <Select
                    id="font_family"
                    name="font_family"
                    placeholder="Select font"
                    options={[
                      { value: 'inter', label: 'Inter (Default)' },
                      { value: 'roboto', label: 'Roboto' },
                      { value: 'open_sans', label: 'Open Sans' },
                      { value: 'system', label: 'System Font' },
                    ]}
                    value="inter"
                    onChange={() => {}}
                  />
                </div>
                <div>
                  <label htmlFor="border_radius" className="block text-sm font-medium text-secondary-700 mb-1">Border Radius</label>
                  <Select
                    id="border_radius"
                    name="border_radius"
                    placeholder="Select radius"
                    options={[
                      { value: 'none', label: 'None (Sharp)' },
                      { value: 'sm', label: 'Small' },
                      { value: 'md', label: 'Medium (Default)' },
                      { value: 'lg', label: 'Large' },
                      { value: 'full', label: 'Full (Rounded)' },
                    ]}
                    value="md"
                    onChange={() => {}}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Localization Settings */}
      {activeTab === 'localization' && (
        <div className="space-y-6">
          <Card variant="outlined" padding="lg">
            <CardHeader>
              <CardTitle>Languages</CardTitle>
              <CardDescription>Configure supported languages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[
                  { code: 'en', name: 'English', native: 'English', rtl: false, enabled: true },
                  { code: 'si', name: 'Sinhala', native: 'සිංහල', rtl: false, enabled: true },
                  { code: 'ta', name: 'Tamil', native: 'தமிழ்', rtl: false, enabled: true },
                ].map((lang) => (
                  <div key={lang.code} className="flex items-center gap-4 p-4 bg-secondary-50 rounded-lg">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center font-bold text-primary-600">
                      {lang.code.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-secondary-900">{lang.name} ({lang.native})</p>
                      <p className="text-sm text-secondary-500">Code: {lang.code} • RTL: {lang.rtl ? 'Yes' : 'No'}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={lang.enabled} className="sr-only peer" />
                      <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                ))}
              </div>
              <Button variant="outline">Add Language</Button>
            </CardContent>
          </Card>

          <Card variant="outlined" padding="lg">
            <CardHeader>
              <CardTitle>Regional Settings</CardTitle>
              <CardDescription>Configure regional defaults</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="default_country" className="block text-sm font-medium text-secondary-700 mb-1">Default Country</label>
                  <Select
                    id="default_country"
                    name="default_country"
                    placeholder="Select country"
                    options={[
                      { value: 'LK', label: 'Sri Lanka' },
                      { value: 'US', label: 'United States' },
                      { value: 'IN', label: 'India' },
                    ]}
                    value="LK"
                    onChange={() => {}}
                  />
                </div>
                <div>
                  <label htmlFor="date_format" className="block text-sm font-medium text-secondary-700 mb-1">Date Format</label>
                  <Select
                    id="date_format"
                    name="date_format"
                    placeholder="Select format"
                    options={[
                      { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                      { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                      { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                    ]}
                    value="DD/MM/YYYY"
                    onChange={() => {}}
                  />
                </div>
                <div>
                  <label htmlFor="time_format" className="block text-sm font-medium text-secondary-700 mb-1">Time Format</label>
                  <Select
                    id="time_format"
                    name="time_format"
                    placeholder="Select format"
                    options={[
                      { value: '24h', label: '24 Hour' },
                      { value: '12h', label: '12 Hour' },
                    ]}
                    value="24h"
                    onChange={() => {}}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="number_format" className="block text-sm font-medium text-secondary-700 mb-1">Number Format</label>
                  <Select
                    id="number_format"
                    name="number_format"
                    placeholder="Select format"
                    options={[
                      { value: '1,234.56', label: '1,234.56' },
                      { value: '1.234,56', label: '1.234,56' },
                      { value: '1 234,56', label: '1 234,56' },
                    ]}
                    value="1,234.56"
                    onChange={() => {}}
                  />
                </div>
                <div>
                  <label htmlFor="first_day_of_week" className="block text-sm font-medium text-secondary-700 mb-1">First Day of Week</label>
                  <Select
                    id="first_day_of_week"
                    name="first_day_of_week"
                    placeholder="Select day"
                    options={[
                      { value: '0', label: 'Sunday' },
                      { value: '1', label: 'Monday' },
                    ]}
                    value="0"
                    onChange={() => {}}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Database Settings */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          <Card variant="outlined" padding="lg">
            <CardHeader>
              <CardTitle>Database Configuration</CardTitle>
              <CardDescription>View database connection status and settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-secondary-50 rounded-lg">
                  <p className="text-sm font-medium text-secondary-900">Connection Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 bg-success-500 rounded-full" />
                    <span className="text-success-600 font-medium">Connected</span>
                  </div>
                </div>
                <div className="p-4 bg-secondary-50 rounded-lg">
                  <p className="text-sm font-medium text-secondary-900">Database Type</p>
                  <p className="text-secondary-600 mt-1">PostgreSQL (Supabase)</p>
                </div>
                <div className="p-4 bg-secondary-50 rounded-lg">
                  <p className="text-sm font-medium text-secondary-900">Pool Size</p>
                  <p className="text-secondary-600 mt-1">20 connections</p>
                </div>
                <div className="p-4 bg-secondary-50 rounded-lg">
                  <p className="text-sm font-medium text-secondary-900">SSL Mode</p>
                  <p className="text-secondary-600 mt-1">Require</p>
                </div>
              </div>
              <div className="pt-4 border-t border-secondary-200">
                <Button variant="outline">Test Connection</Button>
                <Button variant="outline" className="ml-2">View Logs</Button>
              </div>
            </CardContent>
          </Card>

          <Card variant="outlined" padding="lg">
            <CardHeader>
              <CardTitle>Maintenance</CardTitle>
              <CardDescription>Database maintenance operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                  <Database className="w-6 h-6" />
                  <span>Run Migrations</span>
                  <span className="text-xs text-secondary-500">Apply pending migrations</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                  <RefreshCw className="w-6 h-6" />
                  <span>Vacuum Analyze</span>
                  <span className="text-xs text-secondary-500">Optimize database</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                  <Download className="w-6 h-6" />
                  <span>Backup Database</span>
                  <span className="text-xs text-secondary-500">Create full backup</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Email Settings */}
      {activeTab === 'email' && (
        <div className="space-y-6">
          <Card variant="outlined" padding="lg">
            <CardHeader>
              <CardTitle>Email Provider</CardTitle>
              <CardDescription>Configure SMTP settings for outgoing emails</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="smtp_host" className="block text-sm font-medium text-secondary-700 mb-1">SMTP Host</label>
                  <Input id="smtp_host" name="smtp_host" placeholder="smtp.example.com" />
                </div>
                <div>
                  <label htmlFor="smtp_port" className="block text-sm font-medium text-secondary-700 mb-1">SMTP Port</label>
                  <Input id="smtp_port" name="smtp_port" type="number" placeholder="587" />
                </div>
                <div>
                  <label htmlFor="smtp_username" className="block text-sm font-medium text-secondary-700 mb-1">Username</label>
                  <Input id="smtp_username" name="smtp_username" placeholder="your-email@example.com" />
                </div>
                <div>
                  <label htmlFor="smtp_password" className="block text-sm font-medium text-secondary-700 mb-1">Password</label>
                  <Input id="smtp_password" name="smtp_password" type="password" placeholder="••••••••" />
                </div>
                <div>
                  <label htmlFor="smtp_encryption" className="block text-sm font-medium text-secondary-700 mb-1">Encryption</label>
                  <Select
                    id="smtp_encryption"
                    name="smtp_encryption"
                    placeholder="Select encryption"
                    options={[
                      { value: 'tls', label: 'TLS' },
                      { value: 'ssl', label: 'SSL' },
                      { value: 'none', label: 'None' },
                    ]}
                    value="tls"
                    onChange={() => {}}
                  />
                </div>
                <div>
                  <label htmlFor="from_email" className="block text-sm font-medium text-secondary-700 mb-1">From Email</label>
                  <Input id="from_email" name="from_email" type="email" placeholder="noreply@workfinder.lk" />
                </div>
                <div>
                  <label htmlFor="from_name" className="block text-sm font-medium text-secondary-700 mb-1">From Name</label>
                  <Input id="from_name" name="from_name" placeholder="WorkFinder" />
                </div>
              </div>
              <div className="pt-4 border-t border-secondary-200">
                <Button variant="outline">Test Email Configuration</Button>
              </div>
            </CardContent>
          </Card>

          <Card variant="outlined" padding="lg">
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>Customize email templates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: 'Welcome Email', subject: 'Welcome to WorkFinder!' },
                { name: 'Email Verification', subject: 'Verify your email address' },
                { name: 'Password Reset', subject: 'Reset your password' },
                { name: 'New Enquiry', subject: 'You have a new enquiry' },
                { name: 'New Message', subject: 'You have a new message' },
                { name: 'Listing Approved', subject: 'Your listing has been approved' },
                { name: 'Listing Rejected', subject: 'Your listing needs changes' },
                { name: 'New Review', subject: 'You received a new review' },
                { name: 'Quotation Received', subject: 'You received a new quotation' },
                { name: 'Report Filed', subject: 'New report filed' },
              ].map((template) => (
                <div key={template.name} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                  <div>
                    <p className="font-medium text-secondary-900">{template.name}</p>
                    <p className="text-sm text-secondary-500">Subject: {template.subject}</p>
                  </div>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* API Settings */}
      {activeTab === 'api' && (
        <div className="space-y-6">
          <Card variant="outlined" padding="lg">
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Manage API keys for external integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                <div>
                  <p className="font-medium text-secondary-900">Public API Key</p>
                  <p className="text-sm text-secondary-500">Used for client-side integrations</p>
                </div>
                <div className="flex items-center gap-2">
                  <code className="px-3 py-1 bg-secondary-200 rounded text-sm font-mono">wf_pub_••••••••••••••••</code>
                  <Button variant="ghost" size="sm">Regenerate</Button>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                <div>
                  <p className="font-medium text-secondary-900">Secret API Key</p>
                  <p className="text-sm text-secondary-500">Used for server-side operations (keep secure!)</p>
                </div>
                <div className="flex items-center gap-2">
                  <code className="px-3 py-1 bg-secondary-200 rounded text-sm font-mono">wf_sec_••••••••••••••••</code>
                  <Button variant="ghost" size="sm">Regenerate</Button>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                <div>
                  <p className="font-medium text-secondary-900">Webhook Secret</p>
                  <p className="text-sm text-secondary-500">Used to verify webhook signatures</p>
                </div>
                <div className="flex items-center gap-2">
                  <code className="px-3 py-1 bg-secondary-200 rounded text-sm font-mono">wf_whsec_••••••••••••••••</code>
                  <Button variant="ghost" size="sm">Regenerate</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="outlined" padding="lg">
            <CardHeader>
              <CardTitle>Rate Limits</CardTitle>
              <CardDescription>Configure API rate limits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="rate_limit_public" className="block text-sm font-medium text-secondary-700 mb-1">Public API (req/min)</label>
                  <Input id="rate_limit_public" name="rate_limit_public" type="number" defaultValue="100" min="10" max="1000" />
                </div>
                <div>
                  <label htmlFor="rate_limit_authenticated" className="block text-sm font-medium text-secondary-700 mb-1">Authenticated API (req/min)</label>
                  <Input id="rate_limit_authenticated" name="rate_limit_authenticated" type="number" defaultValue="500" min="50" max="5000" />
                </div>
                <div>
                  <label htmlFor="rate_limit_admin" className="block text-sm font-medium text-secondary-700 mb-1">Admin API (req/min)</label>
                  <Input id="rate_limit_admin" name="rate_limit_admin" type="number" defaultValue="2000" min="100" max="10000" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="webhook_timeout" className="block text-sm font-medium text-secondary-700 mb-1">Webhook Timeout (seconds)</label>
                  <Input id="webhook_timeout" name="webhook_timeout" type="number" defaultValue="30" min="5" max="120" />
                </div>
                <div>
                  <label htmlFor="webhook_retries" className="block text-sm font-medium text-secondary-700 mb-1">Webhook Retries</label>
                  <Input id="webhook_retries" name="webhook_retries" type="number" defaultValue="3" min="0" max="10" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="outlined" padding="lg">
            <CardHeader>
              <CardTitle>CORS Settings</CardTitle>
              <CardDescription>Configure Cross-Origin Resource Sharing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="cors_origins" className="block text-sm font-medium text-secondary-700 mb-1">Allowed Origins (one per line)</label>
                <textarea
                  id="cors_origins"
                  name="cors_origins"
                  rows={5}
                  className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                  defaultValue="https://workfinder.lk
https://www.workfinder.lk
https://app.workfinder.lk
http://localhost:3000"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cors_methods" className="block text-sm font-medium text-secondary-700 mb-1">Allowed Methods</label>
                  <Input id="cors_methods" name="cors_methods" defaultValue="GET,POST,PUT,PATCH,DELETE,OPTIONS" />
                </div>
                <div>
                  <label htmlFor="cors_headers" className="block text-sm font-medium text-secondary-700 mb-1">Allowed Headers</label>
                  <Input id="cors_headers" name="cors_headers" defaultValue="Content-Type,Authorization,X-Requested-With" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-secondary-900">Allow Credentials</p>
                  <p className="text-sm text-secondary-500">Allow cookies and authentication headers</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}