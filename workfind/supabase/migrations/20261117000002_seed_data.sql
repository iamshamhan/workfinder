-- WorkFind Seed Data
-- Initial data for districts, cities, and categories

-- ============================================
-- DISTRICTS DATA
-- ============================================
INSERT INTO districts (id, name, name_si, name_ta, province) VALUES
('colombo', 'Colombo', 'කොළඹ', 'கொழும்பு', 'Western'),
('gampaha', 'Gampaha', 'ගම්පහ', 'கம்பாகா', 'Western'),
('kalutara', 'Kalutara', 'කළුතර', 'களுத்துறை', 'Western'),
('kandy', 'Kandy', 'මහනුවර', 'கண்டி', 'Central'),
('matale', 'Matale', 'මාතලේ', 'மாத்தளை', 'Central'),
('nuwara_eliya', 'Nuwara Eliya', 'නුවරඑළිය', 'நுவரெலியா', 'Central'),
('galle', 'Galle', 'ගාල්ල', 'காலை', 'Southern'),
('matara', 'Matara', 'මාතර', 'மாத்தரை', 'Southern'),
('hambantota', 'Hambantota', 'හම්බන්තොට', 'கம்பந்தோட்டை', 'Southern'),
('jaffna', 'Jaffna', 'යාපනය', 'யாழ்ப்பாணம்', 'Northern'),
('kilinochchi', 'Kilinochchi', 'කිලිනොච්චි', 'கிளினொச்சி', 'Northern'),
('mannar', 'Mannar', 'මන්නාරම', 'மன்னார்', 'Northern'),
('vavuniya', 'Vavuniya', 'වවුනියාව', 'வவுனியா', 'Northern'),
('mullaitivu', 'Mullaitivu', 'මුලතිව්', 'முல்லைத்தீவு', 'Northern'),
('batticaloa', 'Batticaloa', 'මඩකලපුව', 'மட்டக்களப்பு', 'Eastern'),
('ampara', 'Ampara', 'අම්පාර', 'அம்பாறை', 'Eastern'),
('trincomalee', 'Trincomalee', 'ත්‍රිකුණාමලය', 'திருக்கோணமலை', 'Eastern'),
('kurunegala', 'Kurunegala', 'කුරුණෑගල', 'குருணாகல்', 'North Western'),
('puttalam', 'Puttalam', 'පුත්තලම', 'புத்தலம்', 'North Western'),
('anuradhapura', 'Anuradhapura', 'අනුරාධපුර', 'அனுராதபுரம்', 'North Central'),
('polonnaruwa', 'Polonnaruwa', 'පොළොන්නරුව', 'பொலன்னறுவை', 'North Central'),
('badulla', 'Badulla', 'බදුල්ල', 'பதுளை', 'Uva'),
('monaragala', 'Monaragala', 'මොණරාගල', 'மொனராகல', 'Uva'),
('ratnapura', 'Ratnapura', 'රත්නපුර', 'இரத்தினபுரி', 'Sabaragamuwa'),
('kegalle', 'Kegalle', 'කෑගල්ල', 'கேகால்ல', 'Sabaragamuwa')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    name_si = EXCLUDED.name_si,
    name_ta = EXCLUDED.name_ta,
    province = EXCLUDED.province;

-- ============================================
-- CITIES DATA
-- ============================================
INSERT INTO cities (district_id, name, name_si, name_ta) VALUES
-- Colombo District
('colombo', 'Colombo', 'කොළඹ', 'கொழும்பு'),
('colombo', 'Dehiwala-Mount Lavinia', 'දෙහිවල-මවුන් ලවිනියා', 'தேஹிவால-மவுண்ட் லவினியா'),
('colombo', 'Moratuwa', 'මොරටුව', 'மொரட்டு'),
('colombo', 'Sri Jayawardenepura Kotte', 'ශ්‍රී ජයවර්ධනපුර කෝට්ටේ', 'ஸ்ரீ ஜயவர்த்தனபுர கோட்டை'),
('colombo', 'Kaduwela', 'කඩුවැල', 'கடுவெல'),
('colombo', 'Maharagama', 'මහරගම', 'மஹரகம'),
('colombo', 'Boralesgamuwa', 'බෝරලැස්ගමුව', 'பொரலெஸ்கமுவ'),
('colombo', 'Kesbewa', 'කැස්බෑව', 'கெஸ்பேவ'),

