import { createClient } from '@/lib/supabase/server';
import type {
  // TypeScript types
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
  // Input types
  CreateProfileInput,
  UpdateProfileInput,
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateSubcategoryInput,
  UpdateSubcategoryInput,
  CreateProviderProfileInput,
  UpdateProviderProfileInput,
  CreateProviderCategoryInput,
  CreateServiceListingInput,
  UpdateServiceListingInput,
  CreateListingImageInput,
  CreateServiceAreaInput,
  CreateSavedProviderInput,
  CreateJobRequestInput,
  UpdateJobRequestInput,
  CreateQuotationInput,
  UpdateQuotationInput,
  CreateEnquiryInput,
  UpdateEnquiryInput,
  CreateConversationInput,
  CreateMessageInput,
  CreateReviewInput,
  UpdateReviewInput,
  CreateReportInput,
  UpdateReportInput,
  CreateNotificationInput,
  UpdateNotificationInput,
  CreateAdminAuditLogInput,
  CreateDistrictInput,
  CreateCityInput,
  // Filter types
  ProfileFilters,
  ProviderProfileFilters,
  ServiceListingFilters,
  JobRequestFilters,
  QuotationFilters,
  EnquiryFilters,
  ConversationFilters,
  MessageFilters,
  ReviewFilters,
  ReportFilters,
  NotificationFilters,
  SearchListingsParams,
  ListOptions,
  PaginatedResult,
} from './types';

/**
 * Helper function to convert snake_case DB rows to camelCase TypeScript types
 */
function toCamelCase<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = value;
  }
  return result as T;
}

function toSnakeCase<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    result[snakeKey] = value;
  }
  return result as T;
}

/**
 * Pagination helper
 */
function paginate<T>(
  data: T[],
  page: number = 1,
  limit: number = 20
): PaginatedResult<T> {
  const total = data.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  return {
    data: data.slice(start, start + limit),
    total,
    page,
    limit,
    totalPages,
  };
}

/**
 * ============================================
 * PROFILES QUERIES
 * ============================================
 */

export async function getProfileByUserId(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch profile: ${error.message}`);
  }
  return toCamelCase(data);
}

export async function getProfileById(id: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch profile: ${error.message}`);
  }
  return toCamelCase(data);
}

export async function getProfiles(
  filters: ProfileFilters = {},
  options: ListOptions = {}
): Promise<PaginatedResult<Profile>> {
  const supabase = await createClient();
  let query = supabase.from('profiles').select('*', { count: 'exact' });

  if (filters.role) query = query.eq('role', filters.role);
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.user_id) query = query.eq('user_id', filters.user_id);

  if (options.orderBy) {
    query = query.order(options.orderBy, { ascending: options.orderDirection === 'asc' });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const page = options.page || 1;
  const limit = options.limit || 20;
  query = query.range((page - 1) * limit, page * limit - 1);

  const { data, error, count } = await query;

  if (error) throw new Error(`Failed to fetch profiles: ${error.message}`);

  return {
    data: data?.map(toCamelCase) || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export async function createProfile(input: CreateProfileInput): Promise<Profile> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .insert(toSnakeCase(input))
    .select()
    .single();

  if (error) throw new Error(`Failed to create profile: ${error.message}`);
  return toCamelCase(data);
}

export async function updateProfile(userId: string, input: UpdateProfileInput): Promise<Profile> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .update(toSnakeCase(input))
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update profile: ${error.message}`);
  return toCamelCase(data);
}

/**
 * ============================================
 * CATEGORIES QUERIES
 * ============================================
 */

export async function getCategories(includeInactive = false): Promise<Category[]> {
  const supabase = await createClient();
  let query = supabase.from('categories').select('*');

  if (!includeInactive) {
    query = query.eq('is_active', true);
  }

  query = query.order('display_order', { ascending: true });

  const { data, error } = await query;
  if (error) throw new Error(`Failed to fetch categories: ${error.message}`);
  return (data || []).map(toCamelCase);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch category: ${error.message}`);
  }
  return toCamelCase(data);
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch category: ${error.message}`);
  }
  return toCamelCase(data);
}

export async function getSubcategories(categoryId: string, includeInactive = false): Promise<Subcategory[]> {
  const supabase = await createClient();
  let query = supabase.from('subcategories').select('*').eq('category_id', categoryId);

  if (!includeInactive) {
    query = query.eq('is_active', true);
  }

  query = query.order('display_order', { ascending: true });

  const { data, error } = await query;
  if (error) throw new Error(`Failed to fetch subcategories: ${error.message}`);
  return (data || []).map(toCamelCase);
}

export async function getSubcategoryBySlug(categoryId: string, slug: string): Promise<Subcategory | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('subcategories')
    .select('*')
    .eq('category_id', categoryId)
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch subcategory: ${error.message}`);
  }
  return toCamelCase(data);
}

