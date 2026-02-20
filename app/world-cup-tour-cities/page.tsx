'use client';

import { useState, useMemo } from 'react';
import {
  TOUR_CITIES,
  filterTourCities,
  getTourCitySummary,
  type TourCity,
  type TourCityFilters,
} from '@/app/data/world-cup-tour-cities';

export default function WorldCupTourCitiesPage() {
  const [filters, setFilters] = useState<TourCityFilters>({});
  const [search, setSearch] = useState('');

  const summary = getTourCitySummary();

  const filteredCities = useMemo(() => {
    return filterTourCities(TOUR_CITIES, { ...filters, search: search || null });
  }, [filters, search]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            World Cup Mobile Tour Cities
          </h1>
          <p className="text-gray-400">
            Complete list of tour markets with NWSL proximity data
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-[#141414] border border-[#2A2A2A] rounded-lg p-4">
            <div className="text-2xl font-bold text-[#FFD100]">{summary.total}</div>
            <div className="text-sm text-gray-400">Total Cities</div>
          </div>
          <div className="bg-[#141414] border border-[#2A2A2A] rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-400">{summary.usa}</div>
            <div className="text-sm text-gray-400">USA Markets</div>
          </div>
          <div className="bg-[#141414] border border-[#2A2A2A] rounded-lg p-4">
            <div className="text-2xl font-bold text-red-400">{summary.canada}</div>
            <div className="text-sm text-gray-400">Canada Markets</div>
          </div>
          <div className="bg-[#141414] border border-[#2A2A2A] rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">{summary.primary}</div>
            <div className="text-sm text-gray-400">Primary Markets</div>
          </div>
          <div className="bg-[#141414] border border-[#2A2A2A] rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-400">{summary.canadaTruckLikely}</div>
            <div className="text-sm text-gray-400">Canada Truck</div>
          </div>
          <div className="bg-[#141414] border border-[#2A2A2A] rounded-lg p-4">
            <div className="text-2xl font-bold text-pink-400">{summary.nwslProximity}</div>
            <div className="text-sm text-gray-400">NWSL Proximity</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#141414] border border-[#2A2A2A] rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Filters</h2>
          
          {/* Search */}
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by market, state, or NWSL market..."
              className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-2 text-white focus:border-[#FFD100] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Country */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Country</label>
              <select
                value={filters.country || ''}
                onChange={(e) => setFilters({ ...filters, country: e.target.value ? (e.target.value as 'USA' | 'CAN') : undefined })}
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-4 py-2 text-white focus:border-[#FFD100] focus:outline-none"
              >
                <option value="">All Countries</option>
                <option value="USA">USA</option>
                <option value="CAN">Canada</option>
              </select>
            </div>

            {/* Primary Only */}
            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.primaryOnly || false}
                  onChange={(e) => setFilters({ ...filters, primaryOnly: e.target.checked || undefined })}
                  className="w-4 h-4 rounded border-[#2A2A2A] bg-[#0A0A0A] text-[#FFD100] focus:ring-[#FFD100] focus:ring-offset-0"
                />
                <span className="ml-2 text-sm">Primary Markets Only</span>
              </label>
            </div>

            {/* Canada Truck Likely */}
            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.canadaTruckLikely || false}
                  onChange={(e) => setFilters({ ...filters, canadaTruckLikely: e.target.checked || undefined })}
                  className="w-4 h-4 rounded border-[#2A2A2A] bg-[#0A0A0A] text-[#FFD100] focus:ring-[#FFD100] focus:ring-offset-0"
                />
                <span className="ml-2 text-sm">Canada Truck Accessible</span>
              </label>
            </div>

            {/* NWSL Proximity */}
            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.nwslProximity || false}
                  onChange={(e) => setFilters({ ...filters, nwslProximity: e.target.checked || undefined })}
                  className="w-4 h-4 rounded border-[#2A2A2A] bg-[#0A0A0A] text-[#FFD100] focus:ring-[#FFD100] focus:ring-offset-0"
                />
                <span className="ml-2 text-sm">NWSL Proximity</span>
              </label>
            </div>
          </div>

          {/* Clear Filters */}
          {(filters.country || filters.primaryOnly || filters.canadaTruckLikely || filters.nwslProximity || search) && (
            <button
              onClick={() => {
                setFilters({});
                setSearch('');
              }}
              className="mt-4 px-4 py-2 bg-[#2A2A2A] hover:bg-[#3A3A3A] rounded-lg text-sm transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-400">
          Showing {filteredCities.length} of {TOUR_CITIES.length} cities
        </div>

        {/* Cities Table */}
        <div className="bg-[#141414] border border-[#2A2A2A] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0A0A0A] border-b border-[#2A2A2A]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Market</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">State</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Country</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-300">Primary</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-300">Canada Truck</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-300">NWSL</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Nearest NWSL Market</th>
                </tr>
              </thead>
              <tbody>
                {filteredCities.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                      No cities match your filters
                    </td>
                  </tr>
                ) : (
                  filteredCities.map((city, idx) => (
                    <tr
                      key={`${city.country}-${city.market}`}
                      className={`border-b border-[#2A2A2A] hover:bg-[#1A1A1A] transition-colors ${
                        idx % 2 === 0 ? 'bg-[#0F0F0F]' : 'bg-[#141414]'
                      }`}
                    >
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{city.market}</span>
                          {city.primary && (
                            <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-xs rounded-full border border-green-500/20">
                              Primary
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">{city.state}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          city.country === 'USA' 
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {city.country}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {city.primary ? (
                          <span className="text-green-400">✓</span>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {city.canadaTruckLikely ? (
                          <span className="text-purple-400">✓</span>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {city.nwslProximity ? (
                          <span className="text-pink-400">✓</span>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {city.nearestNwslMarket || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 p-4 bg-[#141414] border border-[#2A2A2A] rounded-lg text-sm text-gray-400">
          <p className="mb-2">
            <strong className="text-white">NWSL Proximity:</strong> Markets within ~300 miles driving distance to nearest NWSL home market (2026 expansion includes Boston + Denver)
          </p>
          <p>
            <strong className="text-white">Canada Truck Likely:</strong> Markets likely accessible by truck from Canada
          </p>
        </div>
      </div>
    </div>
  );
}
