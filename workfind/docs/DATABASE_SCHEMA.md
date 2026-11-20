# WorkFind Database Schema Documentation

## Overview

This document describes the complete PostgreSQL database schema for the WorkFind Sri Lankan Service Provider Marketplace. The schema is designed with Row Level Security (RLS) policies for multi-tenant access control supporting three user roles: **Customer**, **Provider**, and **Admin**.

## Database Extensions

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- Trigram similarity for full-text search
```

## Entity Relationship Diagram

```
┌─────────────┐       ┌──────────────────┐       ┌─────────────────┐
│   profiles  │◄─────►│ provider_profiles│◄─────►│ service_listings│
└─────────────┘       └──────────────────┘       └────────┬────────┘
      │                          │                        │
      │                          ▼                        ▼
      │                   ┌───────────────┐       ┌───────────────┐
      │                   │provider_categ.│       │ listing_images│
      │                   └───────────────┘       └───────────────┘
      │                          │
      ▼                          ▼
┌─────────────┐       ┌──────────────────┐       ┌─────────────────┐
│  categories │◄─────►│  subcategories   │       │  service_areas  │
└─────────────┘       └──────────────────┘       └─────────────────┘
      │                          │
      │                          ▼
      │                   ┌──────────────────┐
      │                   │   job_requests   │◄──────┐
      │                   └────────┬─────────┘       │
      │                            │                 │
      ▼                            ▼                 ▼
┌─────────────┐       ┌──────────────────┐  ┌───────────────┐
│  enquiries  │       │   quotations     │  │ conversations │
└─────────────┘       └──────────────────┘  └───────┬───────┘
                                                    │
                                                    ▼
                                             ┌───────────────┐
                                             │   messages    │
                                             └───────────────┘
                                                    │
                                                    ▼
                                             ┌───────────────┐
                                             │   reviews     │
                                             └───────────────┘
                                                    │
                                                    ▼
                                             ┌───────────────┐
                                             │   reports     │
                                             └───────────────┘
                                                    │
                                                    ▼
                                             ┌───────────────┐
                                             │ notifications │
                                             └───────────────┘
                                                    │
                                                    ▼
                                             ┌───────────────┐
                                             │admin_audit_log│
                                             └───────────────┘
