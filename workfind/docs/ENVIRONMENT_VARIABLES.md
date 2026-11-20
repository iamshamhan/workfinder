# WorkFind Environment Variables Reference

## Required Variables

### Supabase Configuration
These are **required** for the application to function.

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://abcdefghijklmnop.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key (client-safe) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only, **never expose to client**) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### App Configuration
| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `NEXT_PUBLIC_APP_URL` | Base URL of the application | `http://localhost:3000` | `https://workfind.lk` |
| `NEXT_PUBLIC_APP_NAME` | Application name displayed in UI | `WorkFind` | `WorkFind` |

---

## Optional Variables

### Email Configuration (for notifications, verification emails)
| Variable | Description | Example |
|----------|-------------|---------|
| `EMAIL_SERVER_HOST` | SMTP server hostname | `smtp.sendgrid.net` |
| `EMAIL_SERVER_PORT` | SMTP server port | `587` |
| `EMAIL_SERVER_USER` | SMTP username | `apikey` |
| `EMAIL_SERVER_PASSWORD` | SMTP password / API key | `SG.xxxxxxxxxxxx` |
| `EMAIL_FROM` | Sender email address | `noreply@workfind.lk` |

### Storage
| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_STORAGE_URL` | Public storage URL for direct asset access | `https://abcdefghijklmnop.supabase.co/storage/v1/object/public` |

### Analytics & Monitoring (future use)
| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_GA_ID` | Google Analytics Measurement ID | `G-XXXXXXXXXX` |
| `SENTRY_DSN` | Sentry error tracking DSN | `https://xxxx@sentry.io/xxxx` |

### Feature Flags (future use)
| Variable | Description | Default |
|----------|-------------|---------|
| `ENABLE_CHAT` | Enable in-app chat feature | `true` |
| `ENABLE_REVIEWS` | Enable review system | `true` |
| `ENABLE_JOB_REQUESTS` | Enable job request feature | `true` |

---

## Environment-Specific Values

### Development (`.env.local`)
```env
# Supabase (use local Supabase instance)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-local-service-role-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=WorkFind (Dev)

# Email (use test credentials or Ethereal Email)
EMAIL_SERVER_HOST=smtp.ethereal.email
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-ethereal-user
EMAIL_SERVER_PASSWORD=your-ethereal-pass
EMAIL_FROM=dev@workfind.local
```

### Staging (`.env.staging`)
```env
# Supabase (use staging project)
NEXT_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-staging-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-staging-service-role-key

# App
NEXT_PUBLIC_APP_URL=https://staging.workfind.lk
NEXT_PUBLIC_APP_NAME=WorkFind (Staging)

# Email (use staging email service)
EMAIL_SERVER_HOST=smtp.sendgrid.net
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=apikey
EMAIL_SERVER_PASSWORD=your-staging-sendgrid-key
EMAIL_FROM=staging@workfind.lk
```

### Production (`.env.production`)
```env
# Supabase (use production project)
NEXT_PUBLIC_SUPABASE_URL=https://production-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key

# App
NEXT_PUBLIC_APP_URL=https://workfind.lk
NEXT_PUBLIC_APP_NAME=WorkFind

# Email (use production email service)
EMAIL_SERVER_HOST=smtp.sendgrid.net
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=apikey
EMAIL_SERVER_PASSWORD=your-production-sendgrid-key
EMAIL_FROM=noreply@workfind.lk

# Storage
NEXT_PUBLIC_SUPABASE_STORAGE_URL=https://production-project.supabase.co/storage/v1/object/public

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
SENTRY_DSN=https://xxxx@sentry.io/xxxx
```

---

## Getting Supabase Keys

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **API**
4. Copy the following:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

---

## Security Best Practices

### ❌ NEVER DO
- Commit `.env.local`, `.env.production`, or any file with real secrets to git
- Expose `SUPABASE_SERVICE_ROLE_KEY` to the client/browser
- Use the same keys across environments
- Share service role keys in chat, email, or documentation

