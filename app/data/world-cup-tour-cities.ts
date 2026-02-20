// ---------------------------------------------------------------------------
// World Cup Mobile Tour – City / Market data & filter utilities
// ---------------------------------------------------------------------------
// Includes driving-distance proximity to NWSL home markets (2026 expansion
// teams: Boston + Denver). Practical proxy: ~≤ 300 miles to nearest NWSL metro.
// ---------------------------------------------------------------------------

export interface TourCity {
  market: string;
  state: string; // U.S. state abbreviation or Canadian province
  country: 'USA' | 'CAN';
  primary: boolean;
  canadaTruckLikely: boolean;
  nwslProximity: boolean;
  nearestNwslMarket: string | null; // null when nwslProximity is false
}

// ---- U.S. Markets ----------------------------------------------------------

const US_CITIES: TourCity[] = [
  { market: 'Albuquerque', state: 'NM', country: 'USA', primary: false, canadaTruckLikely: false, nwslProximity: false, nearestNwslMarket: null },
  { market: 'Atlanta', state: 'GA', country: 'USA', primary: true, canadaTruckLikely: false, nwslProximity: false, nearestNwslMarket: null },
  { market: 'Austin', state: 'TX', country: 'USA', primary: false, canadaTruckLikely: false, nwslProximity: true, nearestNwslMarket: 'Houston' },
  { market: 'Bakersfield', state: 'CA', country: 'USA', primary: false, canadaTruckLikely: false, nwslProximity: true, nearestNwslMarket: 'Los Angeles' },
  { market: 'Bentonville', state: 'AR', country: 'USA', primary: false, canadaTruckLikely: false, nwslProximity: true, nearestNwslMarket: 'Kansas City' },
  { market: 'Boston', state: 'MA', country: 'USA', primary: true, canadaTruckLikely: false, nwslProximity: true, nearestNwslMarket: 'Boston' },
  { market: 'Charlotte', state: 'NC', country: 'USA', primary: false, canadaTruckLikely: false, nwslProximity: true, nearestNwslMarket: 'North Carolina' },
  { market: 'Chicago', state: 'IL', country: 'USA', primary: false, canadaTruckLikely: true, nwslProximity: true, nearestNwslMarket: 'Chicago' },
  { market: 'Columbus', state: 'OH', country: 'USA', primary: false, canadaTruckLikely: false, nwslProximity: true, nearestNwslMarket: 'Louisville' },
  { market: 'Dallas\u2013Fort Worth', state: 'TX', country: 'USA', primary: true, canadaTruckLikely: false, nwslProximity: true, nearestNwslMarket: 'Houston' },
  { market: 'Denver', state: 'CO', country: 'USA', primary: false, canadaTruckLikely: false, nwslProximity: true, nearestNwslMarket: 'Denver' },
  { market: 'El Paso', state: 'TX', country: 'USA', primary: false, canadaTruckLikely: false, nwslProximity: false, nearestNwslMarket: null },
  { market: 'Fresno', state: 'CA', country: 'USA', primary: false, canadaTruckLikely: false, nwslProximity: true, nearestNwslMarket: 'Bay Area' },
  { market: 'Houston', state: 'TX', country: 'USA', primary: true, canadaTruckLikely: false, nwslProximity: true, nearestNwslMarket: 'Houston' },
  { market: 'Jacksonville', state: 'FL', country: 'USA', primary: false, canadaTruckLikely: false, nwslProximity: true, nearestNwslMarket: 'Orlando' },
  { market: 'Kansas City', state: 'KS/MO', country: 'USA', primary: true, canadaTruckLikely: false, nwslProximity: true, nearestNwslMarket: 'Kansas City' },
  { market: 'Las Vegas', state: 'NV', country: 'USA', primary: false, canadaTruckLikely: false, nwslProximity: true, nearestNwslMarket: 'Los Angeles' },
  { market: 'Los Angeles', state: 'CA', country: 'USA', primary: true, canadaTruckLikely: false, nwslProximity: true, nearestNwslMarket: 'Los Angeles' },
  { market: 'McAllen\u2013Brownsville', state: 'TX', country: 'USA', primary: false, canadaTruckLikely: false, nwslProximity: false, nearestNwslMarket: null },
  { market: 'Miami', state: 'FL', country: 'USA', primary: true, canadaTruckLikely: false, nwslProximity: true, nearestNwslMarket: 'Orlando' },
  { market: 'Minneapolis\u2013St. Paul', state: 'MN', country: 'USA', primary: false, canadaTruckLikely: true, nwslProximity: false, nearestNwslMarket: null },
  { market: 'Nashville', state: 'TN', country: 'USA', primary: false, canadaTruckLikely: false, nwslProximity: true, nearestNwslMarket: 'Louisville' },
  { market: 'New Jersey', state: 'NJ', country: 'USA', primary: true, canadaTruckLikely: false, nwslProximity: true, nearestNwslMarket: 'Gotham/NJ' },
  { market: 'New York City', state: 'NY', country: 'USA', primary: true, canadaTruckLikely: false, nwslProximity: true, nearestNwslMarket: 'Gotham/NJ' },
  { market: 'Oklahoma City', state: 'OK', country: 'USA', primary: false, canadaTruckLikely: false, nwslProximity: true, nearestNwslMarket: 'Kansas City' },
  { market: 'Orlando', state: 'FL', country: 'USA', primary: false, canadaTruckLikely: false, nwslProximity: true, nearestNwslMarket: 'Orlando' },
  { market: 'Philadelphia', state: 'PA', country: 'USA', primary: true, canadaTruckLikely: false, nwslProximity: true, nearestNwslMarket: 'Washington DC / Gotham-NJ' },
  { market: 'Phoenix', state: 'AZ', country: 'USA', primary: false, canadaTruckLikely: false, nwslProximity: false, nearestNwslMarket: null },
  { market: 'Portland', state: 'OR', country: 'USA', primary: false, canadaTruckLikely: true, nwslProximity: true, nearestNwslMarket: 'Portland' },
  { market: 'Raleigh', state: 'NC', country: 'USA', primary: false, canadaTruckLikely: false, nwslProximity: true, nearestNwslMarket: 'North Carolina' },
  { market: 'Sacramento', state: 'CA', country: 'USA', primary: false, canadaTruckLikely: false, nwslProximity: true, nearestNwslMarket: 'Bay Area' },
  { market: 'Salt Lake City', state: 'UT', country: 'USA', primary: false, canadaTruckLikely: false, nwslProximity: true, nearestNwslMarket: 'Utah' },
  { market: 'San Antonio', state: 'TX', country: 'USA', primary: false, canadaTruckLikely: false, nwslProximity: true, nearestNwslMarket: 'Houston' },
  { market: 'San Diego', state: 'CA', country: 'USA', primary: false, canadaTruckLikely: false, nwslProximity: true, nearestNwslMarket: 'San Diego' },
  { market: 'San Francisco / San Jose', state: 'CA', country: 'USA', primary: true, canadaTruckLikely: false, nwslProximity: true, nearestNwslMarket: 'Bay Area' },
  { market: 'Seattle', state: 'WA', country: 'USA', primary: true, canadaTruckLikely: true, nwslProximity: true, nearestNwslMarket: 'Seattle' },
  { market: 'St. Louis', state: 'MO', country: 'USA', primary: false, canadaTruckLikely: false, nwslProximity: true, nearestNwslMarket: 'Kansas City' },
  { market: 'Tucson', state: 'AZ', country: 'USA', primary: false, canadaTruckLikely: false, nwslProximity: false, nearestNwslMarket: null },
  { market: 'Washington', state: 'DC', country: 'USA', primary: false, canadaTruckLikely: false, nwslProximity: true, nearestNwslMarket: 'Washington DC' },
];

