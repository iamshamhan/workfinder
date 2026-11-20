-- WorkFind Row Level Security Policies
-- Security policies for all tables

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can insert their own profile (during registration)
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public can view active provider profiles (for marketplace)
CREATE POLICY "Public can view active provider profiles" ON profiles
    FOR SELECT USING (role = 'provider' AND status = 'active');

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.user_id = auth.uid() AND p.role = 'admin'
        )
    );

-- Admins can update any profile
CREATE POLICY "Admins can update any profile" ON profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.user_id = auth.uid() AND p.role = 'admin'
        )
    );

-- ============================================
-- CATEGORIES POLICIES
-- ============================================
-- Everyone can view active categories
CREATE POLICY "Everyone can view active categories" ON categories
    FOR SELECT USING (is_active = TRUE);

-- Admins can manage categories
CREATE POLICY "Admins can manage categories" ON categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.user_id = auth.uid() AND p.role = 'admin'
        )
    );

-- ============================================
-- SUBCATEGORIES POLICIES
-- ============================================
-- Everyone can view active subcategories
CREATE POLICY "Everyone can view active subcategories" ON subcategories
    FOR SELECT USING (is_active = TRUE);

-- Admins can manage subcategories
CREATE POLICY "Admins can manage subcategories" ON subcategories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.user_id = auth.uid() AND p.role = 'admin'
        )
    );

-- ============================================
-- PROVIDER PROFILES POLICIES
-- ============================================
-- Providers can view their own profile
CREATE POLICY "Providers can view own profile" ON provider_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Providers can insert their own profile
CREATE POLICY "Providers can insert own profile" ON provider_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Providers can update their own profile
CREATE POLICY "Providers can update own profile" ON provider_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Public can view verified provider profiles
CREATE POLICY "Public can view verified providers" ON provider_profiles
    FOR SELECT USING (verification_status = 'verified');

-- Customers can view provider profiles for enquiries
CREATE POLICY "Customers can view providers for enquiries" ON provider_profiles
    FOR SELECT USING (verification_status IN ('verified', 'pending'));

-- Admins can view all provider profiles
CREATE POLICY "Admins can view all provider profiles" ON provider_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.user_id = auth.uid() AND p.role = 'admin'
        )
    );

-- Admins can update any provider profile
CREATE POLICY "Admins can update any provider profile" ON provider_profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.user_id = auth.uid() AND p.role = 'admin'
        )
    );

-- ============================================
-- PROVIDER CATEGORIES POLICIES
-- ============================================
-- Providers can manage their own categories
CREATE POLICY "Providers can manage own categories" ON provider_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM provider_profiles pp
            WHERE pp.id = provider_categories.provider_id AND pp.user_id = auth.uid()
        )
    );

-- Public can view provider categories for verified providers
CREATE POLICY "Public can view provider categories" ON provider_categories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM provider_profiles pp
            WHERE pp.id = provider_categories.provider_id
            AND pp.verification_status = 'verified'
        )
    );

-- Admins can manage all provider categories
CREATE POLICY "Admins can manage provider categories" ON provider_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.user_id = auth.uid() AND p.role = 'admin'
        )
    );

-- ============================================
-- SERVICE LISTINGS POLICIES
-- ============================================
-- Providers can manage their own listings
CREATE POLICY "Providers can manage own listings" ON service_listings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM provider_profiles pp
            WHERE pp.id = service_listings.provider_id AND pp.user_id = auth.uid()
        )
    );

-- Public can view published listings
CREATE POLICY "Public can view published listings" ON service_listings
    FOR SELECT USING (status = 'published');

-- Customers can view published listings for enquiries
CREATE POLICY "Customers can view listings for enquiries" ON service_listings
    FOR SELECT USING (status = 'published');

-- Admins can view all listings
CREATE POLICY "Admins can view all listings" ON service_listings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.user_id = auth.uid() AND p.role = 'admin'
        )
    );

