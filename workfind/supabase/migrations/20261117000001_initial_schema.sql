-- WorkFind Database Schema
-- Initial migration for the Sri Lankan Service Provider Marketplace

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- PROFILES TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL CHECK (role IN ('customer', 'provider', 'admin')) DEFAULT 'customer',
    status TEXT NOT NULL CHECK (status IN ('active', 'suspended', 'pending_verification', 'banned')) DEFAULT 'active',
    phone TEXT,
    whatsapp TEXT,
    email TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_status ON profiles(status);

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    image_url TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_is_active ON categories(is_active);

-- ============================================
-- SUBCATEGORIES TABLE
-- ============================================
CREATE TABLE subcategories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(category_id, slug)
);

CREATE INDEX idx_subcategories_category_id ON subcategories(category_id);
CREATE INDEX idx_subcategories_slug ON subcategories(slug);
CREATE INDEX idx_subcategories_is_active ON subcategories(is_active);

-- ============================================
-- PROVIDER PROFILES TABLE
-- ============================================
CREATE TABLE provider_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    business_name TEXT NOT NULL,
    business_logo_url TEXT,
    cover_image_url TEXT,
    short_intro TEXT,
    description TEXT,
    main_category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    years_experience INTEGER,
    languages TEXT[] NOT NULL DEFAULT '{}',
    availability JSONB NOT NULL DEFAULT '{"monday":{"is_available":true,"start_time":"09:00","end_time":"17:00"},"tuesday":{"is_available":true,"start_time":"09:00","end_time":"17:00"},"wednesday":{"is_available":true,"start_time":"09:00","end_time":"17:00"},"thursday":{"is_available":true,"start_time":"09:00","end_time":"17:00"},"friday":{"is_available":true,"start_time":"09:00","end_time":"17:00"},"saturday":{"is_available":true,"start_time":"09:00","end_time":"13:00"},"sunday":{"is_available":false,"start_time":null,"end_time":null}}',
    service_delivery_types TEXT[] NOT NULL DEFAULT '{}',
    verification_status TEXT NOT NULL CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')) DEFAULT 'unverified',
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    rating NUMERIC(3,2) NOT NULL DEFAULT 0.00,
    review_count INTEGER NOT NULL DEFAULT 0,
    profile_views INTEGER NOT NULL DEFAULT 0,
    district TEXT,
    city TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_provider_profiles_user_id ON provider_profiles(user_id);
CREATE INDEX idx_provider_profiles_main_category ON provider_profiles(main_category_id);
CREATE INDEX idx_provider_profiles_district ON provider_profiles(district);
CREATE INDEX idx_provider_profiles_city ON provider_profiles(city);
CREATE INDEX idx_provider_profiles_verification ON provider_profiles(verification_status);
CREATE INDEX idx_provider_profiles_rating ON provider_profiles(rating DESC);

-- ============================================
-- PROVIDER CATEGORIES TABLE (many-to-many)
-- ============================================
CREATE TABLE provider_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES provider_profiles(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
    subcategory_id UUID REFERENCES subcategories(id) ON DELETE SET NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(provider_id, category_id, subcategory_id)
);

CREATE INDEX idx_provider_categories_provider_id ON provider_categories(provider_id);
CREATE INDEX idx_provider_categories_category_id ON provider_categories(category_id);

-- ============================================
-- SERVICE LISTINGS TABLE
-- ============================================
CREATE TABLE service_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES provider_profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE RESTRICT NOT NULL,
    subcategory_id UUID REFERENCES subcategories(id) ON DELETE SET NULL,
    main_image_url TEXT,
    pricing_type TEXT NOT NULL CHECK (pricing_type IN ('fixed', 'starting_from', 'hourly', 'daily', 'negotiable', 'quotation')),
    price_amount NUMERIC(12,2),
    price_currency TEXT NOT NULL DEFAULT 'LKR',
    location_type TEXT NOT NULL CHECK (location_type IN ('business_location', 'customer_location', 'remote', 'multiple_locations')),
    district TEXT,
    city TEXT,
    service_coverage TEXT[] NOT NULL DEFAULT '{}',
    experience_required TEXT,
    tags TEXT[] NOT NULL DEFAULT '{}',
    status TEXT NOT NULL CHECK (status IN ('draft', 'pending_approval', 'published', 'rejected', 'suspended', 'archived')) DEFAULT 'draft',
    rejection_reason TEXT,
    published_at TIMESTAMPTZ,
    view_count INTEGER NOT NULL DEFAULT 0,
    enquiry_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(provider_id, slug)
);