export async function createCategory(input: CreateCategoryInput): Promise<Category> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .insert(toSnakeCase(input))
    .select()
    .single();

  if (error) throw new Error(`Failed to create category: ${error.message}`);
  return toCamelCase(data);
}

export async function updateCategory(id: string, input: UpdateCategoryInput): Promise<Category> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .update(toSnakeCase(input))
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update category: ${error.message}`);
  return toCamelCase(data);
}

/**
 * ============================================
 * PROVIDER PROFILES QUERIES
 * ============================================
 */

export async function getProviderProfileByUserId(userId: string): Promise<ProviderProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('provider_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch provider profile: ${error.message}`);
  }
  return toCamelCase(data);
}

export async function getProviderProfileById(id: string): Promise<ProviderProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('provider_profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch provider profile: ${error.message}`);
  }
  return toCamelCase(data);
}

export async function getProviderProfiles(
  filters: ProviderProfileFilters = {},
  options: ListOptions = {}
): Promise<PaginatedResult<ProviderProfile>> {
  const supabase = await createClient();
  let query = supabase.from('provider_profiles').select('*', { count: 'exact' });

  if (filters.verification_status) {
    query = query.eq('verification_status', filters.verification_status);
  }
  if (filters.main_category_id) {
    query = query.eq('main_category_id', filters.main_category_id);
  }
  if (filters.district) {
    query = query.eq('district', filters.district);
  }
  if (filters.city) {
    query = query.eq('city', filters.city);
  }
  if (filters.min_rating) {
    query = query.gte('rating', filters.min_rating);
  }
  if (filters.user_id) {
    query = query.eq('user_id', filters.user_id);
  }

  if (options.orderBy) {
    query = query.order(options.orderBy, { ascending: options.orderDirection === 'asc' });
  } else {
    query = query.order('rating', { ascending: false });
  }

  const page = options.page || 1;
  const limit = options.limit || 20;
  query = query.range((page - 1) * limit, page * limit - 1);

  const { data, error, count } = await query;

  if (error) throw new Error(`Failed to fetch provider profiles: ${error.message}`);

  return {
    data: data?.map(toCamelCase) || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export async function createProviderProfile(input: CreateProviderProfileInput): Promise<ProviderProfile> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('provider_profiles')
    .insert(toSnakeCase(input))
    .select()
    .single();

  if (error) throw new Error(`Failed to create provider profile: ${error.message}`);
  return toCamelCase(data);
}

export async function updateProviderProfile(
  userId: string,
  input: UpdateProviderProfileInput
): Promise<ProviderProfile> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('provider_profiles')
    .update(toSnakeCase(input))
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update provider profile: ${error.message}`);
  return toCamelCase(data);
}

export async function incrementProfileViews(providerId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc('increment_profile_views', { provider_id: providerId });
  if (error) throw new Error(`Failed to increment profile views: ${error.message}`);
}

/**
 * ============================================
 * PROVIDER CATEGORIES QUERIES
 * ============================================
 */

export async function getProviderCategories(providerId: string): Promise<ProviderCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('provider_categories')
    .select('*')
    .eq('provider_id', providerId);

  if (error) throw new Error(`Failed to fetch provider categories: ${error.message}`);
  return (data || []).map(toCamelCase);
}

export async function addProviderCategory(input: CreateProviderCategoryInput): Promise<ProviderCategory> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('provider_categories')
    .insert(toSnakeCase(input))
    .select()
    .single();

  if (error) throw new Error(`Failed to add provider category: ${error.message}`);
  return toCamelCase(data);
}

export async function removeProviderCategory(providerId: string, categoryId: string, subcategoryId?: string): Promise<void> {
  const supabase = await createClient();
  let query = supabase
    .from('provider_categories')
    .delete()
    .eq('provider_id', providerId)
    .eq('category_id', categoryId);

  if (subcategoryId) {
    query = query.eq('subcategory_id', subcategoryId);
  }

  const { error } = await query;
  if (error) throw new Error(`Failed to remove provider category: ${error.message}`);
}

/**
 * ============================================
 * SERVICE LISTINGS QUERIES
 * ============================================
 */

export async function getServiceListingById(id: string): Promise<ServiceListing | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('service_listings')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch service listing: ${error.message}`);
  }
  return toCamelCase(data);
}

