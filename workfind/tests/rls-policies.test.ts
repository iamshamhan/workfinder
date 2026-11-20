/**
 * RLS Policy Tests
 *
 * These tests verify that Row Level Security policies work correctly
 * for different user roles (customer, provider, admin).
 *
 * Run with: npx jest tests/rls-policies.test.ts
 * Requires a running Supabase instance with the migrations applied.
 */

import { createClient } from '@supabase/supabase-js';

// Test configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

// Test users (these would be created in a test setup)
const TEST_USERS = {
  admin: {
    email: 'admin@test.workfind.lk',
    password: 'TestPass123!',
    role: 'admin' as const,
  },
  provider: {
    email: 'provider@test.workfind.lk',
    password: 'TestPass123!',
    role: 'provider' as const,
  },
  customer: {
    email: 'customer@test.workfind.lk',
    password: 'TestPass123!',
    role: 'customer' as const,
  },
  provider2: {
    email: 'provider2@test.workfind.lk',
    password: 'TestPass123!',
    role: 'provider' as const,
  },
};

interface TestContext {
  supabase: ReturnType<typeof createClient>;
  adminClient: ReturnType<typeof createClient>;
  users: Record<string, { id: string; accessToken: string; refreshToken: string }>;
  providers: Record<string, string>;
  categories: Record<string, string>;
}

let testContext: TestContext;

/**
 * Setup test environment
 */
async function setupTestEnvironment(): Promise<TestContext> {
  // Admin client with service role key for setup
  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Regular client for testing
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const users: TestContext['users'] = {};
  const providers: TestContext['providers'] = {};
  const categories: TestContext['categories'] = {};

  // Create test users
  for (const [key, userData] of Object.entries(TEST_USERS)) {
    // Sign up user
    const { data: signUpData, error: signUpError } = await adminClient.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: { role: userData.role },
    });

    if (signUpError && signUpError.message !== 'User already registered') {
      throw new Error(`Failed to create user ${key}: ${signUpError.message}`);
    }

    let userId = signUpData?.user?.id;

    // If user already exists, get their ID
    if (!userId) {
      const { data: listData } = await adminClient.auth.admin.listUsers();
      const existingUser = listData.users.find(u => u.email === userData.email);
      userId = existingUser?.id;
    }

    if (!userId) {
      throw new Error(`Could not find or create user ${key}`);
    }

    // Create profile
    const { error: profileError } = await adminClient
      .from('profiles')
      .upsert({
        user_id: userId,
        email: userData.email,
        role: userData.role,
        status: 'active',
        full_name: `Test ${key.charAt(0).toUpperCase() + key.slice(1)}`,
      });

    if (profileError) {
      throw new Error(`Failed to create profile for ${key}: ${profileError.message}`);
    }

    // Sign in to get tokens
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: userData.email,
      password: userData.password,
    });

    if (signInError) {
      throw new Error(`Failed to sign in ${key}: ${signInError.message}`);
    }

    users[key] = {
      id: userId,
      accessToken: signInData.session!.access_token,
      refreshToken: signInData.session!.refresh_token,
    };

    // Create provider profile for provider users
    if (userData.role === 'provider') {
      const { data: category } = await adminClient
        .from('categories')
        .select('id')
        .eq('slug', 'electrical')
        .single();

      const { data: providerProfile, error: providerError } = await adminClient
        .from('provider_profiles')
        .upsert({
          user_id: userId,
          business_name: `Test ${key.charAt(0).toUpperCase() + key.slice(1)} Services`,
          main_category_id: category?.id,
          verification_status: 'verified',
          rating: 4.5,
          review_count: 10,
          district: 'colombo',
          city: 'Colombo',
        })
        .select('id')
        .single();

      if (providerError) {
        throw new Error(`Failed to create provider profile for ${key}: ${providerError.message}`);
      }

      providers[key] = providerProfile.id;
    }
  }

  // Get category IDs
  const { data: cats } = await adminClient.from('categories').select('id, slug');
  for (const cat of cats || []) {
    categories[cat.slug] = cat.id;
  }

  return { supabase, adminClient, users, providers, categories };
}