-- Admins can update any listing
CREATE POLICY "Admins can update any listing" ON service_listings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.user_id = auth.uid() AND p.role = 'admin'
        )
    );

-- ============================================
-- LISTING IMAGES POLICIES
-- ============================================
-- Providers can manage images for their listings
CREATE POLICY "Providers can manage listing images" ON listing_images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM service_listings sl
            JOIN provider_profiles pp ON pp.id = sl.provider_id
            WHERE sl.id = listing_images.listing_id AND pp.user_id = auth.uid()
        )
    );

-- Public can view images for published listings
CREATE POLICY "Public can view listing images" ON listing_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM service_listings sl
            WHERE sl.id = listing_images.listing_id AND sl.status = 'published'
        )
    );

-- Admins can manage all listing images
CREATE POLICY "Admins can manage listing images" ON listing_images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.user_id = auth.uid() AND p.role = 'admin'
        )
    );

-- ============================================
-- SERVICE AREAS POLICIES
-- ============================================
-- Providers can manage their own service areas
CREATE POLICY "Providers can manage own service areas" ON service_areas
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM provider_profiles pp
            WHERE pp.id = service_areas.provider_id AND pp.user_id = auth.uid()
        )
    );

-- Public can view service areas for verified providers
CREATE POLICY "Public can view service areas" ON service_areas
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM provider_profiles pp
            WHERE pp.id = service_areas.provider_id
            AND pp.verification_status = 'verified'
        )
    );

-- Admins can manage all service areas
CREATE POLICY "Admins can manage service areas" ON service_areas
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.user_id = auth.uid() AND p.role = 'admin'
        )
    );

-- ============================================
-- SAVED PROVIDERS POLICIES
-- ============================================
-- Customers can manage their saved providers
CREATE POLICY "Customers can manage saved providers" ON saved_providers
    FOR ALL USING (auth.uid() = customer_id);

-- Providers can view who saved them (optional, for analytics)
CREATE POLICY "Providers can view their savers" ON saved_providers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM provider_profiles pp
            WHERE pp.id = saved_providers.provider_id AND pp.user_id = auth.uid()
        )
    );

-- Admins can view all saved providers
CREATE POLICY "Admins can view saved providers" ON saved_providers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.user_id = auth.uid() AND p.role = 'admin'
        )
    );

-- ============================================
-- JOB REQUESTS POLICIES
-- ============================================
-- Customers can manage their own job requests
CREATE POLICY "Customers can manage own job requests" ON job_requests
    FOR ALL USING (auth.uid() = customer_id);

-- Providers can view open job requests in their categories/areas
CREATE POLICY "Providers can view open job requests" ON job_requests
    FOR SELECT USING (
        status = 'open'
        AND EXISTS (
            SELECT 1 FROM provider_profiles pp
            WHERE pp.user_id = auth.uid()
            AND pp.verification_status = 'verified'
            AND (
                pp.main_category_id = job_requests.category_id
                OR EXISTS (
                    SELECT 1 FROM provider_categories pc
                    WHERE pc.provider_id = pp.id
                    AND pc.category_id = job_requests.category_id
                )
            )
        )
    );

-- Admins can view all job requests
CREATE POLICY "Admins can view all job requests" ON job_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.user_id = auth.uid() AND p.role = 'admin'
        )
    );

-- ============================================
-- QUOTATIONS POLICIES
-- ============================================
-- Providers can manage their own quotations
CREATE POLICY "Providers can manage own quotations" ON quotations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM provider_profiles pp
            WHERE pp.id = quotations.provider_id AND pp.user_id = auth.uid()
        )
    );

-- Customers can view quotations for their job requests
CREATE POLICY "Customers can view own quotations" ON quotations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM job_requests jr
            WHERE jr.id = quotations.job_request_id AND jr.customer_id = auth.uid()
        )
    );

-- Admins can view all quotations
CREATE POLICY "Admins can view all quotations" ON quotations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.user_id = auth.uid() AND p.role = 'admin'
        )
    );

