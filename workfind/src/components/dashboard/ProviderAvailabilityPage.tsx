'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Calendar,
  Clock,
  Save,
  X,
  Loader2,
  CheckCircle,
  ChevronRight,
  Copy,
  Trash2,
  Plus,
  AlertCircle,
  Sun,
  Moon,
  Globe,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectOption } from '@/components/ui/Select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Toast, ToastContainer } from '@/components/ui/Toast'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/utils'

interface ProviderAvailabilityPageProps {
  userId: string
}

const daysOfWeek = [
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
  { key: 'sunday', label: 'Sunday', short: 'Sun' },
]

const timeOptions = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2)
  const minute = i % 2 === 0 ? '00' : '30'
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  const ampm = hour >= 12 ? 'PM' : 'AM'
  return {
    value: `${hour.toString().padStart(2, '0')}:${minute}`,
    label: `${displayHour}:${minute} ${ampm}`,
  }
})

const timeSlotOptions = [
  { value: 'morning', label: 'Morning (6 AM - 12 PM)', start: '06:00', end: '12:00' },
  { value: 'afternoon', label: 'Afternoon (12 PM - 6 PM)', start: '12:00', end: '18:00' },
  { value: 'evening', label: 'Evening (6 PM - 10 PM)', start: '18:00', end: '22:00' },
  { value: 'custom', label: 'Custom Hours', start: '', end: '' },
]

type ExceptionType = 'closed' | 'limited' | 'extended'

const exceptionOptions: SelectOption[] = [
  { value: 'closed', label: 'Closed / Unavailable' },
  { value: 'limited', label: 'Limited Hours' },
  { value: 'extended', label: 'Extended Hours' },
]

interface AvailabilityDay {
  is_available: boolean
  start_time: string | null
  end_time: string | null
}

interface Availability {
  monday: AvailabilityDay
  tuesday: AvailabilityDay
  wednesday: AvailabilityDay
  thursday: AvailabilityDay
  friday: AvailabilityDay
  saturday: AvailabilityDay
  sunday: AvailabilityDay
}

const defaultAvailability: Availability = {
  monday: { is_available: true, start_time: '08:00', end_time: '17:00' },
  tuesday: { is_available: true, start_time: '08:00', end_time: '17:00' },
  wednesday: { is_available: true, start_time: '08:00', end_time: '17:00' },
  thursday: { is_available: true, start_time: '08:00', end_time: '17:00' },
  friday: { is_available: true, start_time: '08:00', end_time: '17:00' },
  saturday: { is_available: true, start_time: '08:00', end_time: '13:00' },
  sunday: { is_available: false, start_time: null, end_time: null },
}

const mockExceptions = [
  { id: '1', date: '2025-01-15', type: 'closed', reason: 'Public Holiday - Thai Pongal', start_time: null, end_time: null },
  { id: '2', date: '2025-02-04', type: 'closed', reason: 'Public Holiday - Independence Day', start_time: null, end_time: null },
  { id: '3', date: '2025-03-15', type: 'limited', reason: 'Personal Appointment', start_time: '09:00', end_time: '12:00' },
  { id: '4', date: '2025-04-13', type: 'closed', reason: 'Sinhala & Tamil New Year', start_time: null, end_time: null },
  { id: '5', date: '2025-04-14', type: 'closed', reason: 'Sinhala & Tamil New Year', start_time: null, end_time: null },
]

