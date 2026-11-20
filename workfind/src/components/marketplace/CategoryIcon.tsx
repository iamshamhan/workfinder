import {
  AirVent,
  Briefcase,
  Car,
  Camera,
  GraduationCap,
  Hammer,
  HardHat,
  Laptop,
  Paintbrush,
  PartyPopper,
  Scissors,
  Sparkles,
  Trees,
  Truck,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  electrical: Zap,
  plumbing: Wrench,
  cleaning: Sparkles,
  construction: HardHat,
  repairs: Hammer,
  transport: Truck,
  education: GraduationCap,
  technology: Laptop,
  beauty: Scissors,
  events: PartyPopper,
  painting: Paintbrush,
  gardening: Trees,
  hvac: AirVent,
  automotive: Car,
  photography: Camera,
}

export function CategoryIcon({
  slug,
  className,
}: {
  slug: string
  className?: string
}) {
  const Icon = CATEGORY_ICONS[slug] ?? Briefcase
  return <Icon className={cn('h-6 w-6', className)} aria-hidden="true" />
}
