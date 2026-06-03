import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { Heart, MapPin, BedDouble, Bath, Maximize, MessageSquare, Eye, Plus, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PropertyCard({ 
  property, 
  onViewDetails, 
  compareList = [], 
  onToggleCompare 
}) {
  const { user, toggleSaveProperty } = useAuth();
  const { setActiveChat } = useChat();

  const isSaved = user?.savedProperties?.some(id => (id._id || id) === property._id);
  const isComparing = compareList.some(p => p._id === property._id);

  // Price Formatter Helper (converts Indian Rupees to Lakhs/Crores)
  const formatPrice = (price) => {
    const isRent = property.listingType === 'rent';
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

  const handleSave = (e) => {
    e.stopPropagation();
    if (!user) {
      alert('Please log in to save properties to your wishlist.');
      return;
    }
    toggleSaveProperty(property._id);
  };

  const handleContact = (e) => {
    e.stopPropagation();
    if (!user) {
      alert('Please log in to communicate with listings managers.');
      return;
    }
    // Set active chat manager
    const target = property.agent || property.seller;
    if (target) {
      setActiveChat(target);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="glass-card overflow-hidden flex flex-col h-full cursor-pointer relative group"
      onClick={() => onViewDetails(property._id)}
    >
      {/* Property Badge Categories (e.g. Trending or Sold) */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        <span className={`px-2.5 py-1 text-white font-bold rounded-lg text-[9px] uppercase tracking-wide shadow-sm ${
          property.listingType === 'rent' ? 'bg-teal-600 shadow-teal-500/20' : 'bg-indigo-600 shadow-indigo-600/20'
        }`}>
          {property.listingType === 'rent' ? 'For Rent' : 'For Sale'}
        </span>
        {property.viewsCount > 150 && (
          <span className="px-2.5 py-1 bg-amber-500 text-white font-bold rounded-lg text-[9px] uppercase tracking-wide shadow-sm shadow-amber-500/20">
            ★ Trending
          </span>
        )}
        {property.status === 'sold' ? (
          <span className="px-2.5 py-1 bg-red-600 text-white font-bold rounded-lg text-[9px] uppercase tracking-wide">
            {property.listingType === 'rent' ? 'Rented' : 'Sold'}
          </span>
        ) : property.status === 'under_review' ? (
          <span className="px-2.5 py-1 bg-slate-500 text-white font-bold rounded-lg text-[9px] uppercase tracking-wide">
            Under Review
          </span>
        ) : null}
      </div>

      {/* Wishlist Button */}
      <button 
        onClick={handleSave}
        className="absolute top-3 right-3 z-10 p-2 bg-white/80 hover:bg-white dark:bg-slate-900/80 dark:hover:bg-slate-900 backdrop-blur-md rounded-xl shadow-md border border-white/20 dark:border-slate-800/30 text-slate-600 hover:text-red-500 transition-colors"
        aria-label="Add to Wishlist"
      >
        <Heart 
          size={16} 
          className={isSaved ? 'fill-red-500 text-red-500 transition-transform active:scale-125' : 'transition-transform active:scale-125'} 
        />
      </button>

      {/* Property Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img 
          src={property.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80'} 
          alt={property.title} 
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80';
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Comparison Toggler */}
        {onToggleCompare && (
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleCompare(property); }}
            className={`absolute bottom-3 right-3 p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 backdrop-blur-md transition-all shadow-sm ${
              isComparing 
                ? 'bg-emerald-600 border-emerald-500 text-white' 
                : 'bg-white/90 border-slate-200 text-slate-700 dark:bg-slate-900/90 dark:border-slate-800 dark:text-slate-300'
            }`}
          >
            {isComparing ? <Check size={12} /> : <Plus size={12} />}
            {isComparing ? 'Comparing' : 'Compare'}
          </button>
        )}
      </div>

      {/* Property Meta Body */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Title and Price */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-base line-clamp-1 text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {property.title}
          </h3>
          <span className="font-extrabold text-lg text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
            {formatPrice(property.price)}
          </span>
        </div>

        {/* Address Location */}
        <div className="flex items-center gap-1 text-slate-400 mt-1.5 text-xs">
          <MapPin size={12} />
          <span className="capitalize truncate">
            {property.address.split(',').slice(0, 2).join(',')} ({property.city})
          </span>
        </div>

        {/* Property Specs Configuration */}
        <div className="grid grid-cols-3 gap-2 border-y border-slate-100 dark:border-slate-800/50 py-3 my-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 justify-center">
            <BedDouble size={14} className="text-slate-400" />
            <span>{property.bedrooms || 0} Beds</span>
          </div>
          <div className="flex items-center gap-1.5 justify-center">
            <Bath size={14} className="text-slate-400" />
            <span>{property.bathrooms || 0} Baths</span>
          </div>
          <div className="flex items-center gap-1.5 justify-center">
            <Maximize size={14} className="text-slate-400" />
            <span>{property.area} sqft</span>
          </div>
        </div>

        {/* Bottom Panel (Agent info, Views count, Contact button) */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100/50 dark:border-slate-800/20">
          <div className="flex items-center gap-2">
            <img 
              src={(property.agent || property.seller)?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&h=80&q=80'} 
              alt={(property.agent || property.seller)?.name || 'Seller'} 
              className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-800"
            />
            <span className="text-[10px] text-slate-400 font-medium truncate max-w-[80px]">
              {(property.agent || property.seller)?.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
              <Eye size={10} /> {property.viewsCount}
            </span>
            <button 
              onClick={handleContact}
              className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/80 dark:text-indigo-400 transition-colors"
              title="Chat with Agent"
            >
              <MessageSquare size={12} />
            </button>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
