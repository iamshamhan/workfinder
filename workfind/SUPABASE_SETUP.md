# WorkFind - Supabase Backend Setup Guide

This document provides complete instructions for setting up the Supabase backend for the WorkFind marketplace.

## Prerequisites

- Supabase account (https://supabase.com)
- Docker Desktop (for local development) OR access to a Supabase project
- Node.js 18+ and npm

## 1. Create Supabase Project

### Option A: Local Development (Docker required)
```bash
# Start local Supabase stack
npx supabase start

# This will start:
# - PostgreSQL on port 54322
# - Supabase Studio on port 54323
# - Inbucket (email testing) on port 54324
```

### Option B: Cloud Project (Recommended for production)
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Choose organization, enter project name: `workfind`
4. Set database password (save it securely)
5. Choose region closest to Sri Lanka (Singapore or Mumbai)
6. Wait for project to be ready (~2 minutes)

## 2. Apply Database Migrations

### Local Development
```bash
# Apply all migrations to local database
npx supabase db reset

# Or apply individually
npx supabase db push
```

### Cloud Project
```bash
# Link to your cloud project
npx supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
npx supabase db push
```

### Manual Migration (via SQL Editor)
If CLI fails, run the migration files in order via Supabase Dashboard > SQL Editor:

1. `supabase/migrations/20261117000001_initial_schema.sql`
2. `supabase/migrations/20261117000002_seed_data.sql`
3. `supabase/migrations/20261117000003_rls_policies.sql`

**Order matters!** Run them in sequence.

## 3. Database Schema Overview

### Tables Created (18 tables)

| Table | Purpose |
|-------|---------|
| `profiles` | Extended user info (extends auth.users) |
| `categories` | Main service categories |
| `subcategories` | Sub-categories under categories |
| `provider_profiles` | Provider business details |
| `provider_categories` | Many-to-many provider ↔ categories |
| `service_listings` | Individual service offerings |
| `listing_images` | Images for service listings |
| `service_areas` | Geographic coverage for providers |
| `saved_providers` | Customer bookmarks |
| `job_requests` | Customer job postings |
| `quotations` | Provider quotes for jobs |
| `enquiries` | Customer → Provider messages |
| `conversations` | Message threads |
| `messages` | Individual messages |
| `reviews` | Customer reviews |
| `reports` | Content/user reports |
| `notifications` | In-app notifications |
| `admin_audit_logs` | Admin action tracking |
| `districts` | Sri Lankan districts (25) |
| `cities` | Cities within districts (200+) |

### Key Features
- UUID primary keys
- Foreign key constraints
- Full-text search indexes (GIN) on listings, jobs
- Automatic `updated_at` triggers
- Row Level Security (RLS) on all tables

## 4. Storage Buckets

Create these buckets in Supabase Dashboard > Storage:

### Bucket Configuration

| Bucket | Public | File Types | Max Size | Purpose |
|--------|--------|------------|----------|---------|
| `profile-pictures` | Yes | jpg, png, webp | 5MB | User avatars |
| `business-logos` | Yes | jpg, png, webp, svg | 5MB | Provider logos |
| `listing-images` | Yes | jpg, png, webp | 10MB | Service listing images |
| `portfolio-images` | Yes | jpg, png, webp | 10MB | Provider portfolio |
| `job-attachments` | No | jpg, png, pdf | 10MB | Job request attachments |

### Storage Policies (apply via SQL Editor)

```sql
-- Profile Pictures
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

-- Business Logos
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

-- Listing Images
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

-- Portfolio Images
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

-- Job Attachments
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
```

## 5. Authentication Configuration

### Email/Password Auth
1. Go to Authentication > Providers
2. Enable Email provider
3. Configure:
   - Enable email confirmations: ON
   - Secure email change: ON
   - Password strength: Strong

### Email Templates (Authentication > Email Templates)
Customize:
- **Confirm signup**: Add WorkFind branding
- **Reset password**: Add WorkFind branding
- **Magic link**: Optional

### Site URL & Redirect URLs (Authentication > URL Configuration)
```
Site URL: https://your-domain.com (or http://localhost:3000)
Redirect URLs:
  - http://localhost:3000/auth/callback
  - https://your-domain.com/auth/callback
  - http://localhost:3000/dashboard/**
  - https://your-domain.com/dashboard/**
```

## 6. Row Level Security Summary

All tables have RLS enabled with policies for:

| Role | Access |
|------|--------|
| **Customer** | Own profile, saved providers, job requests, enquiries, conversations, messages, reviews (own), notifications |
| **Provider** | Own profile, provider profile, categories, listings, images, service areas, enquiries (received), conversations, messages, reviews (about them) |
| **Admin** | All tables, audit logs, reports, user management |

Key policies:
- Customers can only see published listings
- Providers can only manage their own listings
- Conversations/messages only accessible to participants
- Reviews only creatable by customers for completed jobs
- Providers can only see enquiries for their listings

## 7. Environment Variables

Create `.env.local` with your credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=WorkFind

# Email Configuration (configure when needed)
EMAIL_SERVER_HOST=
EMAIL_SERVER_PORT=
EMAIL_SERVER_USER=
EMAIL_SERVER_PASSWORD=
EMAIL_FROM=noreply@workfind.lk

# Storage
NEXT_PUBLIC_SUPABASE_STORAGE_URL=https://your-project.supabase.co/storage/v1/object/public
```

### Getting Credentials
1. Go to Project Settings > API
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

## 8. Verify Setup

### Test Database Connection
```bash
# TypeScript check
npx tsc --noEmit

# Run dev server
npm run dev

# Visit http://localhost:3000
# Check browser console for Supabase connection errors
```

### Test Auth Flow
1. Visit `/register?role=customer`
2. Register with email
3. Check email for confirmation link
4. Click link → should redirect to `/login`
5. Login → should redirect to `/dashboard/customer`

### Test Provider Flow
1. Visit `/register?role=provider`
2. Register and create provider profile
3. Verify profile appears in browse page

## 9. Production Deployment Checklist

- [ ] Create production Supabase project
- [ ] Run all migrations
- [ ] Create storage buckets with policies
- [ ] Configure authentication providers
- [ ] Set up email templates
- [ ] Configure redirect URLs for production domain
- [ ] Set environment variables in Vercel
- [ ] Enable RLS on all tables (verify)
- [ ] Test all user flows
- [ ] Set up monitoring/alerts
- [ ] Configure backups (daily)

## 10. Troubleshooting

### Docker Not Running
```
Error: failed to connect to the docker API
```
**Solution**: Start Docker Desktop, then run `npx supabase start`

### Migration Fails
```
Error: relation already exists
```
**Solution**: Run `npx supabase db reset` (local) or drop tables manually in cloud

### RLS Blocks Access
```
Error: row-level security policy violation
```
**Solution**: Check policy syntax, ensure `auth.uid()` is used correctly

### Auth Callback Fails
```
Error: invalid redirect URL
```
**Solution**: Add callback URL to Supabase Auth > URL Configuration

### Storage Upload Fails
```
Error: bucket not found
```
**Solution**: Create bucket in Storage dashboard, check policies

## 11. Useful Commands

```bash
# Start local Supabase
npx supabase start

# Stop local Supabase
npx supabase stop

# Reset local database (destructive)
npx supabase db reset

# Generate TypeScript types
npx supabase gen types typescript --local > src/types/database.ts

# Link to cloud project
npx supabase link --project-ref YOUR_REF

# Push to cloud
npx supabase db push

# Pull schema from cloud
npx supabase db pull

# Open Supabase Studio
npx supabase studio

# View logs
npx supabase logs
```

## 12. Migration Files Reference

### 20261117000001_initial_schema.sql
- Creates all 20 tables
- Indexes, foreign keys, triggers
- Full-text search indexes

### 20261117000002_seed_data.sql
- 25 Sri Lankan districts with Sinhala/Tamil names
- 200+ cities with translations
- 20 main categories with icons
- 100+ subcategories

### 20261117000003_rls_policies.sql
- RLS policies for all tables
- Role-based access control
- Storage policies (documented separately)

---

## Next Steps After Setup

Once Supabase is configured:

1. **Part 4**: Implement authentication screens (login, register, password reset)
2. **Part 5**: Build provider profile & listing management
3. **Part 6**: Connect search to real database
4. **Part 7**: Connect provider/service pages to database
5. **Part 8**: Customer dashboard
6. **Part 9**: Provider dashboard
7. **Part 10**: Messaging & notifications
8. **Part 11**: Admin dashboard
9. **Part 12-14**: Security audit, UI/UX audit, production deployment

---

*This setup guide covers the complete Supabase backend for WorkFind. The migrations are ready to run and will create a production-ready database schema for the Sri Lankan service marketplace.*