```

## Tables

### 1. Core Tables

#### `profiles`
Extends Supabase `auth.users` with application-specific fields.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Internal profile ID |
| `user_id` | UUID | FK→auth.users(id), UNIQUE, NOT NULL | Supabase auth user ID |
| `full_name` | TEXT | | User's full name |
| `avatar_url` | TEXT | | Profile picture URL |
| `role` | TEXT | NOT NULL, CHECK('customer','provider','admin'), DEFAULT 'customer' | User role |
| `status` | TEXT | NOT NULL, CHECK('active','suspended','pending_verification','banned'), DEFAULT 'active' | Account status |
| `phone` | TEXT | | Phone number |
| `whatsapp` | TEXT | | WhatsApp number |
| `email` | TEXT | NOT NULL | Email address |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:** `user_id`, `role`, `status`

#### `categories`
Main service categories.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Category ID |
| `name` | TEXT | NOT NULL | Category name |
| `slug` | TEXT | NOT NULL, UNIQUE | URL-friendly slug |
| `description` | TEXT | | Category description |
| `icon` | TEXT | | Emoji/icon identifier |
| `image_url` | TEXT | | Category image URL |
| `parent_id` | UUID | FK→categories(id), SET NULL | Parent category (for hierarchy) |
| `display_order` | INTEGER | NOT NULL, DEFAULT 0 | Sort order |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | Visibility flag |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:** `parent_id`, `slug`, `is_active`

#### `subcategories`
Subcategories within categories.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Subcategory ID |
| `category_id` | UUID | FK→categories(id), CASCADE, NOT NULL | Parent category |
| `name` | TEXT | NOT NULL | Subcategory name |
| `slug` | TEXT | NOT NULL | URL-friendly slug |
| `description` | TEXT | | Subcategory description |
| `display_order` | INTEGER | NOT NULL, DEFAULT 0 | Sort order |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | Visibility flag |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Unique:** `(category_id, slug)`
**Indexes:** `category_id`, `slug`, `is_active`

### 2. Provider Tables

#### `provider_profiles`
Extended profile for service providers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Provider profile ID |
| `user_id` | UUID | FK→auth.users(id), CASCADE, UNIQUE, NOT NULL | Auth user ID |
| `business_name` | TEXT | NOT NULL | Business name |
| `business_logo_url` | TEXT | | Logo image URL |
| `cover_image_url` | TEXT | | Cover/banner image URL |
| `short_intro` | TEXT | | Brief tagline |
| `description` | TEXT | | Detailed description |
| `main_category_id` | UUID | FK→categories(id), SET NULL | Primary category |
| `years_experience` | INTEGER | | Years in business |
| `languages` | TEXT[] | NOT NULL, DEFAULT '{}' | Spoken languages |
| `availability` | JSONB | NOT NULL, DEFAULT {...} | Weekly schedule |
| `service_delivery_types` | TEXT[] | NOT NULL, DEFAULT '{}' | Delivery methods |
| `verification_status` | TEXT | NOT NULL, CHECK('unverified','pending','verified','rejected'), DEFAULT 'unverified' | Verification state |
| `verified_at` | TIMESTAMPTZ | | Verification timestamp |
| `verified_by` | UUID | FK→auth.users(id), SET NULL | Verifying admin |
| `rating` | NUMERIC(3,2) | NOT NULL, DEFAULT 0.00 | Average rating |
| `review_count` | INTEGER | NOT NULL, DEFAULT 0 | Number of reviews |
| `profile_views` | INTEGER | NOT NULL, DEFAULT 0 | Profile view count |
| `district` | TEXT | | District location |
| `city` | TEXT | | City location |
| `phone` | TEXT | | Business phone |
| `whatsapp` | TEXT | | Business WhatsApp |
| `email` | TEXT | | Business email |
| `service_coverage` | TEXT[] | NOT NULL, DEFAULT '{}' | Serviceable districts |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:** `user_id`, `main_category_id`, `district`, `city`, `verification_status`, `rating DESC`

#### `provider_categories`
Many-to-many relationship between providers and categories.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Record ID |
| `provider_id` | UUID | FK→provider_profiles(id), CASCADE, NOT NULL | Provider |
| `category_id` | UUID | FK→categories(id), CASCADE, NOT NULL | Category |
| `subcategory_id` | UUID | FK→subcategories(id), SET NULL | Subcategory |
| `is_primary` | BOOLEAN | NOT NULL, DEFAULT FALSE | Primary category flag |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Unique:** `(provider_id, category_id, subcategory_id)`
**Indexes:** `provider_id`, `category_id`

#### `service_areas`
Geographic service coverage for providers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Record ID |
| `provider_id` | UUID | FK→provider_profiles(id), CASCADE, NOT NULL | Provider |
| `district` | TEXT | NOT NULL | District |
| `city` | TEXT | | City |
| `is_primary` | BOOLEAN | NOT NULL, DEFAULT FALSE | Primary area flag |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Unique:** `(provider_id, district, city)`
**Indexes:** `provider_id`, `district`

### 3. Service Listing Tables

#### `service_listings`
Services offered by providers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Listing ID |
| `provider_id` | UUID | FK→provider_profiles(id), CASCADE, NOT NULL | Provider |
| `title` | TEXT | NOT NULL | Service title |
| `slug` | TEXT | NOT NULL | URL-friendly slug |
| `description` | TEXT | NOT NULL | Service description |
| `category_id` | UUID | FK→categories(id), RESTRICT, NOT NULL | Category |
| `subcategory_id` | UUID | FK→subcategories(id), SET NULL | Subcategory |
| `main_image_url` | TEXT | | Main image URL |
| `pricing_type` | TEXT | NOT NULL, CHECK('fixed','starting_from','hourly','daily','negotiable','quotation') | Pricing model |
| `price_amount` | NUMERIC(12,2) | | Price amount |
| `price_currency` | TEXT | NOT NULL, DEFAULT 'LKR' | Currency |
| `location_type` | TEXT | NOT NULL, CHECK('business_location','customer_location','remote','multiple_locations') | Service location |
| `district` | TEXT | | Service district |
| `city` | TEXT | | Service city |
| `service_coverage` | TEXT[] | NOT NULL, DEFAULT '{}' | Coverage areas |
| `experience_required` | TEXT | | Required experience |
| `tags` | TEXT[] | NOT NULL, DEFAULT '{}' | Search tags |
| `status` | TEXT | NOT NULL, CHECK('draft','pending_approval','published','rejected','suspended','archived'), DEFAULT 'draft' | Listing status |
| `rejection_reason` | TEXT | | Rejection reason |
| `published_at` | TIMESTAMPTZ | | Publication timestamp |
| `view_count` | INTEGER | NOT NULL, DEFAULT 0 | View counter |
| `enquiry_count` | INTEGER | NOT NULL, DEFAULT 0 | Enquiry counter |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Unique:** `(provider_id, slug)`
**Indexes:** `provider_id`, `category_id`, `subcategory_id`, `status`, `district`, `city`, `pricing_type`, `published_at DESC`
**Full-text Search Index:** GIN index on `(title, description, experience_required, tags)`

#### `listing_images`
Image gallery for service listings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Image ID |
| `listing_id` | UUID | FK→service_listings(id), CASCADE, NOT NULL | Listing |
| `image_url` | TEXT | NOT NULL | Image URL |
| `display_order` | INTEGER | NOT NULL, DEFAULT 0 | Sort order |
| `is_main` | BOOLEAN | NOT NULL, DEFAULT FALSE | Main image flag |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Indexes:** `listing_id`

### 4. Customer Interaction Tables

#### `saved_providers`
Customer's saved/favorite providers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Record ID |
| `customer_id` | UUID | FK→auth.users(id), CASCADE, NOT NULL | Customer |
| `provider_id` | UUID | FK→provider_profiles(id), CASCADE, NOT NULL | Provider |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Unique:** `(customer_id, provider_id)`
**Indexes:** `customer_id`, `provider_id`

#### `job_requests`
Service requests posted by customers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Request ID |
| `customer_id` | UUID | FK→auth.users(id), CASCADE, NOT NULL | Customer |
| `title` | TEXT | NOT NULL | Request title |
| `description` | TEXT | NOT NULL | Request description |
| `category_id` | UUID | FK→categories(id), RESTRICT, NOT NULL | Category |
| `subcategory_id` | UUID | FK→subcategories(id), SET NULL | Subcategory |
| `required_service` | TEXT | NOT NULL | Specific service needed |
| `district` | TEXT | NOT NULL | Service district |
| `city` | TEXT | | Service city |
| `budget_min` | NUMERIC(12,2) | | Minimum budget |
| `budget_max` | NUMERIC(12,2) | | Maximum budget |
| `budget_currency` | TEXT | NOT NULL, DEFAULT 'LKR' | Currency |
| `preferred_date` | TIMESTAMPTZ | | Preferred service date |
| `urgency` | TEXT | NOT NULL, CHECK('low','normal','high','urgent'), DEFAULT 'normal' | Urgency level |
| `reference_images` | TEXT[] | NOT NULL, DEFAULT '{}' | Reference images |
| `contact_preferences` | TEXT[] | NOT NULL, DEFAULT '{}' | Contact methods |
| `status` | TEXT | NOT NULL, CHECK('open','receiving_offers','in_progress','completed','cancelled'), DEFAULT 'open' | Request status |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:** `customer_id`, `category_id`, `district`, `status`, `created_at DESC`
**Full-text Search Index:** GIN index on `(title, description, required_service)`

#### `quotations`
Provider quotes for job requests.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Quotation ID |
| `job_request_id` | UUID | FK→job_requests(id), CASCADE, NOT NULL | Job request |
| `provider_id` | UUID | FK→provider_profiles(id), CASCADE, NOT NULL | Provider |
| `amount` | NUMERIC(12,2) | NOT NULL | Quote amount |
| `currency` | TEXT | NOT NULL, DEFAULT 'LKR' | Currency |
| `description` | TEXT | NOT NULL | Quote details |
| `estimated_duration` | TEXT | | Estimated completion time |
| `valid_until` | TIMESTAMPTZ | | Quote validity |
| `status` | TEXT | NOT NULL, CHECK('pending','accepted','rejected','withdrawn','expired'), DEFAULT 'pending' | Quote status |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Unique:** `(job_request_id, provider_id)`
**Indexes:** `job_request_id`, `provider_id`, `status`

#### `enquiries`
Direct enquiries from customers to providers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Enquiry ID |
| `customer_id` | UUID | FK→auth.users(id), CASCADE, NOT NULL | Customer |
| `provider_id` | UUID | FK→provider_profiles(id), CASCADE, NOT NULL | Provider |
| `listing_id` | UUID | FK→service_listings(id), SET NULL | Related listing |
| `subject` | TEXT | NOT NULL | Enquiry subject |
| `message` | TEXT | NOT NULL | Enquiry message |
| `contact_method` | TEXT | NOT NULL, CHECK('call','whatsapp','email','in_app') | Preferred contact |
| `status` | TEXT | NOT NULL, CHECK('new','read','replied','closed'), DEFAULT 'new' | Enquiry status |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:** `customer_id`, `provider_id`, `listing_id`, `status`

### 5. Communication Tables

#### `conversations`
Message threads between users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Conversation ID |
| `participant_1_id` | UUID | FK→auth.users(id), CASCADE, NOT NULL | First participant |
| `participant_2_id` | UUID | FK→auth.users(id), CASCADE, NOT NULL | Second participant |
| `listing_id` | UUID | FK→service_listings(id), SET NULL | Related listing |
| `job_request_id` | UUID | FK→job_requests(id), SET NULL | Related job request |
| `last_message_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last activity |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Unique:** `(participant_1_id, participant_2_id, listing_id, job_request_id)`
**Indexes:** `participant_1_id`, `participant_2_id`, `listing_id`, `job_request_id`, `last_message_at DESC`

