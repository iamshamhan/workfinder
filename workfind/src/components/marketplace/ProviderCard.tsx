import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Shield, Star } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/mock-data'

export interface ProviderCardData {
  id: string
  name: string
  category: string
  location: string
  rating: number
  reviewCount: number
  startingPrice: number | null
  isVerified: boolean
  image: string | null
}

export function ProviderCard({ provider }: { provider: ProviderCardData }) {
  return (
    <Card variant="elevated" padding="none" className="flex h-full flex-col overflow-hidden">
      <div className="relative h-48 bg-secondary-100">
        {provider.image ? (
          <Image
            src={provider.image}
            alt={`${provider.name} cover image`}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-secondary-300" aria-hidden="true">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {provider.isVerified && (
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 shadow-sm">
            <Shield className="h-3.5 w-3.5 text-success-600" aria-hidden="true" />
            <span className="text-xs font-medium text-secondary-700">Verified</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center gap-1.5 text-sm text-secondary-500">
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{provider.location}</span>
        </div>
        <h3 className="mb-2 font-semibold text-secondary-900">{provider.name}</h3>
        <Badge variant="outline" size="sm" className="mb-4 w-fit">
          {provider.category}
        </Badge>
        <div className="mt-auto flex items-end gap-3 border-t border-secondary-100 pt-3">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-warning-400 text-warning-400" aria-hidden="true" />
            <span className="font-medium text-secondary-900">{provider.rating.toFixed(1)}</span>
            <span className="text-sm text-secondary-500">({provider.reviewCount} reviews)</span>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-secondary-500">Starting from</p>
            <p className="font-semibold text-secondary-900">
              {provider.startingPrice !== null ? formatCurrency(provider.startingPrice) : 'Quote'}
            </p>
          </div>
        </div>
        <Link
          href={`/providers/${provider.id}`}
          className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-primary-600 px-4 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
        >
          View profile
        </Link>
      </div>
    </Card>
  )
}
