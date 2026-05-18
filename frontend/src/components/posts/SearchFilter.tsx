import React, { useState, useEffect } from 'react';
import type { Category, FilterState } from '../../types';
import { categoryIcons } from '../../utils';

interface Props {
  filters: FilterState;
  categories: Category[];
  onFilterChange: (filters: Partial<FilterState>) => void;
}

const SearchFilter: React.FC<Props> = ({ filters, categories, onFilterChange }) => {
  const [searchInput, setSearchInput] = useState(filters.search);

  useEffect(() => {
    const t = setTimeout(() => onFilterChange({ search: searchInput, page: 1 }), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-4">
      {/* Search */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input
          type="text"
          placeholder="Search posts..."
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          className="input pl-9"
        />
      </div>

      {/* Categories */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Category</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onFilterChange({ category: '', page: 1 })}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!filters.category ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => onFilterChange({ category: cat.slug, page: 1 })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${filters.category === cat.slug ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <span>{categoryIcons[cat.slug] || '📌'}</span>
              {cat.name}
              {cat.post_count !== undefined && (
                <span className="opacity-70">({cat.post_count})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Sort & Location row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Sort</p>
          <select
            value={filters.sort}
            onChange={e => onFilterChange({ sort: e.target.value, page: 1 })}
            className="input text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Location</p>
          <input
            type="text"
            placeholder="Filter by location..."
            value={filters.location}
            onChange={e => onFilterChange({ location: e.target.value, page: 1 })}
            className="input text-sm"
          />
        </div>
      </div>

      {/* Active filters */}
      {(filters.category || filters.search || filters.location) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500">Active:</span>
          {filters.category && (
            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">
              {filters.category}
              <button onClick={() => onFilterChange({ category: '' })} className="ml-1 hover:text-blue-900">×</button>
            </span>
          )}
          {filters.search && (
            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">
              "{filters.search}"
              <button onClick={() => { setSearchInput(''); onFilterChange({ search: '' }); }} className="ml-1 hover:text-blue-900">×</button>
            </span>
          )}
          {filters.location && (
            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">
              📍 {filters.location}
              <button onClick={() => onFilterChange({ location: '' })} className="ml-1 hover:text-blue-900">×</button>
            </span>
          )}
          <button onClick={() => { setSearchInput(''); onFilterChange({ category: '', search: '', location: '', page: 1 }); }}
            className="text-xs text-red-500 hover:text-red-700">Clear all</button>
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