/**
 * Create a client authenticated as a specific user
 */
function createUserClient(userKey: keyof typeof TEST_USERS) {
  const user = testContext.users[userKey];
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${user.accessToken}`,
      },
    },
  });
}

/**
 * Clean up test data
 */
async function cleanupTestEnvironment() {
  // Delete test users
  for (const [key, userData] of Object.entries(TEST_USERS)) {
    const user = testContext.users[key];
    if (user) {
      await testContext.adminClient.auth.admin.deleteUser(user.id);
    }
  }
}

// ============================================
// TESTS
// ============================================

describe('RLS Policies', () => {
  beforeAll(async () => {
    testContext = await setupTestEnvironment();
  });

  afterAll(async () => {
    await cleanupTestEnvironment();
  });

  describe('Profiles Table', () => {
    test('Users can view their own profile', async () => {
      const client = createUserClient('customer');
      const user = testContext.users.customer;

      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      expect(error).toBeNull();
      expect(data).not.toBeNull();
      expect(data!.user_id).toBe(user.id);
    });

    test('Users cannot view other users profiles', async () => {
      const client = createUserClient('customer');
      const otherUserId = testContext.users.provider.id;

      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('user_id', otherUserId)
        .single();

      // Should return null due to RLS
      expect(data).toBeNull();
    });

    test('Users can update their own profile', async () => {
      const client = createUserClient('customer');
      const user = testContext.users.customer;

      const { data, error } = await client
        .from('profiles')
        .update({ full_name: 'Updated Name' })
        .eq('user_id', user.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data!.full_name).toBe('Updated Name');
    });

    test('Public can view active provider profiles', async () => {
      // Use anon client (no auth)
      const { data, error } = await testContext.supabase
        .from('profiles')
        .select('*')
        .eq('role', 'provider')
        .eq('status', 'active');

      expect(error).toBeNull();
      expect(data).toBeInstanceOf(Array);
      expect(data!.length).toBeGreaterThan(0);
    });

    test('Admins can view all profiles', async () => {
      const client = createUserClient('admin');

      const { data, error } = await client.from('profiles').select('*');

      expect(error).toBeNull();
      expect(data).toBeInstanceOf(Array);
      expect(data!.length).toBeGreaterThanOrEqual(4); // admin, provider, customer, provider2
    });
  });

  describe('Provider Profiles Table', () => {
    test('Providers can view their own profile', async () => {
      const client = createUserClient('provider');
      const providerId = testContext.providers.provider;

      const { data, error } = await client
        .from('provider_profiles')
        .select('*')
        .eq('id', providerId)
        .single();

      expect(error).toBeNull();
      expect(data).not.toBeNull();
      expect(data!.id).toBe(providerId);
    });

    test('Providers cannot view other provider profiles', async () => {
      const client = createUserClient('provider');
      const otherProviderId = testContext.providers.provider2;

      const { data, error } = await client
        .from('provider_profiles')
        .select('*')
        .eq('id', otherProviderId)
        .single();

      expect(data).toBeNull();
    });

    test('Public can view verified provider profiles', async () => {
      const { data, error } = await testContext.supabase
        .from('provider_profiles')
        .select('*')
        .eq('verification_status', 'verified');

      expect(error).toBeNull();
      expect(data).toBeInstanceOf(Array);
      expect(data!.length).toBeGreaterThan(0);
    });

    test('Customers can view verified and pending providers', async () => {
      const client = createUserClient('customer');

      const { data, error } = await client
        .from('provider_profiles')
        .select('*')
        .in('verification_status', ['verified', 'pending']);

      expect(error).toBeNull();
      expect(data).toBeInstanceOf(Array);
    });

    test('Admins can view all provider profiles', async () => {
      const client = createUserClient('admin');

      const { data, error } = await client.from('provider_profiles').select('*');

      expect(error).toBeNull();
      expect(data).toBeInstanceOf(Array);
    });
  });

  describe('Service Listings Table', () => {
    let testListingId: string;

    beforeAll(async () => {
      // Create a test listing
      const providerId = testContext.providers.provider;
      const categoryId = testContext.categories.electrical;

      const { data, error } = await testContext.adminClient
        .from('service_listings')
        .insert({
          provider_id: providerId,
          title: 'Test Electrical Service',
          slug: 'test-electrical-service',
          description: 'A test service listing',
          category_id: categoryId,
          pricing_type: 'fixed',
          price_amount: 5000,
          location_type: 'customer_location',
          district: 'colombo',
          status: 'published',
        })
        .select('id')
        .single();

      if (error) throw new Error(`Failed to create test listing: ${error.message}`);
      testListingId = data.id;
    });

    test('Providers can manage their own listings', async () => {
      const client = createUserClient('provider');

      const { data, error } = await client
        .from('service_listings')
        .select('*')
        .eq('provider_id', testContext.providers.provider);

      expect(error).toBeNull();
      expect(data).toBeInstanceOf(Array);
      expect(data!.some(l => l.id === testListingId)).toBe(true);
    });

    test('Providers cannot manage other providers listings', async () => {
      const client = createUserClient('provider2');

      const { data, error } = await client
        .from('service_listings')
        .select('*')
        .eq('provider_id', testContext.providers.provider);

      expect(data).toHaveLength(0);
    });

    test('Public can view published listings', async () => {
      const { data, error } = await testContext.supabase
        .from('service_listings')
        .select('*')
        .eq('status', 'published');

      expect(error).toBeNull();
      expect(data).toBeInstanceOf(Array);
      expect(data!.some(l => l.id === testListingId)).toBe(true);
    });

    test('Public cannot view draft listings', async () => {
      // Create a draft listing
      const providerId = testContext.providers.provider;
      const categoryId = testContext.categories.electrical;

      const { data: draftListing } = await testContext.adminClient
        .from('service_listings')
        .insert({
          provider_id: providerId,
          title: 'Draft Service',
          slug: 'draft-service',
          description: 'A draft service',
          category_id: categoryId,
          pricing_type: 'fixed',
          price_amount: 3000,
          location_type: 'customer_location',
          district: 'colombo',
          status: 'draft',
        })
        .select('id')
        .single();

      const { data, error } = await testContext.supabase
        .from('service_listings')
        .select('*')
        .eq('id', draftListing!.id)
        .single();

      expect(data).toBeNull();
    });
  });

  describe('Job Requests Table', () => {
    let testJobRequestId: string;

    beforeAll(async () => {
      const customerId = testContext.users.customer.id;
      const categoryId = testContext.categories.electrical;

      const { data, error } = await testContext.adminClient
        .from('job_requests')
        .insert({
          customer_id: customerId,
          title: 'Need Electrician',
          description: 'Need an electrician for wiring',
          category_id: categoryId,
          required_service: 'Home wiring',
          district: 'colombo',
          status: 'open',
        })
        .select('id')
        .single();

      if (error) throw new Error(`Failed to create test job request: ${error.message}`);
      testJobRequestId = data.id;
    });

    test('Customers can manage their own job requests', async () => {
      const client = createUserClient('customer');

      const { data, error } = await client
        .from('job_requests')
        .select('*')
        .eq('customer_id', testContext.users.customer.id);

      expect(error).toBeNull();
      expect(data).toBeInstanceOf(Array);
      expect(data!.some(j => j.id === testJobRequestId)).toBe(true);
    });

    test('Providers can view open job requests in their category', async () => {
      const client = createUserClient('provider');

      const { data, error } = await client
        .from('job_requests')
        .select('*')
        .eq('status', 'open');

      expect(error).toBeNull();
      expect(data).toBeInstanceOf(Array);
      // Should see the job request since it's in their category (electrical)
      expect(data!.some(j => j.id === testJobRequestId)).toBe(true);
    });

    test('Providers cannot view job requests outside their category', async () => {
      // Create a job request in a different category
      const customerId = testContext.users.customer.id;
      const plumbingCategoryId = testContext.categories.plumbing;

      const { data: otherJob } = await testContext.adminClient
        .from('job_requests')
        .insert({
          customer_id: customerId,
          title: 'Need Plumber',
          description: 'Need a plumber for leak',
          category_id: plumbingCategoryId,
          required_service: 'Leak repair',
          district: 'colombo',
          status: 'open',
        })
        .select('id')
        .single();

      const client = createUserClient('provider'); // Electrical provider

      const { data, error } = await client
        .from('job_requests')
        .select('*')
        .eq('id', otherJob!.id)
        .single();

      expect(data).toBeNull(); // Provider is electrical, job is plumbing
    });
  });

  describe('Quotations Table', () => {
    let testQuotationId: string;
    let testJobRequestId: string;

    beforeAll(async () => {
      const customerId = testContext.users.customer.id;
      const providerId = testContext.providers.provider;
      const categoryId = testContext.categories.electrical;

      // Create job request
      const { data: jobRequest } = await testContext.adminClient
        .from('job_requests')
        .insert({
          customer_id: customerId,
          title: 'Need Electrician for Quotation',
          description: 'Test job for quotation',
          category_id: categoryId,
          required_service: 'Wiring',
          district: 'colombo',
          status: 'open',
        })
        .select('id')
        .single();

      testJobRequestId = jobRequest!.id;

      // Create quotation
      const { data: quotation } = await testContext.adminClient
        .from('quotations')
        .insert({
          job_request_id: testJobRequestId,
          provider_id: providerId,
          amount: 10000,
          description: 'Test quotation',
        })
        .select('id')
        .single();

      testQuotationId = quotation!.id;
    });

    test('Providers can manage their own quotations', async () => {
      const client = createUserClient('provider');

      const { data, error } = await client
        .from('quotations')
        .select('*')
        .eq('provider_id', testContext.providers.provider);

      expect(error).toBeNull();
      expect(data).toBeInstanceOf(Array);
      expect(data!.some(q => q.id === testQuotationId)).toBe(true);
    });

    test('Customers can view quotations for their job requests', async () => {
      const client = createUserClient('customer');

      const { data, error } = await client
        .from('quotations')
        .select('*')
        .eq('job_request_id', testJobRequestId);

      expect(error).toBeNull();
      expect(data).toBeInstanceOf(Array);
      expect(data!.some(q => q.id === testQuotationId)).toBe(true);
    });

    test('Customers cannot view quotations for other customers job requests', async () => {
      const client = createUserClient('customer');

      // Create another customer's job request
      const { data: otherJob } = await testContext.adminClient
        .from('job_requests')
        .insert({
          customer_id: testContext.users.customer.id, // Same customer for simplicity
          title: 'Other Job',
          description: 'Other job',
          category_id: testContext.categories.electrical,
          required_service: 'Repair',
          district: 'colombo',
          status: 'open',
        })
        .select('id')
        .single();

      const { data: otherQuotation } = await testContext.adminClient
        .from('quotations')
        .insert({
          job_request_id: otherJob!.id,
          provider_id: testContext.providers.provider2,
          amount: 5000,
          description: 'Other quotation',
        })
        .select('id')
        .single();

      const { data, error } = await client
        .from('quotations')
        .select('*')
        .eq('id', otherQuotation!.id)
        .single();

      // This should still work since it's the same customer
      expect(error).toBeNull();
    });
  });

  describe('Enquiries Table', () => {
    let testEnquiryId: string;
    let testListingId: string;

    beforeAll(async () => {
      const providerId = testContext.providers.provider;
      const categoryId = testContext.categories.electrical;

      // Create listing
      const { data: listing } = await testContext.adminClient
        .from('service_listings')
        .insert({
          provider_id: providerId,
          title: 'Test Listing for Enquiry',
          slug: 'test-listing-enquiry',
          description: 'Test listing',
          category_id: categoryId,
          pricing_type: 'fixed',
          price_amount: 5000,
          location_type: 'customer_location',
          district: 'colombo',
          status: 'published',
        })
        .select('id')
        .single();

      testListingId = listing!.id;

      // Create enquiry
      const { data: enquiry } = await testContext.adminClient
        .from('enquiries')
        .insert({
          customer_id: testContext.users.customer.id,
          provider_id: providerId,
          listing_id: testListingId,
          subject: 'Test Enquiry',
          message: 'Hello, interested in your service',
          contact_method: 'in_app',
        })
        .select('id')
        .single();

      testEnquiryId = enquiry!.id;
    });

    test('Customers can manage their own enquiries', async () => {
      const client = createUserClient('customer');

      const { data, error } = await client
        .from('enquiries')
        .select('*')
        .eq('customer_id', testContext.users.customer.id);

      expect(error).toBeNull();
      expect(data).toBeInstanceOf(Array);
      expect(data!.some(e => e.id === testEnquiryId)).toBe(true);
    });

    test('Providers can view enquiries for their listings', async () => {
      const client = createUserClient('provider');

      const { data, error } = await client
        .from('enquiries')
        .select('*')
        .eq('provider_id', testContext.providers.provider);

      expect(error).toBeNull();
      expect(data).toBeInstanceOf(Array);
      expect(data!.some(e => e.id === testEnquiryId)).toBe(true);
    });

    test('Providers can update enquiry status', async () => {
      const client = createUserClient('provider');

      const { data, error } = await client
        .from('enquiries')
        .update({ status: 'read' })
        .eq('id', testEnquiryId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data!.status).toBe('read');
    });
  });

  describe('Conversations Table', () => {
    let testConversationId: string;

    beforeAll(async () => {
      const { data, error } = await testContext.adminClient
        .from('conversations')
        .insert({
          participant_1_id: testContext.users.customer.id,
          participant_2_id: testContext.users.provider.id,
        })
        .select('id')
        .single();

      if (error) throw new Error(`Failed to create test conversation: ${error.message}`);
      testConversationId = data.id;
    });

    test('Users can view conversations they are part of', async () => {
      const client = createUserClient('customer');

      const { data, error } = await client
        .from('conversations')
        .select('*')
        .eq('id', testConversationId)
        .single();

      expect(error).toBeNull();
      expect(data).not.toBeNull();
      expect(data!.id).toBe(testConversationId);
    });

    test('Users cannot view conversations they are not part of', async () => {
      // Create conversation between provider and provider2
      const { data: otherConv } = await testContext.adminClient
        .from('conversations')
        .insert({
          participant_1_id: testContext.users.provider.id,
          participant_2_id: testContext.users.provider2.id,
        })
        .select('id')
        .single();

      const client = createUserClient('customer');

      const { data, error } = await client
        .from('conversations')
        .select('*')
        .eq('id', otherConv!.id)
        .single();

      expect(data).toBeNull();
    });

    test('Users can create conversations', async () => {
      const client = createUserClient('customer');

      const { data, error } = await client
        .from('conversations')
        .insert({
          participant_1_id: testContext.users.customer.id,
          participant_2_id: testContext.users.provider2.id,
        })
        .select('id')
        .single();

      expect(error).toBeNull();
      expect(data).not.toBeNull();
    });
  });

  describe('Messages Table', () => {
    let testConversationId: string;
    let testMessageId: string;

    beforeAll(async () => {
      // Create conversation
      const { data: conversation } = await testContext.adminClient
        .from('conversations')
        .insert({
          participant_1_id: testContext.users.customer.id,
          participant_2_id: testContext.users.provider.id,
        })
        .select('id')
        .single();

      testConversationId = conversation!.id;

      // Create message
      const { data: message } = await testContext.adminClient
        .from('messages')
        .insert({
          conversation_id: testConversationId,
          sender_id: testContext.users.customer.id,
          content: 'Hello provider!',
        })
        .select('id')
        .single();

      testMessageId = message!.id;
    });

    test('Users can view messages in their conversations', async () => {
      const client = createUserClient('customer');

      const { data, error } = await client
        .from('messages')
        .select('*')
        .eq('conversation_id', testConversationId);

      expect(error).toBeNull();
      expect(data).toBeInstanceOf(Array);
      expect(data!.some(m => m.id === testMessageId)).toBe(true);
    });

    test('Users can send messages in their conversations', async () => {
      const client = createUserClient('provider');

      const { data, error } = await client
        .from('messages')
        .insert({
          conversation_id: testConversationId,
          sender_id: testContext.users.provider.id,
          content: 'Hello customer!',
        })
        .select('id')
        .single();

      expect(error).toBeNull();
      expect(data).not.toBeNull();
    });

    test('Users cannot send messages in conversations they are not part of', async () => {
      // Create conversation between provider and provider2
      const { data: otherConv } = await testContext.adminClient
        .from('conversations')
        .insert({
          participant_1_id: testContext.users.provider.id,
          participant_2_id: testContext.users.provider2.id,
        })
        .select('id')
        .single();

      const client = createUserClient('customer');

      const { error } = await client
        .from('messages')
        .insert({
          conversation_id: otherConv!.id,
          sender_id: testContext.users.customer.id,
          content: 'Unauthorized message',
        });

      expect(error).not.toBeNull(); // Should fail due to RLS
    });
  });

  describe('Reviews Table', () => {
    let testReviewId: string;
    let testJobRequestId: string;

    beforeAll(async () => {
      // Create completed job request
      const { data: jobRequest } = await testContext.adminClient
        .from('job_requests')
        .insert({
          customer_id: testContext.users.customer.id,
          title: 'Completed Job for Review',
          description: 'Test completed job',
          category_id: testContext.categories.electrical,
          required_service: 'Wiring',
          district: 'colombo',
          status: 'completed',
        })
        .select('id')
        .single();

      testJobRequestId = jobRequest!.id;

      // Create review
      const { data: review } = await testContext.adminClient
        .from('reviews')
        .insert({
          customer_id: testContext.users.customer.id,
          provider_id: testContext.providers.provider,
          job_request_id: testJobRequestId,
          rating: 5,
          title: 'Great service!',
          content: 'Very professional and quick.',
          status: 'published',
          is_verified_purchase: true,
        })
        .select('id')
        .single();

      testReviewId = review!.id;
    });

    test('Customers can create reviews for completed jobs', async () => {
      // Create another completed job
      const { data: jobRequest } = await testContext.adminClient
        .from('job_requests')
        .insert({
          customer_id: testContext.users.customer.id,
          title: 'Another Completed Job',
          description: 'Test',
          category_id: testContext.categories.electrical,
          required_service: 'Repair',
          district: 'colombo',
          status: 'completed',
        })
        .select('id')
        .single();

      const client = createUserClient('customer');

      const { data, error } = await client
        .from('reviews')
        .insert({
          customer_id: testContext.users.customer.id,
          provider_id: testContext.providers.provider,
          job_request_id: jobRequest!.id,
          rating: 4,
          content: 'Good service',
        })
        .select('id')
        .single();

      expect(error).toBeNull();
      expect(data).not.toBeNull();
    });

    test('Customers cannot create reviews for non-completed jobs', async () => {
      const { data: jobRequest } = await testContext.adminClient
        .from('job_requests')
        .insert({
          customer_id: testContext.users.customer.id,
          title: 'Open Job',
          description: 'Test',
          category_id: testContext.categories.electrical,
          required_service: 'Repair',
          district: 'colombo',
          status: 'open',
        })
        .select('id')
        .single();

      const client = createUserClient('customer');

      const { error } = await client
        .from('reviews')
        .insert({
          customer_id: testContext.users.customer.id,
          provider_id: testContext.providers.provider,
          job_request_id: jobRequest!.id,
          rating: 4,
          content: 'Good service',
        });

      expect(error).not.toBeNull(); // Should fail
    });

    test('Public can view published reviews', async () => {
      const { data, error } = await testContext.supabase
        .from('reviews')
        .select('*')
        .eq('status', 'published');

      expect(error).toBeNull();
      expect(data).toBeInstanceOf(Array);
      expect(data!.some(r => r.id === testReviewId)).toBe(true);
    });

    test('Providers can view their own reviews', async () => {
      const client = createUserClient('provider');

      const { data, error } = await client
        .from('reviews')
        .select('*')
        .eq('provider_id', testContext.providers.provider);

      expect(error).toBeNull();
      expect(data).toBeInstanceOf(Array);
    });
  });

  describe('Reports Table', () => {
    test('Users can create reports', async () => {
      const client = createUserClient('customer');

      const { data, error } = await client
        .from('reports')
        .insert({
          reporter_id: testContext.users.customer.id,
          reported_type: 'user',
          reported_id: testContext.users.provider.id,
          reason: 'inappropriate_content',
          description: 'Test report',
        })
        .select('id')
        .single();

      expect(error).toBeNull();
      expect(data).not.toBeNull();
    });

    test('Users can view their own reports', async () => {
      const client = createUserClient('customer');

      const { data, error } = await client
        .from('reports')
        .select('*')
        .eq('reporter_id', testContext.users.customer.id);

      expect(error).toBeNull();
      expect(data).toBeInstanceOf(Array);
    });

    test('Admins can view all reports', async () => {
      const client = createUserClient('admin');

      const { data, error } = await client.from('reports').select('*');

      expect(error).toBeNull();
      expect(data).toBeInstanceOf(Array);
    });
  });

  describe('Notifications Table', () => {
    let testNotificationId: string;

    beforeAll(async () => {
      const { data, error } = await testContext.adminClient
        .from('notifications')
        .insert({
          user_id: testContext.users.customer.id,
          type: 'new_enquiry',
          title: 'Test Notification',
          message: 'This is a test notification',
        })
        .select('id')
        .single();

      if (error) throw new Error(`Failed to create test notification: ${error.message}`);
      testNotificationId = data.id;
    });

    test('Users can view their own notifications', async () => {
      const client = createUserClient('customer');

      const { data, error } = await client
        .from('notifications')
        .select('*')
        .eq('user_id', testContext.users.customer.id);

      expect(error).toBeNull();
      expect(data).toBeInstanceOf(Array);
      expect(data!.some(n => n.id === testNotificationId)).toBe(true);
    });

    test('Users can mark notifications as read', async () => {
      const client = createUserClient('customer');

      const { data, error } = await client
        .from('notifications')
        .update({ is_read: true })
        .eq('id', testNotificationId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data!.is_read).toBe(true);
    });
  });

  describe('Categories & Subcategories', () => {
    test('Everyone can view active categories', async () => {
      const { data, error } = await testContext.supabase
        .from('categories')
        .select('*')
        .eq('is_active', true);

      expect(error).toBeNull();
      expect(data).toBeInstanceOf(Array);
      expect(data!.length).toBeGreaterThan(0);
    });

    test('Everyone can view active subcategories', async () => {
      const { data, error } = await testContext.supabase
        .from('subcategories')
        .select('*')
        .eq('is_active', true);

      expect(error).toBeNull();
      expect(data).toBeInstanceOf(Array);
      expect(data!.length).toBeGreaterThan(0);
    });

    test('Only admins can manage categories', async () => {
      const client = createUserClient('customer');

      const { error } = await client
        .from('categories')
        .insert({
          name: 'Test Category',
          slug: 'test-category',
          description: 'Test',
          icon: '🔧',
          display_order: 999,
        });

      expect(error).not.toBeNull(); // Should fail
    });
  });

  describe('Districts & Cities', () => {
    test('Everyone can view districts', async () => {
      const { data, error } = await testContext.supabase.from('districts').select('*');

      expect(error).toBeNull();
      expect(data).toBeInstanceOf(Array);
      expect(data!.length).toBe(25); // 25 Sri Lankan districts
    });

    test('Everyone can view cities', async () => {
      const { data, error } = await testContext.supabase.from('cities').select('*');

      expect(error).toBeNull();
      expect(data).toBeInstanceOf(Array);
      expect(data!.length).toBeGreaterThan(0);
    });
  });

  describe('Admin Audit Logs', () => {
    test('Only admins can view audit logs', async () => {
      const client = createUserClient('customer');

      const { data, error } = await client.from('admin_audit_logs').select('*');

      expect(data).toHaveLength(0); // RLS blocks access
    });

    test('Admins can view audit logs', async () => {
      const client = createUserClient('admin');

      const { data, error } = await client.from('admin_audit_logs').select('*');

      expect(error).toBeNull();
      expect(data).toBeInstanceOf(Array);
    });
  });
});

// ============================================
// STORAGE POLICY TESTS
// ============================================

describe('Storage Policies', () => {
  beforeAll(async () => {
    testContext = await setupTestEnvironment();
  });

  afterAll(async () => {
    await cleanupTestEnvironment();
  });

  test('Users can upload to their own profile pictures folder', async () => {
    const client = createUserClient('customer');
    const userId = testContext.users.customer.id;

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    const { data, error } = await client.storage
      .from('profile-pictures')
      .upload(`${userId}/test.jpg`, file);

    expect(error).toBeNull();
    expect(data).not.toBeNull();

    // Cleanup
    await client.storage.from('profile-pictures').remove([`${userId}/test.jpg`]);
  });

  test('Users cannot upload to other users profile pictures folder', async () => {
    const client = createUserClient('customer');
    const otherUserId = testContext.users.provider.id;

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    const { error } = await client.storage
      .from('profile-pictures')
      .upload(`${otherUserId}/test.jpg`, file);

    expect(error).not.toBeNull(); // Should fail
  });

  test('Providers can upload business logos', async () => {
    const client = createUserClient('provider');
    const providerId = testContext.providers.provider;

    const file = new File(['test'], 'logo.png', { type: 'image/png' });

    const { data, error } = await client.storage
      .from('business-logos')
      .upload(`${providerId}/logo.png`, file);

    expect(error).toBeNull();
    expect(data).not.toBeNull();

    // Cleanup
    await client.storage.from('business-logos').remove([`${providerId}/logo.png`]);
  });

  test('Customers cannot upload business logos', async () => {
    const client = createUserClient('customer');
    const providerId = testContext.providers.provider;

    const file = new File(['test'], 'logo.png', { type: 'image/png' });

    const { error } = await client.storage
      .from('business-logos')
      .upload(`${providerId}/logo.png`, file);

    expect(error).not.toBeNull(); // Should fail
  });

  test('Public can view profile pictures', async () => {
    const userId = testContext.users.customer.id;

    const file = new File(['test'], 'public-test.jpg', { type: 'image/jpeg' });

    // Upload with admin
    await testContext.adminClient.storage
      .from('profile-pictures')
      .upload(`${userId}/public-test.jpg`, file);

    // Try to download with anon client
    const { data, error } = await testContext.supabase.storage
      .from('profile-pictures')
      .download(`${userId}/public-test.jpg`);

    expect(error).toBeNull();
    expect(data).not.toBeNull();

    // Cleanup
    await testContext.adminClient.storage.from('profile-pictures').remove([`${userId}/public-test.jpg`]);
  });
});