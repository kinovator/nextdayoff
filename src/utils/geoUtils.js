import { REGIONS } from '../data/regions';

const TIMEZONE_TO_REGION = {
  'America/Vancouver': 'BC',
  'America/Dawson_Creek': 'BC',
  'America/Creston': 'BC',
  'America/Edmonton': 'AB',
  'America/Calgary': 'AB',
  'America/Regina': 'SK',
  'America/Swift_Current': 'SK',
  'America/Winnipeg': 'MB',
  'America/Rainy_River': 'ON',
  'America/Toronto': 'ON',
  'America/Thunder_Bay': 'ON',
  'America/Nipigon': 'ON',
  'America/Montreal': 'QC',
  'America/Halifax': 'NS',
  'America/Moncton': 'NB',
  'America/St_Johns': 'NL',
  'America/Goose_Bay': 'NL',
  'America/Yellowknife': 'NT',
  'America/Inuvik': 'NT',
  'America/Whitehorse': 'YT',
  'America/Dawson': 'YT',
  'America/Iqaluit': 'NU',
  'America/Rankin_Inlet': 'NU',
  'America/Resolute': 'NU',
  'America/Pangnirtung': 'NU',
  // United States (representative state per IANA zone)
  'America/New_York': 'NY',
  'America/Detroit': 'MI',
  'America/Indiana/Indianapolis': 'IN',
  'America/Chicago': 'IL',
  'America/Denver': 'CO',
  'America/Phoenix': 'AZ',
  'America/Boise': 'ID',
  'America/Los_Angeles': 'CA',
  'Pacific/Honolulu': 'HI',
  'America/Anchorage': 'AK',
};

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function detectRegionFromTimezone() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && TIMEZONE_TO_REGION[tz]) {
      return {
        code: TIMEZONE_TO_REGION[tz],
        source: 'timezone',
        detail: tz,
      };
    }
  } catch (e) {
    console.debug('Timezone detection failed', e);
  }
  return null;
}

export async function detectRegionFromGeolocation() {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      return reject(new Error('Geolocation is not supported by your browser.'));
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        let closestRegion = null;
        let minDistance = Infinity;

        // Compare against all regions with coordinates
        for (const region of REGIONS) {
          if (!region.latitude || !region.longitude) continue;
          const dist = calculateDistance(latitude, longitude, region.latitude, region.longitude);
          if (dist < minDistance) {
            minDistance = dist;
            closestRegion = region;
          }
        }

        if (closestRegion) {
          resolve({
            code: closestRegion.code,
            name: closestRegion.name,
            source: 'gps',
            coords: { latitude, longitude },
            distanceKm: Math.round(minDistance),
          });
        } else {
          reject(new Error('Could not match coordinates to a supported region.'));
        }
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 600000, // 10 minutes cache
      }
    );
  });
}
