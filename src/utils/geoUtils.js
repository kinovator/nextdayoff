import { REGIONS } from '../data/regions';

// Deprecated IANA aliases that devices may report under their modern name.
const TIMEZONE_ALIASES = {
  'America/Montreal': 'America/Toronto',
};

function canonicalTimezone(tz) {
  return TIMEZONE_ALIASES[tz] || tz;
}

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
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Primary: point-in-polygon against real administrative boundaries.
        // Handles border towns correctly (centroid math cannot) and is
        // immune to wrong device timezone settings. Lazy-loaded so the
        // boundary data never lands in the initial bundle.
        try {
          const { findRegionCodeAtPoint } = await import('../data/boundaries');
          const boundaryCode = findRegionCodeAtPoint(longitude, latitude);
          if (boundaryCode) {
            const boundaryRegion = REGIONS.find((r) => r.code === boundaryCode);
            resolve({
              code: boundaryRegion.code,
              name: boundaryRegion.name,
              source: 'gps',
              coords: { latitude, longitude },
              distanceKm: 0,
            });
            return;
          }
        } catch (e) {
          console.debug('Boundary lookup failed, falling back to timezone pool', e);
        }

        // Fallback: point outside every boundary (ocean, foreign country,
        // mock coordinates, boundary simplification noise).
        // Federal jurisdiction (FED) is not a place — never auto-select it.
        const nonFederal = REGIONS.filter((r) => r.type !== 'federal');

        // Candidate pool = regions associated with the device timezone.
        // Provincial/state centroids sit far from their populations (BC's is
        // in remote north-west), so raw nearest-centroid across every region
        // crosses borders (Vancouver -> WA, Toronto -> FED). A timezone never
        // straddles the CA/US border (BC = America/Vancouver, US Pacific =
        // America/Los_Angeles), so within a pool the nearest centroid is
        // reliable. Unknown timezone falls back to every non-federal region.
        let tz = null;
        try {
          tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        } catch (e) {
          // keep tz null, fall through to the global pool
        }
        const canonicalTz = tz ? canonicalTimezone(tz) : null;
        const tzRegionCode = tz
          ? TIMEZONE_TO_REGION[tz] || TIMEZONE_TO_REGION[canonicalTz]
          : null;
        let candidates = canonicalTz
          ? nonFederal.filter(
              (r) =>
                r.code === tzRegionCode || canonicalTimezone(r.timezone) === canonicalTz
            )
          : [];
        if (candidates.length === 0) {
          candidates = nonFederal;
        }

        const nearestIn = (list) => {
          let best = null;
          let bestDist = Infinity;
          for (const region of list) {
            if (!region.latitude || !region.longitude) continue;
            const dist = calculateDistance(
              latitude,
              longitude,
              region.latitude,
              region.longitude
            );
            if (dist < bestDist) {
              bestDist = dist;
              best = region;
            }
          }
          return { region: best, distance: bestDist };
        };

        const nearestInPool = nearestIn(candidates);
        // Prefer the region whose timezone string equals the device timezone
        // exactly, unless another pool region is >25% closer. Keeps Ottawa on
        // Ontario (device America/Toronto) while Montreal — same device zone
        // via the deprecated America/Montreal alias — stays Quebec.
        let chosen = nearestInPool.region;
        let chosenDistance = nearestInPool.distance;
        const exactTzMatch = nearestIn(candidates.filter((r) => r.timezone === tz));
        if (
          exactTzMatch.region &&
          exactTzMatch.distance <= nearestInPool.distance * 1.25
        ) {
          chosen = exactTzMatch.region;
          chosenDistance = exactTzMatch.distance;
        }

        if (chosen) {
          resolve({
            code: chosen.code,
            name: chosen.name,
            source: 'gps',
            coords: { latitude, longitude },
            distanceKm: Math.round(chosenDistance),
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