export async function getServiceListingBySlug(providerId: string, slug: string): Promise<ServiceListing | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('service_listings')
    .select('*')
    .eq('provider_id', providerId)
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch service listing: ${error.message}`);
  }
  return toCamelCase(data);
}

export async function getServiceListings(
  filters: ServiceListingFilters = {},
  options: ListOptions = {}
): Promise<PaginatedResult<ServiceListing>> {
  const supabase = await createClient();
  let query = supabase.from('service_listings').select('*', { count: 'exact' });

  if (filters.provider_id) query = query.eq('provider_id', filters.provider_id);
  if (filters.category_id) query = query.eq('category_id', filters.category_id);
  if (filters.subcategory_id) query = query.eq('subcategory_id', filters.subcategory_id);
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.district) query = query.eq('district', filters.district);
  if (filters.city) query = query.eq('city', filters.city);
  if (filters.pricing_type) query = query.eq('pricing_type', filters.pricing_type);
  if (filters.min_price) query = query.gte('price_amount', filters.min_price);
  if (filters.max_price) query = query.lte('price_amount', filters.max_price);

  if (options.orderBy) {
    query = query.order(options.orderBy, { ascending: options.orderDirection === 'asc' });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const page = options.page || 1;
  const limit = options.limit || 20;
  query = query.range((page - 1) * limit, page * limit - 1);

  const { data, error, count } = await query;

  if (error) throw new Error(`Failed to fetch service listings: ${error.message}`);

  return {
    data: data?.map(toCamelCase) || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export async function searchListings(params: SearchListingsParams): Promise<PaginatedResult<ServiceListing>> {
  const supabase = await createClient();
  let query = supabase.from('service_listings').select('*', { count: 'exact' });

  // Base filter: published listings only
  query = query.eq('status', 'published');

  if (params.category) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', params.category)
      .single();
    if (cat) query = query.eq('category_id', cat.id);
  }

  if (params.subcategory) {
    const { data: sub } = await supabase
      .from('subcategories')
      .select('id')
      .eq('slug', params.subcategory)
      .single();
    if (sub) query = query.eq('subcategory_id', sub.id);
  }

  if (params.district) query = query.eq('district', params.district);
  if (params.city) query = query.ilike('city', params.city);

  if (params.min_price !== undefined) query = query.gte('price_amount', params.min_price);
  if (params.max_price !== undefined) query = query.lte('price_amount', params.max_price);

  if (params.verified_only) {
    query = query.eq('verification_status', 'verified');
  }

  if (params.pricing_types?.length) {
    query = query.in('pricing_type', params.pricing_types);
  }

  if (params.service_delivery_types?.length) {
    query = query.in('location_type', params.service_delivery_types);
  }

  // Full-text search
  if (params.query) {
    query = query.textSearch('fts', params.query, {
      type: 'websearch',
      config: 'english',
    });
  }

  // Sorting
  switch (params.sort_by) {
    case 'rating':
      // Need to join with provider_profiles for rating
      break;
    case 'reviews':
      // Need to join with provider_profiles for review_count
      break;
    case 'newest':
      query = query.order('published_at', { ascending: false });
      break;
    case 'price_low':
      query = query.order('price_amount', { ascending: true, nullsLast: true });
      break;
    case 'price_high':
      query = query.order('price_amount', { ascending: false, nullsLast: true });
      break;
    default:
      query = query.order('view_count', { ascending: false });
  }

  const page = params.page || 1;
  const limit = params.limit || 12;
  query = query.range((page - 1) * limit, page * limit - 1);

  const { data, error, count } = await query;

  if (error) throw new Error(`Failed to search listings: ${error.message}`);

  return {
    data: data?.map(toCamelCase) || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export async function createServiceListing(input: CreateServiceListingInput): Promise<ServiceListing> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('service_listings')
    .insert(toSnakeCase(input))
    .select()
    .single();

  if (error) throw new Error(`Failed to create service listing: ${error.message}`);
  return toCamelCase(data);
}

export async function updateServiceListing(
  id: string,
  input: UpdateServiceListingInput
): Promise<ServiceListing> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('service_listings')
    .update(toSnakeCase(input))
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update service listing: ${error.message}`);
  return toCamelCase(data);
}