-- ============================================
-- ENQUIRIES POLICIES
-- ============================================
-- Customers can manage their own enquiries
CREATE POLICY "Customers can manage own enquiries" ON enquiries
    FOR ALL USING (auth.uid() = customer_id);

-- Providers can view enquiries for their listings
CREATE POLICY "Providers can view own enquiries" ON enquiries
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM provider_profiles pp
            WHERE pp.id = enquiries.provider_id AND pp.user_id = auth.uid()
        )
    );

-- Providers can update enquiry status (read, replied)
CREATE POLICY "Providers can update enquiry status" ON enquiries
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM provider_profiles pp
            WHERE pp.id = enquiries.provider_id AND pp.user_id = auth.uid()
        )
    );

-- Admins can view all enquiries
CREATE POLICY "Admins can view all enquiries" ON enquiries
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.user_id = auth.uid() AND p.role = 'admin'
        )
    );

-- ============================================
-- CONVERSATIONS POLICIES
-- ============================================
-- Users can view conversations they're part of
CREATE POLICY "Users can view own conversations" ON conversations
    FOR SELECT USING (
        auth.uid() = participant_1_id OR auth.uid() = participant_2_id
    );

-- Users can create conversations
CREATE POLICY "Users can create conversations" ON conversations
    FOR INSERT WITH CHECK (
        auth.uid() = participant_1_id OR auth.uid() = participant_2_id
    );

-- Users can update conversations they're part of (last_message_at)
CREATE POLICY "Users can update own conversations" ON conversations
    FOR UPDATE USING (
        auth.uid() = participant_1_id OR auth.uid() = participant_2_id
    );

-- Admins can view all conversations
CREATE POLICY "Admins can view all conversations" ON conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.user_id = auth.uid() AND p.role = 'admin'
        )
    );

-- ============================================
-- MESSAGES POLICIES
-- ============================================
-- Users can view messages in their conversations
CREATE POLICY "Users can view own messages" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = messages.conversation_id
            AND (c.participant_1_id = auth.uid() OR c.participant_2_id = auth.uid())
        )
    );

-- Users can insert messages in their conversations
CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id
        AND EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = messages.conversation_id
            AND (c.participant_1_id = auth.uid() OR c.participant_2_id = auth.uid())
        )
    );

-- Users can mark messages as read
CREATE POLICY "Users can mark messages read" ON messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = messages.conversation_id
            AND (c.participant_1_id = auth.uid() OR c.participant_2_id = auth.uid())
            AND messages.sender_id != auth.uid()
        )
    );

-- Admins can view all messages
CREATE POLICY "Admins can view all messages" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.user_id = auth.uid() AND p.role = 'admin'
        )
    );

-- ============================================
-- REVIEWS POLICIES
-- ============================================
-- Customers can create reviews for completed jobs
CREATE POLICY "Customers can create reviews" ON reviews
    FOR INSERT WITH CHECK (
        auth.uid() = customer_id
        AND EXISTS (
            SELECT 1 FROM job_requests jr
            WHERE jr.id = reviews.job_request_id
            AND jr.customer_id = auth.uid()
            AND jr.status = 'completed'
        )
    );

-- Customers can update their own reviews
CREATE POLICY "Customers can update own reviews" ON reviews
    FOR UPDATE USING (auth.uid() = customer_id);

-- Public can view published reviews
CREATE POLICY "Public can view published reviews" ON reviews
    FOR SELECT USING (status = 'published');

-- Providers can view reviews for their profile
CREATE POLICY "Providers can view own reviews" ON reviews
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM provider_profiles pp
            WHERE pp.id = reviews.provider_id AND pp.user_id = auth.uid()
        )
    );

-- Admins can manage all reviews
CREATE POLICY "Admins can manage reviews" ON reviews
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.user_id = auth.uid() AND p.role = 'admin'
        )
    );

-- ============================================
-- REPORTS POLICIES
-- ============================================
-- Users can create reports
CREATE POLICY "Users can create reports" ON reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Users can view their own reports
CREATE POLICY "Users can view own reports" ON reports
    FOR SELECT USING (auth.uid() = reporter_id);

