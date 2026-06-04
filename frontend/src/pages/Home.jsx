import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropertyCard from '../components/PropertyCard';
import ComparisonPanel from '../components/ComparisonPanel';
import { Search, SlidersHorizontal, ArrowUpDown, RefreshCcw, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home({ onViewDetails, compareList, setCompareList }) {
  const [properties, setProperties] = useState([]);
  const [personalized, setPersonalized] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [city, setCity] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [listingType, setListingType] = useState('');
  const [sort, setSort] = useState('newest');
  
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchLandingData();
  }, []);

  // Fetch search recommendations when search query triggers
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.length >= 2) {
        fetchSuggestions();
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const fetchLandingData = async () => {
    try {
      setLoading(true);
      // 1. Fetch Personalized recommendations ("Recommended for You")
      // Handles auth token automatically via Axios interceptor
      const personalRes = await axios.get('/recommendations/personalized');
      if (personalRes.data.success) {
        setPersonalized(personalRes.data.properties);
      }

      // 2. Fetch Trending Listings
      const trendingRes = await axios.get('/recommendations/trending');
      if (trendingRes.data.success) {
        setTrending(trendingRes.data.properties);
      }

      // 3. Fetch Standard available listings
      const listRes = await axios.get('/properties');
      if (listRes.data.success) {
        setProperties(listRes.data.properties);
      }
    } catch (err) {
      console.error('Error loading landing page data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const res = await axios.get(`/properties/suggestions?q=${searchTerm}`);
      if (res.data.success) {
        setSuggestions(res.data.suggestions);
      }
    } catch (err) {
      console.error('Suggestions error:', err.message);
    }
  };

  const executeSearch = async (currentListingType = listingType) => {
    setShowSuggestions(false);
    setIsSearching(true);
    setLoading(true);

    try {
      let query = `/properties?sort=${sort}`;
      if (searchTerm) query += `&q=${searchTerm}`;
      if (city) query += `&city=${city}`;
      if (propertyType) query += `&propertyType=${propertyType}`;
      if (minPrice) query += `&minPrice=${minPrice}`;
      if (maxPrice) query += `&maxPrice=${maxPrice}`;
      if (bedrooms) query += `&bedrooms=${bedrooms}`;
      if (bathrooms) query += `&bathrooms=${bathrooms}`;
      if (currentListingType) query += `&listingType=${currentListingType}`;

      const res = await axios.get(query);
      if (res.data.success) {
        setProperties(res.data.properties);
      }
    } catch (err) {
      console.error('Search error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const executeSearchForCity = async (cityName) => {
    setShowSuggestions(false);
    setIsSearching(true);
    setLoading(true);
    try {
      let query = `/properties?sort=${sort}&city=${cityName}&q=${cityName}`;
      if (propertyType) query += `&propertyType=${propertyType}`;
      if (minPrice) query += `&minPrice=${minPrice}`;
      if (maxPrice) query += `&maxPrice=${maxPrice}`;
      if (bedrooms) query += `&bedrooms=${bedrooms}`;
      if (bathrooms) query += `&bathrooms=${bathrooms}`;
      if (listingType) query += `&listingType=${listingType}`;

      const res = await axios.get(query);
      if (res.data.success) {
        setProperties(res.data.properties);
      }
    } catch (err) {
      console.error('Search error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    executeSearch();
  };

  const handleListingTypeChange = (type) => {
    setListingType(type);
    executeSearch(type);
  };

  const handleSuggestionClick = (sug) => {
    setShowSuggestions(false);
    if (sug.type === 'location') {
      setCity(sug.value);
      setSearchTerm(sug.value);
      executeSearchForCity(sug.value);
    } else {
      // Direct view of property
      onViewDetails(sug.value);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setCity('');
    setPropertyType('');
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('');
    setBathrooms('');
    setListingType('');
    setSort('newest');
    setIsSearching(false);
    fetchLandingData();
  };

  // Compare List helpers
  const handleToggleCompare = (property) => {
    setCompareList(prev => {
      const exists = prev.some(p => p._id === property._id);
      if (exists) {
        return prev.filter(p => p._id !== property._id);
      }
      if (prev.length >= 3) {
        alert('You can compare a maximum of 3 properties at the same time.');
        return prev;
      }
      return [...prev, property];
    });
  };

  const handleRemoveCompare = (id) => {
    setCompareList(prev => prev.filter(p => p._id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 pb-32">
      
      {/* 1. HERO SEARCH HEADER */}
      <div className="relative rounded-3xl overflow-hidden mb-12 bg-[#1B3B2B] text-white py-20 px-8 text-center border border-[#C5A880]/20 shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(197,168,128,0.08),transparent_70%)]"></div>
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative max-w-2xl mx-auto"
        >
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-white/5 backdrop-blur-md rounded-full text-[10px] font-medium text-[#C5A880] border border-[#C5A880]/20 mb-5 tracking-wider uppercase">
            <Sparkles size={11} className="text-[#C5A880]" /> Intelligent Bespoke Search
          </span>
          <h1 className="text-4xl md:text-6xl font-serif font-normal italic tracking-tight leading-tight">
            Discover Your Perfect Space with <span className="text-[#C5A880] font-serif not-italic">ApnaSpace</span>
          </h1>
          <p className="mt-4 text-slate-300/90 text-xs md:text-sm font-sans tracking-wide max-w-lg mx-auto leading-relaxed">
            Connecting discerning buyers, sellers, and agents through intuitive property intelligence.
          </p>

          {/* Rent/Buy Tabs */}
          <div className="mt-8 mb-6 inline-flex p-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
            <button
              onClick={() => handleListingTypeChange('sale')}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                listingType === 'sale'
                  ? 'bg-[#C5A880] text-[#12110E] shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => handleListingTypeChange('rent')}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                listingType === 'rent'
                  ? 'bg-[#C5A880] text-[#12110E] shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Rent
            </button>
            <button
              onClick={() => handleListingTypeChange('')}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                listingType === ''
                  ? 'bg-[#C5A880] text-[#12110E] shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              All
            </button>
          </div>

          {/* Core Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative mt-2 max-w-xl mx-auto">
            <div className="relative">
              <input 
                type="text"
                placeholder="Search by city, title, or state (e.g. Delhi, Dwarka)..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                className="w-full pl-12 pr-28 py-4 bg-white/95 dark:bg-[#1E1C19]/95 text-[#1C1917] dark:text-[#FAF9F6] rounded-xl border border-[#C5A880]/20 shadow-md focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880] focus:outline-none text-sm font-sans"
              />
              <Search className="absolute left-4 top-4 text-slate-400" size={18} />
              
              <div className="absolute right-2 top-2 flex items-center gap-1.5">
                <button 
                  type="button" 
                  onClick={() => setShowFilters(!showFilters)}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#1C1917] dark:text-[#FAF9F6] rounded-xl transition-colors"
                  title="Advanced Filters"
                >
                  <SlidersHorizontal size={14} />
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-[#12110E] hover:bg-[#2E2A25] text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                >
                  Find
                </button>
              </div>
            </div>

            {/* Auto Suggestions dropdown */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl shadow-xl overflow-hidden z-20 text-left"
                >
                  {suggestions.map((sug, i) => (
                    <div 
                      key={i}
                      onClick={() => handleSuggestionClick(sug)}
                      className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800/50 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase ${sug.type === 'location' ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-600' : 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600'}`}>
                          {sug.type}
                        </span>
                        <span className="font-semibold truncate max-w-[200px]">{sug.label}</span>
                      </div>
                      {sug.price && <span className="font-bold text-slate-400">₹{(sug.price / 100000).toFixed(0)} L</span>}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* Quick-Access Cities (Pills) */}
          <div className="mt-6 flex flex-wrap justify-center items-center gap-2.5 max-w-xl mx-auto relative z-10">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1">Popular Cities:</span>
            {['hyderabad', 'delhi', 'mumbai', 'bangalore', 'pune'].map(c => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setCity(c);
                  setSearchTerm(c);
                  executeSearchForCity(c);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold capitalize transition-all duration-300 border ${
                  city === c 
                    ? 'bg-[#C5A880] text-[#12110E] border-[#C5A880] shadow-sm' 
                    : 'bg-white/10 dark:bg-white/5 border-white/20 dark:border-white/10 text-slate-200 hover:text-white hover:bg-white/20 hover:border-white/30 cursor-pointer'
                }`}
              >
                {c === 'delhi' ? 'Delhi / NCR' : c}
              </button>
            ))}
          </div>

        </motion.div>
      </div>

      {/* 2. ADVANCED FILTERS PANEL */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-8"
          >
            <div className="p-6 glass-card grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Property Type Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Property Type</label>
                <select 
                  value={propertyType} 
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="premium-input"
                >
                  <option value="">All Types</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="villa">Villa</option>
                  <option value="plot">Plot / Land</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>

              {/* Listing Purpose Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Listing Purpose</label>
                <select 
                  value={listingType} 
                  onChange={(e) => setListingType(e.target.value)}
                  className="premium-input"
                >
                  <option value="">All Purpose (Sale & Rent)</option>
                  <option value="sale">For Sale (Buy)</option>
                  <option value="rent">For Rent</option>
                </select>
              </div>

              {/* City Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">City Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. delhi, mumbai"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="premium-input"
                />
              </div>

              {/* Min Price */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Min Price (₹)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 2000000"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="premium-input"
                />
              </div>

              {/* Max Price */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Max Price (₹)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 8000000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="premium-input"
                />
              </div>

              {/* Bedrooms */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Bedrooms</label>
                <select 
                  value={bedrooms} 
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="premium-input"
                >
                  <option value="">Any Beds</option>
                  <option value="1">1 BHK+</option>
                  <option value="2">2 BHK+</option>
                  <option value="3">3 BHK+</option>
                  <option value="4">4 BHK+</option>
                </select>
              </div>

              {/* Bathrooms */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Bathrooms</label>
                <select 
                  value={bathrooms} 
                  onChange={(e) => setBathrooms(e.target.value)}
                  className="premium-input"
                >
                  <option value="">Any Baths</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                </select>
              </div>

              {/* Sorting Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Sort Results By</label>
                <select 
                  value={sort} 
                  onChange={(e) => setSort(e.target.value)}
                  className="premium-input"
                >
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="views">Most Viewed / Popular</option>
                </select>
              </div>

              {/* Filter Controls Buttons */}
              <div className="flex items-end gap-2">
                <button 
                  onClick={resetFilters}
                  className="btn-secondary w-full py-3"
                >
                  <RefreshCcw size={14} /> Clear
                </button>
                <button 
                  onClick={handleSearchSubmit}
                  className="btn-primary w-full py-3"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. DISCOVERY MODULE CONTENT */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
          <span className="text-slate-400 text-xs font-semibold">Updating listing records...</span>
        </div>
      ) : isSearching ? (
        
        // Search Results Active Block
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-extrabold text-xl text-slate-800 dark:text-slate-100 flex items-center gap-2">
              Search Results ({properties.length})
            </h2>
            <button onClick={resetFilters} className="text-xs text-indigo-500 font-semibold hover:underline">
              Back to discovery
            </button>
          </div>
          {properties.length === 0 ? (
            <div className="glass-card py-20 text-center text-sm text-slate-400 font-medium">
              No properties matched your specific filters. Try expanding your search queries.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map(p => (
                <PropertyCard 
                  key={p._id} 
                  property={p} 
                  onViewDetails={onViewDetails}
                  compareList={compareList}
                  onToggleCompare={handleToggleCompare}
                />
              ))}
            </div>
          )}
        </div>

      ) : (
        
        // Default Discovery View
        <div className="flex flex-col gap-14">
          
          {/* Personalized Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-extrabold text-xl text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <Sparkles className="text-indigo-500 fill-indigo-500/20" size={20} /> Recommended For You
                </h2>
                <p className="text-xs text-slate-400 mt-1">Sourced from your saved lists and property click behavior.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {personalized.map(p => (
                <PropertyCard 
                  key={p._id} 
                  property={p} 
                  onViewDetails={onViewDetails}
                  compareList={compareList}
                  onToggleCompare={handleToggleCompare}
                />
              ))}
            </div>
          </div>

          {/* Trending Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-extrabold text-xl text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  🔥 Trending Listings
                </h2>
                <p className="text-xs text-slate-400 mt-1">Our most viewed properties and high-demand segments.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {trending.map(p => (
                <PropertyCard 
                  key={p._id} 
                  property={p} 
                  onViewDetails={onViewDetails}
                  compareList={compareList}
                  onToggleCompare={handleToggleCompare}
                />
              ))}
            </div>
          </div>

          {/* All Listings Grid */}
          <div>
            <h2 className="font-extrabold text-xl text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              🗺 Explore All Listings
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map(p => (
                <PropertyCard 
                  key={p._id} 
                  property={p} 
                  onViewDetails={onViewDetails}
                  compareList={compareList}
                  onToggleCompare={handleToggleCompare}
                />
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Comparison Bottom Floating Panel */}
      <ComparisonPanel 
        compareList={compareList}
        onRemove={handleRemoveCompare}
        onClear={() => setCompareList([])}
      />

    </div>
  );
}
