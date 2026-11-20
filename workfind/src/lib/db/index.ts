/**
 * WorkFind Database Access Layer
 *
 * This module provides a comprehensive database access layer for all entities
 * in the WorkFind marketplace application.
 *
 * @module db
 */

// Types
export * from './types';

// Queries
export * from './queries';

// Storage
export * from './storage';

// Re-export Supabase clients
export { createClient as createBrowserClient } from '@/lib/supabase/client';
export { createClient as createServerClient } from '@/lib/supabase/server';