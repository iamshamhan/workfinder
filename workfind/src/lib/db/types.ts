export type {
  Profile,
  Category,
  Subcategory,
  ProviderProfile,
  ProviderCategory,
  ServiceListing,
  ListingImage,
  ServiceArea,
  SavedProvider,
  JobRequest,
  Quotation,
  Enquiry,
  Conversation,
  Message,
  Review,
  Report,
  Notification,
  AdminAuditLog,
  District,
  City,
  UserRole,
  UserStatus,
  VerificationStatus,
  ListingStatus,
  JobStatus,
  QuotationStatus,
  EnquiryStatus,
  ReviewStatus,
  ReportStatus,
  MessageType,
  NotificationType,
  PricingType,
  ServiceDeliveryType,
  JobUrgency,
  ContactPreference,
} from '@/types';

/**
 * Database row types (snake_case from PostgreSQL)
 */
export interface ProfileRow {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  status: UserStatus;
  phone: string | null;
  whatsapp: string | null;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  parent_id: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubcategoryRow {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProviderProfileRow {
  id: string;
  user_id: string;
  business_name: string;
  business_logo_url: string | null;
  cover_image_url: string | null;
  short_intro: string | null;
  description: string | null;
  main_category_id: string | null;
  years_experience: number | null;
  languages: string[];
  availability: ProviderProfile['availability'];
  service_delivery_types: ServiceDeliveryType[];
  verification_status: VerificationStatus;
  verified_at: string | null;
  verified_by: string | null;
  rating: number;
  review_count: number;
  profile_views: number;
  district: string | null;
  city: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  service_coverage: string[];
  created_at: string;
  updated_at: string;
}

export interface ProviderCategoryRow {
  id: string;
  provider_id: string;
  category_id: string;
  subcategory_id: string | null;
  is_primary: boolean;
  created_at: string;
}

export interface ServiceListingRow {
  id: string;
  provider_id: string;
  title: string;
  slug: string;
  description: string;
  category_id: string;
  subcategory_id: string | null;
  main_image_url: string | null;
  pricing_type: PricingType;
  price_amount: number | null;
  price_currency: string;
  location_type: ServiceDeliveryType;
  district: string | null;
  city: string | null;
  service_coverage: string[];
  experience_required: string | null;
  tags: string[];
  status: ListingStatus;
  rejection_reason: string | null;
  published_at: string | null;
  view_count: number;
  enquiry_count: number;
  created_at: string;
  updated_at: string;
}

export interface ListingImageRow {
  id: string;
  listing_id: string;
  image_url: string;
  display_order: number;
  is_main: boolean;
  created_at: string;
}

export interface ServiceAreaRow {
  id: string;
  provider_id: string;
  district: string;
  city: string | null;
  is_primary: boolean;
  created_at: string;
}

export interface SavedProviderRow {
  id: string;
  customer_id: string;
  provider_id: string;
  created_at: string;
}

export interface JobRequestRow {
  id: string;
  customer_id: string;
  title: string;
  description: string;
  category_id: string;
  subcategory_id: string | null;
  required_service: string;
  district: string;
  city: string | null;
  budget_min: number | null;
  budget_max: number | null;
  budget_currency: string;
  preferred_date: string | null;
  urgency: JobUrgency;
  reference_images: string[];
  contact_preferences: ContactPreference[];
  status: JobStatus;
  created_at: string;
  updated_at: string;
}

export interface QuotationRow {
  id: string;
  job_request_id: string;
  provider_id: string;
  amount: number;
  currency: string;
  description: string;
  estimated_duration: string | null;
  valid_until: string | null;
  status: QuotationStatus;
  created_at: string;
  updated_at: string;
}

export interface EnquiryRow {
  id: string;
  customer_id: string;
  provider_id: string;
  listing_id: string | null;
  subject: string;
  message: string;
  contact_method: ContactPreference;
  status: EnquiryStatus;
  created_at: string;
  updated_at: string;
}

export interface ConversationRow {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  listing_id: string | null;
  job_request_id: string | null;
  last_message_at: string;
  created_at: string;
  updated_at: string;
}

export interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: MessageType;
  read_at: string | null;
  created_at: string;
}

export interface ReviewRow {
  id: string;
  customer_id: string;
  provider_id: string;
  job_request_id: string | null;
  listing_id: string | null;
  rating: number;
  title: string | null;
  content: string;
  images: string[];
  is_verified_purchase: boolean;
  status: ReviewStatus;
  moderation_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReportRow {
  id: string;
  reporter_id: string;
  reported_type: 'user' | 'listing' | 'review' | 'message';
  reported_id: string;
  reason: string;
  description: string | null;
  status: ReportStatus;
  moderator_id: string | null;
  moderation_note: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface NotificationRow {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  reference_id: string | null;
  reference_type: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface AdminAuditLogRow {
  id: string;
  admin_id: string;
  action: string;
  target_type: string;
  target_id: string;
  details: Record<string, unknown>;
  created_at: string;
}

export interface DistrictRow {
  id: string;
  name: string;
  name_si: string | null;
  name_ta: string | null;
  province: string;
  created_at: string;
}

export interface CityRow {
  id: string;
  district_id: string;
  name: string;
  name_si: string | null;
  name_ta: string | null;
  created_at: string;
}

/**
 * Input types for create operations (camelCase for TypeScript)
 */
export type CreateProfileInput = Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
export type UpdateProfileInput = Partial<Omit<Profile, 'id' | 'user_id' | 'created_at'>>;

export type CreateCategoryInput = Omit<Category, 'id' | 'created_at' | 'updated_at'>;
export type UpdateCategoryInput = Partial<Omit<Category, 'id' | 'created_at'>>;

export type CreateSubcategoryInput = Omit<Subcategory, 'id' | 'created_at' | 'updated_at'>;
export type UpdateSubcategoryInput = Partial<Omit<Subcategory, 'id' | 'created_at'>>;

export type CreateProviderProfileInput = Omit<ProviderProfile, 'id' | 'created_at' | 'updated_at' | 'rating' | 'review_count' | 'profile_views' | 'verified_at' | 'verified_by'>;
export type UpdateProviderProfileInput = Partial<Omit<ProviderProfile, 'id' | 'user_id' | 'created_at' | 'rating' | 'review_count' | 'profile_views'>>;

export type CreateProviderCategoryInput = Omit<ProviderCategory, 'id' | 'created_at'>;
export type UpdateProviderCategoryInput = Partial<Omit<ProviderCategory, 'id' | 'created_at'>>;

export type CreateServiceListingInput = Omit<ServiceListing, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'enquiry_count' | 'published_at'>;
export type UpdateServiceListingInput = Partial<Omit<ServiceListing, 'id' | 'provider_id' | 'created_at' | 'view_count' | 'enquiry_count'>>;

export type CreateListingImageInput = Omit<ListingImage, 'id' | 'created_at'>;
export type UpdateListingImageInput = Partial<Omit<ListingImage, 'id' | 'listing_id' | 'created_at'>>;

export type CreateServiceAreaInput = Omit<ServiceArea, 'id' | 'created_at'>;
export type UpdateServiceAreaInput = Partial<Omit<ServiceArea, 'id' | 'provider_id' | 'created_at'>>;

export type CreateSavedProviderInput = Omit<SavedProvider, 'id' | 'created_at'>;

export type CreateJobRequestInput = Omit<JobRequest, 'id' | 'created_at' | 'updated_at'>;
export type UpdateJobRequestInput = Partial<Omit<JobRequest, 'id' | 'customer_id' | 'created_at'>>;

export type CreateQuotationInput = Omit<Quotation, 'id' | 'created_at' | 'updated_at'>;
export type UpdateQuotationInput = Partial<Omit<Quotation, 'id' | 'job_request_id' | 'provider_id' | 'created_at'>>;

export type CreateEnquiryInput = Omit<Enquiry, 'id' | 'created_at' | 'updated_at'>;
export type UpdateEnquiryInput = Partial<Omit<Enquiry, 'id' | 'customer_id' | 'provider_id' | 'created_at'>>;

export type CreateConversationInput = Omit<Conversation, 'id' | 'created_at' | 'updated_at' | 'last_message_at'>;
export type UpdateConversationInput = Partial<Omit<Conversation, 'id' | 'created_at'>>;

export type CreateMessageInput = Omit<Message, 'id' | 'created_at' | 'read_at'>;
export type UpdateMessageInput = Partial<Omit<Message, 'id' | 'conversation_id' | 'sender_id' | 'created_at'>>;

export type CreateReviewInput = Omit<Review, 'id' | 'created_at' | 'updated_at' | 'status' | 'is_verified_purchase'>;
export type UpdateReviewInput = Partial<Omit<Review, 'id' | 'customer_id' | 'provider_id' | 'created_at'>>;

export type CreateReportInput = Omit<Report, 'id' | 'created_at' | 'status' | 'moderator_id' | 'moderation_note' | 'resolved_at'>;
export type UpdateReportInput = Partial<Omit<Report, 'id' | 'reporter_id' | 'created_at'>>;

export type CreateNotificationInput = Omit<Notification, 'id' | 'created_at' | 'is_read' | 'read_at'>;
export type UpdateNotificationInput = Partial<Omit<Notification, 'id' | 'user_id' | 'created_at'>>;

export type CreateAdminAuditLogInput = Omit<AdminAuditLog, 'id' | 'created_at'>;

export type CreateDistrictInput = Omit<District, 'created_at'>;
export type UpdateDistrictInput = Partial<Omit<District, 'id' | 'created_at'>>;

export type CreateCityInput = Omit<City, 'id' | 'created_at'>;
export type UpdateCityInput = Partial<Omit<City, 'id' | 'created_at'>>;

/**
 * Query filter types
 */
export interface ListOptions {
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface ProfileFilters {
  role?: UserRole;
  status?: UserStatus;
  user_id?: string;
}

export interface ProviderProfileFilters {
  verification_status?: VerificationStatus;
  main_category_id?: string;
  district?: string;
  city?: string;
  min_rating?: number;
  user_id?: string;
}

export interface ServiceListingFilters {
  provider_id?: string;
  category_id?: string;
  subcategory_id?: string;
  status?: ListingStatus;
  district?: string;
  city?: string;
  pricing_type?: PricingType;
  min_price?: number;
  max_price?: number;
  search?: string;
}

export interface JobRequestFilters {
  customer_id?: string;
  category_id?: string;
  district?: string;
  status?: JobStatus;
  urgency?: JobUrgency;
}

export interface QuotationFilters {
  job_request_id?: string;
  provider_id?: string;
  status?: QuotationStatus;
}

export interface EnquiryFilters {
  customer_id?: string;
  provider_id?: string;
  listing_id?: string;
  status?: EnquiryStatus;
}

export interface ConversationFilters {
  user_id?: string;
  listing_id?: string;
  job_request_id?: string;
}

export interface MessageFilters {
  conversation_id?: string;
  sender_id?: string;
  unread_only?: boolean;
}

export interface ReviewFilters {
  customer_id?: string;
  provider_id?: string;
  job_request_id?: string;
  listing_id?: string;
  status?: ReviewStatus;
  min_rating?: number;
}

export interface ReportFilters {
  reporter_id?: string;
  reported_type?: 'user' | 'listing' | 'review' | 'message';
  reported_id?: string;
  status?: ReportStatus;
}

export interface NotificationFilters {
  user_id?: string;
  is_read?: boolean;
  type?: NotificationType;
}

export interface SearchListingsParams {
  query?: string;
  category?: string;
  subcategory?: string;
  district?: string;
  city?: string;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  verified_only?: boolean;
  pricing_types?: PricingType[];
  service_delivery_types?: ServiceDeliveryType[];
  sort_by?: 'relevant' | 'rating' | 'reviews' | 'newest' | 'price_low' | 'price_high';
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}