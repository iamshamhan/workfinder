export const SRI_LANKAN_PROVINCES = [
  'Western',
  'Central',
  'Southern',
  'Northern',
  'Eastern',
  'North Western',
  'North Central',
  'Uva',
  'Sabaragamuwa',
] as const

export const SRI_LANKAN_DISTRICTS = [
  { id: 'colombo', name: 'Colombo', province: 'Western' },
  { id: 'gampaha', name: 'Gampaha', province: 'Western' },
  { id: 'kalutara', name: 'Kalutara', province: 'Western' },
  { id: 'kandy', name: 'Kandy', province: 'Central' },
  { id: 'matale', name: 'Matale', province: 'Central' },
  { id: 'nuwara_eliya', name: 'Nuwara Eliya', province: 'Central' },
  { id: 'galle', name: 'Galle', province: 'Southern' },
  { id: 'matara', name: 'Matara', province: 'Southern' },
  { id: 'hambantota', name: 'Hambantota', province: 'Southern' },
  { id: 'jaffna', name: 'Jaffna', province: 'Northern' },
  { id: 'kilinochchi', name: 'Kilinochchi', province: 'Northern' },
  { id: 'mannar', name: 'Mannar', province: 'Northern' },
  { id: 'vavuniya', name: 'Vavuniya', province: 'Northern' },
  { id: 'mullaitivu', name: 'Mullaitivu', province: 'Northern' },
  { id: 'batticaloa', name: 'Batticaloa', province: 'Eastern' },
  { id: 'ampara', name: 'Ampara', province: 'Eastern' },
  { id: 'trincomalee', name: 'Trincomalee', province: 'Eastern' },
  { id: 'kurunegala', name: 'Kurunegala', province: 'North Western' },
  { id: 'puttalam', name: 'Puttalam', province: 'North Western' },
  { id: 'anuradhapura', name: 'Anuradhapura', province: 'North Central' },
  { id: 'polonnaruwa', name: 'Polonnaruwa', province: 'North Central' },
  { id: 'badulla', name: 'Badulla', province: 'Uva' },
  { id: 'monaragala', name: 'Monaragala', province: 'Uva' },
  { id: 'ratnapura', name: 'Ratnapura', province: 'Sabaragamuwa' },
  { id: 'kegalle', name: 'Kegalle', province: 'Sabaragamuwa' },
] as const

export const SRI_LANKAN_CITIES: Record<string, string[]> = {
  colombo: [
    'Colombo',
    'Dehiwala-Mount Lavinia',
    'Moratuwa',
    'Sri Jayawardenepura Kotte',
    'Kaduwela',
    'Maharagama',
    'Boralesgamuwa',
    'Kesbewa',
  ],
  gampaha: [
    'Gampaha',
    'Negombo',
    'Wattala',
    'Ja-Ela',
    'Katunayake',
    'Minuwangoda',
    'Divulapitiya',
    'Mirigama',
  ],
  kalutara: [
    'Kalutara',
    'Panadura',
    'Beruwala',
    'Horana',
    'Matugama',
    'Agalawatta',
  ],
  kandy: [
    'Kandy',
    'Peradeniya',
    'Gampola',
    'Nawalapitiya',
    'Kadugannawa',
    'Pilimathalawa',
  ],
  matale: ['Matale', 'Dambulla', 'Sigiriya', 'Naula'],
  nuwara_eliya: ['Nuwara Eliya', 'Hatton', 'Talawakele', 'Nanu Oya'],
  galle: ['Galle', 'Ambalangoda', 'Hikkaduwa', 'Elpitiya', 'Balapitiya'],
  matara: ['Matara', 'Weligama', 'Akuressa', 'Deniyaya', 'Tangalle'],
  hambantota: ['Hambantota', 'Tangalle', 'Tissamaharama', 'Ambalantota'],
  jaffna: ['Jaffna', 'Chavakachcheri', 'Point Pedro', 'Kayts'],
  kilinochchi: ['Kilinochchi', 'Poonakary', 'Pallai'],
  mannar: ['Mannar', 'Erukkalampiddy', 'Pesalai'],
  vavuniya: ['Vavuniya', 'Cheddikulam', 'Nedunkerny'],
  mullaitivu: ['Mullaitivu', 'Puthukkudiyiruppu', 'Oddusuddan'],
  batticaloa: ['Batticaloa', 'Eravur', 'Kalkudah', 'Valachchenai'],
  ampara: ['Ampara', 'Kalmunai', 'Akkaraipattu', 'Pottuvil'],
  trincomalee: ['Trincomalee', 'Kantale', 'Muttur', 'Kinchadi'],
  kurunegala: ['Kurunegala', 'Kuliyapitiya', 'Nikaweratiya', 'Mawathagama'],
  puttalam: ['Puttalam', 'Chilaw', 'Wennappuwa', 'Marawila', 'Kalpitiya'],
  anuradhapura: ['Anuradhapura', 'Mihintale', 'Kekirawa', 'Thambuttegama'],
  polonnaruwa: ['Polonnaruwa', 'Kaduruwela', 'Hingurakgoda', 'Medirigiriya'],
  badulla: ['Badulla', 'Bandarawela', 'Haputale', 'Welimada', 'Mahiyanganaya'],
  monaragala: ['Monaragala', 'Bibile', 'Wellawaya', 'Siyambalanduwa'],
  ratnapura: ['Ratnapura', 'Balangoda', 'Embilipitiya', 'Nivitigala', 'Pelmadulla'],
  kegalle: ['Kegalle', 'Mawanella', 'Rambukkana', 'Deraniyagala', 'Ruwanwella'],
}

export const CURRENCY = 'LKR'
export const COUNTRY_CODE = '+94'
export const DEFAULT_LOCALE = 'en'
export const SUPPORTED_LOCALES = ['en', 'si', 'ta'] as const

export type Province = (typeof SRI_LANKAN_PROVINCES)[number]
export type DistrictId = (typeof SRI_LANKAN_DISTRICTS)[number]['id']
export type Locale = (typeof SUPPORTED_LOCALES)[number]