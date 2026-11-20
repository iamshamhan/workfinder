export type UserRole = 'customer' | 'provider' | 'admin'

export type UserStatus = 'active' | 'suspended' | 'pending_verification' | 'banned'

export interface Profile {
  id: string
  user_id: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  status: UserStatus
  phone: string | null
  whatsapp: string | null
  email: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  image_url: string | null
  parent_id: string | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Subcategory {
  id: string
  category_id: string
  name: string
  slug: string
  description: string | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProviderProfile {
  id: string
  user_id: string
  business_name: string
  business_logo_url: string | null
  cover_image_url: string | null
  short_intro: string | null
  description: string | null
  main_category_id: string | null
  years_experience: number | null
  languages: string[]
  availability: ProviderAvailability
  service_delivery_types: ServiceDeliveryType[]
  verification_status: VerificationStatus
  verified_at: string | null
  verified_by: string | null
  rating: number
  review_count: number
  profile_views: number
  district: string | null
  city: string | null
  phone: string | null
  whatsapp: string | null
  email: string | null
  service_coverage: string[]
  created_at: string
  updated_at: string
}

export type ProviderAvailability = {
  monday: DayAvailability
  tuesday: DayAvailability
  wednesday: DayAvailability
  thursday: DayAvailability
  friday: DayAvailability
  saturday: DayAvailability
  sunday: DayAvailability
}

export type DayAvailability = {
  is_available: boolean
  start_time: string | null
  end_time: string | null
}

export type ServiceDeliveryType =
  | 'business_location'
  | 'customer_location'
  | 'remote'
  | 'multiple_locations'

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected'

export interface ProviderCategory {
  id: string
  provider_id: string
  category_id: string
  subcategory_id: string | null
  is_primary: boolean
  created_at: string
}

export interface ServiceListing {
  id: string
  provider_id: string
  title: string
  slug: string
  description: string
  category_id: string
  subcategory_id: string | null
  main_image_url: string | null
  pricing_type: PricingType
  price_amount: number | null
  price_currency: string
  location_type: ServiceDeliveryType
  district: string | null
  city: string | null
  service_coverage: string[]
  experience_required: string | null
  tags: string[]
  status: ListingStatus
  rejection_reason: string | null
  published_at: string | null
  view_count: number
  enquiry_count: number
  created_at: string
  updated_at: string
}

export type PricingType =
  | 'fixed'
  | 'starting_from'
  | 'hourly'
  | 'daily'
  | 'negotiable'
  | 'quotation'

export type ListingStatus =
  | 'draft'
  | 'pending_approval'
  | 'published'
  | 'rejected'
  | 'suspended'
  | 'archived'

export interface ListingImage {
  id: string
  listing_id: string
  image_url: string
  display_order: number
  is_main: boolean
  created_at: string
}

export interface ServiceArea {
  id: string
  provider_id: string
  district: string
  city: string | null
  is_primary: boolean
  created_at: string
}

export interface SavedProvider {
  id: string
  customer_id: string
  provider_id: string
  created_at: string
}

export interface JobRequest {
  id: string
  customer_id: string
  title: string
  description: string
  category_id: string
  subcategory_id: string | null
  required_service: string
  district: string
  city: string | null
  budget_min: number | null
  budget_max: number | null
  budget_currency: string
  preferred_date: string | null
  urgency: JobUrgency
  reference_images: string[]
  contact_preferences: ContactPreference[]
  status: JobStatus
  created_at: string
  updated_at: string
}

export type JobUrgency = 'low' | 'normal' | 'high' | 'urgent'

export type ContactPreference = 'call' | 'whatsapp' | 'email' | 'in_app'

export type JobStatus =
  | 'open'
  | 'receiving_offers'
  | 'in_progress'
  | 'completed'
  | 'cancelled'

export interface Quotation {
  id: string
  job_request_id: string
  provider_id: string
  amount: number
  currency: string
  description: string
  estimated_duration: string | null
  valid_until: string | null
  status: QuotationStatus
  created_at: string
  updated_at: string
}

export type QuotationStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'withdrawn'
  | 'expired'

export interface Enquiry {
  id: string
  customer_id: string
  provider_id: string
  listing_id: string | null
  subject: string
  message: string
  contact_method: ContactPreference
  status: EnquiryStatus
  created_at: string
  updated_at: string
}

export type EnquiryStatus = 'new' | 'read' | 'replied' | 'closed'

export interface Conversation {
  id: string
  participant_1_id: string
  participant_2_id: string
  listing_id: string | null
  job_request_id: string | null
  last_message_at: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  message_type: MessageType
  read_at: string | null
  created_at: string
}

export type MessageType = 'text' | 'image' | 'file' | 'system'

export interface Review {
  id: string
  customer_id: string
  provider_id: string
  job_request_id: string | null
  listing_id: string | null
  rating: number
  title: string | null
  content: string
  images: string[]
  is_verified_purchase: boolean
  status: ReviewStatus
  moderation_note: string | null
  created_at: string
  updated_at: string
}

export type ReviewStatus = 'pending' | 'published' | 'hidden' | 'flagged'

export interface Report {
  id: string
  reporter_id: string
  reported_type: 'user' | 'listing' | 'review' | 'message'
  reported_id: string
  reason: ReportReason
  description: string | null
  status: ReportStatus
  moderator_id: string | null
  moderation_note: string | null
  resolved_at: string | null
  created_at: string
}

export type ReportReason =
  | 'inappropriate_content'
  | 'spam'
  | 'fake_profile'
  | 'misleading_information'
  | 'harassment'
  | 'fraud'
  | 'poor_service'
  | 'other'

export type ReportStatus =
  | 'pending'
  | 'under_review'
  | 'resolved'
  | 'dismissed'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  reference_id: string | null
  reference_type: string | null
  is_read: boolean
  read_at: string | null
  created_at: string
}

export type NotificationType =
  | 'new_enquiry'
  | 'new_message'
  | 'new_quotation'
  | 'quotation_accepted'
  | 'quotation_rejected'
  | 'listing_approved'
  | 'listing_rejected'
  | 'listing_suspended'
  | 'review_received'
  | 'account_suspended'
  | 'account_reinstated'
  | 'report_filed'
  | 'report_resolved'

export interface AdminAuditLog {
  id: string
  admin_id: string
  action: string
  target_type: string
  target_id: string
  details: Record<string, unknown>
  created_at: string
}

export interface District {
  id: string
  name: string
  name_si: string | null
  name_ta: string | null
  province: string
  created_at: string
}

export interface City {
  id: string
  district_id: string
  name: string
  name_si: string | null
  name_ta: string | null
  created_at: string
}