### ✅ ALWAYS DO
- Use `.env.local` for local development (gitignored)
- Use different Supabase projects for dev/staging/production
- Rotate keys periodically (especially if compromised)
- Use Vercel/Netlify environment variable settings for production
- Restrict API keys by referrer/domain in Supabase dashboard

---

## Verification Checklist

Before deploying, verify:

- [ ] All required variables are set
- [ ] `NEXT_PUBLIC_SUPABASE_URL` matches your project
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is the anon key (not service role)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is only used server-side
- [ ] `NEXT_PUBLIC_APP_URL` matches your deployment URL
- [ ] Email credentials work (test with a verification email)
- [ ] Storage URL is accessible (if using custom domain)
- [ ] No secrets in client-side code (grep for `SUPABASE_SERVICE_ROLE_KEY` in `src/`)

---

## Local Development with Supabase CLI

```bash
# Start local Supabase
npx supabase start

# Get local keys (output shows them)
npx supabase status

# Apply migrations
npx supabase db push

# Generate TypeScript types
npm run db:types

# Reset database (careful - destroys data)
npx supabase db reset
```

### Local Keys Example Output
```
API URL: http://localhost:54321
GraphQL URL: http://localhost:54321/graphql/v1
DB URL: postgresql://postgres:postgres@localhost:54322/postgres
Studio URL: http://localhost:54323
Inbucket URL: http://localhost:54324
JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Vercel Deployment

In Vercel dashboard → Project Settings → Environment Variables:

### Production
```
NEXT_PUBLIC_SUPABASE_URL = https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your-prod-anon-key
SUPABASE_SERVICE_ROLE_KEY = your-prod-service-role-key
NEXT_PUBLIC_APP_URL = https://workfind.lk
NEXT_PUBLIC_APP_NAME = WorkFind
EMAIL_SERVER_HOST = smtp.sendgrid.net
EMAIL_SERVER_PORT = 587
EMAIL_SERVER_USER = apikey
EMAIL_SERVER_PASSWORD = your-prod-sendgrid-key
EMAIL_FROM = noreply@workfind.lk
NEXT_PUBLIC_SUPABASE_STORAGE_URL = https://your-prod-project.supabase.co/storage/v1/object/public
```

### Preview (auto-deployed from branches)
```
NEXT_PUBLIC_SUPABASE_URL = https://your-staging-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your-staging-anon-key
SUPABASE_SERVICE_ROLE_KEY = your-staging-service-role-key
NEXT_PUBLIC_APP_URL = https://workfind-git-branch.vercel.app
NEXT_PUBLIC_APP_NAME = WorkFind (Preview)
```

---

## Troubleshooting

### "Invalid API key" error
- Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
- Check if key was regenerated in Supabase dashboard
- Ensure no extra whitespace in env file

### "JWT expired" or auth issues
- Check `SUPABASE_SERVICE_ROLE_KEY` is valid
- Verify system clock is synchronized
- Check JWT secret matches in Supabase settings

### Storage access denied
- Verify bucket policies are applied
- Check `NEXT_PUBLIC_SUPABASE_STORAGE_URL` format
- Ensure file paths match RLS policy folder structure

### RLS policy not working
- Verify policies are enabled: `ALTER TABLE x ENABLE ROW LEVEL SECURITY;`
- Check policy syntax with `SELECT * FROM pg_policies WHERE tablename = 'x';`
- Test with different user roles using the test suite

---

## Migration to New Supabase Project

If moving to a new Supabase project:

1. Create new project in Supabase dashboard
2. Run all migrations in order:
   ```bash
   npx supabase db push --project-ref NEW_PROJECT_REF
   ```
3. Update environment variables
4. Update `project_ref` in Supabase config if using custom domains
5. Reconfigure storage bucket policies
6. Update any hardcoded URLs in codebase
7. Test all RLS policies with test suite