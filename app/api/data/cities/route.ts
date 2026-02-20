import { NextResponse } from 'next/server';
import {
  TOUR_CITIES,
  filterTourCities,
  getUniqueStates,
  getUniqueNwslMarkets,
  getCitiesByNwslMarket,
  getTourCitySummary,
  type TourCityFilters,
} from '@/app/data/world-cup-tour-cities';

/**
 * GET /api/data/cities
 * 
 * Query params (all optional):
 * - country: 'USA' | 'CAN'
 * - primaryOnly: 'true' | 'false'
 * - canadaTruckLikely: 'true' | 'false'
 * - nwslProximity: 'true' | 'false'
 * - state: string (e.g., 'CA', 'NY')
 * - search: string (searches market, state, nearest NWSL market)
 * - summary: 'true' returns summary stats instead of full list
 * - states: 'true' returns unique states list
 * - nwslMarkets: 'true' returns unique NWSL markets list
 * - nwslMarket: string (filters by specific NWSL market)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Special queries
  if (searchParams.get('summary') === 'true') {
    return NextResponse.json({
      summary: getTourCitySummary(),
      timestamp: new Date().toISOString(),
    });
  }

  if (searchParams.get('states') === 'true') {
    return NextResponse.json({
      states: getUniqueStates(),
      timestamp: new Date().toISOString(),
    });
  }

  if (searchParams.get('nwslMarkets') === 'true') {
    return NextResponse.json({
      nwslMarkets: getUniqueNwslMarkets(),
      timestamp: new Date().toISOString(),
    });
  }

  const nwslMarket = searchParams.get('nwslMarket');
  if (nwslMarket) {
    return NextResponse.json({
      nwslMarket,
      cities: getCitiesByNwslMarket(nwslMarket),
      timestamp: new Date().toISOString(),
    });
  }

  // Build filters from query params
  const filters: TourCityFilters = {};

  const country = searchParams.get('country');
  if (country === 'USA' || country === 'CAN') {
    filters.country = country;
  }

  if (searchParams.get('primaryOnly') === 'true') {
    filters.primaryOnly = true;
  }

  if (searchParams.get('canadaTruckLikely') === 'true') {
    filters.canadaTruckLikely = true;
  }

  if (searchParams.get('nwslProximity') === 'true') {
    filters.nwslProximity = true;
  }

  const state = searchParams.get('state');
  if (state) {
    filters.state = state;
  }

  const search = searchParams.get('search');
  if (search) {
    filters.search = search;
  }

  // Apply filters
  const cities = filterTourCities(TOUR_CITIES, filters);

  return NextResponse.json({
    cities,
    count: cities.length,
    filters,
    timestamp: new Date().toISOString(),
  });
}
