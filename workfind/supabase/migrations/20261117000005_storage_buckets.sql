-- WorkFind Storage Buckets & Policies
-- Configure storage for images and files

-- ============================================
-- CREATE STORAGE BUCKETS
-- ============================================

-- Profile Pictures Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-pictures',
  'profile-pictures',
  TRUE,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Business Logos Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'business-logos',
  'business-logos',
  TRUE,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Cover Images Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cover-images',
  'cover-images',
  TRUE,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Listing Images Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'listing-images',
  'listing-images',
  TRUE,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Portfolio Images Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio-images',
  'portfolio-images',
  TRUE,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Job Request Attachments Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'job-attachments',
  'job-attachments',
  FALSE, -- Private bucket
  20971520, -- 20MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Review Images Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'review-images',
  'review-images',
  TRUE,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Chat Attachments Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-attachments',
  'chat-attachments',
  FALSE, -- Private bucket
  20971520, -- 20MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- STORAGE POLICIES
-- ============================================

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------
-- PROFILE PICTURES POLICIES
-- --------------------------------------------

-- Users can upload their own profile picture
CREATE POLICY "Users can upload own profile picture" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-pictures'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can update their own profile picture
CREATE POLICY "Users can update own profile picture" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-pictures'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own profile picture
CREATE POLICY "Users can delete own profile picture" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-pictures'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Public can view profile pictures
CREATE POLICY "Public can view profile pictures" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-pictures');

-- --------------------------------------------
-- BUSINESS LOGOS POLICIES
-- --------------------------------------------

-- Providers can upload business logo
CREATE POLICY "Providers can upload business logo" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'business-logos'
    AND EXISTS (
      SELECT 1 FROM provider_profiles pp
      WHERE pp.user_id = auth.uid() AND pp.id::text = (storage.foldername(name))[1]
    )
  );

-- Providers can update their business logo
CREATE POLICY "Providers can update business logo" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'business-logos'
    AND EXISTS (
      SELECT 1 FROM provider_profiles pp
      WHERE pp.user_id = auth.uid() AND pp.id::text = (storage.foldername(name))[1]
    )
  );

-- Providers can delete their business logo
CREATE POLICY "Providers can delete business logo" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'business-logos'
    AND EXISTS (
      SELECT 1 FROM provider_profiles pp
      WHERE pp.user_id = auth.uid() AND pp.id::text = (storage.foldername(name))[1]
    )
  );

-- Public can view business logos
CREATE POLICY "Public can view business logos" ON storage.objects
  FOR SELECT USING (bucket_id = 'business-logos');

-- --------------------------------------------
-- COVER IMAGES POLICIES
-- --------------------------------------------

-- Providers can upload cover images
CREATE POLICY "Providers can upload cover images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'cover-images'
    AND EXISTS (
      SELECT 1 FROM provider_profiles pp
      WHERE pp.user_id = auth.uid() AND pp.id::text = (storage.foldername(name))[1]
    )
  );

-- Providers can update their cover images
CREATE POLICY "Providers can update cover images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'cover-images'
    AND EXISTS (
      SELECT 1 FROM provider_profiles pp
      WHERE pp.user_id = auth.uid() AND pp.id::text = (storage.foldername(name))[1]
    )
  );

-- Providers can delete their cover images
CREATE POLICY "Providers can delete cover images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'cover-images'
    AND EXISTS (
      SELECT 1 FROM provider_profiles pp
      WHERE pp.user_id = auth.uid() AND pp.id::text = (storage.foldername(name))[1]
    )
  );

-- Public can view cover images
CREATE POLICY "Public can view cover images" ON storage.objects
  FOR SELECT USING (bucket_id = 'cover-images');

-- --------------------------------------------
-- LISTING IMAGES POLICIES
-- --------------------------------------------

-- Providers can upload listing images
CREATE POLICY "Providers can upload listing images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'listing-images'
    AND EXISTS (
      SELECT 1 FROM service_listings sl
      JOIN provider_profiles pp ON pp.id = sl.provider_id
      WHERE pp.user_id = auth.uid() AND sl.id::text = (storage.foldername(name))[1]
    )
  );

-- Providers can update their listing images
CREATE POLICY "Providers can update listing images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'listing-images'
    AND EXISTS (
      SELECT 1 FROM service_listings sl
      JOIN provider_profiles pp ON pp.id = sl.provider_id
      WHERE pp.user_id = auth.uid() AND sl.id::text = (storage.foldername(name))[1]
    )
  );

-- Providers can delete their listing images
CREATE POLICY "Providers can delete listing images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'listing-images'
    AND EXISTS (
      SELECT 1 FROM service_listings sl
      JOIN provider_profiles pp ON pp.id = sl.provider_id
      WHERE pp.user_id = auth.uid() AND sl.id::text = (storage.foldername(name))[1]
    )
  );

-- Public can view listing images for published listings
CREATE POLICY "Public can view published listing images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'listing-images'
    AND EXISTS (
      SELECT 1 FROM service_listings sl
      WHERE sl.id::text = (storage.foldername(name))[1] AND sl.status = 'published'
    )
  );

-- --------------------------------------------
-- PORTFOLIO IMAGES POLICIES
-- --------------------------------------------