#### `messages`
Individual messages within conversations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Message ID |
| `conversation_id` | UUID | FK→conversations(id), CASCADE, NOT NULL | Conversation |
| `sender_id` | UUID | FK→auth.users(id), CASCADE, NOT NULL | Sender |
| `content` | TEXT | NOT NULL | Message content |
| `message_type` | TEXT | NOT NULL, CHECK('text','image','file','system'), DEFAULT 'text' | Message type |
| `read_at` | TIMESTAMPTZ | | Read timestamp |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Indexes:** `conversation_id`, `sender_id`, `created_at`

### 6. Review & Moderation Tables

#### `reviews`
Customer reviews for providers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Review ID |
| `customer_id` | UUID | FK→auth.users(id), CASCADE, NOT NULL | Customer |
| `provider_id` | UUID | FK→provider_profiles(id), CASCADE, NOT NULL | Provider |
| `job_request_id` | UUID | FK→job_requests(id), SET NULL | Related job |
| `listing_id` | UUID | FK→service_listings(id), SET NULL | Related listing |
| `rating` | INTEGER | NOT NULL, CHECK(1-5) | Star rating |
| `title` | TEXT | | Review title |
| `content` | TEXT | NOT NULL | Review content |
| `images` | TEXT[] | NOT NULL, DEFAULT '{}' | Review images |
| `is_verified_purchase` | BOOLEAN | NOT NULL, DEFAULT FALSE | Verified purchase |
| `status` | TEXT | NOT NULL, CHECK('pending','published','hidden','flagged'), DEFAULT 'pending' | Moderation status |
| `moderation_note` | TEXT | | Moderator notes |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Unique:** `(customer_id, provider_id, job_request_id)`
**Indexes:** `customer_id`, `provider_id`, `job_request_id`, `listing_id`, `status`, `rating`

