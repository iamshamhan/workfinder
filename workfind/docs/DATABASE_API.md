# WorkFind Database API Reference

## Overview

This document describes the type-safe database access layer for WorkFind. All queries are in `src/lib/db/queries.ts` with types in `src/lib/db/types.ts`.

## Quick Start

```typescript
import { 
  getProviderProfileById,
  getServiceListings,
  createServiceListing,
  searchListings 
} from '@/lib/db';

// Server Component (uses server client automatically)
const provider = await getProviderProfileById('uuid-here');

// Client Component (uses browser client)
const listings = await getServiceListings({ status: 'published' });
```

---

## Profiles

### `getProfileByUserId(userId: string): Promise<Profile | null>`
Get profile by Supabase auth user ID.

### `getProfileById(id: string): Promise<Profile | null>`
Get profile by internal profile ID.

### `getProfiles(filters?, options?): Promise<PaginatedResult<Profile>>`
List profiles with filters.
```typescript
getProfiles(
  { role: 'provider', status: 'active' },
  { page: 1, limit: 20, orderBy: 'created_at', orderDirection: 'desc' }
)
```

### `createProfile(input: CreateProfileInput): Promise<Profile>`
Create new profile (called during registration).

### `updateProfile(userId: string, input: UpdateProfileInput): Promise<Profile>`
Update user's own profile.

---

## Categories & Subcategories

### `getCategories(includeInactive?: boolean): Promise<Category[]>`
Get all categories, optionally including inactive.

### `getCategoryBySlug(slug: string): Promise<Category | null>`
Get category by URL slug.

### `getCategoryById(id: string): Promise<Category | null>`
Get category by ID.

### `getSubcategories(categoryId: string, includeInactive?: boolean): Promise<Subcategory[]>`
Get subcategories for a category.

### `getSubcategoryBySlug(categoryId: string, slug: string): Promise<Subcategory | null>`
Get subcategory by slug within category.

### `createCategory(input: CreateCategoryInput): Promise<Category>`
Admin only: Create new category.

### `updateCategory(id: string, input: UpdateCategoryInput): Promise<Category>`
Admin only: Update category.

---

## Provider Profiles

### `getProviderProfileByUserId(userId: string): Promise<ProviderProfile | null>`
Get provider profile by auth user ID.

### `getProviderProfileById(id: string): Promise<ProviderProfile | null>`
Get provider profile by ID.

### `getProviderProfiles(filters?, options?): Promise<PaginatedResult<ProviderProfile>>`
List provider profiles with filters.
```typescript
getProviderProfiles(
  { 
    verification_status: 'verified',
    district: 'colombo',
    min_rating: 4.0 
  },
  { page: 1, limit: 12, orderBy: 'rating', orderDirection: 'desc' }
)
```

### `createProviderProfile(input: CreateProviderProfileInput): Promise<ProviderProfile>`
Create provider profile (after registration as provider).

### `updateProviderProfile(userId: string, input: UpdateProviderProfileInput): Promise<ProviderProfile>`
Update provider's own profile.

### `incrementProfileViews(providerId: string): Promise<void>`
Atomically increment profile view counter.

---

## Provider Categories

### `getProviderCategories(providerId: string): Promise<ProviderCategory[]>`
Get all categories for a provider.

### `addProviderCategory(input: CreateProviderCategoryInput): Promise<ProviderCategory>`
Add category to provider profile.

### `removeProviderCategory(providerId: string, categoryId: string, subcategoryId?: string): Promise<void>`
Remove category from provider profile.

---

## Service Listings

### `getServiceListingById(id: string): Promise<ServiceListing | null>`
Get listing by ID.

### `getServiceListingBySlug(providerId: string, slug: string): Promise<ServiceListing | null>`
Get listing by provider + slug (for URLs).

### `getServiceListings(filters?, options?): Promise<PaginatedResult<ServiceListing>>`
List listings with filters.
```typescript
getServiceListings(
  { 
    provider_id: 'uuid',
    category_id: 'uuid',
    status: 'published',
    district: 'colombo',
    min_price: 1000,
    max_price: 50000 
  },
  { page: 1, limit: 12, orderBy: 'created_at', orderDirection: 'desc' }
)
```

