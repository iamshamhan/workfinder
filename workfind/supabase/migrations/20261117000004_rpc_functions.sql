-- WorkFind RPC Functions
-- Helper functions for atomic operations

-- ============================================
-- INCREMENT FUNCTIONS
-- ============================================

-- Increment provider profile views atomically
CREATE OR REPLACE FUNCTION increment_profile_views(provider_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE provider_profiles
  SET profile_views = profile_views + 1,
      updated_at = NOW()
  WHERE id = provider_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment service listing views atomically
CREATE OR REPLACE FUNCTION increment_listing_views(listing_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE service_listings
  SET view_count = view_count + 1,
      updated_at = NOW()
  WHERE id = listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment service listing enquiries atomically
CREATE OR REPLACE FUNCTION increment_listing_enquiries(listing_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE service_listings
  SET enquiry_count = enquiry_count + 1,
      updated_at = NOW()
  WHERE id = listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment job request quotation count
CREATE OR REPLACE FUNCTION increment_job_request_quotations(job_request_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE job_requests
  SET updated_at = NOW()
  WHERE id = job_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RATING CALCULATION FUNCTIONS
-- ============================================

-- Update provider rating based on reviews
CREATE OR REPLACE FUNCTION update_provider_rating(provider_id UUID)
RETURNS VOID AS $$
DECLARE
  avg_rating NUMERIC(3,2);
  review_count INTEGER;
BEGIN
  SELECT COALESCE(AVG(rating)::NUMERIC(3,2), 0), COUNT(*)
  INTO avg_rating, review_count
  FROM reviews
  WHERE provider_id = update_provider_rating.provider_id
    AND status = 'published';

  UPDATE provider_profiles
  SET rating = avg_rating,
      review_count = review_count,
      updated_at = NOW()
  WHERE id = provider_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SEARCH FUNCTIONS
-- ============================================

-- Full-text search for service listings
CREATE OR REPLACE FUNCTION search_service_listings(
  search_query TEXT DEFAULT NULL,
  category_slug TEXT DEFAULT NULL,
  subcategory_slug TEXT DEFAULT NULL,
  district_param TEXT DEFAULT NULL,
  city_param TEXT DEFAULT NULL,
  min_price NUMERIC DEFAULT NULL,
  max_price NUMERIC DEFAULT NULL,
  min_rating NUMERIC DEFAULT NULL,
  verified_only BOOLEAN DEFAULT FALSE,
  pricing_types TEXT[] DEFAULT NULL,
  service_delivery_types TEXT[] DEFAULT NULL,
  sort_by TEXT DEFAULT 'relevant',
  page_num INTEGER DEFAULT 1,
  limit_num INTEGER DEFAULT 12
)
RETURNS TABLE (
  id UUID,
  provider_id UUID,
  title TEXT,
  slug TEXT,
  description TEXT,
  category_id UUID,
  subcategory_id UUID,
  main_image_url TEXT,
  pricing_type TEXT,
  price_amount NUMERIC,
  price_currency TEXT,
  location_type TEXT,
  district TEXT,
  city TEXT,
  service_coverage TEXT[],
  experience_required TEXT,
  tags TEXT[],
  status TEXT,
  rejection_reason TEXT,
  published_at TIMESTAMPTZ,
  view_count INTEGER,
  enquiry_count INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  total_count BIGINT
) AS $$
DECLARE
  base_query TEXT;
  where_conditions TEXT[] := ARRAY['sl.status = ''published'''];
  join_clauses TEXT := '';
  order_clause TEXT;
  offset_val INTEGER := (page_num - 1) * limit_num;
BEGIN
  -- Build category filter
  IF category_slug IS NOT NULL THEN
    join_clauses := join_clauses || ' JOIN categories c ON c.id = sl.category_id';
    where_conditions := where_conditions || ' c.slug = ' || quote_literal(category_slug);
  END IF;

  -- Build subcategory filter
  IF subcategory_slug IS NOT NULL THEN
    join_clauses := join_clauses || ' JOIN subcategories sc ON sc.id = sl.subcategory_id';
    where_conditions := where_conditions || ' sc.slug = ' || quote_literal(subcategory_slug);
  END IF;

  -- Build district filter
  IF district_param IS NOT NULL THEN
    where_conditions := where_conditions || ' sl.district = ' || quote_literal(district_param);
  END IF;

  -- Build city filter
  IF city_param IS NOT NULL THEN
    where_conditions := where_conditions || ' sl.city ILIKE ' || quote_literal(city_param);
  END IF;

  -- Build price filters
  IF min_price IS NOT NULL THEN
    where_conditions := where_conditions || ' sl.price_amount >= ' || min_price;
  END IF;

  IF max_price IS NOT NULL THEN
    where_conditions := where_conditions || ' sl.price_amount <= ' || max_price;
  END IF;

  -- Build verified only filter
  IF verified_only THEN
    join_clauses := join_clauses || ' JOIN provider_profiles pp ON pp.id = sl.provider_id';
    where_conditions := where_conditions || ' pp.verification_status = ''verified''';
  END IF;

  -- Build min rating filter
  IF min_rating IS NOT NULL THEN
    join_clauses := join_clauses || ' JOIN provider_profiles pp ON pp.id = sl.provider_id';
    where_conditions := where_conditions || ' pp.rating >= ' || min_rating;
  END IF;

  -- Build pricing types filter
  IF pricing_types IS NOT NULL AND array_length(pricing_types, 1) > 0 THEN
    where_conditions := where_conditions || ' sl.pricing_type = ANY(' || quote_literal(pricing_types) || ')';
  END IF;

  -- Build service delivery types filter
  IF service_delivery_types IS NOT NULL AND array_length(service_delivery_types, 1) > 0 THEN
    where_conditions := where_conditions || ' sl.location_type = ANY(' || quote_literal(service_delivery_types) || ')';
  END IF;

  -- Build full-text search
  IF search_query IS NOT NULL AND search_query != '' THEN
    where_conditions := where_conditions || ' sl.fts @@ websearch_to_tsquery(''english'', ' || quote_literal(search_query) || ')';
  END IF;

  -- Build order clause
  CASE sort_by
    WHEN 'rating' THEN
      join_clauses := join_clauses || ' JOIN provider_profiles pp ON pp.id = sl.provider_id';
      order_clause := ' ORDER BY pp.rating DESC NULLS LAST';
    WHEN 'reviews' THEN
      join_clauses := join_clauses || ' JOIN provider_profiles pp ON pp.id = sl.provider_id';
      order_clause := ' ORDER BY pp.review_count DESC NULLS LAST';
    WHEN 'newest' THEN
      order_clause := ' ORDER BY sl.published_at DESC NULLS LAST';
    WHEN 'price_low' THEN
      order_clause := ' ORDER BY sl.price_amount ASC NULLS LAST';
    WHEN 'price_high' THEN
      order_clause := ' ORDER BY sl.price_amount DESC NULLS LAST';
    ELSE
      order_clause := ' ORDER BY sl.view_count DESC';
  END CASE;

  -- Execute count query
  base_query := 'SELECT COUNT(*) FROM service_listings sl' || join_clauses || ' WHERE ' || array_to_string(where_conditions, ' AND ');
  EXECUTE base_query INTO total_count;

  -- Execute data query
  RETURN QUERY EXECUTE
    'SELECT sl.*, ' || total_count || ' as total_count FROM service_listings sl'
    || join_clauses
    || ' WHERE ' || array_to_string(where_conditions, ' AND ')
    || order_clause
    || ' LIMIT ' || limit_num || ' OFFSET ' || offset_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Search providers
CREATE OR REPLACE FUNCTION search_providers(
  category_slug TEXT DEFAULT NULL,
  district_param TEXT DEFAULT NULL,
  city_param TEXT DEFAULT NULL,
  min_rating NUMERIC DEFAULT NULL,
  verified_only BOOLEAN DEFAULT TRUE,
  search_query TEXT DEFAULT NULL,
  sort_by TEXT DEFAULT 'rating',
  page_num INTEGER DEFAULT 1,
  limit_num INTEGER DEFAULT 12
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  business_name TEXT,
  business_logo_url TEXT,
  cover_image_url TEXT,
  short_intro TEXT,
  description TEXT,
  main_category_id UUID,
  years_experience INTEGER,
  languages TEXT[],
  availability JSONB,
  service_delivery_types TEXT[],
  verification_status TEXT,
  verified_at TIMESTAMPTZ,
  verified_by UUID,
  rating NUMERIC,
  review_count INTEGER,
  profile_views INTEGER,
  district TEXT,
  city TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  service_coverage TEXT[],
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  total_count BIGINT
) AS $$
DECLARE
  where_conditions TEXT[] := ARRAY[];
  join_clauses TEXT := '';
  order_clause TEXT;
  offset_val INTEGER := (page_num - 1) * limit_num;
BEGIN
  -- Base filter: verified providers by default
  IF verified_only THEN
    where_conditions := where_conditions || ' pp.verification_status = ''verified''';
  END IF;

  -- Category filter
  IF category_slug IS NOT NULL THEN
    join_clauses := join_clauses || ' JOIN categories c ON c.id = pp.main_category_id';
    where_conditions := where_conditions || ' c.slug = ' || quote_literal(category_slug);
  END IF;

  -- District filter
  IF district_param IS NOT NULL THEN
    where_conditions := where_conditions || ' pp.district = ' || quote_literal(district_param);
  END IF;

  -- City filter
  IF city_param IS NOT NULL THEN
    where_conditions := where_conditions || ' pp.city ILIKE ' || quote_literal(city_param);
  END IF;

  -- Min rating
  IF min_rating IS NOT NULL THEN
    where_conditions := where_conditions || ' pp.rating >= ' || min_rating;
  END IF;

  -- Search query
  IF search_query IS NOT NULL AND search_query != '' THEN
    where_conditions := where_conditions || ' (
      pp.business_name ILIKE ' || quote_literal('%' || search_query || '%') || ' OR
      pp.description ILIKE ' || quote_literal('%' || search_query || '%') OR
      pp.short_intro ILIKE ' || quote_literal('%' || search_query || '%')
    )';
  END IF;

  -- Sorting
  CASE sort_by
    WHEN 'rating' THEN order_clause := ' ORDER BY pp.rating DESC NULLS LAST';
    WHEN 'reviews' THEN order_clause := ' ORDER BY pp.review_count DESC NULLS LAST';
    WHEN 'newest' THEN order_clause := ' ORDER BY pp.created_at DESC';
    WHEN 'views' THEN order_clause := ' ORDER BY pp.profile_views DESC';
    ELSE order_clause := ' ORDER BY pp.rating DESC NULLS LAST';
  END CASE;

  -- Execute count query
  DECLARE
    count_query TEXT := 'SELECT COUNT(*) FROM provider_profiles pp' || join_clauses;
  BEGIN
    IF array_length(where_conditions, 1) > 0 THEN
      count_query := count_query || ' WHERE ' || array_to_string(where_conditions, ' AND ');
    END IF;
    EXECUTE count_query INTO total_count;
  END;

  -- Execute data query
  RETURN QUERY EXECUTE
    'SELECT pp.*, ' || total_count || ' as total_count FROM provider_profiles pp'
    || join_clauses
    || CASE WHEN array_length(where_conditions, 1) > 0 THEN ' WHERE ' || array_to_string(where_conditions, ' AND ') ELSE '' END
    || order_clause
    || ' LIMIT ' || limit_num || ' OFFSET ' || offset_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- JOB REQUEST MATCHING
-- ============================================

-- Find matching providers for a job request
CREATE OR REPLACE FUNCTION find_matching_providers(job_request_id UUID)
RETURNS TABLE (
  provider_id UUID,
  business_name TEXT,
  business_logo_url TEXT,
  rating NUMERIC,
  review_count INTEGER,
  district TEXT,
  city TEXT,
  match_score INTEGER
) AS $$
DECLARE
  jr RECORD;
BEGIN
  -- Get job request details
  SELECT * INTO jr FROM job_requests WHERE id = job_request_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Find matching providers
  RETURN QUERY
  SELECT
    pp.id,
    pp.business_name,
    pp.business_logo_url,
    pp.rating,
    pp.review_count,
    pp.district,
    pp.city,
    CASE
      WHEN pp.main_category_id = jr.category_id THEN 10
      WHEN EXISTS (
        SELECT 1 FROM provider_categories pc
        WHERE pc.provider_id = pp.id AND pc.category_id = jr.category_id
      ) THEN 8
      ELSE 0
    END +
    CASE
      WHEN pp.district = jr.district THEN 5
      WHEN EXISTS (
        SELECT 1 FROM service_areas sa
        WHERE sa.provider_id = pp.id AND sa.district = jr.district
      ) THEN 3
      ELSE 0
    END +
    CASE
      WHEN pp.verification_status = 'verified' THEN 5
      ELSE 0
    END +
    (pp.rating * 2)::INTEGER as match_score
  FROM provider_profiles pp
  WHERE pp.verification_status = 'verified'
    AND (
      pp.main_category_id = jr.category_id
      OR EXISTS (
        SELECT 1 FROM provider_categories pc
        WHERE pc.provider_id = pp.id AND pc.category_id = jr.category_id
      )
    )
    AND (
      pp.district = jr.district
      OR EXISTS (
        SELECT 1 FROM service_areas sa
        WHERE sa.provider_id = pp.id AND sa.district = jr.district
      )
    )
  ORDER BY match_score DESC, pp.rating DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- NOTIFICATION HELPERS
-- ============================================

-- Create notification with automatic type handling
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_reference_id UUID DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, reference_id, reference_type)
  VALUES (p_user_id, p_type, p_title, p_message, p_reference_id, p_reference_type)
  RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ADMIN AUDIT LOG HELPERS
-- ============================================

-- Create admin audit log entry
CREATE OR REPLACE FUNCTION create_audit_log(
  p_admin_id UUID,
  p_action TEXT,
  p_target_type TEXT,
  p_target_id UUID,
  p_details JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, details)
  VALUES (p_admin_id, p_action, p_target_type, p_target_id, p_details)
  RETURNING id INTO log_id;

  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- CONVERSATION HELPERS
-- ============================================

-- Get or create conversation between two users
CREATE OR REPLACE FUNCTION get_or_create_conversation(
  p_user_id_1 UUID,
  p_user_id_2 UUID,
  p_listing_id UUID DEFAULT NULL,
  p_job_request_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  conversation_id UUID;
BEGIN
  -- Try to find existing conversation
  SELECT id INTO conversation_id
  FROM conversations
  WHERE (
    (participant_1_id = p_user_id_1 AND participant_2_id = p_user_id_2)
    OR (participant_1_id = p_user_id_2 AND participant_2_id = p_user_id_1)
  )
  AND (p_listing_id IS NULL OR listing_id = p_listing_id)
  AND (p_job_request_id IS NULL OR job_request_id = p_job_request_id)
  LIMIT 1;

  IF conversation_id IS NOT NULL THEN
    RETURN conversation_id;
  END IF;

  -- Create new conversation
  INSERT INTO conversations (participant_1_id, participant_2_id, listing_id, job_request_id)
  VALUES (p_user_id_1, p_user_id_2, p_listing_id, p_job_request_id)
  RETURNING id INTO conversation_id;

  RETURN conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER FUNCTIONS FOR AUTOMATIC UPDATES
-- ============================================

-- Trigger: Update provider rating when review is published
CREATE OR REPLACE FUNCTION trigger_update_provider_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.status = 'published' THEN
      PERFORM update_provider_rating(NEW.provider_id);
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.status = 'published' THEN
      PERFORM update_provider_rating(OLD.provider_id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_reviews_update_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION trigger_update_provider_rating();

-- Trigger: Update conversation last_message_at when message is sent
CREATE OR REPLACE FUNCTION trigger_update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at,
      updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_messages_update_conversation
AFTER INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION trigger_update_conversation_last_message();

-- Trigger: Increment job request quotation count
CREATE OR REPLACE FUNCTION trigger_increment_job_quotations()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM increment_job_request_quotations(NEW.job_request_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_quotations_increment_count
AFTER INSERT ON quotations
FOR EACH ROW EXECUTE FUNCTION trigger_increment_job_quotations();

-- Trigger: Create notification when quotation is created
CREATE OR REPLACE FUNCTION trigger_notify_new_quotation()
RETURNS TRIGGER AS $$
DECLARE
  jr RECORD;
BEGIN
  SELECT customer_id INTO jr FROM job_requests WHERE id = NEW.job_request_id;
  IF FOUND THEN
    PERFORM create_notification(
      jr.customer_id,
      'new_quotation',
      'New Quotation Received',
      'You have received a new quotation for your job request',
      NEW.id,
      'quotation'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_quotations_notify_customer
AFTER INSERT ON quotations
FOR EACH ROW EXECUTE FUNCTION trigger_notify_new_quotation();

-- Trigger: Create notification when enquiry is created
CREATE OR REPLACE FUNCTION trigger_notify_new_enquiry()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_notification(
    NEW.provider_id,
    'new_enquiry',
    'New Enquiry Received',
    'You have received a new enquiry: ' || NEW.subject,
    NEW.id,
    'enquiry'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_enquiries_notify_provider
AFTER INSERT ON enquiries
FOR EACH ROW EXECUTE FUNCTION trigger_notify_new_enquiry();

-- Trigger: Create notification when review is published
CREATE OR REPLACE FUNCTION trigger_notify_new_review()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'published' THEN
    PERFORM create_notification(
      NEW.provider_id,
      'review_received',
      'New Review Received',
      'You have received a new ' || NEW.rating || '-star review',
      NEW.id,
      'review'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_reviews_notify_provider
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW
WHEN (NEW.status = 'published' AND (OLD.status IS DISTINCT FROM NEW.status OR OLD.status IS NULL))
EXECUTE FUNCTION trigger_notify_new_review();

-- Trigger: Create notification when message is sent
CREATE OR REPLACE FUNCTION trigger_notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
  conv RECORD;
  recipient_id UUID;
BEGIN
  SELECT participant_1_id, participant_2_id INTO conv
  FROM conversations WHERE id = NEW.conversation_id;

  IF FOUND THEN
    recipient_id := CASE
      WHEN conv.participant_1_id = NEW.sender_id THEN conv.participant_2_id
      ELSE conv.participant_1_id
    END;

    PERFORM create_notification(
      recipient_id,
      'new_message',
      'New Message',
      'You have a new message',
      NEW.conversation_id,
      'conversation'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_messages_notify_recipient
AFTER INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION trigger_notify_new_message();

-- Trigger: Create notification when job request is created
CREATE OR REPLACE FUNCTION trigger_notify_new_job_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify matching providers (this would be called by a background job in practice)
  -- For now, we just log it
  PERFORM create_audit_log(
    NEW.customer_id,
    'job_request_created',
    'job_request',
    NEW.id,
    jsonb_build_object('title', NEW.title, 'category_id', NEW.category_id, 'district', NEW.district)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_job_requests_audit
AFTER INSERT ON job_requests
FOR EACH ROW EXECUTE FUNCTION trigger_notify_new_job_request();

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant execute permissions on RPC functions to authenticated users
GRANT EXECUTE ON FUNCTION increment_profile_views(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_listing_views(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_listing_enquiries(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_job_request_quotations(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_provider_rating(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION search_service_listings(
  TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, NUMERIC, NUMERIC, BOOLEAN, TEXT[], TEXT[], TEXT, INTEGER, INTEGER
) TO authenticated;
GRANT EXECUTE ON FUNCTION search_providers(
  TEXT, TEXT, TEXT, NUMERIC, BOOLEAN, TEXT, TEXT, INTEGER, INTEGER
) TO authenticated;
GRANT EXECUTE ON FUNCTION find_matching_providers(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_notification(
  UUID, TEXT, TEXT, TEXT, UUID, TEXT
) TO authenticated;
GRANT EXECUTE ON FUNCTION create_audit_log(
  UUID, TEXT, TEXT, UUID, JSONB
) TO authenticated;
GRANT EXECUTE ON FUNCTION get_or_create_conversation(
  UUID, UUID, UUID, UUID
) TO authenticated;

-- Grant execute permissions to service_role for all functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;