-- Gampaha District
('gampaha', 'Gampaha', 'ගම්පහ', 'கம்பாகா'),
('gampaha', 'Negombo', 'නීගම්බ', 'நீக்கம்பு'),
('gampaha', 'Wattala', 'වත්තල', 'வத்தல'),
('gampaha', 'Ja-Ela', 'ජා-ඇල', 'ஜா-எலா'),
('gampaha', 'Katunayake', 'කටුනායක', 'கடுனாயக்கே'),
('gampaha', 'Minuwangoda', 'මිනුවන්ගොඩ', 'மினுவாங்கொட'),
('gampaha', 'Divulapitiya', 'දිවුලපිටිය', 'திவுலபிட்டிய'),
('gampaha', 'Mirigama', 'මිරිගම', 'மிரிகம'),

-- Kalutara District
('kalutara', 'Kalutara', 'කළුතර', 'களுத்துறை'),
('kalutara', 'Panadura', 'පානදුර', 'பாணதுரை'),
('kalutara', 'Beruwala', 'බේරුවල', 'பேரு வல'),
('kalutara', 'Horana', 'හොරණ', 'ஹொரண'),
('kalutara', 'Matugama', 'මතුගම', 'மத்துகம'),
('kalutara', 'Agalawatta', 'අගලවත්ත', 'அகலவத்த'),

-- Kandy District
('kandy', 'Kandy', 'මහනුවර', 'கண்டி'),
('kandy', 'Peradeniya', 'පේරාදෙණිය', 'பேராதேனியா'),
('kandy', 'Gampola', 'ගම්පොල', 'கம்போல'),
('kandy', 'Nawalapitiya', 'නාවලපිටිය', 'நாவலபிட்டிய'),
('kandy', 'Kadugannawa', 'කඩුගන්නාව', 'கடுகண்ணாவ'),
('kandy', 'Pilimathalawa', 'පිළිමත්තලාව', 'பிலிமத்தாலாவ'),

-- Matale District
('matale', 'Matale', 'මාතලේ', 'மாத்தளை'),
('matale', 'Dambulla', 'දඹුල්ල', 'தம்புள்ள'),
('matale', 'Sigiriya', 'සීගිරිය', 'சிகிரியா'),
('matale', 'Naula', 'නාවල', 'நாவல'),

-- Nuwara Eliya District
('nuwara_eliya', 'Nuwara Eliya', 'නුවරඑළිය', 'நுவரெலியா'),
('nuwara_eliya', 'Hatton', 'හැටන්', 'ஹேட்டன்'),
('nuwara_eliya', 'Talawakele', 'තලවාකැලේ', 'தளவாக்கெலே'),
('nuwara_eliya', 'Nanu Oya', 'නානු ඔය', 'நானு ஓயா'),

-- Galle District
('galle', 'Galle', 'ගාල්ල', 'காலை'),
('galle', 'Ambalangoda', 'අම්බලංගොඩ', 'அம்பலங்கொட'),
('galle', 'Hikkaduwa', 'හික්කදුව', 'ஹிக்கடுவ'),
('galle', 'Elpitiya', 'ඇල්පිටිය', 'எல்பிட்டிய'),
('galle', 'Balapitiya', 'බලපිටිය', 'பலபிட்டிய'),

-- Matara District
('matara', 'Matara', 'මාතර', 'மாத்தரை'),
('matara', 'Weligama', 'වැලිගම', 'வேலிகம'),
('matara', 'Akuressa', 'අකුරැස්ස', 'அகுரெஸ்ஸ'),
('matara', 'Deniyaya', 'දෙනියාය', 'டெனியாய'),
('matara', 'Tangalle', 'තංගල්ල', 'தங்கல்ல'),

-- Hambantota District
('hambantota', 'Hambantota', 'හම්බන්තොට', 'கம்பந்தோட்டை'),
('hambantota', 'Tangalle', 'තංගල්ල', 'தங்கல்ல'),
('hambantota', 'Tissamaharama', 'තිස්සමහාරාම', 'திஸ்ஸமஹாராம'),
('hambantota', 'Ambalantota', 'අම්බලන්තොට', 'அம்பலந்தோட்ட'),

-- Jaffna District
('jaffna', 'Jaffna', 'යාපනය', 'யாழ்ப்பாணம்'),
('jaffna', 'Chavakachcheri', 'චාවකච්චේරි', 'சாவகச்சேரி'),
('jaffna', 'Point Pedro', 'පොයින්ට් පේද්‍රෝ', 'பয়ிண்ட் பேட்ரோ'),
('jaffna', 'Kayts', 'කයිට්ස්', 'கெய்ட்ஸ்'),

