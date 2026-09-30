/**
 * Multi-country region registry for NextDayOff.
 *
 * Every jurisdiction (province, territory, state, district, federal) lives in
 * one flat list with an explicit `country` code, so holiday data can reference
 * regions by their globally-unique two-letter codes and the app can group,
 * filter, and label them per country. Adding a country = add entries here,
 * then add holidays referencing their codes.
 */

export const COUNTRIES = [
  { code: 'CA', name: 'Canada', flag: '🍁' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
];

const CANADIAN_REGIONS = [
  {
    code: 'BC',
    name: 'British Columbia',
    shortName: 'B.C.',
    type: 'province',
    capital: 'Victoria',
    standardHolidaysCount: 10,
    flag: '🌲',
    latitude: 53.7267,
    longitude: -127.6476,
    timezone: 'America/Vancouver',
  },
  {
    code: 'ON',
    name: 'Ontario',
    shortName: 'Ontario',
    type: 'province',
    capital: 'Toronto',
    standardHolidaysCount: 9,
    flag: '🏙️',
    latitude: 51.2538,
    longitude: -85.3232,
    timezone: 'America/Toronto',
  },
  {
    code: 'QC',
    name: 'Quebec',
    shortName: 'Québec',
    type: 'province',
    capital: 'Quebec City',
    standardHolidaysCount: 8,
    flag: '⚜️',
    latitude: 52.9399,
    longitude: -73.5491,
    timezone: 'America/Montreal',
  },
  {
    code: 'AB',
    name: 'Alberta',
    shortName: 'Alberta',
    type: 'province',
    capital: 'Edmonton',
    standardHolidaysCount: 9,
    flag: '🏔️',
    latitude: 53.9333,
    longitude: -116.5765,
    timezone: 'America/Edmonton',
  },
  {
    code: 'MB',
    name: 'Manitoba',
    shortName: 'Manitoba',
    type: 'province',
    capital: 'Winnipeg',
    standardHolidaysCount: 9,
    flag: '🌾',
    latitude: 53.7609,
    longitude: -98.8139,
    timezone: 'America/Winnipeg',
  },
  {
    code: 'SK',
    name: 'Saskatchewan',
    shortName: 'Saskatchewan',
    type: 'province',
    capital: 'Regina',
    standardHolidaysCount: 10,
    flag: '🌻',
    latitude: 52.9399,
    longitude: -106.4509,
    timezone: 'America/Regina',
  },
  {
    code: 'NS',
    name: 'Nova Scotia',
    shortName: 'Nova Scotia',
    type: 'province',
    capital: 'Halifax',
    standardHolidaysCount: 6,
    flag: '⛵',
    latitude: 44.682,
    longitude: -63.7443,
    timezone: 'America/Halifax',
  },
  {
    code: 'NB',
    name: 'New Brunswick',
    shortName: 'New Brunswick',
    type: 'province',
    capital: 'Fredericton',
    standardHolidaysCount: 8,
    flag: '🌊',
    latitude: 46.5653,
    longitude: -66.4619,
    timezone: 'America/Moncton',
  },
  {
    code: 'NL',
    name: 'Newfoundland and Labrador',
    shortName: 'Nfld. & Lab.',
    type: 'province',
    capital: "St. John's",
    standardHolidaysCount: 6,
    flag: '⚓',
    latitude: 53.1355,
    longitude: -57.6604,
    timezone: 'America/St_Johns',
  },
  {
    code: 'PE',
    name: 'Prince Edward Island',
    shortName: 'P.E.I.',
    type: 'province',
    capital: 'Charlottetown',
    standardHolidaysCount: 8,
    flag: '🏖️',
    latitude: 46.5107,
    longitude: -63.4168,
    timezone: 'America/Halifax',
  },
  {
    code: 'NT',
    name: 'Northwest Territories',
    shortName: 'N.W.T.',
    type: 'territory',
    capital: 'Yellowknife',
    standardHolidaysCount: 10,
    flag: '❄️',
    latitude: 64.8255,
    longitude: -124.8457,
    timezone: 'America/Yellowknife',
  },
  {
    code: 'YT',
    name: 'Yukon',
    shortName: 'Yukon',
    type: 'territory',
    capital: 'Whitehorse',
    standardHolidaysCount: 10,
    flag: '🌌',
    latitude: 64.2823,
    longitude: -135.0,
    timezone: 'America/Whitehorse',
  },
  {
    code: 'NU',
    name: 'Nunavut',
    shortName: 'Nunavut',
    type: 'territory',
    capital: 'Iqaluit',
    standardHolidaysCount: 10,
    flag: '🧭',
    latitude: 70.2998,
    longitude: -83.1076,
    timezone: 'America/Iqaluit',
  },
  {
    code: 'FED',
    name: 'Federal Jurisdiction',
    shortName: 'Federal',
    type: 'federal',
    capital: 'Ottawa',
    standardHolidaysCount: 10,
    flag: '🇨🇦',
    latitude: 45.4215,
    longitude: -75.6972,
    timezone: 'America/Toronto',
  },
];

const US_REGIONS = [
  // Standard two-letter USPS codes — globally unique (no overlap with the
  // Canadian codes above), so holidays can reference them directly.
  // standardHolidaysCount = the 11 US federal holidays (state-level
  // additions can be layered in later).
  { code: 'AL', name: 'Alabama', shortName: 'Alabama', type: 'state', capital: 'Montgomery', standardHolidaysCount: 11, flag: '🇺🇸', latitude: 32.3668, longitude: -86.3, timezone: 'America/Chicago' },
  { code: 'AK', name: 'Alaska', shortName: 'Alaska', type: 'state', capital: 'Juneau', standardHolidaysCount: 11, flag: '🇺🇸', latitude: 58.3019, longitude: -134.4197, timezone: 'America/Anchorage' },
  { code: 'AZ', name: 'Arizona', shortName: 'Arizona', type: 'state', capital: 'Phoenix', standardHolidaysCount: 11, flag: '🌵', latitude: 33.4484, longitude: -112.074, timezone: 'America/Phoenix' },
  { code: 'AR', name: 'Arkansas', shortName: 'Arkansas', type: 'state', capital: 'Little Rock', standardHolidaysCount: 11, flag: '💎', latitude: 34.7465, longitude: -92.2896, timezone: 'America/Chicago' },
  { code: 'CA', name: 'California', shortName: 'California', type: 'state', capital: 'Sacramento', standardHolidaysCount: 11, flag: '🌉', latitude: 38.5816, longitude: -121.4944, timezone: 'America/Los_Angeles' },
  { code: 'CO', name: 'Colorado', shortName: 'Colorado', type: 'state', capital: 'Denver', standardHolidaysCount: 11, flag: '🏔️', latitude: 39.7392, longitude: -104.9903, timezone: 'America/Denver' },
  { code: 'CT', name: 'Connecticut', shortName: 'Connecticut', type: 'state', capital: 'Hartford', standardHolidaysCount: 11, flag: '🌳', latitude: 41.7658, longitude: -72.6734, timezone: 'America/New_York' },
  { code: 'DE', name: 'Delaware', shortName: 'Delaware', type: 'state', capital: 'Dover', standardHolidaysCount: 11, flag: '🐔', latitude: 39.1582, longitude: -75.5244, timezone: 'America/New_York' },
  { code: 'FL', name: 'Florida', shortName: 'Florida', type: 'state', capital: 'Tallahassee', standardHolidaysCount: 11, flag: '🌴', latitude: 30.4383, longitude: -84.2807, timezone: 'America/New_York' },
  { code: 'GA', name: 'Georgia', shortName: 'Georgia', type: 'state', capital: 'Atlanta', standardHolidaysCount: 11, flag: '🍑', latitude: 33.749, longitude: -84.388, timezone: 'America/New_York' },
  { code: 'HI', name: 'Hawaii', shortName: 'Hawaii', type: 'state', capital: 'Honolulu', standardHolidaysCount: 11, flag: '🌺', latitude: 21.3069, longitude: -157.8583, timezone: 'Pacific/Honolulu' },
  { code: 'ID', name: 'Idaho', shortName: 'Idaho', type: 'state', capital: 'Boise', standardHolidaysCount: 11, flag: '🥔', latitude: 43.615, longitude: -116.2023, timezone: 'America/Boise' },
  { code: 'IL', name: 'Illinois', shortName: 'Illinois', type: 'state', capital: 'Springfield', standardHolidaysCount: 11, flag: '🌆', latitude: 39.7817, longitude: -89.6501, timezone: 'America/Chicago' },
  { code: 'IN', name: 'Indiana', shortName: 'Indiana', type: 'state', capital: 'Indianapolis', standardHolidaysCount: 11, flag: '🌽', latitude: 39.7684, longitude: -86.1581, timezone: 'America/Indiana/Indianapolis' },
  { code: 'IA', name: 'Iowa', shortName: 'Iowa', type: 'state', capital: 'Des Moines', standardHolidaysCount: 11, flag: '🌾', latitude: 41.5868, longitude: -93.625, timezone: 'America/Chicago' },
  { code: 'KS', name: 'Kansas', shortName: 'Kansas', type: 'state', capital: 'Topeka', standardHolidaysCount: 11, flag: '🌻', latitude: 39.0473, longitude: -95.6752, timezone: 'America/Chicago' },
  { code: 'KY', name: 'Kentucky', shortName: 'Kentucky', type: 'state', capital: 'Frankfort', standardHolidaysCount: 11, flag: '🐎', latitude: 38.2009, longitude: -84.8777, timezone: 'America/New_York' },
  { code: 'LA', name: 'Louisiana', shortName: 'Louisiana', type: 'state', capital: 'Baton Rouge', standardHolidaysCount: 11, flag: '🎺', latitude: 30.4515, longitude: -91.1871, timezone: 'America/Chicago' },
  { code: 'ME', name: 'Maine', shortName: 'Maine', type: 'state', capital: 'Augusta', standardHolidaysCount: 11, flag: '🦞', latitude: 44.3106, longitude: -69.7795, timezone: 'America/New_York' },
  { code: 'MD', name: 'Maryland', shortName: 'Maryland', type: 'state', capital: 'Annapolis', standardHolidaysCount: 11, flag: '🦀', latitude: 38.9784, longitude: -76.4922, timezone: 'America/New_York' },
  { code: 'MA', name: 'Massachusetts', shortName: 'Massachusetts', type: 'state', capital: 'Boston', standardHolidaysCount: 11, flag: '🎓', latitude: 42.3601, longitude: -71.0589, timezone: 'America/New_York' },
  { code: 'MI', name: 'Michigan', shortName: 'Michigan', type: 'state', capital: 'Lansing', standardHolidaysCount: 11, flag: '🚗', latitude: 42.7325, longitude: -84.5555, timezone: 'America/Detroit' },
  { code: 'MN', name: 'Minnesota', shortName: 'Minnesota', type: 'state', capital: 'Saint Paul', standardHolidaysCount: 11, flag: '❄️', latitude: 44.9537, longitude: -93.09, timezone: 'America/Chicago' },
  { code: 'MS', name: 'Mississippi', shortName: 'Mississippi', type: 'state', capital: 'Jackson', standardHolidaysCount: 11, flag: '🎶', latitude: 32.2988, longitude: -90.1848, timezone: 'America/Chicago' },
  { code: 'MO', name: 'Missouri', shortName: 'Missouri', type: 'state', capital: 'Jefferson City', standardHolidaysCount: 11, flag: '🏹', latitude: 38.5767, longitude: -92.1735, timezone: 'America/Chicago' },
  { code: 'MT', name: 'Montana', shortName: 'Montana', type: 'state', capital: 'Helena', standardHolidaysCount: 11, flag: '🏔️', latitude: 46.5891, longitude: -112.0391, timezone: 'America/Denver' },
  { code: 'NE', name: 'Nebraska', shortName: 'Nebraska', type: 'state', capital: 'Lincoln', standardHolidaysCount: 11, flag: '🌽', latitude: 40.8136, longitude: -96.7026, timezone: 'America/Chicago' },
  { code: 'NV', name: 'Nevada', shortName: 'Nevada', type: 'state', capital: 'Carson City', standardHolidaysCount: 11, flag: '🎰', latitude: 39.1638, longitude: -119.7674, timezone: 'America/Los_Angeles' },
  { code: 'NH', name: 'New Hampshire', shortName: 'New Hampshire', type: 'state', capital: 'Concord', standardHolidaysCount: 11, flag: '🍁', latitude: 43.2081, longitude: -71.5376, timezone: 'America/New_York' },
  { code: 'NJ', name: 'New Jersey', shortName: 'New Jersey', type: 'state', capital: 'Trenton', standardHolidaysCount: 11, flag: '🏖️', latitude: 40.2171, longitude: -74.7429, timezone: 'America/New_York' },
  { code: 'NM', name: 'New Mexico', shortName: 'New Mexico', type: 'state', capital: 'Santa Fe', standardHolidaysCount: 11, flag: '🌵', latitude: 35.687, longitude: -105.9378, timezone: 'America/Denver' },
  { code: 'NY', name: 'New York', shortName: 'New York', type: 'state', capital: 'Albany', standardHolidaysCount: 11, flag: '🗽', latitude: 42.6526, longitude: -73.7562, timezone: 'America/New_York' },
  { code: 'NC', name: 'North Carolina', shortName: 'North Carolina', type: 'state', capital: 'Raleigh', standardHolidaysCount: 11, flag: '🌲', latitude: 35.7796, longitude: -78.6382, timezone: 'America/New_York' },
  { code: 'ND', name: 'North Dakota', shortName: 'North Dakota', type: 'state', capital: 'Bismarck', standardHolidaysCount: 11, flag: '🌻', latitude: 46.8083, longitude: -100.7837, timezone: 'America/Chicago' },
  { code: 'OH', name: 'Ohio', shortName: 'Ohio', type: 'state', capital: 'Columbus', standardHolidaysCount: 11, flag: '🌰', latitude: 39.9612, longitude: -82.9988, timezone: 'America/New_York' },
  { code: 'OK', name: 'Oklahoma', shortName: 'Oklahoma', type: 'state', capital: 'Oklahoma City', standardHolidaysCount: 11, flag: '🌾', latitude: 35.4676, longitude: -97.5164, timezone: 'America/Chicago' },
  { code: 'OR', name: 'Oregon', shortName: 'Oregon', type: 'state', capital: 'Salem', standardHolidaysCount: 11, flag: '🌲', latitude: 44.9429, longitude: -123.0351, timezone: 'America/Los_Angeles' },
  { code: 'PA', name: 'Pennsylvania', shortName: 'Pennsylvania', type: 'state', capital: 'Harrisburg', standardHolidaysCount: 11, flag: '🔔', latitude: 40.2732, longitude: -76.8867, timezone: 'America/New_York' },
  { code: 'RI', name: 'Rhode Island', shortName: 'Rhode Island', type: 'state', capital: 'Providence', standardHolidaysCount: 11, flag: '⚓', latitude: 41.824, longitude: -71.4128, timezone: 'America/New_York' },
  { code: 'SC', name: 'South Carolina', shortName: 'South Carolina', type: 'state', capital: 'Columbia', standardHolidaysCount: 11, flag: '🌴', latitude: 34.0007, longitude: -81.0348, timezone: 'America/New_York' },
  { code: 'SD', name: 'South Dakota', shortName: 'South Dakota', type: 'state', capital: 'Pierre', standardHolidaysCount: 11, flag: '🗿', latitude: 44.3668, longitude: -100.3538, timezone: 'America/Chicago' },
  { code: 'TN', name: 'Tennessee', shortName: 'Tennessee', type: 'state', capital: 'Nashville', standardHolidaysCount: 11, flag: '🎸', latitude: 36.1627, longitude: -86.7816, timezone: 'America/Chicago' },
  { code: 'TX', name: 'Texas', shortName: 'Texas', type: 'state', capital: 'Austin', standardHolidaysCount: 11, flag: '⭐', latitude: 30.2672, longitude: -97.7431, timezone: 'America/Chicago' },
  { code: 'UT', name: 'Utah', shortName: 'Utah', type: 'state', capital: 'Salt Lake City', standardHolidaysCount: 11, flag: '🏜️', latitude: 40.7608, longitude: -111.891, timezone: 'America/Denver' },
  { code: 'VT', name: 'Vermont', shortName: 'Vermont', type: 'state', capital: 'Montpelier', standardHolidaysCount: 11, flag: '🍁', latitude: 44.2601, longitude: -72.5754, timezone: 'America/New_York' },
  { code: 'VA', name: 'Virginia', shortName: 'Virginia', type: 'state', capital: 'Richmond', standardHolidaysCount: 11, flag: '🏛️', latitude: 37.5407, longitude: -77.436, timezone: 'America/New_York' },
  { code: 'WA', name: 'Washington', shortName: 'Washington', type: 'state', capital: 'Olympia', standardHolidaysCount: 11, flag: '🌧️', latitude: 47.0379, longitude: -122.9007, timezone: 'America/Los_Angeles' },
  { code: 'WV', name: 'West Virginia', shortName: 'West Virginia', type: 'state', capital: 'Charleston', standardHolidaysCount: 11, flag: '⛰️', latitude: 38.3498, longitude: -81.6326, timezone: 'America/New_York' },
  { code: 'WI', name: 'Wisconsin', shortName: 'Wisconsin', type: 'state', capital: 'Madison', standardHolidaysCount: 11, flag: '🧀', latitude: 43.0731, longitude: -89.4012, timezone: 'America/Chicago' },
  { code: 'WY', name: 'Wyoming', shortName: 'Wyoming', type: 'state', capital: 'Cheyenne', standardHolidaysCount: 11, flag: '🐂', latitude: 41.14, longitude: -104.8202, timezone: 'America/Denver' },
  { code: 'DC', name: 'District of Columbia', shortName: 'Washington DC', type: 'district', capital: 'Washington', standardHolidaysCount: 11, flag: '🏛️', latitude: 38.9072, longitude: -77.0369, timezone: 'America/New_York' },
];

export const REGIONS = [
  ...CANADIAN_REGIONS.map((r) => ({ ...r, country: 'CA' })),
  ...US_REGIONS.map((r) => ({ ...r, country: 'US' })),
];

export const DEFAULT_REGION_CODE = 'BC';

export function getRegionByCode(code) {
  return (
    REGIONS.find((r) => r.code.toUpperCase() === (code || '').toUpperCase()) || REGIONS[0]
  );
}

export function getCountryByCode(code) {
  return (
    COUNTRIES.find((c) => c.code === (code || '').toUpperCase()) || COUNTRIES[0]
  );
}

export function getRegionsForCountry(countryCode) {
  return REGIONS.filter((r) => r.country === (countryCode || '').toUpperCase());
}

export function getCountryForRegion(regionCode) {
  return getCountryByCode(getRegionByCode(regionCode).country);
}