-- Admins can manage all reports
CREATE POLICY "Admins can manage reports" ON reports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.user_id = auth.uid() AND p.role = 'admin'
        )
    );

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================
-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- System can insert notifications (via service role)
-- Admins can view all notifications
CREATE POLICY "Admins can view all notifications" ON notifications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.user_id = auth.uid() AND p.role = 'admin'
        )
    );

-- ============================================
-- ADMIN AUDIT LOGS POLICIES
-- ============================================
-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON admin_audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.user_id = auth.uid() AND p.role = 'admin'
        )
    );

-- System can insert audit logs (via service role)
CREATE POLICY "System can insert audit logs" ON admin_audit_logs
    FOR INSERT WITH CHECK (true);

-- ============================================
-- DISTRICTS POLICIES
-- ============================================
-- Everyone can view districts
CREATE POLICY "Everyone can view districts" ON districts
    FOR SELECT USING (true);

-- Admins can manage districts
CREATE POLICY "Admins can manage districts" ON districts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.user_id = auth.uid() AND p.role = 'admin'
        )
    );

-- ============================================
-- CITIES POLICIES
-- ============================================
-- Everyone can view cities
CREATE POLICY "Everyone can view cities" ON cities
    FOR SELECT USING (true);

-- Admins can manage cities
CREATE POLICY "Admins can manage cities" ON cities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.user_id = auth.uid() AND p.role = 'admin'
        )
    );

-- ============================================
-- STORAGE POLICIES (to be applied via Supabase Dashboard or CLI)
-- ============================================
-- These are noted here for reference, applied separately

/*
-- Profile Pictures Bucket
CREATE POLICY "Users can upload own profile picture" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'profile-pictures'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update own profile picture" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'profile-pictures'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Public can view profile pictures" ON storage.objects
    FOR SELECT USING (bucket_id = 'profile-pictures');

-- Business Logos Bucket
CREATE POLICY "Providers can upload business logo" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'business-logos'
        AND EXISTS (
            SELECT 1 FROM provider_profiles pp
            WHERE pp.user_id = auth.uid() AND pp.id::text = (storage.foldername(name))[1]
        )
    );

CREATE POLICY "Public can view business logos" ON storage.objects
    FOR SELECT USING (bucket_id = 'business-logos');

-- Listing Images Bucket
CREATE POLICY "Providers can upload listing images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'listing-images'
        AND EXISTS (
            SELECT 1 FROM service_listings sl
            JOIN provider_profiles pp ON pp.id = sl.provider_id
            WHERE pp.user_id = auth.uid() AND sl.id::text = (storage.foldername(name))[1]
        )
    );

CREATE POLICY "Public can view listing images" ON storage.objects
    FOR SELECT USING (bucket_id = 'listing-images');

-- Portfolio Images Bucket
CREATE POLICY "Providers can upload portfolio images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'portfolio-images'
        AND EXISTS (
            SELECT 1 FROM provider_profiles pp
            WHERE pp.user_id = auth.uid() AND pp.id::text = (storage.foldername(name))[1]
        )
    );

CREATE POLICY "Public can view portfolio images" ON storage.objects
    FOR SELECT USING (bucket_id = 'portfolio-images');

-- Job Request Attachments Bucket
CREATE POLICY "Customers can upload job attachments" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'job-attachments'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Participants can view job attachments" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'job-attachments'
        AND (
            auth.uid()::text = (storage.foldername(name))[1]
            OR EXISTS (
                SELECT 1 FROM job_requests jr
                WHERE jr.id::text = (storage.foldername(name))[1]
                AND EXISTS (
                    SELECT 1 FROM quotations q
                    WHERE q.job_request_id = jr.id
                    AND EXISTS (
                        SELECT 1 FROM provider_profiles pp
                        WHERE pp.id = q.provider_id AND pp.user_id = auth.uid()
                    )
                )
            )
        )
    );
*/