-- Providers can upload portfolio images
CREATE POLICY "Providers can upload portfolio images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'portfolio-images'
    AND EXISTS (
      SELECT 1 FROM provider_profiles pp
      WHERE pp.user_id = auth.uid() AND pp.id::text = (storage.foldername(name))[1]
    )
  );

-- Providers can update their portfolio images
CREATE POLICY "Providers can update portfolio images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'portfolio-images'
    AND EXISTS (
      SELECT 1 FROM provider_profiles pp
      WHERE pp.user_id = auth.uid() AND pp.id::text = (storage.foldername(name))[1]
    )
  );

-- Providers can delete their portfolio images
CREATE POLICY "Providers can delete portfolio images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'portfolio-images'
    AND EXISTS (
      SELECT 1 FROM provider_profiles pp
      WHERE pp.user_id = auth.uid() AND pp.id::text = (storage.foldername(name))[1]
    )
  );

-- Public can view portfolio images for verified providers
CREATE POLICY "Public can view portfolio images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'portfolio-images'
    AND EXISTS (
      SELECT 1 FROM provider_profiles pp
      WHERE pp.id::text = (storage.foldername(name))[1] AND pp.verification_status = 'verified'
    )
  );

-- --------------------------------------------
-- JOB ATTACHMENTS POLICIES
-- --------------------------------------------

-- Customers can upload job attachments
CREATE POLICY "Customers can upload job attachments" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'job-attachments'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Customers can update their job attachments
CREATE POLICY "Customers can update job attachments" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'job-attachments'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Customers can delete their job attachments
CREATE POLICY "Customers can delete job attachments" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'job-attachments'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Participants can view job attachments
CREATE POLICY "Participants can view job attachments" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'job-attachments'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR EXISTS (
        SELECT 1 FROM job_requests jr
        WHERE jr.id::text = (storage.foldername(name))[1]
        AND (
          jr.customer_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM quotations q
            WHERE q.job_request_id = jr.id
            AND EXISTS (
              SELECT 1 FROM provider_profiles pp
              WHERE pp.id = q.provider_id AND pp.user_id = auth.uid()
            )
          )
        )
      )
    )
  );

-- --------------------------------------------
-- REVIEW IMAGES POLICIES
-- --------------------------------------------

-- Customers can upload review images
CREATE POLICY "Customers can upload review images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'review-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Customers can update their review images
CREATE POLICY "Customers can update review images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'review-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Customers can delete their review images
CREATE POLICY "Customers can delete review images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'review-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Public can view review images for published reviews
CREATE POLICY "Public can view published review images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'review-images'
    AND EXISTS (
      SELECT 1 FROM reviews r
      WHERE r.id::text = (storage.foldername(name))[1] AND r.status = 'published'
    )
  );

-- --------------------------------------------
-- CHAT ATTACHMENTS POLICIES
-- --------------------------------------------

-- Users can upload chat attachments in their conversations
CREATE POLICY "Users can upload chat attachments" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'chat-attachments'
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id::text = (storage.foldername(name))[1]
      AND (c.participant_1_id = auth.uid() OR c.participant_2_id = auth.uid())
    )
  );

-- Users can update their chat attachments
CREATE POLICY "Users can update chat attachments" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'chat-attachments'
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id::text = (storage.foldername(name))[1]
      AND (c.participant_1_id = auth.uid() OR c.participant_2_id = auth.uid())
    )
  );

-- Users can delete their chat attachments
CREATE POLICY "Users can delete chat attachments" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'chat-attachments'
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id::text = (storage.foldername(name))[1]
      AND (c.participant_1_id = auth.uid() OR c.participant_2_id = auth.uid())
    )
  );

-- Conversation participants can view chat attachments
CREATE POLICY "Participants can view chat attachments" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'chat-attachments'
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id::text = (storage.foldername(name))[1]
      AND (c.participant_1_id = auth.uid() OR c.participant_2_id = auth.uid())
    )
  );

-- --------------------------------------------
-- ADMIN POLICIES (Full access for admins)
-- --------------------------------------------

-- Admins can manage all storage objects
CREATE POLICY "Admins can manage all storage" ON storage.objects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

-- ============================================
-- STORAGE HELPER FUNCTIONS
-- ============================================

-- Get public URL for a file
CREATE OR REPLACE FUNCTION get_storage_public_url(bucket_name TEXT, file_path TEXT)
RETURNS TEXT AS $$
DECLARE
  url TEXT;
BEGIN
  SELECT public_url INTO url
  FROM storage.objects
  WHERE bucket_id = bucket_name AND name = file_path
  LIMIT 1;

  IF url IS NULL THEN
    -- Construct URL manually
    url := (SELECT 'https://' || project_ref || '.supabase.co/storage/v1/object/public/' || bucket_name || '/' || file_path
            FROM (SELECT current_setting('app.settings.project_ref') AS project_ref) s);
  END IF;

  RETURN url;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Delete file and return success
CREATE OR REPLACE FUNCTION delete_storage_file(bucket_name TEXT, file_path TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM storage.objects
  WHERE bucket_id = bucket_name AND name = file_path;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_storage_public_url(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_storage_file(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA storage TO service_role;