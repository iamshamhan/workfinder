'use client'

import { FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Briefcase, ChevronRight, MapPin, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectOption } from '@/components/ui/Select'

export function HeroSearch({
  categories,
  districts,
}: {
  categories: SelectOption[]
  districts: SelectOption[]
}) {
  const router = useRouter()

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const params = new URLSearchParams()
    const query = String(data.get('q') || '').trim()
    const category = String(data.get('category') || '')
    const district = String(data.get('district') || '')

    if (query) params.set('q', query)
    if (category) params.set('category', category)
    if (district) params.set('district', district)

    const search = params.toString()
    router.push(search ? `/browse?${search}` : '/browse')
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-secondary-200 bg-white p-4 shadow-lg md:p-6"
      role="search"
    >
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
        <div className="text-left">
          <label htmlFor="hero-search" className="mb-1.5 block text-sm font-medium text-secondary-700">
            Service
          </label>
          <Input
            id="hero-search"
            name="q"
            placeholder="Electrician, house cleaning, AC repair"
            leftIcon={<Search className="h-5 w-5" aria-hidden="true" />}
            aria-label="Service search"
          />
        </div>
        <div className="text-left">
          <label htmlFor="hero-category" className="mb-1.5 block text-sm font-medium text-secondary-700">
            Category
          </label>
          <Select
            id="hero-category"
            name="category"
            options={[{ value: '', label: 'All categories' }, ...categories]}
            defaultValue=""
            leftIcon={<Briefcase className="h-5 w-5" aria-hidden="true" />}
            aria-label="Category filter"
          />
        </div>
        <div className="text-left">
          <label htmlFor="hero-location" className="mb-1.5 block text-sm font-medium text-secondary-700">
            District
          </label>
          <Select
            id="hero-location"
            name="district"
            options={[{ value: '', label: 'All districts' }, ...districts]}
            defaultValue=""
            leftIcon={<MapPin className="h-5 w-5" aria-hidden="true" />}
            aria-label="District filter"
          />
        </div>
        <Button type="submit" size="lg" className="h-12 w-full lg:w-auto min-w-[120px]" rightIcon={<ChevronRight className="h-5 w-5" aria-hidden="true" />}>
          Search
        </Button>
      </div>
    </form>
  )
}
