/**
 * Mock Data for UI/UX Prototyping
 *
 * IMPORTANT: This data is ONLY for visual prototyping.
 * In production, all data will come from Supabase database.
 * Keep this file separate from production data fetching logic.
 */

import type {
  Category,
  Subcategory,
  ProviderProfile,
  ServiceListing,
  Review,
  District,
  City,
} from '@/types';

// ============================================
// DISTRICTS & CITIES
// ============================================

export const mockDistricts: District[] = [
  { id: 'colombo', name: 'Colombo', name_si: 'කොළඹ', name_ta: 'கொழும்பு', province: 'Western', created_at: new Date().toISOString() },
  { id: 'gampaha', name: 'Gampaha', name_si: 'ගම්පහ', name_ta: 'கம்பாகா', province: 'Western', created_at: new Date().toISOString() },
  { id: 'kalutara', name: 'Kalutara', name_si: 'කළුතර', name_ta: 'களுத்துறை', province: 'Western', created_at: new Date().toISOString() },
  { id: 'kandy', name: 'Kandy', name_si: 'මහනුවර', name_ta: 'கண்டி', province: 'Central', created_at: new Date().toISOString() },
  { id: 'matale', name: 'Matale', name_si: 'මාතලේ', name_ta: 'மாத்தளை', province: 'Central', created_at: new Date().toISOString() },
  { id: 'nuwara_eliya', name: 'Nuwara Eliya', name_si: 'නුවරඑළිය', name_ta: 'நுவரெலியா', province: 'Central', created_at: new Date().toISOString() },
  { id: 'galle', name: 'Galle', name_si: 'ගාල්ල', name_ta: 'காலை', province: 'Southern', created_at: new Date().toISOString() },
  { id: 'matara', name: 'Matara', name_si: 'මාතර', name_ta: 'மாத்தரை', province: 'Southern', created_at: new Date().toISOString() },
  { id: 'hambantota', name: 'Hambantota', name_si: 'හම්බන්තොට', name_ta: 'கம்பந்தோட்டை', province: 'Southern', created_at: new Date().toISOString() },
  { id: 'jaffna', name: 'Jaffna', name_si: 'යාපනය', name_ta: 'யாழ்ப்பாணம்', province: 'Northern', created_at: new Date().toISOString() },
  { id: 'kurunegala', name: 'Kurunegala', name_si: 'කුරුණෑගල', name_ta: 'குருணாகல்', province: 'North Western', created_at: new Date().toISOString() },
  { id: 'puttalam', name: 'Puttalam', name_si: 'පුත්තලම', name_ta: 'புத்தலம்', province: 'North Western', created_at: new Date().toISOString() },
  { id: 'anuradhapura', name: 'Anuradhapura', name_si: 'අනුරාධපුර', name_ta: 'அனுராதபுரம்', province: 'North Central', created_at: new Date().toISOString() },
  { id: 'polonnaruwa', name: 'Polonnaruwa', name_si: 'පොළොන්නරුව', name_ta: 'பொலன்னறுவை', province: 'North Central', created_at: new Date().toISOString() },
  { id: 'badulla', name: 'Badulla', name_si: 'බදුල්ල', name_ta: 'பதுளை', province: 'Uva', created_at: new Date().toISOString() },
  { id: 'monaragala', name: 'Monaragala', name_si: 'මොණරාගල', name_ta: 'மொனராகல', province: 'Uva', created_at: new Date().toISOString() },
  { id: 'ratnapura', name: 'Ratnapura', name_si: 'රත්නපුර', name_ta: 'இரத்தினபுரி', province: 'Sabaragamuwa', created_at: new Date().toISOString() },
  { id: 'kegalle', name: 'Kegalle', name_si: 'කෑගල්ල', name_ta: 'கேகால்ல', province: 'Sabaragamuwa', created_at: new Date().toISOString() },
];

export const mockCities: City[] = [
  { id: '1', district_id: 'colombo', name: 'Colombo', name_si: 'කොළඹ', name_ta: 'கொழும்பு', created_at: new Date().toISOString() },
  { id: '2', district_id: 'colombo', name: 'Dehiwala-Mount Lavinia', name_si: 'දෙහිවල-මවුන් ලවිනියා', name_ta: 'தேஹிவால-மவுண்ட் லவினியா', created_at: new Date().toISOString() },
  { id: '3', district_id: 'colombo', name: 'Moratuwa', name_si: 'මොරටුව', name_ta: 'மொரட்டு', created_at: new Date().toISOString() },
  { id: '4', district_id: 'colombo', name: 'Sri Jayawardenepura Kotte', name_si: 'ශ්‍රී ජයවර්ධනපුර කෝට්ටේ', name_ta: 'ஸ்ரீ ஜயவர்த்தனபுர கோட்டை', created_at: new Date().toISOString() },
  { id: '5', district_id: 'gampaha', name: 'Gampaha', name_si: 'ගම්පහ', name_ta: 'கம்பாகா', created_at: new Date().toISOString() },
  { id: '6', district_id: 'gampaha', name: 'Negombo', name_si: 'නීගම්බ', name_ta: 'நீக்கம்பு', created_at: new Date().toISOString() },
  { id: '7', district_id: 'gampaha', name: 'Wattala', name_si: 'වත්තල', name_ta: 'வத்தல', created_at: new Date().toISOString() },
  { id: '8', district_id: 'kandy', name: 'Kandy', name_si: 'මහනුවර', name_ta: 'கண்டி', created_at: new Date().toISOString() },
  { id: '9', district_id: 'kandy', name: 'Peradeniya', name_si: 'පේරාදෙණිය', name_ta: 'பேராதேனியா', created_at: new Date().toISOString() },
  { id: '10', district_id: 'galle', name: 'Galle', name_si: 'ගාල්ල', name_ta: 'காலை', created_at: new Date().toISOString() },
  { id: '11', district_id: 'galle', name: 'Hikkaduwa', name_si: 'හික්කදුව', name_ta: 'ஹிக்கடுவ', created_at: new Date().toISOString() },
  { id: '12', district_id: 'matara', name: 'Matara', name_si: 'මාතර', name_ta: 'மாத்தரை', created_at: new Date().toISOString() },
  { id: '13', district_id: 'jaffna', name: 'Jaffna', name_si: 'යාපනය', name_ta: 'யாழ்ப்பாணம்', created_at: new Date().toISOString() },
  { id: '14', district_id: 'kurunegala', name: 'Kurunegala', name_si: 'කුරුණෑගල', name_ta: 'குருணாகல்', created_at: new Date().toISOString() },
];

