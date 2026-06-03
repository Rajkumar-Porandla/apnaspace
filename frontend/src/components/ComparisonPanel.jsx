import React, { useState } from 'react';
import { X, GitCompare, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ComparisonPanel({ 
  compareList = [], 
  onRemove, 
  onClear 
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (compareList.length === 0) return null;

  // Currency Formatter Helper
  const formatPrice = (price, property) => {
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
    <>
      {/* 1. Slide-up bottom tray */}
      <div className="fixed bottom-0 left-0 right-0 z-40 px-6 py-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200/50 dark:border-slate-800/40 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 max-w-7xl mx-auto rounded-t-3xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <GitCompare size={20} />
          </div>
          <div>
            <h4 className="font-bold text-sm">Compare Listings ({compareList.length} of 3)</h4>
            <p className="text-slate-400 text-xs mt-0.5">Select up to three properties to inspect specifications side-by-side.</p>
          </div>
        </div>

        {/* Selected Properties Previews */}
        <div className="flex items-center gap-3 flex-wrap">
          {compareList.map(p => (
            <div 
              key={p._id}
              className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-2 rounded-xl pr-1.5 border border-slate-200/40 dark:border-slate-700/20 text-xs"
            >
              <img 
                src={p.images[0]} 
                alt="" 
                className="w-8 h-8 rounded-lg object-cover"
              />
              <div className="max-w-[100px] truncate">
                <div className="font-bold truncate">{p.title}</div>
                <div className="text-[10px] text-indigo-500 font-semibold">{formatPrice(p.price, p)}</div>
              </div>
              <button 
                onClick={() => onRemove(p._id)}
                className="p-1 text-slate-400 hover:text-red-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
                aria-label="Remove"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button 
            onClick={onClear}
            className="text-xs text-slate-500 hover:underline px-3 py-2"
          >
            Clear all
          </button>
          <button 
            onClick={() => setIsExpanded(true)}
            className="btn-primary flex items-center gap-1.5 px-4 py-2.5"
            disabled={compareList.length < 2}
            title={compareList.length < 2 ? 'Select at least 2 properties to compare' : ''}
          >
            Compare Now <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* 2. Expanded comparison matrix (Full-Screen Modal Overlay) */}
      <AnimatePresence>
        {isExpanded && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/40"
            >
              
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center gap-2">
                  <GitCompare className="text-indigo-600 dark:text-indigo-400" />
                  <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-100">
                    Side-by-Side Property Comparison
                  </h3>
                </div>
                <button 
                  onClick={() => setIsExpanded(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Comparison Grid Matrix */}
              <div className="p-6 overflow-x-auto">
                <table className="w-full min-w-[600px] border-collapse text-sm">
                  <thead>
                    <tr>
                      <th className="w-1/4 p-3 text-left font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800/50">Specs / Details</th>
                      {compareList.map(p => (
                        <th 
                          key={p._id}
                          className="w-1/4 p-3 text-center border-b border-slate-100 dark:border-slate-800/50"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <img 
                              src={p.images[0]} 
                              alt="" 
                              className="w-24 h-16 rounded-xl object-cover ring-2 ring-indigo-500/20"
                            />
                            <div className="font-bold text-xs truncate max-w-[150px]">{p.title}</div>
                            <div className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">{formatPrice(p.price, p)}</div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    
                    {/* Location */}
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                      <td className="p-3 font-semibold text-slate-500">Location / Area</td>
                      {compareList.map(p => (
                        <td key={p._id} className="p-3 text-center capitalize">{p.city}, {p.state}</td>
                      ))}
                    </tr>

                    {/* Property Type */}
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 border-t border-slate-100/50 dark:border-slate-800/20">
                      <td className="p-3 font-semibold text-slate-500">Property Type</td>
                      {compareList.map(p => (
                        <td key={p._id} className="p-3 text-center capitalize">{p.propertyType}</td>
                      ))}
                    </tr>

                    {/* Area Size */}
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 border-t border-slate-100/50 dark:border-slate-800/20">
                      <td className="p-3 font-semibold text-slate-500">Area Size</td>
                      {compareList.map(p => (
                        <td key={p._id} className="p-3 text-center font-semibold">{p.area} sqft</td>
                      ))}
                    </tr>

                    {/* Bedrooms */}
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 border-t border-slate-100/50 dark:border-slate-800/20">
                      <td className="p-3 font-semibold text-slate-500">Bedrooms</td>
                      {compareList.map(p => (
                        <td key={p._id} className="p-3 text-center">{p.bedrooms || 'N/A'}</td>
                      ))}
                    </tr>

                    {/* Bathrooms */}
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 border-t border-slate-100/50 dark:border-slate-800/20">
                      <td className="p-3 font-semibold text-slate-500">Bathrooms</td>
                      {compareList.map(p => (
                        <td key={p._id} className="p-3 text-center">{p.bathrooms || 'N/A'}</td>
                      ))}
                    </tr>

                    {/* Views Track */}
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 border-t border-slate-100/50 dark:border-slate-800/20">
                      <td className="p-3 font-semibold text-slate-500">Listing Views</td>
                      {compareList.map(p => (
                        <td key={p._id} className="p-3 text-center">{p.viewsCount} views</td>
                      ))}
                    </tr>

                    {/* Amenities Matrix Checklist */}
                    <tr className="bg-slate-50/30 dark:bg-slate-800/5 border-t border-slate-100/50 dark:border-slate-800/20">
                      <td className="p-3 font-bold text-slate-700 dark:text-slate-300" colSpan={compareList.length + 1}>
                        Amenities Comparison
                      </td>
                    </tr>

                    {allAmenities.map(amenity => (
                      <tr key={amenity} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 border-t border-slate-100/50 dark:border-slate-800/20">
                        <td className="p-3 pl-6 text-xs text-slate-500">{amenity}</td>
                        {compareList.map(p => {
                          const hasAmenity = p.amenities?.includes(amenity);
                          return (
                            <td key={p._id} className="p-3 text-center">
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

              {/* Close controls */}
              <div className="p-6 border-t border-slate-100 dark:border-slate-800/50 flex justify-end">
                <button 
                  onClick={() => setIsExpanded(false)}
                  className="btn-secondary px-6"
                >
                  Close Comparison
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