-- Kilinochchi District
('kilinochchi', 'Kilinochchi', 'කිලිනොච්චි', 'கிளினொச்சி'),
('kilinochchi', 'Poonakary', 'පූනකරි', 'பூநகரி'),
('kilinochchi', 'Pallai', 'පල්ලෙයි', 'பல்லாய்'),

-- Mannar District
('mannar', 'Mannar', 'මන්නාරම', 'மன்னார்'),
('mannar', 'Erukkalampiddy', 'එළුක්කලම්පිඩි', 'ஏறுக்கலம்பிட்டி'),
('mannar', 'Pesalai', 'පෙසාලේ', 'பேசாலே'),

-- Vavuniya District
('vavuniya', 'Vavuniya', 'වවුනියාව', 'வவுனியா'),
('vavuniya', 'Cheddikulam', 'චෙඩ්ඩිකුලම්', 'செட்டிகுளம்'),
('vavuniya', 'Nedunkerny', 'නෙඩුන්කැර්නි', 'நெடுங்கेิร์னி'),

-- Mullaitivu District
('mullaitivu', 'Mullaitivu', 'මුලතිව්', 'முல்லைத்தீவு'),
('mullaitivu', 'Puthukkudiyiruppu', 'පුතුක්කුඩියිරුප්පු', 'புத்துக்குடியிருப்பு'),
('mullaitivu', 'Oddusuddan', 'ඕඩුසුද්දාන්', 'ஒட்டுசுட்டான்'),

-- Batticaloa District
('batticaloa', 'Batticaloa', 'මඩකලපුව', 'மட்டக்களப்பு'),
('batticaloa', 'Eravur', 'එරාවුර්', 'ஏறாவூர்'),
('batticaloa', 'Kalkudah', 'කල්කුඩා', 'கல்குடா'),
('batticaloa', 'Valachchenai', 'වලච්චේනේ', 'வலச்சேனை'),

-- Ampara District
('ampara', 'Ampara', 'අම්පාර', 'அம்பாறை'),
('ampara', 'Kalmunai', 'කල්මුනේ', 'கல்முனை'),
('ampara', 'Akkaraipattu', 'අක්කරයිපත්තු', 'அக்கரைப்பட்டு'),
('ampara', 'Pottuvil', 'පොතුවිල්', 'பொத்துவில்'),

-- Trincomalee District
('trincomalee', 'Trincomalee', 'ත්‍රිකුණාමලය', 'திருக்கோணமலை'),
('trincomalee', 'Kantale', 'කන්තලේ', 'கந்தலே'),
('trincomalee', 'Muttur', 'මුතුර්', 'முத்தூர்'),
('trincomalee', 'Kinchadi', 'කිංචඩි', 'கிஞ்சாடி'),

-- Kurunegala District
('kurunegala', 'Kurunegala', 'කුරුණෑගල', 'குருணாகல்'),
('kurunegala', 'Kuliyapitiya', 'කුලියාපිටිය', 'குளியாபிட்டிய'),
('kurunegala', 'Nikaweratiya', 'නිකවෙරටිය', 'நிகவரேடிய'),
('kurunegala', 'Mawathagama', 'මාවතගම', 'மாவதகம'),

-- Puttalam District
('puttalam', 'Puttalam', 'පුත්තලම', 'புத்தலம்'),
('puttalam', 'Chilaw', 'චිලාව්', 'சிலாவ்'),
('puttalam', 'Wennappuwa', 'වෙන්නප්පුව', 'வெண்ணப்புவ'),
('puttalam', 'Marawila', 'මරවිල', 'மறவில'),
('puttalam', 'Kalpitiya', 'කල්පිටිය', 'கல்பிட்டிய'),

-- Anuradhapura District
('anuradhapura', 'Anuradhapura', 'අනුරාධපුර', 'அனுராதபுரம்'),
('anuradhapura', 'Mihintale', 'මිහින්තලේ', 'மிஹிந்தலே'),
('anuradhapura', 'Kekirawa', 'කැකිරාව', 'கேகிராவ'),
('anuradhapura', 'Thambuttegama', 'තඹුත්තේගම', 'தம்புட்டேகம'),