// ---- Canadian Markets ------------------------------------------------------

const CAN_CITIES: TourCity[] = [
  { market: 'Toronto', state: 'ON', country: 'CAN', primary: true, canadaTruckLikely: false, nwslProximity: false, nearestNwslMarket: null },
  { market: 'Vancouver', state: 'BC', country: 'CAN', primary: true, canadaTruckLikely: false, nwslProximity: false, nearestNwslMarket: null },
];

// ---- Combined dataset ------------------------------------------------------

export const TOUR_CITIES: TourCity[] = [...US_CITIES, ...CAN_CITIES];

// ---------------------------------------------------------------------------
// Filter helpers
// ---------------------------------------------------------------------------

export interface TourCityFilters {
  country?: 'USA' | 'CAN' | null;
  primaryOnly?: boolean;
  canadaTruckLikely?: boolean;
  nwslProximity?: boolean;
  state?: string | null;
  search?: string | null;
}

export function filterTourCities(
  cities: TourCity[],
  filters: TourCityFilters,
): TourCity[] {
  return cities.filter((city) => {
    if (filters.country && city.country !== filters.country) return false;
    if (filters.primaryOnly && !city.primary) return false;
    if (filters.canadaTruckLikely && !city.canadaTruckLikely) return false;
    if (filters.nwslProximity && !city.nwslProximity) return false;
    if (filters.state && city.state !== filters.state) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const haystack = `${city.market} ${city.state} ${city.nearestNwslMarket ?? ''}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

// ---------------------------------------------------------------------------
// Derived lookups
// ---------------------------------------------------------------------------

export function getUniqueStates(cities: TourCity[] = TOUR_CITIES): string[] {
  return [...new Set(cities.map((c) => c.state))].sort();
}

export function getUniqueNwslMarkets(cities: TourCity[] = TOUR_CITIES): string[] {
  return [...new Set(
    cities
      .map((c) => c.nearestNwslMarket)
      .filter((m): m is string => m !== null),
  )].sort();
}

export function getCitiesByNwslMarket(
  nwslMarket: string,
  cities: TourCity[] = TOUR_CITIES,
): TourCity[] {
  return cities.filter((c) => c.nearestNwslMarket === nwslMarket);
}

export function getTourCitySummary(cities: TourCity[] = TOUR_CITIES) {
  return {
    total: cities.length,
    usa: cities.filter((c) => c.country === 'USA').length,
    canada: cities.filter((c) => c.country === 'CAN').length,
    primary: cities.filter((c) => c.primary).length,
    canadaTruckLikely: cities.filter((c) => c.canadaTruckLikely).length,
    nwslProximity: cities.filter((c) => c.nwslProximity).length,
  };
}