CREATE INDEX idx_service_listings_provider_id ON service_listings(provider_id);
CREATE INDEX idx_service_listings_category_id ON service_listings(category_id);
CREATE INDEX idx_service_listings_subcategory_id ON service_listings(subcategory_id);
CREATE INDEX idx_service_listings_status ON service_listings(status);
CREATE INDEX idx_service_listings_district ON service_listings(district);
CREATE INDEX idx_service_listings_city ON service_listings(city);
CREATE INDEX idx_service_listings_pricing_type ON service_listings(pricing_type);
CREATE INDEX idx_service_listings_published_at ON service_listings(published_at DESC);

-- Full-text search index
CREATE INDEX idx_service_listings_fts ON service_listings USING GIN (
    to_tsvector('english', title || ' ' || description || ' ' || COALESCE(experience_required, '') || ' ' || array_to_string(tags, ' '))
);

-- ============================================
-- LISTING IMAGES TABLE
-- ============================================
CREATE TABLE listing_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES service_listings(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_main BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_listing_images_listing_id ON listing_images(listing_id);

-- ============================================
-- SERVICE AREAS TABLE
-- ============================================
CREATE TABLE service_areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES provider_profiles(id) ON DELETE CASCADE NOT NULL,
    district TEXT NOT NULL,
    city TEXT,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(provider_id, district, city)
);

CREATE INDEX idx_service_areas_provider_id ON service_areas(provider_id);
CREATE INDEX idx_service_areas_district ON service_areas(district);

-- ============================================
-- SAVED PROVIDERS TABLE
-- ============================================
CREATE TABLE saved_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    provider_id UUID REFERENCES provider_profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(customer_id, provider_id)
);

CREATE INDEX idx_saved_providers_customer_id ON saved_providers(customer_id);
CREATE INDEX idx_saved_providers_provider_id ON saved_providers(provider_id);

-- ============================================
-- JOB REQUESTS TABLE
-- ============================================
CREATE TABLE job_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE RESTRICT NOT NULL,
    subcategory_id UUID REFERENCES subcategories(id) ON DELETE SET NULL,
    required_service TEXT NOT NULL,
    district TEXT NOT NULL,
    city TEXT,
    budget_min NUMERIC(12,2),
    budget_max NUMERIC(12,2),
    budget_currency TEXT NOT NULL DEFAULT 'LKR',
    preferred_date TIMESTAMPTZ,
    urgency TEXT NOT NULL CHECK (urgency IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
    reference_images TEXT[] NOT NULL DEFAULT '{}',
    contact_preferences TEXT[] NOT NULL DEFAULT '{}',
    status TEXT NOT NULL CHECK (status IN ('open', 'receiving_offers', 'in_progress', 'completed', 'cancelled')) DEFAULT 'open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_job_requests_customer_id ON job_requests(customer_id);
CREATE INDEX idx_job_requests_category_id ON job_requests(category_id);
CREATE INDEX idx_job_requests_district ON job_requests(district);
CREATE INDEX idx_job_requests_status ON job_requests(status);
CREATE INDEX idx_job_requests_created_at ON job_requests(created_at DESC);

-- Full-text search index
CREATE INDEX idx_job_requests_fts ON job_requests USING GIN (
    to_tsvector('english', title || ' ' || description || ' ' || required_service)
);

-- ============================================
-- QUOTATIONS TABLE
-- ============================================
CREATE TABLE quotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_request_id UUID REFERENCES job_requests(id) ON DELETE CASCADE NOT NULL,
    provider_id UUID REFERENCES provider_profiles(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'LKR',
    description TEXT NOT NULL,
    estimated_duration TEXT,
    valid_until TIMESTAMPTZ,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn', 'expired')) DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(job_request_id, provider_id)
);

CREATE INDEX idx_quotations_job_request_id ON quotations(job_request_id);
CREATE INDEX idx_quotations_provider_id ON quotations(provider_id);
CREATE INDEX idx_quotations_status ON quotations(status);

-- ============================================
-- ENQUIRIES TABLE
-- ============================================
CREATE TABLE enquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    provider_id UUID REFERENCES provider_profiles(id) ON DELETE CASCADE NOT NULL,
    listing_id UUID REFERENCES service_listings(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    contact_method TEXT NOT NULL CHECK (contact_method IN ('call', 'whatsapp', 'email', 'in_app')),
    status TEXT NOT NULL CHECK (status IN ('new', 'read', 'replied', 'closed')) DEFAULT 'new',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_enquiries_customer_id ON enquiries(customer_id);
CREATE INDEX idx_enquiries_provider_id ON enquiries(provider_id);
CREATE INDEX idx_enquiries_listing_id ON enquiries(listing_id);
CREATE INDEX idx_enquiries_status ON enquiries(status);

-- ============================================
-- CONVERSATIONS TABLE
-- ============================================
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    participant_2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    listing_id UUID REFERENCES service_listings(id) ON DELETE SET NULL,
    job_request_id UUID REFERENCES job_requests(id) ON DELETE SET NULL,
    last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(participant_1_id, participant_2_id, listing_id, job_request_id)
);

CREATE INDEX idx_conversations_participant_1 ON conversations(participant_1_id);
CREATE INDEX idx_conversations_participant_2 ON conversations(participant_2_id);
CREATE INDEX idx_conversations_listing_id ON conversations(listing_id);
CREATE INDEX idx_conversations_job_request_id ON conversations(job_request_id);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);