#### `reports`
User reports for content moderation.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Report ID |
| `reporter_id` | UUID | FK→auth.users(id), CASCADE, NOT NULL | Reporter |
| `reported_type` | TEXT | NOT NULL, CHECK('user','listing','review','message') | Reported entity type |
| `reported_id` | UUID | NOT NULL | Reported entity ID |
| `reason` | TEXT | NOT NULL, CHECK('inappropriate_content','spam','fake_profile','misleading_information','harassment','fraud','poor_service','other') | Report reason |
| `description` | TEXT | | Detailed description |
| `status` | TEXT | NOT NULL, CHECK('pending','under_review','resolved','dismissed'), DEFAULT 'pending' | Report status |
| `moderator_id` | UUID | FK→auth.users(id), SET NULL | Moderating admin |
| `moderation_note` | TEXT | | Moderator notes |
| `resolved_at` | TIMESTAMPTZ | | Resolution timestamp |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Indexes:** `reporter_id`, `(reported_type, reported_id)`, `status`

### 7. System Tables

#### `notifications`
User notifications.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Notification ID |
| `user_id` | UUID | FK→auth.users(id), CASCADE, NOT NULL | Recipient |
| `type` | TEXT | NOT NULL, CHECK(13 types) | Notification type |
| `title` | TEXT | NOT NULL | Notification title |
| `message` | TEXT | NOT NULL | Notification message |
| `reference_id` | UUID | | Related entity ID |
| `reference_type` | TEXT | | Related entity type |
| `is_read` | BOOLEAN | NOT NULL, DEFAULT FALSE | Read status |
| `read_at` | TIMESTAMPTZ | | Read timestamp |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Notification Types:** `new_enquiry`, `new_message`, `new_quotation`, `quotation_accepted`, `quotation_rejected`, `listing_approved`, `listing_rejected`, `listing_suspended`, `review_received`, `account_suspended`, `account_reinstated`, `report_filed`, `report_resolved`