export async function incrementListingViews(listingId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc('increment_listing_views', { listing_id: listingId });
  if (error) throw new Error(`Failed to increment listing views: ${error.message}`);
}

export async function incrementListingEnquiries(listingId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc('increment_listing_enquiries', { listing_id: listingId });
  if (error) throw new Error(`Failed to increment listing enquiries: ${error.message}`);
}

/**
 * ============================================
 * LISTING IMAGES QUERIES
 * ============================================
 */

export async function getListingImages(listingId: string): Promise<ListingImage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('listing_images')
    .select('*')
    .eq('listing_id', listingId)
    .order('display_order', { ascending: true });

  if (error) throw new Error(`Failed to fetch listing images: ${error.message}`);
  return (data || []).map(toCamelCase);
}

export async function addListingImage(input: CreateListingImageInput): Promise<ListingImage> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('listing_images')
    .insert(toSnakeCase(input))
    .select()
    .single();

  if (error) throw new Error(`Failed to add listing image: ${error.message}`);
  return toCamelCase(data);
}

export async function deleteListingImage(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('listing_images').delete().eq('id', id);
  if (error) throw new Error(`Failed to delete listing image: ${error.message}`);
}

/**
 * ============================================
 * SERVICE AREAS QUERIES
 * ============================================
 */

export async function getServiceAreas(providerId: string): Promise<ServiceArea[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('service_areas')
    .select('*')
    .eq('provider_id', providerId)
    .order('is_primary', { ascending: false });

  if (error) throw new Error(`Failed to fetch service areas: ${error.message}`);
  return (data || []).map(toCamelCase);
}

export async function addServiceArea(input: CreateServiceAreaInput): Promise<ServiceArea> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('service_areas')
    .insert(toSnakeCase(input))
    .select()
    .single();

  if (error) throw new Error(`Failed to add service area: ${error.message}`);
  return toCamelCase(data);
}

export async function removeServiceArea(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('service_areas').delete().eq('id', id);
  if (error) throw new Error(`Failed to remove service area: ${error.message}`);
}

/**
 * ============================================
 * SAVED PROVIDERS QUERIES
 * ============================================
 */

export async function getSavedProviders(customerId: string): Promise<SavedProvider[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('saved_providers')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch saved providers: ${error.message}`);
  return (data || []).map(toCamelCase);
}

export async function isProviderSaved(customerId: string, providerId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('saved_providers')
    .select('id')
    .eq('customer_id', customerId)
    .eq('provider_id', providerId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return false;
    throw new Error(`Failed to check saved provider: ${error.message}`);
  }
  return !!data;
}

export async function saveProvider(input: CreateSavedProviderInput): Promise<SavedProvider> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('saved_providers')
    .insert(toSnakeCase(input))
    .select()
    .single();

  if (error) throw new Error(`Failed to save provider: ${error.message}`);
  return toCamelCase(data);
}

export async function unsaveProvider(customerId: string, providerId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('saved_providers')
    .delete()
    .eq('customer_id', customerId)
    .eq('provider_id', providerId);

  if (error) throw new Error(`Failed to unsave provider: ${error.message}`);
}

/**
 * ============================================
 * JOB REQUESTS QUERIES
 * ============================================
 */

export async function getJobRequestById(id: string): Promise<JobRequest | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('job_requests')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch job request: ${error.message}`);
  }
  return toCamelCase(data);
}