-- Polonnaruwa District
('polonnaruwa', 'Polonnaruwa', 'පොළොන්නරුව', 'பொலன்னறுவை'),
('polonnaruwa', 'Kaduruwela', 'කදුරුවෙල', 'கதுருவேல'),
('polonnaruwa', 'Hingurakgoda', 'හිංගුරක්ගොඩ', 'ஹிங்குரக்கொட'),
('polonnaruwa', 'Medirigiriya', 'මැදිරිගිරිය', 'மெதிரிகிரியா'),

-- Badulla District
('badulla', 'Badulla', 'බදුල්ල', 'பதுளை'),
('badulla', 'Bandarawela', 'බණ්ඩාරවෙල', 'பந்தாரவேல'),
('badulla', 'Haputale', 'හපුතලේ', 'ஹபுதலே'),
('badulla', 'Welimada', 'වැලිමඩ', 'வேலிமட'),
('badulla', 'Mahiyanganaya', 'මහියංගනය', 'மஹியங்கனய'),

-- Monaragala District
('monaragala', 'Monaragala', 'මොණරාගල', 'மொனராகல'),
('monaragala', 'Bibile', 'බිබිලේ', 'பிபிலே'),
('monaragala', 'Wellawaya', 'වැල්ලවාය', 'வெல்லவாய'),
('monaragala', 'Siyambalanduwa', 'සියඹලන්දුව', 'சியம்பலண்டுவ'),

-- Ratnapura District
('ratnapura', 'Ratnapura', 'රත්නපුර', 'இரத்தினபுரி'),
('ratnapura', 'Balangoda', 'බලංගොඩ', 'பலங்கொட'),
('ratnapura', 'Embilipitiya', 'ඇම්බිලිපිටිය', 'எம்பிலிபிட்டிய'),
('ratnapura', 'Nivitigala', 'නිවිතිගල', 'நிவிடிகல'),
('ratnapura', 'Pelmadulla', 'පෙල්මඩුල්ල', 'பெல்மடுல்ல'),

-- Kegalle District
('kegalle', 'Kegalle', 'කෑගල්ල', 'கேகால்ல'),
('kegalle', 'Mawanella', 'මාවනැල්ල', 'மாவனெல்ல'),
('kegalle', 'Rambukkana', 'රඹුක්කන', 'ரம்புக்கன'),
('kegalle', 'Deraniyagala', 'දෙරණියගල', 'டெரணியகல'),
('kegalle', 'Ruwanwella', 'රුවන්වෙල්ල', 'ருவன்வெல்ல')
ON CONFLICT (district_id, name) DO UPDATE SET
    name_si = EXCLUDED.name_si,
    name_ta = EXCLUDED.name_ta;

-- ============================================
-- CATEGORIES DATA
-- ============================================
INSERT INTO categories (name, slug, description, icon, display_order, is_active) VALUES
('Electrical', 'electrical', 'Licensed electricians for wiring, repairs, installations and maintenance', '⚡', 1, TRUE),
('Plumbing', 'plumbing', 'Professional plumbers for leaks, installations, drainage and water systems', '🔧', 2, TRUE),
('Cleaning', 'cleaning', 'Home and office cleaning services including deep cleaning and maintenance', '🧹', 3, TRUE),
('Construction', 'construction', 'Building contractors, masons, and construction professionals', '🏗️', 4, TRUE),
('Repairs', 'repairs', 'General repair services for appliances, furniture, and home maintenance', '🔨', 5, TRUE),
('Transport', 'transport', 'Moving services, delivery, logistics and vehicle hire', '🚚', 6, TRUE),
('Education', 'education', 'Tutors, trainers, language instructors and educational services', '📚', 7, TRUE),
('Technology', 'technology', 'Web developers, IT support, computer repair and tech services', '💻', 8, TRUE),
('Beauty', 'beauty', 'Salon services, makeup artists, hair stylists and wellness', '💄', 9, TRUE),
('Events', 'events', 'Event planners, caterers, decorators and entertainment services', '🎉', 10, TRUE),
('Painting', 'painting', 'Interior and exterior painting services', '🎨', 11, TRUE),
('Gardening', 'gardening', 'Landscaping, garden maintenance and tree services', '🌳', 12, TRUE),
('HVAC', 'hvac', 'Air conditioning installation, repair and maintenance', '❄️', 13, TRUE),
('Automotive', 'automotive', 'Mechanics, car repair and vehicle maintenance', '🚗', 14, TRUE),
('Photography', 'photography', 'Professional photographers for events, portraits and commercial', '📸', 15, TRUE),
('Health', 'health', 'Nurses, caregivers, physiotherapists and home healthcare', '🏥', 16, TRUE),
('Legal', 'legal', 'Legal consultants, notaries and documentation services', '⚖️', 17, TRUE),
('Finance', 'finance', 'Accountants, tax consultants and financial advisors', '💰', 18, TRUE),
('Pest Control', 'pest-control', 'Pest extermination and prevention services', '🐜', 19, TRUE),
('Security', 'security', 'Security guards, CCTV installation and safety services', '🔒', 20, TRUE)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