export default function ProviderAvailabilityPage({ userId }: ProviderAvailabilityPageProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [toasts, setToasts] = useState<Array<{id: string, title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' | 'default'}>>([])
  const [availability, setAvailability] = useState(defaultAvailability)
  const [exceptions, setExceptions] = useState(mockExceptions)
  const [showExceptionModal, setShowExceptionModal] = useState(false)
  const [editingException, setEditingException] = useState<typeof exceptions[0] | null>(null)
  const [exceptionForm, setExceptionForm] = useState<{
    date: string
    type: ExceptionType
    reason: string
    start_time: string
    end_time: string
  }>({
    date: '',
    type: 'closed',
    reason: '',
    start_time: '',
    end_time: '',
  })

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString()
    const title = type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Notice'
    setToasts(prev => [...prev, { id, title, message, type: type as 'success' | 'error' | 'warning' | 'info' | 'default' }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000)
  }

  const handleAvailabilityChange = (day: string, field: 'is_available' | 'start_time' | 'end_time', value: boolean | string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day as keyof typeof prev],
        [field]: value,
      },
    }))
  }

  const copyDaySchedule = (fromDay: string, toDay: string) => {
    setAvailability(prev => ({
      ...prev,
      [toDay]: { ...prev[fromDay as keyof typeof prev] },
    }) as Availability)
    addToast(`Copied ${daysOfWeek.find(d => d.key === fromDay)?.label} schedule to ${daysOfWeek.find(d => d.key === toDay)?.label}`, 'success')
  }

  const copyWeekdays = () => {
    const mondaySchedule = availability.monday
    setAvailability(prev => ({
      ...prev,
      tuesday: { ...mondaySchedule },
      wednesday: { ...mondaySchedule },
      thursday: { ...mondaySchedule },
      friday: { ...mondaySchedule },
    }) as Availability)
    addToast('Copied Monday schedule to all weekdays', 'success')
  }

  const copyAllDays = () => {
    const mondaySchedule = availability.monday
    setAvailability(prev => ({
      ...prev,
      tuesday: { ...mondaySchedule },
      wednesday: { ...mondaySchedule },
      thursday: { ...mondaySchedule },
      friday: { ...mondaySchedule },
      saturday: { ...mondaySchedule },
      sunday: { ...mondaySchedule },
    }) as Availability)
    addToast('Copied Monday schedule to all days', 'success')
  }

  const applyPreset = (preset: typeof timeSlotOptions[0]) => {
    const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    if (preset.value !== 'custom') {
      setAvailability(prev => {
        const next: Availability = { ...prev }
        weekdays.forEach(day => {
          next[day as keyof typeof next] = {
            is_available: true,
            start_time: preset.start,
            end_time: preset.end,
          }
        })
        return next
      })
      addToast(`Applied ${preset.label} to weekdays`, 'success')
    }
  }

  const openExceptionModal = (exception?: typeof exceptions[0]) => {
    if (exception) {
      setEditingException(exception)
      setExceptionForm({
        date: exception.date,
        type: exception.type as ExceptionType,
        reason: exception.reason,
        start_time: exception.start_time || '',
        end_time: exception.end_time || '',
      })
    } else {
      setEditingException(null)
      setExceptionForm({
        date: new Date().toISOString().split('T')[0],
        type: 'closed',
        reason: '',
        start_time: '',
        end_time: '',
      })
    }
    setShowExceptionModal(true)
  }

  const handleExceptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      if (editingException) {
        setExceptions(prev => prev.map(ex =>
          ex.id === editingException.id ? { ...ex, ...exceptionForm } : ex
        ))
        addToast('Exception updated successfully', 'success')
      } else {
        const newException = {
          id: Date.now().toString(),
          ...exceptionForm,
        }
        setExceptions(prev => [...prev, newException].sort((a, b) => a.date.localeCompare(b.date)))
        addToast('Exception added successfully', 'success')
      }
      setShowExceptionModal(false)
    } catch (err) {
      addToast('Failed to save exception', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteException = (id: string) => {
    setExceptions(prev => prev.filter(ex => ex.id !== id))
    addToast('Exception deleted', 'success')
  }

  const handleSaveAvailability = async () => {
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      addToast('Availability saved successfully!', 'success')
      router.push('/dashboard/provider')
    } catch (err) {
      addToast('Failed to save availability', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const getExceptionTypeBadge = (type: string) => {
    switch (type) {
      case 'closed': return <Badge variant="error" size="sm">Closed</Badge>
      case 'limited': return <Badge variant="warning" size="sm">Limited Hours</Badge>
      case 'extended': return <Badge variant="primary" size="sm">Extended Hours</Badge>
      default: return <Badge variant="secondary" size="sm">{type}</Badge>
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <ToastContainer toasts={toasts} onClose={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Manage Availability</h1>
            <p className="text-secondary-600 mt-1">Set your weekly schedule and manage special dates</p>
          </div>
          <Link href="/dashboard/provider">
            <Button variant="outline" size="sm">
              <X className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Weekly Schedule */}
        <Card variant="outlined" padding="lg" className="mb-8">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Weekly Schedule</CardTitle>
              <CardDescription>Set your regular availability for each day of the week</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={copyWeekdays}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Weekdays
              </Button>
              <Button variant="outline" size="sm" onClick={copyAllDays}>
                <Copy className="w-4 h-4 mr-2" />
                Copy All Days
              </Button>
              <Select
                placeholder="Quick Preset"
                options={timeSlotOptions}
                onChange={(value) => applyPreset(timeSlotOptions.find(o => o.value === value)!)}
                leftIcon={<Clock className="w-4 h-4" aria-hidden="true" />}
                className="w-48"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
              {daysOfWeek.map((day) => {
                const avail = availability[day.key as keyof typeof availability]
                return (
                  <div
                    key={day.key}
                    className={cn(
                      'p-4 rounded-xl border transition-all duration-200',
                      avail.is_available
                        ? 'bg-white border-secondary-200 shadow-sm'
                        : 'bg-secondary-50 border-secondary-100 opacity-60'
                    )}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={avail.is_available}
                          onChange={(e) => handleAvailabilityChange(day.key, 'is_available', e.target.checked)}
                          className="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className={cn('font-medium capitalize', avail.is_available ? 'text-secondary-900' : 'text-secondary-500')}>
                          {day.label}
                        </span>
                      </label>
                    </div>
                    {avail.is_available && (
                      <div className="grid grid-cols-2 gap-2">
                        <Select
                          options={timeOptions}
                          value={avail.start_time || ''}
                          placeholder="Start"
                          onChange={(value) => handleAvailabilityChange(day.key, 'start_time', value)}
                          className="text-sm"
                        />
                        <Select
                          options={timeOptions}
                          value={avail.end_time || ''}
                          placeholder="End"
                          onChange={(value) => handleAvailabilityChange(day.key, 'end_time', value)}
                          className="text-sm"
                        />
                      </div>
                    )}
                    {!avail.is_available && (
                      <p className="text-sm text-secondary-400 text-center py-2">Closed</p>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Quick Actions */}
            <div className="mt-6 pt-6 border-t border-secondary-200">
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" size="sm" onClick={() => copyDaySchedule('monday', 'tuesday')}>
                  <ChevronRight className="w-3.5 h-3.5 mr-1.5" />
                  Mon → Tue
                </Button>
                <Button variant="outline" size="sm" onClick={() => copyDaySchedule('tuesday', 'wednesday')}>
                  <ChevronRight className="w-3.5 h-3.5 mr-1.5" />
                  Tue → Wed
                </Button>
                <Button variant="outline" size="sm" onClick={() => copyDaySchedule('wednesday', 'thursday')}>
                  <ChevronRight className="w-3.5 h-3.5 mr-1.5" />
                  Wed → Thu
                </Button>
                <Button variant="outline" size="sm" onClick={() => copyDaySchedule('thursday', 'friday')}>
                  <ChevronRight className="w-3.5 h-3.5 mr-1.5" />
                  Thu → Fri
                </Button>
                <Button variant="outline" size="sm" onClick={() => copyDaySchedule('friday', 'saturday')}>
                  <ChevronRight className="w-3.5 h-3.5 mr-1.5" />
                  Fri → Sat
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Special Dates / Exceptions */}
        <Card variant="outlined" padding="lg" className="mb-8">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Special Dates & Exceptions</CardTitle>
              <CardDescription>Add holidays, vacations, or special hours for specific dates</CardDescription>
            </div>
            <Button onClick={() => openExceptionModal()} leftIcon={<Plus className="w-4 h-4" />}>
              Add Exception
            </Button>
          </CardHeader>
          <CardContent>
            {exceptions.length > 0 ? (
              <div className="space-y-3">
                {exceptions.map((exception) => (
                  <div
                    key={exception.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-secondary-50 rounded-xl border border-secondary-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-lg border border-secondary-200 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-secondary-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-secondary-900">{formatDate(exception.date)}</span>
                          {getExceptionTypeBadge(exception.type)}
                        </div>
                        <p className="text-sm text-secondary-600 mt-1">{exception.reason}</p>
                        {(exception.start_time || exception.end_time) && (
                          <p className="text-xs text-secondary-500 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" aria-hidden="true" />
                            {exception.start_time && `From ${new Date(`2000-01-01T${exception.start_time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`}
                            {exception.start_time && exception.end_time && ' - '}
                            {exception.end_time && `To ${new Date(`2000-01-01T${exception.end_time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openExceptionModal(exception)}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteException(exception.id)} className="text-error-600 hover:text-error-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-secondary-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-secondary-400" />
                </div>
                <h3 className="font-medium text-secondary-900 mb-2">No special dates added</h3>
                <p className="text-secondary-600 mb-4">Add holidays, vacations, or special hours for specific dates</p>
                <Button onClick={() => openExceptionModal()} leftIcon={<Plus className="w-4 h-4" />}>
                  Add Your First Exception
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timezone & Settings */}
        <Card variant="outlined" padding="lg" className="mb-8">
          <CardHeader>
            <CardTitle>Availability Settings</CardTitle>
            <CardDescription>Configure how your availability is displayed to customers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Timezone</label>
                <Select
                  placeholder="Select Timezone"
                  options={[
                    { value: 'asia/colombo', label: 'Sri Lanka (UTC+5:30)' },
                    { value: 'utc', label: 'UTC' },
                    { value: 'asia/dubai', label: 'Dubai (UTC+4)' },
                    { value: 'asia/singapore', label: 'Singapore (UTC+8)' },
                  ]}
                  value="asia/colombo"
                  onChange={() => {}}
                  leftIcon={<Globe className="w-4 h-4" aria-hidden="true" />}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Booking Window</label>
                <Select
                  placeholder="Select Booking Window"
                  options={[
                    { value: '30d', label: '30 Days in Advance' },
                    { value: '60d', label: '60 Days in Advance' },
                    { value: '90d', label: '90 Days in Advance' },
                    { value: 'unlimited', label: 'No Limit' },
                  ]}
                  value="30d"
                  onChange={() => {}}
                  leftIcon={<Calendar className="w-4 h-4" aria-hidden="true" />}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Minimum Notice</label>
                <Select
                  placeholder="Select Minimum Notice"
                  options={[
                    { value: '1h', label: '1 Hour' },
                    { value: '2h', label: '2 Hours' },
                    { value: '4h', label: '4 Hours' },
                    { value: '24h', label: '24 Hours' },
                  ]}
                  value="2h"
                  onChange={() => {}}
                  leftIcon={<Clock className="w-4 h-4" aria-hidden="true" />}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Buffer Time</label>
                <Select
                  placeholder="Select Buffer Time"
                  options={[
                    { value: '0', label: 'No Buffer' },
                    { value: '15m', label: '15 Minutes' },
                    { value: '30m', label: '30 Minutes' },
                    { value: '1h', label: '1 Hour' },
                  ]}
                  value="15m"
                  onChange={() => {}}
                  leftIcon={<Clock className="w-4 h-4" aria-hidden="true" />}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500" defaultChecked />
                <span className="text-sm text-secondary-700">Show availability on public profile</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500" defaultChecked />
                <span className="text-sm text-secondary-700">Allow customers to request appointments outside availability</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm text-secondary-700">Auto-block booked time slots</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4 border-t border-secondary-200">
          <Link href="/dashboard/provider">
            <Button variant="outline" size="lg">Cancel</Button>
          </Link>
          <Button size="lg" isLoading={isSaving} onClick={handleSaveAvailability}>
            <Save className="w-4 h-4 mr-2" />
            Save Availability
          </Button>
        </div>
      </div>

      {/* Exception Modal */}
      <Modal
        isOpen={showExceptionModal}
        onClose={() => { setShowExceptionModal(false); setEditingException(null); }}
        title={editingException ? 'Edit Exception' : 'Add Special Date'}
        description={editingException ? 'Update the special date details' : 'Add a holiday, vacation, or special hours for a specific date'}
        size="md"
      >
        <form onSubmit={handleExceptionSubmit} className="space-y-4">
          <Input
            label="Date"
            type="date"
            value={exceptionForm.date}
            onChange={(e) => setExceptionForm(prev => ({ ...prev, date: e.target.value }))}
            required
            error={!exceptionForm.date ? 'Date is required' : undefined}
          />

          <Select
            label="Exception Type"
            options={exceptionOptions}
            value={exceptionForm.type}
            onChange={(value) => setExceptionForm(prev => ({ ...prev, type: value as 'closed' | 'limited' | 'extended' }))}
            required
          />

          <Input
            label="Reason / Description"
            value={exceptionForm.reason}
            onChange={(e) => setExceptionForm(prev => ({ ...prev, reason: e.target.value }))}
            placeholder="e.g., Public Holiday, Vacation, Personal Appointment"
            required
            error={!exceptionForm.reason ? 'Reason is required' : undefined}
          />

          {(exceptionForm.type === 'limited' || exceptionForm.type === 'extended') && (
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Start Time"
                options={timeOptions}
                value={exceptionForm.start_time}
                onChange={(value) => setExceptionForm(prev => ({ ...prev, start_time: value }))}
                placeholder="Select start time"
                required
              />
              <Select
                label="End Time"
                options={timeOptions}
                value={exceptionForm.end_time}
                onChange={(value) => setExceptionForm(prev => ({ ...prev, end_time: value }))}
                placeholder="Select end time"
                required
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => { setShowExceptionModal(false); setEditingException(null); }}>Cancel</Button>
            <Button type="submit" isLoading={isSaving}>
              {editingException ? 'Update Exception' : 'Add Exception'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}