export async function getJobRequests(
  filters: JobRequestFilters = {},
  options: ListOptions = {}
): Promise<PaginatedResult<JobRequest>> {
  const supabase = await createClient();
  let query = supabase.from('job_requests').select('*', { count: 'exact' });

  if (filters.customer_id) query = query.eq('customer_id', filters.customer_id);
  if (filters.category_id) query = query.eq('category_id', filters.category_id);
  if (filters.district) query = query.eq('district', filters.district);
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.urgency) query = query.eq('urgency', filters.urgency);

  if (options.orderBy) {
    query = query.order(options.orderBy, { ascending: options.orderDirection === 'asc' });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const page = options.page || 1;
  const limit = options.limit || 20;
  query = query.range((page - 1) * limit, page * limit - 1);

  const { data, error, count } = await query;

  if (error) throw new Error(`Failed to fetch job requests: ${error.message}`);

  return {
    data: data?.map(toCamelCase) || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export async function getOpenJobRequestsForProvider(
  providerId: string,
  options: ListOptions = {}
): Promise<PaginatedResult<JobRequest>> {
  const supabase = await createClient();
  let query = supabase
    .from('job_requests')
    .select('*', { count: 'exact' })
    .eq('status', 'open');

  // Filter by provider's categories and service areas
  const { data: provider } = await supabase
    .from('provider_profiles')
    .select('main_category_id, id')
    .eq('id', providerId)
    .single();

  if (provider) {
    const { data: categories } = await supabase
      .from('provider_categories')
      .select('category_id')
      .eq('provider_id', providerId);

    const categoryIds = [provider.main_category_id, ...(categories?.map(c => c.category_id) || [])]
      .filter(Boolean);

    query = query.in('category_id', categoryIds);
  }

  if (options.orderBy) {
    query = query.order(options.orderBy, { ascending: options.orderDirection === 'asc' });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const page = options.page || 1;
  const limit = options.limit || 20;
  query = query.range((page - 1) * limit, page * limit - 1);

  const { data, error, count } = await query;

  if (error) throw new Error(`Failed to fetch job requests: ${error.message}`);

  return {
    data: data?.map(toCamelCase) || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export async function createJobRequest(input: CreateJobRequestInput): Promise<JobRequest> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('job_requests')
    .insert(toSnakeCase(input))
    .select()
    .single();

  if (error) throw new Error(`Failed to create job request: ${error.message}`);
  return toCamelCase(data);
}

export async function updateJobRequest(
  id: string,
  input: UpdateJobRequestInput
): Promise<JobRequest> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('job_requests')
    .update(toSnakeCase(input))
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update job request: ${error.message}`);
  return toCamelCase(data);
}

/**
 * ============================================
 * QUOTATIONS QUERIES
 * ============================================
 */

export async function getQuotationById(id: string): Promise<Quotation | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('quotations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch quotation: ${error.message}`);
  }
  return toCamelCase(data);
}

export async function getQuotations(
  filters: QuotationFilters = {},
  options: ListOptions = {}
): Promise<PaginatedResult<Quotation>> {
  const supabase = await createClient();
  let query = supabase.from('quotations').select('*', { count: 'exact' });

  if (filters.job_request_id) query = query.eq('job_request_id', filters.job_request_id);
  if (filters.provider_id) query = query.eq('provider_id', filters.provider_id);
  if (filters.status) query = query.eq('status', filters.status);

  if (options.orderBy) {
    query = query.order(options.orderBy, { ascending: options.orderDirection === 'asc' });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const page = options.page || 1;
  const limit = options.limit || 20;
  query = query.range((page - 1) * limit, page * limit - 1);

  const { data, error, count } = await query;

  if (error) throw new Error(`Failed to fetch quotations: ${error.message}`);

  return {
    data: data?.map(toCamelCase) || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export async function getQuotationsForJobRequest(jobRequestId: string): Promise<Quotation[]> {
  return getQuotations({ job_request_id: jobRequestId }, { limit: 100 });
}

export async function createQuotation(input: CreateQuotationInput): Promise<Quotation> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('quotations')
    .insert(toSnakeCase(input))
    .select()
    .single();

  if (error) throw new Error(`Failed to create quotation: ${error.message}`);
  return toCamelCase(data);
}

export async function updateQuotation(
  id: string,
  input: UpdateQuotationInput
): Promise<Quotation> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('quotations')
    .update(toSnakeCase(input))
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update quotation: ${error.message}`);
  return toCamelCase(data);
}

/**
 * ============================================
 * ENQUIRIES QUERIES
 * ============================================
 */

export async function getEnquiryById(id: string): Promise<Enquiry | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('enquiries')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch enquiry: ${error.message}`);
  }
  return toCamelCase(data);
}

