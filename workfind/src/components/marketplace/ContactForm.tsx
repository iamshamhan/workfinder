'use client'

import { FormEvent, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function ContactForm() {
  const [error, setError] = useState('')

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const name = String(data.get('name') || '').trim()
    const email = String(data.get('email') || '').trim()
    const topic = String(data.get('topic') || '').trim()
    const message = String(data.get('message') || '').trim()

    if (!name || !email || !message) {
      setError('Name, email and message are required.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address.')
      return
    }

    setError('')
    const subject = encodeURIComponent(topic || 'WorkFind enquiry')
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)
    window.location.href = `mailto:support@workfind.lk?subject=${subject}&body=${body}`
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <Input id="contact-name" name="name" label="Name" autoComplete="name" required />
      <Input id="contact-email" name="email" type="email" label="Email" autoComplete="email" required />
      <Input id="contact-topic" name="topic" label="Topic" placeholder="Listing, account, or general question" />
      <div>
        <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-secondary-700">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={6}
          className="w-full rounded-lg border border-secondary-200 px-4 py-2.5 text-base text-secondary-900 focus-visible:border-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        />
      </div>
      {error && (
        <p className="text-sm text-error-600" role="alert">
          {error}
        </p>
      )}
      <Button type="submit">Send message</Button>
      <p className="text-sm text-secondary-500">
        This opens your email app with the message addressed to support@workfind.lk.
      </p>
    </form>
  )
}