// ============================================
// CATEGORIES & SUBCATEGORIES
// ============================================

export const mockCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Electrical',
    slug: 'electrical',
    description: 'Licensed electricians for wiring, repairs, installations and maintenance',
    icon: '⚡',
    image_url: null,
    parent_id: null,
    display_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cat-2',
    name: 'Plumbing',
    slug: 'plumbing',
    description: 'Professional plumbers for leaks, installations, drainage and water systems',
    icon: '🔧',
    image_url: null,
    parent_id: null,
    display_order: 2,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cat-3',
    name: 'Cleaning',
    slug: 'cleaning',
    description: 'Home and office cleaning services including deep cleaning and maintenance',
    icon: '🧹',
    image_url: null,
    parent_id: null,
    display_order: 3,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cat-4',
    name: 'Construction',
    slug: 'construction',
    description: 'Building contractors, masons, and construction professionals',
    icon: '🏗️',
    image_url: null,
    parent_id: null,
    display_order: 4,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cat-5',
    name: 'Repairs',
    slug: 'repairs',
    description: 'General repair services for appliances, furniture, and home maintenance',
    icon: '🔨',
    image_url: null,
    parent_id: null,
    display_order: 5,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cat-6',
    name: 'Transport',
    slug: 'transport',
    description: 'Moving services, delivery, logistics and vehicle hire',
    icon: '🚚',
    image_url: null,
    parent_id: null,
    display_order: 6,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cat-7',
    name: 'Education',
    slug: 'education',
    description: 'Tutors, trainers, language instructors and educational services',
    icon: '📚',
    image_url: null,
    parent_id: null,
    display_order: 7,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cat-8',
    name: 'Technology',
    slug: 'technology',
    description: 'Web developers, IT support, computer repair and tech services',
    icon: '💻',
    image_url: null,
    parent_id: null,
    display_order: 8,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cat-9',
    name: 'Beauty',
    slug: 'beauty',
    description: 'Salon services, makeup artists, hair stylists and wellness',
    icon: '💄',
    image_url: null,
    parent_id: null,
    display_order: 9,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cat-10',
    name: 'Events',
    slug: 'events',
    description: 'Event planners, caterers, decorators and entertainment services',
    icon: '🎉',
    image_url: null,
    parent_id: null,
    display_order: 10,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cat-11',
    name: 'Painting',
    slug: 'painting',
    description: 'Interior and exterior painting services',
    icon: '🎨',
    image_url: null,
    parent_id: null,
    display_order: 11,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cat-12',
    name: 'Gardening',
    slug: 'gardening',
    description: 'Landscaping, garden maintenance and tree services',
    icon: '🌳',
    image_url: null,
    parent_id: null,
    display_order: 12,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cat-13',
    name: 'HVAC',
    slug: 'hvac',
    description: 'Air conditioning installation, repair and maintenance',
    icon: '❄️',
    image_url: null,
    parent_id: null,
    display_order: 13,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cat-14',
    name: 'Automotive',
    slug: 'automotive',
    description: 'Mechanics, car repair and vehicle maintenance',
    icon: '🚗',
    image_url: null,
    parent_id: null,
    display_order: 14,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cat-15',
    name: 'Photography',
    slug: 'photography',
    description: 'Professional photographers for events, portraits and commercial',
    icon: '📸',
    image_url: null,
    parent_id: null,
    display_order: 15,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const mockSubcategories: Subcategory[] = [
  // Electrical
  { id: 'sub-1', category_id: 'cat-1', name: 'Residential Wiring', slug: 'residential-wiring', description: 'Home electrical wiring and rewiring', display_order: 1, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sub-2', category_id: 'cat-1', name: 'Commercial Electrical', slug: 'commercial-electrical', description: 'Office and commercial electrical systems', display_order: 2, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sub-3', category_id: 'cat-1', name: 'Electrical Repairs', slug: 'electrical-repairs', description: 'Fault finding and electrical repairs', display_order: 3, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sub-4', category_id: 'cat-1', name: 'Lighting Installation', slug: 'lighting-installation', description: 'Indoor and outdoor lighting setup', display_order: 4, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sub-5', category_id: 'cat-1', name: 'Solar Installation', slug: 'solar-installation', description: 'Solar panel systems and installation', display_order: 5, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  // Plumbing
  { id: 'sub-6', category_id: 'cat-2', name: 'Pipe Installation', slug: 'pipe-installation', description: 'New pipe installation and replacement', display_order: 1, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sub-7', category_id: 'cat-2', name: 'Leak Detection', slug: 'leak-detection', description: 'Water leak detection and repair', display_order: 2, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sub-8', category_id: 'cat-2', name: 'Drain Cleaning', slug: 'drain-cleaning', description: 'Blocked drain clearing and maintenance', display_order: 3, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sub-9', category_id: 'cat-2', name: 'Bathroom Fitting', slug: 'bathroom-fitting', description: 'Toilet, sink, shower installation', display_order: 4, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sub-10', category_id: 'cat-2', name: 'Water Heater', slug: 'water-heater', description: 'Geyser and water heater services', display_order: 5, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  // Cleaning
  { id: 'sub-11', category_id: 'cat-3', name: 'House Cleaning', slug: 'house-cleaning', description: 'Regular home cleaning services', display_order: 1, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sub-12', category_id: 'cat-3', name: 'Deep Cleaning', slug: 'deep-cleaning', description: 'Thorough deep cleaning service', display_order: 2, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sub-13', category_id: 'cat-3', name: 'Office Cleaning', slug: 'office-cleaning', description: 'Commercial office cleaning', display_order: 3, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sub-14', category_id: 'cat-3', name: 'Carpet Cleaning', slug: 'carpet-cleaning', description: 'Professional carpet and upholstery cleaning', display_order: 4, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sub-15', category_id: 'cat-3', name: 'Post Construction', slug: 'post-construction-cleaning', description: 'Cleanup after renovation/construction', display_order: 5, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

// ============================================
// PROVIDER PROFILES
// ============================================

export const mockProviders: ProviderProfile[] = [
  {
    id: 'prov-1',
    user_id: 'user-1',
    business_name: 'Premier Electrical Services',
    business_logo_url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=200&h=200&fit=crop',
    cover_image_url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=1200&h=400&fit=crop',
    short_intro: 'Licensed electricians with 15+ years experience. 24/7 emergency service available.',
    description: 'Premier Electrical Services is a family-owned business serving Colombo and surrounding areas since 2008. Our team of licensed electricians provides residential, commercial, and industrial electrical services. We pride ourselves on quality workmanship, transparent pricing, and exceptional customer service. All our electricians are certified and undergo regular training to stay current with the latest electrical codes and technologies.',
    main_category_id: 'cat-1',
    years_experience: 15,
    languages: ['English', 'Sinhala', 'Tamil'],
    availability: {
      monday: { is_available: true, start_time: '08:00', end_time: '18:00' },
      tuesday: { is_available: true, start_time: '08:00', end_time: '18:00' },
      wednesday: { is_available: true, start_time: '08:00', end_time: '18:00' },
      thursday: { is_available: true, start_time: '08:00', end_time: '18:00' },
      friday: { is_available: true, start_time: '08:00', end_time: '18:00' },
      saturday: { is_available: true, start_time: '08:00', end_time: '14:00' },
      sunday: { is_available: false, start_time: null, end_time: null },
    },
    service_delivery_types: ['customer_location', 'business_location'],
    verification_status: 'verified',
    verified_at: new Date('2024-01-15').toISOString(),
    verified_by: 'admin-1',
    rating: 4.9,
    review_count: 127,
    profile_views: 3421,
    district: 'colombo',
    city: 'Colombo',
    phone: '+94 11 234 5678',
    whatsapp: '+94 77 123 4567',
    email: 'info@premierelectrical.lk',
    service_coverage: ['colombo', 'gampaha', 'kalutara'],
    created_at: new Date('2023-06-01').toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prov-2',
    user_id: 'user-2',
    business_name: 'AquaFlow Plumbing Solutions',
    business_logo_url: 'https://images.unsplash.com/photo-1581147036324-c157e62b3cc4?w=200&h=200&fit=crop',
    cover_image_url: 'https://images.unsplash.com/photo-1581147036324-c157e62b3cc4?w=1200&h=400&fit=crop',
    short_intro: 'Fast, reliable plumbing services. No call-out fees. 1-year workmanship guarantee.',
    description: 'AquaFlow Plumbing Solutions has been the trusted plumbing partner for homes and businesses in Gampaha district for over 10 years. We specialize in leak detection, pipe installation, bathroom renovations, and emergency plumbing repairs. Our certified plumbers use the latest equipment and techniques to diagnose and fix problems quickly and efficiently. We believe in honest pricing - no hidden fees, no surprises.',
    main_category_id: 'cat-2',
    years_experience: 10,
    languages: ['English', 'Sinhala'],
    availability: {
      monday: { is_available: true, start_time: '07:30', end_time: '17:30' },
      tuesday: { is_available: true, start_time: '07:30', end_time: '17:30' },
      wednesday: { is_available: true, start_time: '07:30', end_time: '17:30' },
      thursday: { is_available: true, start_time: '07:30', end_time: '17:30' },
      friday: { is_available: true, start_time: '07:30', end_time: '17:30' },
      saturday: { is_available: true, start_time: '08:00', end_time: '13:00' },
      sunday: { is_available: true, start_time: '09:00', end_time: '12:00' },
    },
    service_delivery_types: ['customer_location'],
    verification_status: 'verified',
    verified_at: new Date('2024-02-20').toISOString(),
    verified_by: 'admin-1',
    rating: 4.8,
    review_count: 94,
    profile_views: 2156,
    district: 'gampaha',
    city: 'Negombo',
    phone: '+94 31 223 4567',
    whatsapp: '+94 76 234 5678',
    email: 'info@aquaflowplumbing.lk',
    service_coverage: ['gampaha', 'colombo', 'puttalam'],
    created_at: new Date('2023-03-15').toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prov-3',
    user_id: 'user-3',
    business_name: 'SparkleClean Home Services',
    business_logo_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200&h=200&fit=crop',
    cover_image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&h=400&fit=crop',
    short_intro: 'Professional cleaning you can trust. Eco-friendly products. Background-checked staff.',
    description: 'SparkleClean Home Services provides premium residential and commercial cleaning services in Kandy and surrounding areas. Our professionally trained cleaners use eco-friendly, non-toxic cleaning products that are safe for your family and pets. We offer flexible scheduling, customizable cleaning plans, and a 100% satisfaction guarantee. All our staff undergo thorough background checks and training.',
    main_category_id: 'cat-3',
    years_experience: 8,
    languages: ['English', 'Sinhala', 'Tamil'],
    availability: {
      monday: { is_available: true, start_time: '08:00', end_time: '17:00' },
      tuesday: { is_available: true, start_time: '08:00', end_time: '17:00' },
      wednesday: { is_available: true, start_time: '08:00', end_time: '17:00' },
      thursday: { is_available: true, start_time: '08:00', end_time: '17:00' },
      friday: { is_available: true, start_time: '08:00', end_time: '17:00' },
      saturday: { is_available: true, start_time: '08:00', end_time: '15:00' },
      sunday: { is_available: false, start_time: null, end_time: null },
    },
    service_delivery_types: ['customer_location'],
    verification_status: 'verified',
    verified_at: new Date('2024-01-10').toISOString(),
    verified_by: 'admin-1',
    rating: 4.9,
    review_count: 203,
    profile_views: 4123,
    district: 'kandy',
    city: 'Kandy',
    phone: '+94 81 223 4567',
    whatsapp: '+94 71 345 6789',
    email: 'info@sparkleclean.lk',
    service_coverage: ['kandy', 'matale', 'nuwara_eliya'],
    created_at: new Date('2023-08-01').toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prov-4',
    user_id: 'user-4',
    business_name: 'BuildRight Construction',
    business_logo_url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=200&h=200&fit=crop',
    cover_image_url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&h=400&fit=crop',
    short_intro: 'Quality construction from foundation to finish. Licensed contractors. Free estimates.',
    description: 'BuildRight Construction is a full-service construction company based in Matara. We handle everything from new home construction and major renovations to smaller remodeling projects. Our experienced team of builders, masons, carpenters, and project managers work together to deliver quality results on time and within budget. We are fully licensed, insured, and committed to building lasting relationships with our clients.',
    main_category_id: 'cat-4',
    years_experience: 12,
    languages: ['English', 'Sinhala'],
    availability: {
      monday: { is_available: true, start_time: '07:00', end_time: '17:00' },
      tuesday: { is_available: true, start_time: '07:00', end_time: '17:00' },
      wednesday: { is_available: true, start_time: '07:00', end_time: '17:00' },
      thursday: { is_available: true, start_time: '07:00', end_time: '17:00' },
      friday: { is_available: true, start_time: '07:00', end_time: '17:00' },
      saturday: { is_available: true, start_time: '07:00', end_time: '12:00' },
      sunday: { is_available: false, start_time: null, end_time: null },
    },
    service_delivery_types: ['customer_location', 'business_location'],
    verification_status: 'verified',
    verified_at: new Date('2024-03-01').toISOString(),
    verified_by: 'admin-1',
    rating: 4.7,
    review_count: 87,
    profile_views: 1892,
    district: 'matara',
    city: 'Matara',
    phone: '+94 41 223 4567',
    whatsapp: '+94 70 345 6789',
    email: 'info@buildright.lk',
    service_coverage: ['matara', 'galle', 'hambantota'],
    created_at: new Date('2022-11-01').toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prov-5',
    user_id: 'user-5',
    business_name: 'TechFix Computer Solutions',
    business_logo_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&h=200&fit=crop',
    cover_image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&h=400&fit=crop',
    short_intro: 'Expert computer & mobile repair. Same-day service. Data recovery specialists.',
    description: 'TechFix Computer Solutions is Colombo\'s leading computer and mobile device repair center. We repair all brands of laptops, desktops, smartphones, and tablets. Our certified technicians provide hardware repairs, software troubleshooting, virus removal, data recovery, and upgrades. We offer free diagnostics, transparent pricing, and a 90-day warranty on all repairs.',
    main_category_id: 'cat-5',
    years_experience: 7,
    languages: ['English', 'Sinhala', 'Tamil'],
    availability: {
      monday: { is_available: true, start_time: '09:00', end_time: '19:00' },
      tuesday: { is_available: true, start_time: '09:00', end_time: '19:00' },
      wednesday: { is_available: true, start_time: '09:00', end_time: '19:00' },
      thursday: { is_available: true, start_time: '09:00', end_time: '19:00' },
      friday: { is_available: true, start_time: '09:00', end_time: '19:00' },
      saturday: { is_available: true, start_time: '09:00', end_time: '17:00' },
      sunday: { is_available: true, start_time: '10:00', end_time: '16:00' },
    },
    service_delivery_types: ['business_location', 'customer_location', 'remote'],
    verification_status: 'verified',
    verified_at: new Date('2024-02-15').toISOString(),
    verified_by: 'admin-1',
    rating: 4.8,
    review_count: 156,
    profile_views: 2874,
    district: 'colombo',
    city: 'Moratuwa',
    phone: '+94 11 234 5678',
    whatsapp: '+94 77 234 5678',
    email: 'info@techfix.lk',
    service_coverage: ['colombo', 'gampaha', 'kalutara'],
    created_at: new Date('2023-05-01').toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prov-6',
    user_id: 'user-6',
    business_name: 'LankaMove Logistics',
    business_logo_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&h=200&fit=crop',
    cover_image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&h=400&fit=crop',
    short_intro: 'Island-wide moving & delivery. Household & office relocation. Secure storage available.',
    description: 'LankaMove Logistics provides professional moving and delivery services across Sri Lanka. Whether you\'re moving a household, office, or just need a single item delivered, we have the right vehicle and trained crew for the job. We offer packing services, furniture disassembly/reassembly, and secure short-term storage. Fully insured for your peace of mind.',
    main_category_id: 'cat-6',
    years_experience: 9,
    languages: ['English', 'Sinhala'],
    availability: {
      monday: { is_available: true, start_time: '06:00', end_time: '20:00' },
      tuesday: { is_available: true, start_time: '06:00', end_time: '20:00' },
      wednesday: { is_available: true, start_time: '06:00', end_time: '20:00' },
      thursday: { is_available: true, start_time: '06:00', end_time: '20:00' },
      friday: { is_available: true, start_time: '06:00', end_time: '20:00' },
      saturday: { is_available: true, start_time: '06:00', end_time: '18:00' },
      sunday: { is_available: true, start_time: '08:00', end_time: '16:00' },
    },
    service_delivery_types: ['customer_location', 'multiple_locations'],
    verification_status: 'verified',
    verified_at: new Date('2024-01-20').toISOString(),
    verified_by: 'admin-1',
    rating: 4.6,
    review_count: 78,
    profile_views: 1543,
    district: 'colombo',
    city: 'Dehiwala-Mount Lavinia',
    phone: '+94 11 234 5678',
    whatsapp: '+94 76 234 5678',
    email: 'info@lankamove.lk',
    service_coverage: ['all'],
    created_at: new Date('2023-07-01').toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// ============================================
// SERVICE LISTINGS
// ============================================

export const mockListings: ServiceListing[] = [
  // Premier Electrical Services listings
  {
    id: 'listing-1',
    provider_id: 'prov-1',
    title: 'Complete Home Electrical Wiring',
    slug: 'complete-home-electrical-wiring',
    description: 'Full residential electrical wiring including new constructions, renovations, and rewiring of older homes. We use high-quality copper wiring, modern circuit breakers, and ensure compliance with Sri Lanka electrical standards. Includes consultation, design, installation, testing, and certification.',
    category_id: 'cat-1',
    subcategory_id: 'sub-1',
    main_image_url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&h=400&fit=crop',
    pricing_type: 'starting_from',
    price_amount: 45000,
    price_currency: 'LKR',
    location_type: 'customer_location',
    district: 'colombo',
    city: 'Colombo',
    service_coverage: ['colombo', 'gampaha', 'kalutara'],
    experience_required: 'Licensed electrician with 5+ years experience',
    tags: ['wiring', 'rewiring', 'new construction', 'renovation', 'certified'],
    status: 'published',
    rejection_reason: null,
    published_at: new Date('2024-01-20').toISOString(),
    view_count: 1247,
    enquiry_count: 89,
    created_at: new Date('2024-01-18').toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'listing-2',
    provider_id: 'prov-1',
    title: 'Electrical Fault Diagnosis & Repair',
    slug: 'electrical-fault-diagnosis-repair',
    description: 'Expert fault finding for all electrical issues - tripping breakers, flickering lights, dead outlets, burning smells, and more. We use advanced diagnostic equipment to pinpoint problems quickly. Same-day service for emergencies. All repairs come with 6-month warranty.',
    category_id: 'cat-1',
    subcategory_id: 'sub-3',
    main_image_url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&h=400&fit=crop',
    pricing_type: 'hourly',
    price_amount: 3500,
    price_currency: 'LKR',
    location_type: 'customer_location',
    district: 'colombo',
    city: 'Colombo',
    service_coverage: ['colombo', 'gampaha'],
    experience_required: 'Licensed electrician',
    tags: ['fault finding', 'emergency', 'repairs', 'troubleshooting'],
    status: 'published',
    rejection_reason: null,
    published_at: new Date('2024-01-22').toISOString(),
    view_count: 892,
    enquiry_count: 67,
    created_at: new Date('2024-01-20').toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'listing-3',
    provider_id: 'prov-1',
    title: 'Solar Panel System Installation',
    slug: 'solar-panel-system-installation',
    description: 'Complete solar power solutions for homes and businesses. System design, panel installation, inverter setup, battery storage, grid-tie connection, and net metering application assistance. We use Tier 1 panels with 25-year performance warranty. Free site assessment and ROI calculation.',
    category_id: 'cat-1',
    subcategory_id: 'sub-5',
    main_image_url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&h=400&fit=crop',
    pricing_type: 'quotation',
    price_amount: null,
    price_currency: 'LKR',
    location_type: 'customer_location',
    district: 'colombo',
    city: 'Colombo',
    service_coverage: ['colombo', 'gampaha', 'kalutara', 'kandy'],
    experience_required: 'Certified solar installer',
    tags: ['solar', 'renewable energy', 'panel installation', 'battery storage', 'net metering'],
    status: 'published',
    rejection_reason: null,
    published_at: new Date('2024-02-01').toISOString(),
    view_count: 2156,
    enquiry_count: 134,
    created_at: new Date('2024-01-28').toISOString(),
    updated_at: new Date().toISOString(),
  },
  // AquaFlow Plumbing listings
  {
    id: 'listing-4',
    provider_id: 'prov-2',
    title: 'Bathroom Plumbing Installation & Renovation',
    slug: 'bathroom-plumbing-installation-renovation',
    description: 'Complete bathroom plumbing from new installations to full renovations. Toilet, basin, shower, bathtub, bidet installation. Waterproofing, tiling coordination, and drainage design. We work with all major brands and can source fixtures at trade prices. Free design consultation included.',
    category_id: 'cat-2',
    subcategory_id: 'sub-9',
    main_image_url: 'https://images.unsplash.com/photo-1581147036324-c157e62b3cc4?w=600&h=400&fit=crop',
    pricing_type: 'starting_from',
    price_amount: 35000,
    price_currency: 'LKR',
    location_type: 'customer_location',
    district: 'gampaha',
    city: 'Negombo',
    service_coverage: ['gampaha', 'colombo', 'puttalam'],
    experience_required: 'Licensed plumber',
    tags: ['bathroom', 'renovation', 'installation', 'fixtures', 'waterproofing'],
    status: 'published',
    rejection_reason: null,
    published_at: new Date('2024-02-10').toISOString(),
    view_count: 743,
    enquiry_count: 52,
    created_at: new Date('2024-02-08').toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'listing-5',
    provider_id: 'prov-2',
    title: 'Emergency Leak Detection & Repair',
    slug: 'emergency-leak-detection-repair',
    description: '24/7 emergency leak detection using thermal imaging and acoustic equipment. Non-invasive detection for concealed pipes in walls, floors, and underground. Immediate repair to prevent water damage. We also handle insurance claim documentation.',
    category_id: 'cat-2',
    subcategory_id: 'sub-7',
    main_image_url: 'https://images.unsplash.com/photo-1581147036324-c157e62b3cc4?w=600&h=400&fit=crop',
    pricing_type: 'fixed',
    price_amount: 8500,
    price_currency: 'LKR',
    location_type: 'customer_location',
    district: 'gampaha',
    city: 'Negombo',
    service_coverage: ['gampaha', 'colombo'],
    experience_required: 'Licensed plumber with leak detection certification',
    tags: ['leak detection', 'emergency', 'thermal imaging', 'insurance claims'],
    status: 'published',
    rejection_reason: null,
    published_at: new Date('2024-02-15').toISOString(),
    view_count: 1156,
    enquiry_count: 78,
    created_at: new Date('2024-02-12').toISOString(),
    updated_at: new Date().toISOString(),
  },
  // SparkleClean listings
  {
    id: 'listing-6',
    provider_id: 'prov-3',
    title: 'Standard Home Cleaning Service',
    slug: 'standard-home-cleaning-service',
    description: 'Regular home cleaning service tailored to your schedule. Includes dusting, vacuuming, mopping, bathroom cleaning, kitchen cleaning, bed making, and trash removal. Eco-friendly products safe for kids and pets. Background-checked cleaners. Flexible weekly, bi-weekly, or monthly plans.',
    category_id: 'cat-3',
    subcategory_id: 'sub-11',
    main_image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=400&fit=crop',
    pricing_type: 'hourly',
    price_amount: 1200,
    price_currency: 'LKR',
    location_type: 'customer_location',
    district: 'kandy',
    city: 'Kandy',
    service_coverage: ['kandy', 'matale', 'nuwara_eliya'],
    experience_required: 'Trained cleaner',
    tags: ['home cleaning', 'regular', 'eco-friendly', 'flexible schedule'],
    status: 'published',
    rejection_reason: null,
    published_at: new Date('2024-01-15').toISOString(),
    view_count: 2341,
    enquiry_count: 167,
    created_at: new Date('2024-01-12').toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'listing-7',
    provider_id: 'prov-3',
    title: 'Deep Cleaning & Sanitization',
    slug: 'deep-cleaning-sanitization',
    description: 'Thorough deep cleaning for move-in/out, post-renovation, or seasonal cleaning. Includes appliance cleaning (inside/outside), cabinet interiors, window tracks, grout cleaning, disinfection of high-touch surfaces, and sanitization fogging. Perfect for allergy sufferers and health-conscious families.',
    category_id: 'cat-3',
    subcategory_id: 'sub-12',
    main_image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=400&fit=crop',
    pricing_type: 'fixed',
    price_amount: 15000,
    price_currency: 'LKR',
    location_type: 'customer_location',
    district: 'kandy',
    city: 'Kandy',
    service_coverage: ['kandy', 'matale'],
    experience_required: 'Senior cleaner with deep cleaning certification',
    tags: ['deep cleaning', 'sanitization', 'move-in', 'move-out', 'post-renovation', 'disinfection'],
    status: 'published',
    rejection_reason: null,
    published_at: new Date('2024-01-18').toISOString(),
    view_count: 1567,
    enquiry_count: 112,
    created_at: new Date('2024-01-15').toISOString(),
    updated_at: new Date().toISOString(),
  },
  // BuildRight Construction listings
  {
    id: 'listing-8',
    provider_id: 'prov-4',
    title: 'New House Construction - Design & Build',
    slug: 'new-house-construction-design-build',
    description: 'Complete design and build service for new homes. From architectural plans to final handover. We handle approvals, structural engineering, quality materials, skilled craftsmen, and project management. Transparent pricing with detailed BOQ. Regular progress updates with photos. 5-year structural warranty.',
    category_id: 'cat-4',
    subcategory_id: 'sub-1',
    main_image_url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&h=400&fit=crop',
    pricing_type: 'quotation',
    price_amount: null,
    price_currency: 'LKR',
    location_type: 'customer_location',
    district: 'matara',
    city: 'Matara',
    service_coverage: ['matara', 'galle', 'hambantota'],
    experience_required: 'Licensed contractor with 10+ years',
    tags: ['new construction', 'design-build', 'turnkey', 'warranty', 'project management'],
    status: 'published',
    rejection_reason: null,
    published_at: new Date('2024-03-05').toISOString(),
    view_count: 892,
    enquiry_count: 45,
    created_at: new Date('2024-03-01').toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'listing-9',
    provider_id: 'prov-4',
    title: 'Home Renovation & Remodeling',
    slug: 'home-renovation-remodeling',
    description: 'Transform your existing home with our renovation expertise. Kitchen remodeling, bathroom upgrades, room additions, flooring replacement, roof repairs, and exterior makeovers. We manage all trades and ensure minimal disruption to your daily life. Free design consultation and 3D visualization.',
    category_id: 'cat-4',
    subcategory_id: 'sub-2',
    main_image_url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&h=400&fit=crop',
    pricing_type: 'starting_from',
    price_amount: 250000,
    price_currency: 'LKR',
    location_type: 'customer_location',
    district: 'matara',
    city: 'Matara',
    service_coverage: ['matara', 'galle'],
    experience_required: 'Experienced renovation team',
    tags: ['renovation', 'remodeling', 'kitchen', 'bathroom', 'additions'],
    status: 'published',
    rejection_reason: null,
    published_at: new Date('2024-03-10').toISOString(),
    view_count: 678,
    enquiry_count: 34,
    created_at: new Date('2024-03-08').toISOString(),
    updated_at: new Date().toISOString(),
  },
  // TechFix listings
  {
    id: 'listing-10',
    provider_id: 'prov-5',
    title: 'Laptop & Computer Repair',
    slug: 'laptop-computer-repair',
    description: 'Comprehensive repair for all laptop and desktop brands. Screen replacement, keyboard repair, motherboard repair, data recovery, SSD upgrades, RAM upgrades, OS installation, virus removal, overheating fixes. Free diagnostics. 90-day warranty on parts and labor. Same-day service for common issues.',
    category_id: 'cat-5',
    subcategory_id: 'sub-13',
    main_image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop',
    pricing_type: 'starting_from',
    price_amount: 2500,
    price_currency: 'LKR',
    location_type: 'business_location',
    district: 'colombo',
    city: 'Moratuwa',
    service_coverage: ['colombo', 'gampaha', 'kalutara'],
    experience_required: 'Certified technician',
    tags: ['laptop repair', 'computer repair', 'data recovery', 'upgrades', 'virus removal'],
    status: 'published',
    rejection_reason: null,
    published_at: new Date('2024-02-20').toISOString(),
    view_count: 1876,
    enquiry_count: 143,
    created_at: new Date('2024-02-18').toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'listing-11',
    provider_id: 'prov-5',
    title: 'Mobile Phone Repair',
    slug: 'mobile-phone-repair',
    description: 'Expert repair for iPhone, Samsung, and all Android brands. Screen replacement, battery replacement, charging port repair, water damage recovery, motherboard repair, data recovery. Genuine parts used. Free diagnostics. 6-month warranty. Express 1-hour service for screen and battery.',
    category_id: 'cat-5',
    subcategory_id: 'sub-12',
    main_image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop',
    pricing_type: 'starting_from',
    price_amount: 3500,
    price_currency: 'LKR',
    location_type: 'business_location',
    district: 'colombo',
    city: 'Moratuwa',
    service_coverage: ['colombo', 'gampaha'],
    experience_required: 'Certified mobile technician',
    tags: ['phone repair', 'screen replacement', 'battery', 'water damage', 'data recovery'],
    status: 'published',
    rejection_reason: null,
    published_at: new Date('2024-02-22').toISOString(),
    view_count: 2134,
    enquiry_count: 187,
    created_at: new Date('2024-02-20').toISOString(),
    updated_at: new Date().toISOString(),
  },
  // LankaMove listings
  {
    id: 'listing-12',
    provider_id: 'prov-6',
    title: 'Household Moving & Relocation',
    slug: 'household-moving-relocation',
    description: 'Complete household moving service across Sri Lanka. Professional packing with quality materials, furniture disassembly/reassembly, secure transport in covered trucks, unpacking and arrangement at new location. Transit insurance included. Specialized handling for fragile items, pianos, artwork. Short-term storage available.',
    category_id: 'cat-6',
    subcategory_id: 'sub-1',
    main_image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop',
    pricing_type: 'quotation',
    price_amount: null,
    price_currency: 'LKR',
    location_type: 'multiple_locations',
    district: 'colombo',
    city: 'Dehiwala-Mount Lavinia',
    service_coverage: ['all'],
    experience_required: 'Experienced moving crew',
    tags: ['moving', 'relocation', 'packing', 'storage', 'insurance', 'island-wide'],
    status: 'published',
    rejection_reason: null,
    published_at: new Date('2024-01-25').toISOString(),
    view_count: 987,
    enquiry_count: 67,
    created_at: new Date('2024-01-22').toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'listing-13',
    provider_id: 'prov-6',
    title: 'Office & Commercial Relocation',
    slug: 'office-commercial-relocation',
    description: 'Professional office moving with minimal business disruption. After-hours and weekend moves available. IT equipment handling, server relocation, workstation disassembly/reassembly, file organization, layout planning at new location. Project manager assigned. Detailed inventory and labeling.',
    category_id: 'cat-6',
    subcategory_id: 'sub-2',
    main_image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop',
    pricing_type: 'quotation',
    price_amount: null,
    price_currency: 'LKR',
    location_type: 'multiple_locations',
    district: 'colombo',
    city: 'Dehiwala-Mount Lavinia',
    service_coverage: ['all'],
    experience_required: 'Commercial moving specialist',
    tags: ['office moving', 'commercial', 'IT relocation', 'after-hours', 'project management'],
    status: 'published',
    rejection_reason: null,
    published_at: new Date('2024-01-28').toISOString(),
    view_count: 567,
    enquiry_count: 23,
    created_at: new Date('2024-01-25').toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// ============================================
// REVIEWS
// ============================================

export const mockReviews: Review[] = [
  {
    id: 'rev-1',
    customer_id: 'cust-1',
    provider_id: 'prov-1',
    job_request_id: null,
    listing_id: 'listing-1',
    rating: 5,
    title: 'Excellent work, very professional',
    content: 'Premier Electrical rewired our entire 30-year-old house. They were punctual, clean, and explained everything clearly. The team completed the work in 4 days as promised. No hidden costs. Highly recommend!',
    images: [],
    is_verified_purchase: true,
    status: 'published',
    moderation_note: null,
    created_at: new Date('2024-03-15').toISOString(),
    updated_at: new Date('2024-03-15').toISOString(),
  },
  {
    id: 'rev-2',
    customer_id: 'cust-2',
    provider_id: 'prov-1',
    job_request_id: null,
    listing_id: 'listing-2',
    rating: 5,
    title: 'Quick response to emergency',
    content: 'Called at 10 PM on a Sunday for a burning smell from outlet. Electrician arrived within 45 minutes, found and fixed the issue. Very reasonable emergency rate. Saved our house from potential fire.',
    images: [],
    is_verified_purchase: true,
    status: 'published',
    moderation_note: null,
    created_at: new Date('2024-03-10').toISOString(),
    updated_at: new Date('2024-03-10').toISOString(),
  },
  {
    id: 'rev-3',
    customer_id: 'cust-3',
    provider_id: 'prov-2',
    job_request_id: null,
    listing_id: 'listing-4',
    rating: 5,
    title: 'Bathroom renovation exceeded expectations',
    content: 'AquaFlow renovated our master bathroom. The plumber suggested a better layout that saved space. Work was completed in 5 days. Clean, professional, and the 1-year guarantee gives peace of mind.',
    images: [],
    is_verified_purchase: true,
    status: 'published',
    moderation_note: null,
    created_at: new Date('2024-03-20').toISOString(),
    updated_at: new Date('2024-03-20').toISOString(),
  },
  {
    id: 'rev-4',
    customer_id: 'cust-4',
    provider_id: 'prov-3',
    job_request_id: null,
    listing_id: 'listing-6',
    rating: 5,
    title: 'Reliable and trustworthy cleaners',
    content: 'Have been using SparkleClean for 6 months for weekly cleaning. Same cleaner comes every time, knows our preferences. Eco-friendly products don\'t trigger my allergies. Easy to reschedule when needed.',
    images: [],
    is_verified_purchase: true,
    status: 'published',
    moderation_note: null,
    created_at: new Date('2024-03-05').toISOString(),
    updated_at: new Date('2024-03-05').toISOString(),
  },
  {
    id: 'rev-5',
    customer_id: 'cust-5',
    provider_id: 'prov-3',
    job_request_id: null,
    listing_id: 'listing-7',
    rating: 4,
    title: 'Thorough deep cleaning',
    content: 'Used their deep cleaning service after renovation. Very thorough - even cleaned inside cabinets and window tracks. Only reason for 4 stars is they arrived 30 minutes late. Otherwise excellent work.',
    images: [],
    is_verified_purchase: true,
    status: 'published',
    moderation_note: null,
    created_at: new Date('2024-02-28').toISOString(),
    updated_at: new Date('2024-02-28').toISOString(),
  },
  {
    id: 'rev-6',
    customer_id: 'cust-6',
    provider_id: 'prov-5',
    job_request_id: null,
    listing_id: 'listing-10',
    rating: 5,
    title: 'Saved my laptop and data',
    content: 'Spilled coffee on my MacBook. TechFix recovered all my data and fixed the keyboard in 2 days. Much cheaper than Apple store. They even cleaned the inside. Highly recommend for any computer issues.',
    images: [],
    is_verified_purchase: true,
    status: 'published',
    moderation_note: null,
    created_at: new Date('2024-03-12').toISOString(),
    updated_at: new Date('2024-03-12').toISOString(),
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getProvidersByCategory(categorySlug: string): ProviderProfile[] {
  const category = mockCategories.find(c => c.slug === categorySlug);
  if (!category) return [];
  return mockProviders.filter(p => p.main_category_id === category.id);
}

export function getListingsByProvider(providerId: string): ServiceListing[] {
  return mockListings.filter(l => l.provider_id === providerId && l.status === 'published');
}

export function getListingsByCategory(categorySlug: string): ServiceListing[] {
  const category = mockCategories.find(c => c.slug === categorySlug);
  if (!category) return [];
  return mockListings.filter(l => l.category_id === category.id && l.status === 'published');
}

export function getProviderById(id: string): ProviderProfile | undefined {
  return mockProviders.find(p => p.id === id);
}

export function getListingById(id: string): ServiceListing | undefined {
  return mockListings.find(l => l.id === id);
}

export function getReviewsForProvider(providerId: string): Review[] {
  return mockReviews.filter(r => r.provider_id === providerId && r.status === 'published');
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return mockCategories.find(c => c.slug === slug);
}

export function getSubcategoriesByCategory(categoryId: string): Subcategory[] {
  return mockSubcategories.filter(s => s.category_id === categoryId && s.is_active);
}

export function getCitiesByDistrict(districtId: string): City[] {
  return mockCities.filter(c => c.district_id === districtId);
}

export function getDistrictById(id: string): District | undefined {
  return mockDistricts.find(d => d.id === id);
}

// ============================================
// SEARCH & FILTER HELPERS
// ============================================

export interface SearchFilters {
  query?: string;
  category?: string;
  district?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  verifiedOnly?: boolean;
  pricingType?: string[];
  serviceDeliveryType?: string[];
  sortBy?: 'relevant' | 'rating' | 'reviews' | 'newest' | 'price_low' | 'price_high';
  page?: number;
  limit?: number;
}

export function searchListings(filters: SearchFilters): { listings: ServiceListing[]; total: number } {
  let results = mockListings.filter(l => l.status === 'published');

  if (filters.query) {
    const q = filters.query.toLowerCase();
    results = results.filter(l =>
      l.title.toLowerCase().includes(q) ||
      l.description.toLowerCase().includes(q) ||
      l.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  if (filters.category) {
    const cat = mockCategories.find(c => c.slug === filters.category);
    if (cat) {
      results = results.filter(l => l.category_id === cat.id);
    }
  }

  if (filters.district) {
    results = results.filter(l => l.district === filters.district);
  }

  if (filters.city) {
    results = results.filter(l => l.city?.toLowerCase() === filters.city?.toLowerCase());
  }

  if (filters.minPrice !== undefined) {
    results = results.filter(l => l.price_amount !== null && l.price_amount >= filters.minPrice!);
  }

  if (filters.maxPrice !== undefined) {
    results = results.filter(l => l.price_amount !== null && l.price_amount <= filters.maxPrice!);
  }

  if (filters.minRating !== undefined) {
    const providerIds = mockProviders
      .filter(p => p.rating >= filters.minRating!)
      .map(p => p.id);
    results = results.filter(l => providerIds.includes(l.provider_id));
  }

  if (filters.verifiedOnly) {
    const providerIds = mockProviders
      .filter(p => p.verification_status === 'verified')
      .map(p => p.id);
    results = results.filter(l => providerIds.includes(l.provider_id));
  }

  if (filters.pricingType?.length) {
    results = results.filter(l => filters.pricingType!.includes(l.pricing_type));
  }

  if (filters.serviceDeliveryType?.length) {
    results = results.filter(l => filters.serviceDeliveryType!.includes(l.location_type));
  }

  // Sort
  switch (filters.sortBy) {
    case 'rating':
      results.sort((a, b) => {
        const pa = mockProviders.find(p => p.id === a.provider_id)?.rating || 0;
        const pb = mockProviders.find(p => p.id === b.provider_id)?.rating || 0;
        return pb - pa;
      });
      break;
    case 'reviews':
      results.sort((a, b) => {
        const pa = mockProviders.find(p => p.id === a.provider_id)?.review_count || 0;
        const pb = mockProviders.find(p => p.id === b.provider_id)?.review_count || 0;
        return pb - pa;
      });
      break;
    case 'newest':
      results.sort((a, b) => new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime());
      break;
    case 'price_low':
      results.sort((a, b) => (a.price_amount || Infinity) - (b.price_amount || Infinity));
      break;
    case 'price_high':
      results.sort((a, b) => (b.price_amount || -Infinity) - (a.price_amount || -Infinity));
      break;
    default: // relevant
      results.sort((a, b) => b.view_count - a.view_count);
  }

  const total = results.length;
  const page = filters.page || 1;
  const limit = filters.limit || 12;
  const start = (page - 1) * limit;
  const paginated = results.slice(start, start + limit);

  return { listings: paginated, total };
}

export function getStartingPrice(providerId: string): number | null {
  const prices = mockListings
    .filter((listing) => listing.provider_id === providerId && listing.status === 'published' && listing.price_amount !== null)
    .map((listing) => listing.price_amount as number)

  if (prices.length === 0) return null
  return Math.min(...prices)
}

export function formatCurrency(amount: number, currency: string = 'LKR'): string {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}