export async function getEnquiries(
  filters: EnquiryFilters = {},
  options: ListOptions = {}
): Promise<PaginatedResult<Enquiry>> {
  const supabase = await createClient();
  let query = supabase.from('enquiries').select('*', { count: 'exact' });

  if (filters.customer_id) query = query.eq('customer_id', filters.customer_id);
  if (filters.provider_id) query = query.eq('provider_id', filters.provider_id);
  if (filters.listing_id) query = query.eq('listing_id', filters.listing_id);
  if (filters.status) query = query.eq('status', filters.status);

  if (options.orderBy) {
    query = query.order(options.orderBy, { ascending: options.orderDirection === 'asc' });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const page = options.page || 1;
  const limit = options.limit || 20;
  query = query.range((page - 1) * limit, page * limit - 1);

  const { data, error, count } = await query;

  if (error) throw new Error(`Failed to fetch enquiries: ${error.message}`);

  return {
    data: data?.map(toCamelCase) || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export async function createEnquiry(input: CreateEnquiryInput): Promise<Enquiry> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('enquiries')
    .insert(toSnakeCase(input))
    .select()
    .single();

  if (error) throw new Error(`Failed to create enquiry: ${error.message}`);
  return toCamelCase(data);
}

export async function updateEnquiry(
  id: string,
  input: UpdateEnquiryInput
): Promise<Enquiry> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('enquiries')
    .update(toSnakeCase(input))
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update enquiry: ${error.message}`);
  return toCamelCase(data);
}

/**
 * ============================================
 * CONVERSATIONS QUERIES
 * ============================================
 */

export async function getConversationById(id: string): Promise<Conversation | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch conversation: ${error.message}`);
  }
  return toCamelCase(data);
}

export async function getConversation(
  userId1: string,
  userId2: string,
  listingId?: string,
  jobRequestId?: string
): Promise<Conversation | null> {
  const supabase = await createClient();
  let query = supabase
    .from('conversations')
    .select('*')
    .or(`and(participant_1_id.eq.${userId1},participant_2_id.eq.${userId2}),and(participant_1_id.eq.${userId2},participant_2_id.eq.${userId1})`);

  if (listingId) {
    query = query.eq('listing_id', listingId);
  }
  if (jobRequestId) {
    query = query.eq('job_request_id', jobRequestId);
  }

  const { data, error } = await query.single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch conversation: ${error.message}`);
  }
  return toCamelCase(data);
}

export async function getConversations(
  filters: ConversationFilters = {},
  options: ListOptions = {}
): Promise<PaginatedResult<Conversation>> {
  const supabase = await createClient();
  let query = supabase.from('conversations').select('*', { count: 'exact' });

  if (filters.user_id) {
    query = query.or(`participant_1_id.eq.${filters.user_id},participant_2_id.eq.${filters.user_id}`);
  }
  if (filters.listing_id) query = query.eq('listing_id', filters.listing_id);
  if (filters.job_request_id) query = query.eq('job_request_id', filters.job_request_id);

  if (options.orderBy) {
    query = query.order(options.orderBy, { ascending: options.orderDirection === 'asc' });
  } else {
    query = query.order('last_message_at', { ascending: false });
  }

  const page = options.page || 1;
  const limit = options.limit || 20;
  query = query.range((page - 1) * limit, page * limit - 1);

  const { data, error, count } = await query;

  if (error) throw new Error(`Failed to fetch conversations: ${error.message}`);

  return {
    data: data?.map(toCamelCase) || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export async function createConversation(input: CreateConversationInput): Promise<Conversation> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('conversations')
    .insert(toSnakeCase(input))
    .select()
    .single();

  if (error) throw new Error(`Failed to create conversation: ${error.message}`);
  return toCamelCase(data);
}

export async function updateConversationLastMessage(
  id: string,
  lastMessageAt: string
): Promise<Conversation> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('conversations')
    .update({ last_message_at: lastMessageAt, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update conversation: ${error.message}`);
  return toCamelCase(data);
}

/**
 * ============================================
 * MESSAGES QUERIES
 * ============================================
 */