### `searchListings(params: SearchListingsParams): Promise<PaginatedResult<ServiceListing>>`
Advanced search with full-text search.
```typescript
searchListings({
  query: 'electrical wiring',
  category: 'electrical',
  subcategory: 'residential-wiring',
  district: 'colombo',
  city: 'Colombo',
  min_price: 5000,
  max_price: 50000,
  min_rating: 4.0,
  verified_only: true,
  pricing_types: ['fixed', 'starting_from'],
  service_delivery_types: ['customer_location'],
  sort_by: 'rating',
  page: 1,
  limit: 12
})
```

### `createServiceListing(input: CreateServiceListingInput): Promise<ServiceListing>`
Create new service listing (provider only).

### `updateServiceListing(id: string, input: UpdateServiceListingInput): Promise<ServiceListing>`
Update own listing (provider only).

### `incrementListingViews(listingId: string): Promise<void>`
Atomically increment view counter.

### `incrementListingEnquiries(listingId: string): Promise<void>`
Atomically increment enquiry counter.

---

## Listing Images

### `getListingImages(listingId: string): Promise<ListingImage[]>`
Get all images for a listing, ordered by display_order.

### `addListingImage(input: CreateListingImageInput): Promise<ListingImage>`
Add image to listing.

### `deleteListingImage(id: string): Promise<void>`
Delete listing image.

---

## Service Areas

### `getServiceAreas(providerId: string): Promise<ServiceArea[]>`
Get provider's service areas.

### `addServiceArea(input: CreateServiceAreaInput): Promise<ServiceArea>`
Add service area for provider.

### `removeServiceArea(id: string): Promise<void>`
Remove service area.

---

## Saved Providers

### `getSavedProviders(customerId: string): Promise<SavedProvider[]>`
Get customer's saved providers.

### `isProviderSaved(customerId: string, providerId: string): Promise<boolean>`
Check if provider is saved by customer.

### `saveProvider(input: CreateSavedProviderInput): Promise<SavedProvider>`
Save a provider.

### `unsaveProvider(customerId: string, providerId: string): Promise<void>`
Remove saved provider.

---

## Job Requests

### `getJobRequestById(id: string): Promise<JobRequest | null>`
Get job request by ID.