**Indexes:** `user_id`, `is_read`, `created_at DESC`

#### `admin_audit_logs`
Administrative action audit trail.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Log ID |
| `admin_id` | UUID | FK→auth.users(id), CASCADE, NOT NULL | Admin user |
| `action` | TEXT | NOT NULL | Action performed |
| `target_type` | TEXT | NOT NULL | Target entity type |
| `target_id` | UUID | NOT NULL | Target entity ID |
| `details` | JSONB | NOT NULL, DEFAULT '{}' | Action details |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Indexes:** `admin_id`, `(target_type, target_id)`, `created_at DESC`

### 8. Location Tables

#### `districts`
Sri Lankan districts (25 total).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PK | District code (e.g., 'colombo') |
| `name` | TEXT | NOT NULL | English name |
| `name_si` | TEXT | | Sinhala name |
| `name_ta` | TEXT | | Tamil name |
| `province` | TEXT | NOT NULL | Province name |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |

#### `cities`
Cities within districts (200+ total).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | City ID |
| `district_id` | TEXT | FK→districts(id), CASCADE, NOT NULL | District |
| `name` | TEXT | NOT NULL | English name |
| `name_si` | TEXT | | Sinhala name |
| `name_ta` | TEXT | | Tamil name |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Indexes:** `district_id`

## Triggers

### `update_updated_at_column()`
Automatically updates `updated_at` timestamp on row modification.

Applied to: `profiles`, `categories`, `subcategories`, `provider_profiles`, `service_listings`, `job_requests`, `quotations`, `enquiries`, `conversations`, `reviews`

### Automatic Counter Updates
- `increment_profile_views()` - Provider profile views
- `increment_listing_views()` - Listing views
- `increment_listing_enquiries()` - Listing enquiries
- `update_provider_rating()` - Recalculates provider rating from reviews

### Notification Triggers
- New quotation → Notify customer
- New enquiry → Notify provider
- New review (published) → Notify provider
- New message → Notify conversation participant
- New job request → Audit log entry

## Row Level Security (RLS) Policies

### Access Control Matrix

| Table | Customer | Provider | Admin | Public |
|-------|----------|----------|-------|--------|
| profiles | Own | Own | All | Active providers |
| categories | Read active | Read active | All | Read active |
| subcategories | Read active | Read active | All | Read active |
| provider_profiles | Own | Own | All | Verified |
| provider_categories | - | Own | All | Verified providers |
| service_listings | Read published | Own | All | Published |
| listing_images | Read published | Own | All | Published listings |
| service_areas | - | Own | All | Verified providers |
| saved_providers | Own | View savers | All | - |
| job_requests | Own | Category match | All | - |
| quotations | Own requests | Own | All | - |
| enquiries | Own | Own listings | All | - |
| conversations | Participant | Participant | All | - |
| messages | Participant | Participant | All | - |
| reviews | Create (completed jobs) | View own | All | Published |
| reports | Create own | - | All | - |
| notifications | Own | Own | All | - |
| admin_audit_logs | - | - | All | - |
| districts | Read | Read | All | Read |
| cities | Read | Read | All | Read |