-- ============================================
-- SUBCATEGORIES DATA
-- ============================================
-- Electrical subcategories
INSERT INTO subcategories (category_id, name, slug, description, display_order, is_active)
SELECT id, 'Residential Wiring', 'residential-wiring', 'Home electrical wiring and rewiring', 1, TRUE FROM categories WHERE slug = 'electrical'
UNION ALL
SELECT id, 'Commercial Electrical', 'commercial-electrical', 'Office and commercial electrical systems', 2, TRUE FROM categories WHERE slug = 'electrical'
UNION ALL
SELECT id, 'Electrical Repairs', 'electrical-repairs', 'Fault finding and electrical repairs', 3, TRUE FROM categories WHERE slug = 'electrical'
UNION ALL
SELECT id, 'Lighting Installation', 'lighting-installation', 'Indoor and outdoor lighting setup', 4, TRUE FROM categories WHERE slug = 'electrical'
UNION ALL
SELECT id, 'Solar Installation', 'solar-installation', 'Solar panel systems and installation', 5, TRUE FROM categories WHERE slug = 'electrical'
ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

-- Plumbing subcategories
INSERT INTO subcategories (category_id, name, slug, description, display_order, is_active)
SELECT id, 'Pipe Installation', 'pipe-installation', 'New pipe installation and replacement', 1, TRUE FROM categories WHERE slug = 'plumbing'
UNION ALL
SELECT id, 'Leak Detection', 'leak-detection', 'Water leak detection and repair', 2, TRUE FROM categories WHERE slug = 'plumbing'
UNION ALL
SELECT id, 'Drain Cleaning', 'drain-cleaning', 'Blocked drain clearing and maintenance', 3, TRUE FROM categories WHERE slug = 'plumbing'
UNION ALL
SELECT id, 'Bathroom Fitting', 'bathroom-fitting', 'Toilet, sink, shower installation', 4, TRUE FROM categories WHERE slug = 'plumbing'
UNION ALL
SELECT id, 'Water Heater', 'water-heater', 'Geyser and water heater services', 5, TRUE FROM categories WHERE slug = 'plumbing'
ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

-- Cleaning subcategories
INSERT INTO subcategories (category_id, name, slug, description, display_order, is_active)
SELECT id, 'House Cleaning', 'house-cleaning', 'Regular home cleaning services', 1, TRUE FROM categories WHERE slug = 'cleaning'
UNION ALL
SELECT id, 'Deep Cleaning', 'deep-cleaning', 'Thorough deep cleaning service', 2, TRUE FROM categories WHERE slug = 'cleaning'
UNION ALL
SELECT id, 'Office Cleaning', 'office-cleaning', 'Commercial office cleaning', 3, TRUE FROM categories WHERE slug = 'cleaning'
UNION ALL
SELECT id, 'Carpet Cleaning', 'carpet-cleaning', 'Professional carpet and upholstery cleaning', 4, TRUE FROM categories WHERE slug = 'cleaning'
UNION ALL
SELECT id, 'Post Construction', 'post-construction-cleaning', 'Cleanup after renovation/construction', 5, TRUE FROM categories WHERE slug = 'cleaning'
ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

-- Construction subcategories
INSERT INTO subcategories (category_id, name, slug, description, display_order, is_active)
SELECT id, 'Home Construction', 'home-construction', 'New house building and construction', 1, TRUE FROM categories WHERE slug = 'construction'
UNION ALL
SELECT id, 'Renovation', 'renovation', 'Home and office renovation services', 2, TRUE FROM categories WHERE slug = 'construction'
UNION ALL
SELECT id, 'Masonry', 'masonry', 'Brickwork, stonework and concrete', 3, TRUE FROM categories WHERE slug = 'construction'
UNION ALL
SELECT id, 'Roofing', 'roofing', 'Roof installation and repair', 4, TRUE FROM categories WHERE slug = 'construction'
UNION ALL
SELECT id, 'Flooring', 'flooring', 'Tile, wood, vinyl floor installation', 5, TRUE FROM categories WHERE slug = 'construction'
ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