### `getJobRequests(filters?, options?): Promise<PaginatedResult<JobRequest>>`
List job requests (customer's own or admin).
```typescript
getJobRequests(
  { customer_id: 'uuid', status: 'open', category_id: 'uuid' },
  { page: 1, limit: 20 }
)
```

### `getOpenJobRequestsForProvider(providerId: string, options?): Promise<PaginatedResult<JobRequest>>`
Get open job requests matching provider's categories/areas.

### `createJobRequest(input: CreateJobRequestInput): Promise<JobRequest>`
Create job request (customer only).

### `updateJobRequest(id: string, input: UpdateJobRequestInput): Promise<JobRequest>`
Update own job request (customer only).

---

## Quotations

### `getQuotationById(id: string): Promise<Quotation | null>`
Get quotation by ID.

### `getQuotations(filters?, options?): Promise<PaginatedResult<Quotation>>`
List quotations.
```typescript
getQuotations(
  { job_request_id: 'uuid', provider_id: 'uuid', status: 'pending' },
  { page: 1, limit: 20 }
)
```

### `getQuotationsForJobRequest(jobRequestId: string): Promise<Quotation[]>`
Get all quotations for a job request.

### `createQuotation(input: CreateQuotationInput): Promise<Quotation>`
Create quotation (provider only).

### `updateQuotation(id: string, input: UpdateQuotationInput): Promise<Quotation>`
Update own quotation (provider only).

---

## Enquiries

### `getEnquiryById(id: string): Promise<Enquiry | null>`
Get enquiry by ID.

### `getEnquiries(filters?, options?): Promise<PaginatedResult<Enquiry>>`
List enquiries.
```typescript
getEnquiries(
  { customer_id: 'uuid', provider_id: 'uuid', listing_id: 'uuid', status: 'new' },
  { page: 1, limit: 20 }
)
```

### `createEnquiry(input: CreateEnquiryInput): Promise<Enquiry>`
Create enquiry (customer only).

### `updateEnquiry(id: string, input: UpdateEnquiryInput): Promise<Enquiry>`
Update enquiry (customer can update own, provider can update status).

---

## Conversations

### `getConversationById(id: string): Promise<Conversation | null>`
Get conversation by ID.

### `getConversation(userId1, userId2, listingId?, jobRequestId?): Promise<Conversation | null>`
Get or find conversation between two users.

### `getConversations(filters?, options?): Promise<PaginatedResult<Conversation>>`
List user's conversations.
```typescript
getConversations(
  { user_id: 'uuid', listing_id: 'uuid' },
  { page: 1, limit: 20, orderBy: 'last_message_at', orderDirection: 'desc' }
)
```

### `createConversation(input: CreateConversationInput): Promise<Conversation>`
Create new conversation.

### `updateConversationLastMessage(id: string, lastMessageAt: string): Promise<Conversation>`
Update last message timestamp (called when message sent).

---

## Messages

### `getMessages(filters?, options?): Promise<PaginatedResult<Message>>`
Get messages in a conversation.
```typescript
getMessages(
  { conversation_id: 'uuid', unread_only: true },
  { page: 1, limit: 50, orderBy: 'created_at', orderDirection: 'asc' }
)
```

### `createMessage(input: CreateMessageInput): Promise<Message>`
Send message in conversation.

### `markMessagesAsRead(conversationId: string, userId: string): Promise<void>`
Mark messages as read (for messages not sent by user).

### `getUnreadMessageCount(userId: string): Promise<number>`
Get total unread message count for user.

---

## Reviews

### `getReviewById(id: string): Promise<Review | null>`
Get review by ID.

### `getReviews(filters?, options?): Promise<PaginatedResult<Review>>`
List reviews with filters.
```typescript
getReviews(
  { provider_id: 'uuid', status: 'published', min_rating: 4 },
  { page: 1, limit: 10, orderBy: 'created_at', orderDirection: 'desc' }
)
```

### `getPublishedReviewsForProvider(providerId: string): Promise<Review[]>`
Get all published reviews for a provider.

### `createReview(input: CreateReviewInput): Promise<Review>`
Create review (customer only, for completed jobs).

### `updateReview(id: string, input: UpdateReviewInput): Promise<Review>`
Update own review (customer only).

---

## Reports

### `getReportById(id: string): Promise<Report | null>`
Get report by ID.

### `getReports(filters?, options?): Promise<PaginatedResult<Report>>`
List reports.
```typescript
getReports(
  { reporter_id: 'uuid', reported_type: 'listing', status: 'pending' },
  { page: 1, limit: 20 }
)
```

### `createReport(input: CreateReportInput): Promise<Report>`
Create report (any authenticated user).

### `updateReport(id: string, input: UpdateReportInput): Promise<Report>`
Update report (admin only).

---

## Notifications

### `getNotifications(filters?, options?): Promise<PaginatedResult<Notification>>`
Get user notifications.
```typescript
getNotifications(
  { user_id: 'uuid', is_read: false, type: 'new_message' },
  { page: 1, limit: 20 }
)
```

### `createNotification(input: CreateNotificationInput): Promise<Notification>`
Create notification (system/server-side).

### `markNotificationAsRead(id: string): Promise<Notification>`
Mark notification as read.

### `markAllNotificationsAsRead(userId: string): Promise<void>`
Mark all user notifications as read.

### `getUnreadNotificationCount(userId: string): Promise<number>`
Get unread notification count.

---

## Admin Audit Logs

### `createAdminAuditLog(input: CreateAdminAuditLogInput): Promise<AdminAuditLog>`
Create audit log entry (server-side).

### `getAdminAuditLogs(adminId?, options?): Promise<PaginatedResult<AdminAuditLog>>`
Get audit logs (admin only).
```typescript
getAdminAuditLogs(
  'admin-user-id',
  { page: 1, limit: 50, orderBy: 'created_at', orderDirection: 'desc' }
)
```

---

## Districts & Cities

### `getDistricts(): Promise<District[]>`
Get all 25 Sri Lankan districts.

### `getDistrictById(id: string): Promise<District | null>`
Get district by code.

### `getCities(districtId?: string): Promise<City[]>`
Get cities, optionally filtered by district.

### `getCityById(id: string): Promise<City | null>`
Get city by ID.

### `createDistrict(input: CreateDistrictInput): Promise<District>`
Admin only: Create district.

### `createCity(input: CreateCityInput): Promise<City>`
Admin only: Create city.

---

## Storage API

### File Upload Helpers

```typescript
import { 
  uploadProfilePicture,
  uploadBusinessLogo,
  uploadCoverImage,
  uploadListingImage,
  uploadPortfolioImage,
  uploadJobAttachment,
  uploadReviewImage,
  uploadChatAttachment 
} from '@/lib/db/storage';

// Client-side
const result = await uploadProfilePicture(userId, file);
// result: { path, fullPath, publicUrl }

// Server-side
import { uploadProfilePicture as uploadProfilePictureServer } from '@/lib/db/storage';
const result = await uploadProfilePictureServer(userId, file);
```

### Generic Storage Functions

```typescript
import { 
  uploadFile, 
  deleteFile, 
  getPublicUrl, 
  createSignedUrl,
  listFiles 
} from '@/lib/db/storage';

import { STORAGE_BUCKETS } from '@/lib/db/storage';

uploadFile(STORAGE_BUCKETS.LISTING_IMAGES, path, file);
deleteFile(STORAGE_BUCKETS.LISTING_IMAGES, path);
const url = getPublicUrl(STORAGE_BUCKETS.LISTING_IMAGES, path);
const signedUrl = await createSignedUrl(STORAGE_BUCKETS.JOB_ATTACHMENTS, path, 3600);
const files = await listFiles(STORAGE_BUCKETS.LISTING_IMAGES, folderPath);
```

### Bucket Constants

```typescript
STORAGE_BUCKETS = {
  PROFILE_PICTURES: 'profile-pictures',
  BUSINESS_LOGOS: 'business-logos',
  COVER_IMAGES: 'cover-images',
  LISTING_IMAGES: 'listing-images',
  PORTFOLIO_IMAGES: 'portfolio-images',
  JOB_ATTACHMENTS: 'job-attachments',
  REVIEW_IMAGES: 'review-images',
  CHAT_ATTACHMENTS: 'chat-attachments',
}
```

### Validation

```typescript
import { validateFile } from '@/lib/db/storage';

const validation = validateFile(file, STORAGE_BUCKETS.PROFILE_PICTURES);
if (!validation.valid) {
  throw new Error(validation.error);
}
```

---

## Pagination

All list functions return `PaginatedResult<T>`:

```typescript
interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

---

## Filter Types

Each entity has a corresponding filter type:

```typescript
// Example: ServiceListingFilters
interface ServiceListingFilters {
  provider_id?: string;
  category_id?: string;
  subcategory_id?: string;
  status?: ListingStatus;
  district?: string;
  city?: string;
  pricing_type?: PricingType;
  min_price?: number;
  max_price?: number;
  search?: string; // Not used in basic getServiceListings, use searchListings instead
}
```

---

## Error Handling

All functions throw `Error` on failure with descriptive messages:

```typescript
try {
  const listing = await createServiceListing(input);
} catch (error) {
  if (error instanceof Error) {
    console.error('Failed to create listing:', error.message);
    // Handle specific errors:
    // - 'duplicate key value violates unique constraint' → slug conflict
    // - 'foreign key constraint' → invalid category/provider ID
    // - 'row-level security policy' → permission denied
  }
}
```

---

## Server vs Client Usage

### Server Components / Server Actions / API Routes
```typescript
import { getProviderProfileById } from '@/lib/db';
// Uses createServerClient() automatically
```

### Client Components
```typescript
import { getProviderProfileById } from '@/lib/db';
// Uses createBrowserClient() automatically
```

### Explicit Client Choice
```typescript
import { 
  createServerClient, 
  createBrowserClient 
} from '@/lib/db';

const serverDb = createServerClient();
const clientDb = createBrowserClient();
// Use with manual queries if needed
```

---

## TypeScript Types

Import types from `@/types` or `@/lib/db/types`:

```typescript
import type { 
  Profile, 
  ProviderProfile, 
  ServiceListing, 
  CreateServiceListingInput,
  UpdateServiceListingInput,
  SearchListingsParams,
  PaginatedResult 
} from '@/lib/db/types';
```

All database row types (snake_case) are in `src/lib/db/types.ts` with `Row` suffix:
- `ProfileRow`, `CategoryRow`, `ProviderProfileRow`, etc.

Input types use camelCase:
- `CreateProfileInput`, `UpdateProviderProfileInput`, etc.

---

## RPC Functions (Direct Supabase)

For advanced queries, use RPC functions directly:

```typescript
const supabase = createClient();

// Full-text search via RPC
const { data } = await supabase.rpc('search_service_listings', {
  search_query: 'electrical',
  category_slug: 'electrical',
  district_param: 'colombo',
  min_price: 5000,
  sort_by: 'rating',
  page_num: 1,
  limit_num: 12
});

// Match providers to job request
const { data } = await supabase.rpc('find_matching_providers', {
  job_request_id: 'uuid'
});
```

---

## Migration Helpers

```bash
# Generate types after schema changes
npm run db:types

# Push migrations to remote
npm run db:push

# Reset local database
npm run db:reset
```