export async function getMessages(
  filters: MessageFilters = {},
  options: ListOptions = {}
): Promise<PaginatedResult<Message>> {
  const supabase = await createClient();
  let query = supabase.from('messages').select('*', { count: 'exact' });

  if (filters.conversation_id) query = query.eq('conversation_id', filters.conversation_id);
  if (filters.sender_id) query = query.eq('sender_id', filters.sender_id);

  if (options.orderBy) {
    query = query.order(options.orderBy, { ascending: options.orderDirection === 'asc' });
  } else {
    query = query.order('created_at', { ascending: true });
  }

  const page = options.page || 1;
  const limit = options.limit || 50;
  query = query.range((page - 1) * limit, page * limit - 1);

  const { data, error, count } = await query;

  if (error) throw new Error(`Failed to fetch messages: ${error.message}`);

  return {
    data: data?.map(toCamelCase) || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export async function createMessage(input: CreateMessageInput): Promise<Message> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('messages')
    .insert(toSnakeCase(input))
    .select()
    .single();

  if (error) throw new Error(`Failed to create message: ${error.message}`);
  return toCamelCase(data);
}

export async function markMessagesAsRead(
  conversationId: string,
  userId: string
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .neq('sender_id', userId)
    .is('read_at', null);

  if (error) throw new Error(`Failed to mark messages as read: ${error.message}`);
}

export async function getUnreadMessageCount(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('conversation_id', supabase
      .from('conversations')
      .select('id')
      .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`))
    .neq('sender_id', userId)
    .is('read_at', null);

  if (error) throw new Error(`Failed to get unread count: ${error.message}`);
  return count || 0;
}

/**
 * ============================================
 * REVIEWS QUERIES
 * ============================================
 */

export async function getReviewById(id: string): Promise<Review | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch review: ${error.message}`);
  }
  return toCamelCase(data);
}

export async function getReviews(
  filters: ReviewFilters = {},
  options: ListOptions = {}
): Promise<PaginatedResult<Review>> {
  const supabase = await createClient();
  let query = supabase.from('reviews').select('*', { count: 'exact' });

  if (filters.customer_id) query = query.eq('customer_id', filters.customer_id);
  if (filters.provider_id) query = query.eq('provider_id', filters.provider_id);
  if (filters.job_request_id) query = query.eq('job_request_id', filters.job_request_id);
  if (filters.listing_id) query = query.eq('listing_id', filters.listing_id);
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.min_rating) query = query.gte('rating', filters.min_rating);

  if (options.orderBy) {
    query = query.order(options.orderBy, { ascending: options.orderDirection === 'asc' });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const page = options.page || 1;
  const limit = options.limit || 20;
  query = query.range((page - 1) * limit, page * limit - 1);

  const { data, error, count } = await query;

  if (error) throw new Error(`Failed to fetch reviews: ${error.message}`);

  return {
    data: data?.map(toCamelCase) || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export async function getPublishedReviewsForProvider(providerId: string): Promise<Review[]> {
  const result = await getReviews(
    { provider_id: providerId, status: 'published' },
    { limit: 100, orderBy: 'created_at', orderDirection: 'desc' }
  );
  return result.data;
}

export async function createReview(input: CreateReviewInput): Promise<Review> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reviews')
    .insert(toSnakeCase({ ...input, status: 'pending', is_verified_purchase: false }))
    .select()
    .single();

  if (error) throw new Error(`Failed to create review: ${error.message}`);
  return toCamelCase(data);
}

export async function updateReview(
  id: string,
  input: UpdateReviewInput
): Promise<Review> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reviews')
    .update(toSnakeCase(input))
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update review: ${error.message}`);
  return toCamelCase(data);
}

/**
 * ============================================
 * REPORTS QUERIES
 * ============================================
 */

export async function getReportById(id: string): Promise<Report | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch report: ${error.message}`);
  }
  return toCamelCase(data);
}