-- Repairs subcategories
INSERT INTO subcategories (category_id, name, slug, description, display_order, is_active)
SELECT id, 'Appliance Repair', 'appliance-repair', 'Home appliance repair services', 1, TRUE FROM categories WHERE slug = 'repairs'
UNION ALL
SELECT id, 'Mobile Repair', 'mobile-repair', 'Phone and tablet repair', 2, TRUE FROM categories WHERE slug = 'repairs'
UNION ALL
SELECT id, 'Computer Repair', 'computer-repair', 'PC and laptop repair', 3, TRUE FROM categories WHERE slug = 'repairs'
UNION ALL
SELECT id, 'Furniture Repair', 'furniture-repair', 'Furniture restoration and repair', 4, TRUE FROM categories WHERE slug = 'repairs'
UNION ALL
SELECT id, 'General Handyman', 'general-handyman', 'General home repair and maintenance', 5, TRUE FROM categories WHERE slug = 'repairs'
ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

-- Transport subcategories
INSERT INTO subcategories (category_id, name, slug, description, display_order, is_active)
SELECT id, 'House Moving', 'house-moving', 'Residential relocation services', 1, TRUE FROM categories WHERE slug = 'transport'
UNION ALL
SELECT id, 'Office Moving', 'office-moving', 'Commercial relocation services', 2, TRUE FROM categories WHERE slug = 'transport'
UNION ALL
SELECT id, 'Delivery Service', 'delivery-service', 'Package and goods delivery', 3, TRUE FROM categories WHERE slug = 'transport'
UNION ALL
SELECT id, 'Vehicle Hire', 'vehicle-hire', 'Truck, van and car rental with driver', 4, TRUE FROM categories WHERE slug = 'transport'
UNION ALL
SELECT id, 'Logistics', 'logistics', 'Supply chain and logistics management', 5, TRUE FROM categories WHERE slug = 'transport'
ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

-- Education subcategories
INSERT INTO subcategories (category_id, name, slug, description, display_order, is_active)
SELECT id, 'Academic Tutoring', 'academic-tutoring', 'School subject tutoring', 1, TRUE FROM categories WHERE slug = 'education'
UNION ALL
SELECT id, 'Language Classes', 'language-classes', 'English, Sinhala, Tamil, foreign languages', 2, TRUE FROM categories WHERE slug = 'education'
UNION ALL
SELECT id, 'Skill Training', 'skill-training', 'Vocational and professional skills', 3, TRUE FROM categories WHERE slug = 'education'
UNION ALL
SELECT id, 'Music Lessons', 'music-lessons', 'Instrument and vocal training', 4, TRUE FROM categories WHERE slug = 'education'
UNION ALL
SELECT id, 'Exam Preparation', 'exam-preparation', 'O/L, A/L and entrance exam prep', 5, TRUE FROM categories WHERE slug = 'education'
ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

-- Technology subcategories
INSERT INTO subcategories (category_id, name, slug, description, display_order, is_active)
SELECT id, 'Web Development', 'web-development', 'Website design and development', 1, TRUE FROM categories WHERE slug = 'technology'
UNION ALL
SELECT id, 'Mobile App Development', 'mobile-app-development', 'iOS and Android app development', 2, TRUE FROM categories WHERE slug = 'technology'
UNION ALL
SELECT id, 'IT Support', 'it-support', 'Technical support and troubleshooting', 3, TRUE FROM categories WHERE slug = 'technology'
UNION ALL
SELECT id, 'Software Development', 'software-development', 'Custom software solutions', 4, TRUE FROM categories WHERE slug = 'technology'
UNION ALL
SELECT id, 'Digital Marketing', 'digital-marketing', 'SEO, social media, online advertising', 5, TRUE FROM categories WHERE slug = 'technology'
ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

-- Beauty subcategories
INSERT INTO subcategories (category_id, name, slug, description, display_order, is_active)
SELECT id, 'Hair Styling', 'hair-styling', 'Haircut, coloring, treatment', 1, TRUE FROM categories WHERE slug = 'beauty'
UNION ALL
SELECT id, 'Makeup Artist', 'makeup-artist', 'Bridal, party, professional makeup', 2, TRUE FROM categories WHERE slug = 'beauty'
UNION ALL
SELECT id, 'Skincare', 'skincare', 'Facial treatments and skincare', 3, TRUE FROM categories WHERE slug = 'beauty'
UNION ALL
SELECT id, 'Nail Services', 'nail-services', 'Manicure, pedicure, nail art', 4, TRUE FROM categories WHERE slug = 'beauty'
UNION ALL
SELECT id, 'Spa & Wellness', 'spa-wellness', 'Massage, spa treatments, wellness', 5, TRUE FROM categories WHERE slug = 'beauty'
ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