-- ============================================
-- MESSAGES TABLE
-- ============================================
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    message_type TEXT NOT NULL CHECK (message_type IN ('text', 'image', 'file', 'system')) DEFAULT 'text',
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- ============================================
-- REVIEWS TABLE
-- ============================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    provider_id UUID REFERENCES provider_profiles(id) ON DELETE CASCADE NOT NULL,
    job_request_id UUID REFERENCES job_requests(id) ON DELETE SET NULL,
    listing_id UUID REFERENCES service_listings(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    content TEXT NOT NULL,
    images TEXT[] NOT NULL DEFAULT '{}',
    is_verified_purchase BOOLEAN NOT NULL DEFAULT FALSE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'published', 'hidden', 'flagged')) DEFAULT 'pending',
    moderation_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(customer_id, provider_id, job_request_id)
);

CREATE INDEX idx_reviews_customer_id ON reviews(customer_id);
CREATE INDEX idx_reviews_provider_id ON reviews(provider_id);
CREATE INDEX idx_reviews_job_request_id ON reviews(job_request_id);
CREATE INDEX idx_reviews_listing_id ON reviews(listing_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- ============================================
-- REPORTS TABLE
-- ============================================
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    reported_type TEXT NOT NULL CHECK (reported_type IN ('user', 'listing', 'review', 'message')),
    reported_id UUID NOT NULL,
    reason TEXT NOT NULL CHECK (reason IN ('inappropriate_content', 'spam', 'fake_profile', 'misleading_information', 'harassment', 'fraud', 'poor_service', 'other')),
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'under_review', 'resolved', 'dismissed')) DEFAULT 'pending',
    moderator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    moderation_note TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX idx_reports_reported ON reports(reported_type, reported_id);
CREATE INDEX idx_reports_status ON reports(status);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('new_enquiry', 'new_message', 'new_quotation', 'quotation_accepted', 'quotation_rejected', 'listing_approved', 'listing_rejected', 'listing_suspended', 'review_received', 'account_suspended', 'account_reinstated', 'report_filed', 'report_resolved')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    reference_id UUID,
    reference_type TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================
-- ADMIN AUDIT LOGS TABLE
-- ============================================
CREATE TABLE admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id UUID NOT NULL,
    details JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admin_audit_logs_admin_id ON admin_audit_logs(admin_id);
CREATE INDEX idx_admin_audit_logs_target ON admin_audit_logs(target_type, target_id);
CREATE INDEX idx_admin_audit_logs_created_at ON admin_audit_logs(created_at DESC);

-- ============================================
-- DISTRICTS TABLE
-- ============================================
CREATE TABLE districts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_si TEXT,
    name_ta TEXT,
    province TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- CITIES TABLE
-- ============================================
CREATE TABLE cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district_id TEXT REFERENCES districts(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    name_si TEXT,
    name_ta TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cities_district_id ON cities(district_id);

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subcategories_updated_at BEFORE UPDATE ON subcategories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_provider_profiles_updated_at BEFORE UPDATE ON provider_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_listings_updated_at BEFORE UPDATE ON service_listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_requests_updated_at BEFORE UPDATE ON job_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quotations_updated_at BEFORE UPDATE ON quotations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_enquiries_updated_at BEFORE UPDATE ON enquiries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();