export async function getReports(
  filters: ReportFilters = {},
  options: ListOptions = {}
): Promise<PaginatedResult<Report>> {
  const supabase = await createClient();
  let query = supabase.from('reports').select('*', { count: 'exact' });

  if (filters.reporter_id) query = query.eq('reporter_id', filters.reporter_id);
  if (filters.reported_type) query = query.eq('reported_type', filters.reported_type);
  if (filters.reported_id) query = query.eq('reported_id', filters.reported_id);
  if (filters.status) query = query.eq('status', filters.status);

  if (options.orderBy) {
    query = query.order(options.orderBy, { ascending: options.orderDirection === 'asc' });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const page = options.page || 1;
  const limit = options.limit || 20;
  query = query.range((page - 1) * limit, page * limit - 1);

  const { data, error, count } = await query;

  if (error) throw new Error(`Failed to fetch reports: ${error.message}`);

  return {
    data: data?.map(toCamelCase) || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export async function createReport(input: CreateReportInput): Promise<Report> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reports')
    .insert(toSnakeCase({ ...input, status: 'pending' }))
    .select()
    .single();

  if (error) throw new Error(`Failed to create report: ${error.message}`);
  return toCamelCase(data);
}

export async function updateReport(
  id: string,
  input: UpdateReportInput
): Promise<Report> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reports')
    .update(toSnakeCase(input))
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update report: ${error.message}`);
  return toCamelCase(data);
}

/**
 * ============================================
 * NOTIFICATIONS QUERIES
 * ============================================
 */

export async function getNotifications(
  filters: NotificationFilters = {},
  options: ListOptions = {}
): Promise<PaginatedResult<Notification>> {
  const supabase = await createClient();
  let query = supabase.from('notifications').select('*', { count: 'exact' });

  if (filters.user_id) query = query.eq('user_id', filters.user_id);
  if (filters.is_read !== undefined) query = query.eq('is_read', filters.is_read);
  if (filters.type) query = query.eq('type', filters.type);

  if (options.orderBy) {
    query = query.order(options.orderBy, { ascending: options.orderDirection === 'asc' });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const page = options.page || 1;
  const limit = options.limit || 20;
  query = query.range((page - 1) * limit, page * limit - 1);

  const { data, error, count } = await query;

  if (error) throw new Error(`Failed to fetch notifications: ${error.message}`);

  return {
    data: data?.map(toCamelCase) || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export async function createNotification(input: CreateNotificationInput): Promise<Notification> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('notifications')
    .insert(toSnakeCase({ ...input, is_read: false }))
    .select()
    .single();

  if (error) throw new Error(`Failed to create notification: ${error.message}`);
  return toCamelCase(data);
}

export async function markNotificationAsRead(id: string): Promise<Notification> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to mark notification as read: ${error.message}`);
  return toCamelCase(data);
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) throw new Error(`Failed to mark all notifications as read: ${error.message}`);
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) throw new Error(`Failed to get unread notification count: ${error.message}`);
  return count || 0;
}

/**
 * ============================================
 * ADMIN AUDIT LOGS QUERIES
 * ============================================
 */

export async function createAdminAuditLog(input: CreateAdminAuditLogInput): Promise<AdminAuditLog> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('admin_audit_logs')
    .insert(toSnakeCase(input))
    .select()
    .single();

  if (error) throw new Error(`Failed to create audit log: ${error.message}`);
  return toCamelCase(data);
}

export async function getAdminAuditLogs(
  adminId?: string,
  options: ListOptions = {}
): Promise<PaginatedResult<AdminAuditLog>> {
  const supabase = await createClient();
  let query = supabase.from('admin_audit_logs').select('*', { count: 'exact' });

  if (adminId) query = query.eq('admin_id', adminId);

  if (options.orderBy) {
    query = query.order(options.orderBy, { ascending: options.orderDirection === 'asc' });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const page = options.page || 1;
  const limit = options.limit || 50;
  query = query.range((page - 1) * limit, page * limit - 1);

  const { data, error, count } = await query;

  if (error) throw new Error(`Failed to fetch audit logs: ${error.message}`);

  return {
    data: data?.map(toCamelCase) || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

/**
 * ============================================
 * DISTRICTS & CITIES QUERIES
 * ============================================
 */

export async function getDistricts(): Promise<District[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('districts')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw new Error(`Failed to fetch districts: ${error.message}`);
  return (data || []).map(toCamelCase);
}

export async function getDistrictById(id: string): Promise<District | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('districts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch district: ${error.message}`);
  }
  return toCamelCase(data);
}

export async function getCities(districtId?: string): Promise<City[]> {
  const supabase = await createClient();
  let query = supabase.from('cities').select('*');

  if (districtId) {
    query = query.eq('district_id', districtId);
  }

  query = query.order('name', { ascending: true });

  const { data, error } = await query;
  if (error) throw new Error(`Failed to fetch cities: ${error.message}`);
  return (data || []).map(toCamelCase);
}

export async function getCityById(id: string): Promise<City | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch city: ${error.message}`);
  }
  return toCamelCase(data);
}

export async function createDistrict(input: CreateDistrictInput): Promise<District> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('districts')
    .insert(toSnakeCase(input))
    .select()
    .single();

  if (error) throw new Error(`Failed to create district: ${error.message}`);
  return toCamelCase(data);
}

export async function createCity(input: CreateCityInput): Promise<City> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('cities')
    .insert(toSnakeCase(input))
    .select()
    .single();

  if (error) throw new Error(`Failed to create city: ${error.message}`);
  return toCamelCase(data);
}