-- Events subcategories
INSERT INTO subcategories (category_id, name, slug, description, display_order, is_active)
SELECT id, 'Event Planning', 'event-planning', 'Full event management and coordination', 1, TRUE FROM categories WHERE slug = 'events'
UNION ALL
SELECT id, 'Catering', 'catering', 'Food and beverage catering services', 2, TRUE FROM categories WHERE slug = 'events'
UNION ALL
SELECT id, 'Decoration', 'decoration', 'Venue decoration and styling', 3, TRUE FROM categories WHERE slug = 'events'
UNION ALL
SELECT id, 'Photography/Videography', 'event-photography', 'Event photo and video coverage', 4, TRUE FROM categories WHERE slug = 'events'
UNION ALL
SELECT id, 'Entertainment', 'entertainment', 'DJ, live bands, performers', 5, TRUE FROM categories WHERE slug = 'events'
ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

-- Add more subcategories for remaining categories
INSERT INTO subcategories (category_id, name, slug, description, display_order, is_active)
SELECT id, 'Interior Painting', 'interior-painting', 'Interior wall and ceiling painting', 1, TRUE FROM categories WHERE slug = 'painting'
UNION ALL
SELECT id, 'Exterior Painting', 'exterior-painting', 'External wall painting and weatherproofing', 2, TRUE FROM categories WHERE slug = 'painting'
UNION ALL
SELECT id, 'Decorative Finishes', 'decorative-finishes', 'Textured and decorative paint finishes', 3, TRUE FROM categories WHERE slug = 'painting'
ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO subcategories (category_id, name, slug, description, display_order, is_active)
SELECT id, 'Garden Design', 'garden-design', 'Landscape design and planning', 1, TRUE FROM categories WHERE slug = 'gardening'
UNION ALL
SELECT id, 'Lawn Care', 'lawn-care', 'Grass cutting, fertilizing, maintenance', 2, TRUE FROM categories WHERE slug = 'gardening'
UNION ALL
SELECT id, 'Tree Services', 'tree-services', 'Tree trimming, removal, stump grinding', 3, TRUE FROM categories WHERE slug = 'gardening'
UNION ALL
SELECT id, 'Irrigation Systems', 'irrigation-systems', 'Sprinkler and drip irrigation installation', 4, TRUE FROM categories WHERE slug = 'gardening'
ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO subcategories (category_id, name, slug, description, display_order, is_active)
SELECT id, 'AC Installation', 'ac-installation', 'Air conditioner installation', 1, TRUE FROM categories WHERE slug = 'hvac'
UNION ALL
SELECT id, 'AC Repair', 'ac-repair', 'Air conditioner repair and service', 2, TRUE FROM categories WHERE slug = 'hvac'
UNION ALL
SELECT id, 'AC Maintenance', 'ac-maintenance', 'Regular AC cleaning and maintenance', 3, TRUE FROM categories WHERE slug = 'hvac'
UNION ALL
SELECT id, 'Refrigeration', 'refrigeration', 'Commercial refrigeration services', 4, TRUE FROM categories WHERE slug = 'hvac'
ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO subcategories (category_id, name, slug, description, display_order, is_active)
SELECT id, 'Car Service', 'car-service', 'Routine car maintenance and service', 1, TRUE FROM categories WHERE slug = 'automotive'
UNION ALL
SELECT id, 'Car Repair', 'car-repair', 'Mechanical and electrical repairs', 2, TRUE FROM categories WHERE slug = 'automotive'
UNION ALL
SELECT id, 'Tire Services', 'tire-services', 'Tire fitting, balancing, alignment', 3, TRUE FROM categories WHERE slug = 'automotive'
UNION ALL
SELECT id, 'Battery Service', 'battery-service', 'Battery testing and replacement', 4, TRUE FROM categories WHERE slug = 'automotive'
UNION ALL
SELECT id, 'Auto Electrical', 'auto-electrical', 'Vehicle electrical system repairs', 5, TRUE FROM categories WHERE slug = 'automotive'
ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO subcategories (category_id, name, slug, description, display_order, is_active)
SELECT id, 'Wedding Photography', 'wedding-photography', 'Wedding and engagement photography', 1, TRUE FROM categories WHERE slug = 'photography'
UNION ALL
SELECT id, 'Event Photography', 'event-photography', 'Corporate and private event coverage', 2, TRUE FROM categories WHERE slug = 'photography'
UNION ALL
SELECT id, 'Portrait Photography', 'portrait-photography', 'Professional portraits and headshots', 3, TRUE FROM categories WHERE slug = 'photography'
UNION ALL
SELECT id, 'Commercial Photography', 'commercial-photography', 'Product, real estate, food photography', 4, TRUE FROM categories WHERE slug = 'photography'
UNION ALL
SELECT id, 'Videography', 'videography', 'Video production and editing', 5, TRUE FROM categories WHERE slug = 'photography'
ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO subcategories (category_id, name, slug, description, display_order, is_active)
SELECT id, 'Home Nursing', 'home-nursing', 'Qualified nurses for home care', 1, TRUE FROM categories WHERE slug = 'health'
UNION ALL
SELECT id, 'Elderly Care', 'elderly-care', 'Senior citizen care and companionship', 2, TRUE FROM categories WHERE slug = 'health'
UNION ALL
SELECT id, 'Physiotherapy', 'physiotherapy', 'Physical therapy at home', 3, TRUE FROM categories WHERE slug = 'health'
UNION ALL
SELECT id, 'Medical Equipment', 'medical-equipment', 'Medical equipment rental and sales', 4, TRUE FROM categories WHERE slug = 'health'
ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO subcategories (category_id, name, slug, description, display_order, is_active)
SELECT id, 'Legal Consultation', 'legal-consultation', 'Legal advice and consultation', 1, TRUE FROM categories WHERE slug = 'legal'
UNION ALL
SELECT id, 'Document Preparation', 'document-preparation', 'Legal document drafting and review', 2, TRUE FROM categories WHERE slug = 'legal'
UNION ALL
SELECT id, 'Notary Services', 'notary-services', 'Document notarization and certification', 3, TRUE FROM categories WHERE slug = 'legal'
UNION ALL
SELECT id, 'Property Law', 'property-law', 'Real estate legal services', 4, TRUE FROM categories WHERE slug = 'legal'
ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO subcategories (category_id, name, slug, description, display_order, is_active)
SELECT id, 'Accounting', 'accounting', 'Bookkeeping and accounting services', 1, TRUE FROM categories WHERE slug = 'finance'
UNION ALL
SELECT id, 'Tax Consultation', 'tax-consultation', 'Tax planning and filing', 2, TRUE FROM categories WHERE slug = 'finance'
UNION ALL
SELECT id, 'Financial Planning', 'financial-planning', 'Investment and retirement planning', 3, TRUE FROM categories WHERE slug = 'finance'
UNION ALL
SELECT id, 'Audit Services', 'audit-services', 'Financial audit and compliance', 4, TRUE FROM categories WHERE slug = 'finance'
ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO subcategories (category_id, name, slug, description, display_order, is_active)
SELECT id, 'Residential Pest Control', 'residential-pest-control', 'Home pest extermination', 1, TRUE FROM categories WHERE slug = 'pest-control'
UNION ALL
SELECT id, 'Commercial Pest Control', 'commercial-pest-control', 'Office and factory pest management', 2, TRUE FROM categories WHERE slug = 'pest-control'
UNION ALL
SELECT id, 'Termite Treatment', 'termite-treatment', 'Termite inspection and treatment', 3, TRUE FROM categories WHERE slug = 'pest-control'
UNION ALL
SELECT id, 'Mosquito Control', 'mosquito-control', 'Mosquito fogging and prevention', 4, TRUE FROM categories WHERE slug = 'pest-control'
ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

INSERT INTO subcategories (category_id, name, slug, description, display_order, is_active)
SELECT id, 'Security Guards', 'security-guards', 'Manned guarding services', 1, TRUE FROM categories WHERE slug = 'security'
UNION ALL
SELECT id, 'CCTV Installation', 'cctv-installation', 'Security camera systems', 2, TRUE FROM categories WHERE slug = 'security'
UNION ALL
SELECT id, 'Alarm Systems', 'alarm-systems', 'Intruder and fire alarm installation', 3, TRUE FROM categories WHERE slug = 'security'
UNION ALL
SELECT id, 'Access Control', 'access-control', 'Biometric and card access systems', 4, TRUE FROM categories WHERE slug = 'security'
ON CONFLICT (category_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;