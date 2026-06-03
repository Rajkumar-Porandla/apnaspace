import React from 'react';
import { X, GitCompare, ArrowLeft, ExternalLink, Sparkles } from 'lucide-react';

export default function Comparison({ 
  compareList = [], 
  setCompareList, 
  onViewDetails, 
  setCurrentTab 
}) {
  const handleRemove = (id) => {
    setCompareList(prev => prev.filter(p => p._id !== id));
  };

  const handleClearAll = () => {
    setCompareList([]);
  };

  // Currency Formatter Helper
  const formatPrice = (price, property) => {
    if (!price) return '';
    const isRent = property?.listingType === 'rent';
    if (isRent) {
      if (price >= 100000) {
        return `₹${(price / 100000).toFixed(2)} Lakh/mo`;
      }
      return `₹${price.toLocaleString()}/mo`;
    }

    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(0)} Lakh`;
    }
    return `₹${price.toLocaleString()}`;
  };

  // Collect all unique amenities across comparing properties
  const allAmenities = Array.from(
    new Set(compareList.flatMap(p => p.amenities || []))
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <GitCompare className="text-indigo-600 dark:text-indigo-400" /> Side-by-Side Comparison
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Compare specifications, location metrics, and amenities of your selected listings.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setCurrentTab('home')}
            className="btn-secondary py-2 px-4 flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft size={14} /> Back to Discover
          </button>
          
          {compareList.length > 0 && (
            <button 
              onClick={handleClearAll}
              className="text-xs text-red-500 hover:text-red-600 dark:hover:text-red-400 font-semibold hover:underline bg-transparent border-0 cursor-pointer"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {compareList.length === 0 ? (
        <div className="glass-card py-20 text-center px-4 max-w-xl mx-auto flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <GitCompare size={24} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">No properties selected</h3>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">
              You need to select at least two properties to compare. Browse our discover section and click the "Compare" button on any listing card.
            </p>
          </div>
          <button 
            onClick={() => setCurrentTab('home')}
            className="btn-primary mt-2 text-xs py-2 px-5"
          >
            Browse Listings
          </button>
        </div>
      ) : (
        <div className="glass-card overflow-hidden border border-slate-200/50 dark:border-slate-800/40 shadow-xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
          {/* Comparison Table Matrix */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="w-1/4 p-4 text-left font-bold text-slate-400 border-b border-slate-200/50 dark:border-slate-800/40">
                    Specifications
                  </th>
                  {compareList.map(p => (
                    <th 
                      key={p._id}
                      className="w-1/4 p-4 text-center border-b border-slate-200/50 dark:border-slate-800/40 relative group"
                    >
                      <button 
                        onClick={() => handleRemove(p._id)}
                        className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                        title="Remove from comparison"
                      >
                        <X size={14} />
                      </button>
                      
                      <div className="flex flex-col items-center gap-3 pt-4">
                        <img 
                          src={p.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=300&q=80'} 
                          alt="" 
                          className="w-32 h-20 rounded-xl object-cover ring-2 ring-indigo-500/10 shadow-sm"
                        />
                        <div className="font-bold text-xs truncate max-w-[160px] text-slate-800 dark:text-slate-100">
                          {p.title}
                        </div>
                        <div className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                          {formatPrice(p.price, p)}
                        </div>
                        <button 
                          onClick={() => onViewDetails(p._id)}
                          className="text-[10px] text-indigo-500 hover:underline flex items-center gap-1 font-semibold"
                        >
                          View Details <ExternalLink size={10} />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {/* Location */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                  <td className="p-4 font-semibold text-slate-500">Location</td>
                  {compareList.map(p => (
                    <td key={p._id} className="p-4 text-center capitalize text-slate-700 dark:text-slate-300">
                      {p.city}, {p.state}
                    </td>
                  ))}
                </tr>

                {/* Property Type */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                  <td className="p-4 font-semibold text-slate-500">Property Type</td>
                  {compareList.map(p => (
                    <td key={p._id} className="p-4 text-center capitalize text-slate-700 dark:text-slate-300">
                      {p.propertyType}
                    </td>
                  ))}
                </tr>

                {/* Listing Purpose */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                  <td className="p-4 font-semibold text-slate-500">Purpose</td>
                  {compareList.map(p => (
                    <td key={p._id} className="p-4 text-center text-slate-700 dark:text-slate-300">
                      {p.listingType === 'rent' ? 'For Rent' : 'For Sale'}
                    </td>
                  ))}
                </tr>

                {/* Area Size */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                  <td className="p-4 font-semibold text-slate-500">Area Size</td>
                  {compareList.map(p => (
                    <td key={p._id} className="p-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                      {p.area} sqft
                    </td>
                  ))}
                </tr>

                {/* Bedrooms */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                  <td className="p-4 font-semibold text-slate-500">Bedrooms</td>
                  {compareList.map(p => (
                    <td key={p._id} className="p-4 text-center text-slate-700 dark:text-slate-300">
                      {p.bedrooms || 'N/A'}
                    </td>
                  ))}
                </tr>

                {/* Bathrooms */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                  <td className="p-4 font-semibold text-slate-500">Bathrooms</td>
                  {compareList.map(p => (
                    <td key={p._id} className="p-4 text-center text-slate-700 dark:text-slate-300">
                      {p.bathrooms || 'N/A'}
                    </td>
                  ))}
                </tr>

                {/* Views Count */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                  <td className="p-4 font-semibold text-slate-500">Popularity</td>
                  {compareList.map(p => (
                    <td key={p._id} className="p-4 text-center text-slate-700 dark:text-slate-300">
                      {p.viewsCount || 0} views
                    </td>
                  ))}
                </tr>

                {/* Furnishing Status */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                  <td className="p-4 font-semibold text-slate-500">Furnishing</td>
                  {compareList.map(p => (
                    <td key={p._id} className="p-4 text-center text-slate-700 dark:text-slate-300 capitalize">
                      {p.furnishing || 'N/A'}
                    </td>
                  ))}
                </tr>

                {/* Preferred Tenants */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                  <td className="p-4 font-semibold text-slate-500">Preferred Tenants</td>
                  {compareList.map(p => (
                    <td key={p._id} className="p-4 text-center text-slate-700 dark:text-slate-300 capitalize font-medium">
                      {p.tenants || 'Any'}
                    </td>
                  ))}
                </tr>

                {/* Amenities comparison section */}
                <tr className="bg-slate-50/30 dark:bg-slate-800/10">
                  <td className="p-4 font-bold text-slate-800 dark:text-slate-200" colSpan={compareList.length + 1}>
                    Amenities Comparison Matrix
                  </td>
                </tr>

                {allAmenities.map(amenity => (
                  <tr key={amenity} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                    <td className="p-4 pl-6 text-xs text-slate-500">{amenity}</td>
                    {compareList.map(p => {
                      const hasAmenity = p.amenities?.includes(amenity);
                      return (
                        <td key={p._id} className="p-4 text-center">
                          {hasAmenity ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                              ✓
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-50 dark:bg-red-950/20 text-red-400 text-xs">
                              ✕
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