## Storage Buckets

| Bucket | Public | Max Size | MIME Types | Purpose |
|--------|--------|----------|------------|---------|
| profile-pictures | Yes | 5MB | jpeg, png, webp, gif | User avatars |
| business-logos | Yes | 5MB | jpeg, png, webp, svg | Provider logos |
| cover-images | Yes | 10MB | jpeg, png, webp | Provider covers |
| listing-images | Yes | 10MB | jpeg, png, webp | Service images |
| portfolio-images | Yes | 10MB | jpeg, png, webp | Provider portfolio |
| job-attachments | No | 20MB | jpeg, png, webp, pdf, doc, docx | Job references |
| review-images | Yes | 5MB | jpeg, png, webp | Review photos |
| chat-attachments | No | 20MB | jpeg, png, webp, gif, pdf, doc, docx | Chat files |

## RPC Functions

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `increment_profile_views` | provider_id UUID | void | Atomic profile view increment |
| `increment_listing_views` | listing_id UUID | void | Atomic listing view increment |
| `increment_listing_enquiries` | listing_id UUID | void | Atomic enquiry increment |
| `update_provider_rating` | provider_id UUID | void | Recalculate rating from reviews |
| `search_service_listings` | Multiple params | SETOF listings | Full-text search with filters |
| `search_providers` | Multiple params | SETOF providers | Provider search with filters |
| `find_matching_providers` | job_request_id UUID | SETOF providers | Match providers to job |
| `create_notification` | user_id, type, title, message, ref_id, ref_type | UUID | Create notification |
| `create_audit_log` | admin_id, action, target_type, target_id, details | UUID | Create audit log |
| `get_or_create_conversation` | user1, user2, listing_id, job_request_id | UUID | Get or create conversation |

## Environment Variables

### Required

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME=WorkFind
```

### Optional

```env
# Email Configuration
EMAIL_SERVER_HOST=smtp.example.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=user@example.com
EMAIL_SERVER_PASSWORD=password
EMAIL_FROM=noreply@your-domain.com

# Storage
NEXT_PUBLIC_SUPABASE_STORAGE_URL=https://your-project.supabase.co/storage/v1/object/public
```

## Migration Order

1. `20261117000001_initial_schema.sql` - Core tables, indexes, triggers
2. `20261117000002_seed_data.sql` - Districts, cities, categories, subcategories
3. `20261117000003_rls_policies.sql` - Row Level Security policies
4. `20261117000004_rpc_functions.sql` - RPC functions and triggers
5. `20261117000005_storage_buckets.sql` - Storage buckets and policies

## TypeScript Types

All database types are mirrored in `src/types/index.ts` with camelCase property names. The database access layer in `src/lib/db/` provides type-safe queries.

## Testing RLS Policies

Run the test suite:

```bash
# Requires running Supabase instance
npx jest tests/rls-policies.test.ts
```

Tests cover:
- Profile access by role
- Provider profile visibility
- Listing CRUD by provider
- Job request visibility for providers
- Quotation access control
- Enquiry management
- Conversation/message privacy
- Review creation rules
- Report submission
- Notification access
- Admin-only tables
- Storage bucket policies

## Performance Considerations

1. **Indexes**: All foreign keys and frequently queried columns are indexed
2. **Full-text Search**: GIN indexes on `service_listings` and `job_requests` for search
3. **Composite Indexes**: Unique constraints serve as composite indexes
4. **Partitioning**: Consider partitioning `notifications`, `messages`, `admin_audit_logs` by date for large datasets
5. **Connection Pooling**: Use Supabase's built-in PgBouncer for production

## Backup & Recovery

- Point-in-time recovery enabled on Supabase
- Daily automated backups
- Manual backup before schema changes
- Test restore procedure quarterly

## Security Checklist

- [ ] All tables have RLS enabled
- [ ] Policies cover all CRUD operations
- [ ] Service role key only used server-side
- [ ] Storage buckets have appropriate public/private settings
- [ ] File type and size limits enforced
- [ ] Admin actions audited
- [ ] PII protected via RLS
- [ ] SQL injection prevented via parameterized queries