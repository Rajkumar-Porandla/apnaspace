import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { 
  Calendar, 
  Clock, 
  MessageSquare, 
  MapPin, 
  BedDouble, 
  Bath, 
  Maximize, 
  Star, 
  ShieldAlert, 
  ArrowLeft, 
  Send,
  ShieldCheck,
  School,
  Hospital,
  ShoppingBag,
  Truck,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Hammer,
  Flame,
  Car,
  Map,
  GraduationCap,
  DollarSign,
  Activity,
  Compass,
  TrendingUp
} from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import { motion, AnimatePresence } from 'framer-motion';

export default function PropertyDetails({ propertyId, onBack, onSelectProperty, setCurrentTab }) {
  const { user } = useAuth();
  const { setActiveChat, setShowChat } = useChat();

  const [data, setData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationIntel, setLocationIntel] = useState(null);
  const [activeIntelTab, setActiveIntelTab] = useState('scores');
  const [compareLocality, setCompareLocality] = useState('');
  const [nearbyCategory, setNearbyCategory] = useState('school');
  const [commuteDestination, setCommuteDestination] = useState('office');

  const [activeImage, setActiveImage] = useState(0);

  // Booking Form States
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // Review Form States
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [interestTag, setInterestTag] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Neighborhood Chatbot States
  const [localChatMessages, setLocalChatMessages] = useState([
    { sender: 'bot', text: 'Hello! I am your location assistant. Ask me anything about safety, schools, hospitals, transit, or utility supply around this property.' }
  ]);
  const [localInput, setLocalInput] = useState('');
  const [localChatLoading, setLocalChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Property Services States
  const [serviceSuccessMsg, setServiceSuccessMsg] = useState('');

  useEffect(() => {
    fetchPropertyDetails();
    // Reset chatbot when property changes
    setLocalChatMessages([
      { sender: 'bot', text: 'Hello! I am your location assistant. Ask me anything about safety, schools, hospitals, transit, or utility supply around this property.' }
    ]);
  }, [propertyId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localChatMessages, localChatLoading]);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      // 1. Fetch Property Details (triggers views increment in backend)
      const res = await axios.get(`/properties/${propertyId}`);
      if (res.data.success) {
        setData(res.data.property);
        setReviews(res.data.reviews || []);
      }

      // 2. Fetch Similar Properties
      const similarRes = await axios.get(`/recommendations/similar/${propertyId}`);
      if (similarRes.data.success) {
        setSimilar(similarRes.data.properties);
      }

      // 3. Fetch Location Intelligence
      try {
        const intelRes = await axios.get(`/ai/location-intelligence?propertyId=${propertyId}`);
        if (intelRes.data && intelRes.data.success) {
          setLocationIntel(intelRes.data.data);
        }
      } catch (e) {
        console.error('Error loading location intelligence:', e.message);
      }
    } catch (err) {
      console.error('Error fetching property details:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setBookingError('You must sign in to schedule property visits.');
      return;
    }
    setBookingError('');
    setBookingSuccess(false);

    try {
      const res = await axios.post('/visits', {
        propertyId,
        visitDate,
        visitTime,
        notes,
      });

      if (res.data.success) {
        setBookingSuccess(true);
        setNotes('');
        setVisitDate('');
        setVisitTime('');
      }
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Failed to request booking visit.');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setReviewError('You must sign in to submit a review.');
      return;
    }
    setReviewError('');
    setReviewSuccess(false);

    try {
      const res = await axios.post('/reviews', {
        targetType: 'property',
        propertyId,
        rating,
        comment,
        interestTag,
      });

      if (res.data.success) {
        setReviewSuccess(true);
        setComment('');
        setInterestTag('');
        // Reload details to update reviews list
        fetchPropertyDetails();
      }
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    }
  };

  const handleContactManager = () => {
    if (!user) {
      alert('Please sign in to chat with the property manager.');
      return;
    }
    const manager = data.agent || data.seller;
    if (manager) {
      setActiveChat(manager);
      setShowChat(true);
    }
  };

  // Locality Q&A sending handler
  const handleLocalChatSend = async (questionText) => {
    const query = questionText || localInput.trim();
    if (!query) return;

    if (!questionText) {
      setLocalInput('');
    }

    // Add user message
    setLocalChatMessages(prev => [...prev, { sender: 'user', text: query }]);
    setLocalChatLoading(true);

    try {
      const res = await axios.post('/ai/locality-chat', {
        propertyId,
        message: query
      });

      if (res.data.success) {
        setLocalChatMessages(prev => [...prev, { sender: 'bot', text: res.data.answer }]);
      } else {
        setLocalChatMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I couldn\'t fetch locality info right now.' }]);
      }
    } catch (err) {
      console.error('Locality chat failed:', err.message);
      setLocalChatMessages(prev => [...prev, { sender: 'bot', text: 'Could not connect to Q&A assistant.' }]);
    } finally {
      setLocalChatLoading(false);
    }
  };

  // Service Request Handler
  const handleBookService = (serviceName) => {
    setServiceSuccessMsg(`🎉 Success! Your request for "${serviceName}" has been registered. Our representative will contact you within 2 hours.`);
    setTimeout(() => {
      setServiceSuccessMsg('');
    }, 5000);
  };

  const formatPrice = (price) => {
    if (!price) return '';
    const isRent = data?.listingType === 'rent';
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

  // Dynamic nearby calculations
  const getNearbyFacilities = () => {
    if (!data) return null;
    const city = data.city?.toLowerCase() || '';
    const address = data.address?.toLowerCase() || '';
    
    let facilities = {
      schools: [
        { name: 'Greenwood International School', distance: '1.2 km' },
        { name: 'Oakridge High School', distance: '2.4 km' }
      ],
      hospitals: [
        { name: 'City Hospital & Trauma Centre', distance: '0.8 km' },
        { name: 'Metro Healthcare Clinic', distance: '1.5 km' }
      ],
      malls: [
        { name: 'Central Square Mall', distance: '2.0 km' },
        { name: 'Local Sector Market', distance: '0.4 km' }
      ],
      delivery: { available: true, speed: 'Superfast (10-15 mins)' }
    };

    if (address.includes('dwarka') || city.includes('delhi')) {
      facilities = {
        schools: [
          { name: 'Delhi Public School (Sector 6)', distance: '0.3 km' },
          { name: 'Mount Carmel School (Sector 22)', distance: '1.8 km' },
          { name: 'St. Stephens Preparatory School', distance: '0.2 km' }
        ],
        hospitals: [
          { name: 'Venkateshwar Hospital (Sector 18)', distance: '1.1 km' },
          { name: 'Manipal Hospital (Sector 6)', distance: '0.9 km' }
        ],
        malls: [
          { name: 'Pinnacle Mall (Sector 10)', distance: '1.4 km' },
          { name: 'Dwarka Sector 6 Central Market', distance: '0.5 km' },
          { name: 'Pacific Mall (Dwarka Sector 21)', distance: '3.2 km' }
        ],
        delivery: { available: true, speed: 'Superfast (10-12 mins for Zepto/Blinkit/Swiggy)' }
      };
    } else if (address.includes('bandra') || city.includes('mumbai')) {
      facilities = {
        schools: [
          { name: 'St. Stanislaus High School', distance: '0.6 km' },
          { name: 'Arya Vidya Mandir (Bandra)', distance: '1.2 km' },
          { name: 'American School of Bombay (BKC)', distance: '3.5 km' }
        ],
        hospitals: [
          { name: 'Lilavati Hospital & Research Centre', distance: '1.5 km' },
          { name: 'Holy Family Hospital', distance: '0.8 km' }
        ],
        malls: [
          { name: 'Link Square Mall', distance: '0.9 km' },
          { name: 'Jio World Drive (BKC)', distance: '3.8 km' },
          { name: 'Bandra Hill Road Market', distance: '0.4 km' }
        ],
        delivery: { available: true, speed: 'Instant (8-10 mins coverage for Swiggy Instamart/Zepto)' }
      };
    } else if (address.includes('hsr') || address.includes('whitefield') || city.includes('bangalore')) {
      facilities = {
        schools: [
          { name: 'National Public School (HSR)', distance: '0.8 km' },
          { name: 'The International School Bangalore (TISB)', distance: '6.5 km' },
          { name: 'Vibgyor High School (HSR)', distance: '1.4 km' }
        ],
        hospitals: [
          { name: 'Narayana Multispeciality Hospital', distance: '1.2 km' },
          { name: 'Columbia Asia Hospital (Sarjapur Road)', distance: '2.8 km' }
        ],
        malls: [
          { name: 'HSR Sector 6 Shopping Complex', distance: '0.5 km' },
          { name: 'Phoenix Marketcity (Whitefield)', distance: '4.5 km' },
          { name: 'Forum Mall (Koramangala)', distance: '3.2 km' }
        ],
        delivery: { available: true, speed: 'Superfast (10-15 mins for Swiggy/Zomato/Zepto)' }
      };
    } else if (address.includes('greater noida') || address.includes('noida')) {
      facilities = {
        schools: [
          { name: 'Lotus Valley International School', distance: '2.1 km' },
          { name: 'Step by Step School (Sector 132)', distance: '1.9 km' }
        ],
        hospitals: [
          { name: 'Jaypee Hospital (Sector 128)', distance: '3.2 km' },
          { name: 'Felix Hospital (Sector 137)', distance: '2.5 km' }
        ],
        malls: [
          { name: 'Mall of India (Sector 18)', distance: '9.0 km' },
          { name: 'Sector 150 Shopping Plaza', distance: '0.8 km' }
        ],
        delivery: { available: true, speed: 'Moderate (15-20 mins Blinkit/Zomato delivery)' }
      };
    }
    return facilities;
  };

  // Helper for review badges
  const getInterestBadge = (tag) => {
    switch (tag) {
      case 'interested_buying':
        return { label: 'Interested Buyer', class: 'bg-emerald-50 text-emerald-600 border border-emerald-500/10 dark:bg-emerald-950/30 dark:text-emerald-400' };
      case 'interested_renting':
        return { label: 'Interested Tenant', class: 'bg-teal-50 text-teal-600 border border-teal-500/10 dark:bg-teal-950/30 dark:text-teal-400' };
      case 'scheduled_visit':
        return { label: 'Scheduled Visit', class: 'bg-amber-50 text-amber-600 border border-amber-500/10 dark:bg-amber-950/30 dark:text-amber-400' };
      case 'local_resident':
        return { label: 'Local Resident', class: 'bg-blue-50 text-blue-600 border border-blue-500/10 dark:bg-blue-950/30 dark:text-blue-400' };
      case 'just_browsing':
        return { label: 'Just Browsing', class: 'bg-slate-50 text-slate-500 border border-slate-500/10 dark:bg-slate-800/30 dark:text-slate-400' };
      case 'inquired_loan':
        return { label: 'Inquired Loan', class: 'bg-indigo-50 text-indigo-600 border border-indigo-500/10 dark:bg-indigo-950/30 dark:text-indigo-400' };
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
        <span className="text-slate-400 text-xs font-semibold">Retrieving property details...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <div className="text-red-500 font-bold text-lg">Property not found.</div>
        <button onClick={onBack} className="btn-secondary mt-4 mx-auto">Go Back</button>
      </div>
    );
  }

  const nearby = getNearbyFacilities();

  const getSimulatedInterestStats = () => {
    if (!data) return { total: 18, visits: 4 };
    const propIdStr = data._id ? data._id.toString() : '1234567890ab';
    const numPart = parseInt(propIdStr.substring(propIdStr.length - 4), 16) || 0;
    const baseInterest = (numPart % 16) + 14; // Between 14 and 29
    const viewsBonus = Math.floor((data.viewsCount || 0) * 0.12);
    const total = baseInterest + viewsBonus;
    const visits = Math.floor(total * 0.25) + 1; // Approx 25% are scheduled visits
    return { total, visits };
  };

  const interestStats = getSimulatedInterestStats();

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="btn-secondary px-4 py-2 mb-6 flex items-center gap-1.5 self-start text-xs font-semibold text-slate-500 border border-slate-200/50 hover:bg-slate-50 rounded-xl"
      >
        <ArrowLeft size={14} /> Back to discovery
      </button>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Image gallery, description, reviews */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* 1. IMAGE SLIDER */}
          <div className="glass-card overflow-hidden p-3 rounded-3xl border border-slate-200/30 bg-white/60 dark:bg-slate-900/60 shadow-sm">
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img 
                src={data.images[activeImage] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80'} 
                alt="" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80';
                }}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Gallery Thumbs */}
            {data.images.length > 1 && (
              <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
                {data.images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative w-20 aspect-[4/3] rounded-lg overflow-hidden flex-shrink-0 transition-all ${activeImage === idx ? 'ring-2 ring-indigo-500 scale-95' : 'opacity-70 hover:opacity-100'}`}
                  >
                    <img 
                      src={img} 
                      alt="" 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80';
                      }}
                      className="w-full h-full object-cover" 
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. DESCRIPTION & SPECS */}
          <div className="glass-card p-6 rounded-3xl border border-slate-200/30 bg-white/60 dark:bg-slate-900/60 shadow-sm">
            <div className="flex items-start justify-between flex-wrap gap-4 border-b border-slate-100 dark:border-slate-800/50 pb-6 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">{data.title}</h1>
                <div className="flex items-center gap-1 text-slate-400 mt-2 text-xs font-medium capitalize">
                  <MapPin size={14} className="text-slate-400" /> {data.address}, {data.city}, {data.state}
                </div>
              </div>
              <div className="text-right">
                <span className="block text-2xl md:text-3xl font-black text-indigo-600 dark:text-indigo-400">{formatPrice(data.price)}</span>
                <span className={`text-xs font-bold tracking-wider uppercase px-2.5 py-1 rounded-md mt-1.5 inline-block ${
                  data.listingType === 'rent'
                    ? 'bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400'
                    : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
                }`}>
                  {data.listingType === 'rent' ? 'For Rent' : 'For Sale'}
                </span>
              </div>
            </div>

            {/* Core Badges Row */}
            <div className="grid grid-cols-3 gap-4 bg-slate-50/50 dark:bg-slate-950/10 p-4 rounded-2xl mb-6 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex flex-col items-center gap-1 text-center">
                <BedDouble className="text-indigo-500" size={18} />
                <span className="font-semibold">{data.bedrooms || 0} Bedrooms</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-center border-x border-slate-200/50 dark:border-slate-800/40">
                <Bath className="text-indigo-500" size={18} />
                <span className="font-semibold">{data.bathrooms || 0} Bathrooms</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <Maximize className="text-indigo-500" size={18} />
                <span className="font-semibold">{data.area} sq ft</span>
              </div>
            </div>

            {/* Rental Details Row */}
            {data.listingType === 'rent' && (data.furnishing || data.tenants) && (
              <div className="grid grid-cols-2 gap-4 bg-teal-50/10 dark:bg-teal-950/10 border border-teal-500/10 p-4 rounded-2xl mb-6 text-xs text-slate-600 dark:text-slate-300">
                {data.furnishing && (
                  <div className="flex flex-col items-center gap-1 text-center">
                    <span className="text-slate-400">Furnishing Status</span>
                    <span className="font-bold text-teal-600 dark:text-teal-400">{data.furnishing}</span>
                  </div>
                )}
                {data.tenants && (
                  <div className="flex flex-col items-center gap-1 text-center border-l border-slate-200/50 dark:border-slate-800/40">
                    <span className="text-slate-400">Preferred Tenants</span>
                    <span className="font-bold text-teal-600 dark:text-teal-400">{data.tenants}</span>
                  </div>
                )}
              </div>
            )}

            {/* Text description */}
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xs uppercase tracking-wider text-slate-400 mb-2">Listing Description</h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm whitespace-pre-line mb-6 font-medium">
              {data.description}
            </p>

            {/* Amenities Grid */}
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xs uppercase tracking-wider text-slate-400 mb-3">Amenities Included</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {data.amenities.map((amenity, idx) => (
                <div 
                  key={idx}
                  className="flex items-center gap-2 p-2 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-100/50 dark:border-slate-800/10"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  {amenity}
                </div>
              ))}
            </div>
          </div>

          {/* ADVANCED AI-POWERED LOCATION INTELLIGENCE SYSTEM */}
          {locationIntel && locationIntel.success && (
            <div className="glass-card p-6 rounded-3xl border border-slate-200/30 bg-white/60 dark:bg-slate-900/60 shadow-sm flex flex-col gap-6">
              <div className="flex items-start justify-between flex-wrap gap-4 border-b border-slate-100 dark:border-slate-800/50 pb-4">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
                    <Sparkles className="text-indigo-600 dark:text-indigo-400" size={20} />
                    Location Intelligence Hub
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    AI-powered location scoring, connectivity index, safety metrics, and investment prospects.
                  </p>
                </div>
                
                {/* Overall Score Callout */}
                <div className="flex items-center gap-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-500/10 px-4 py-2 rounded-2xl">
                  <div className="text-center">
                    <span className="block text-2xl font-black text-indigo-600 dark:text-indigo-400">
                      {locationIntel.data.locationScore?.overall || 85}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Location Score</span>
                  </div>
                  <div className="w-10 h-10 rounded-full border-4 border-indigo-600/30 border-t-indigo-600 flex items-center justify-center animate-spin-slow">
                    <Activity size={16} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-b border-slate-100 dark:border-slate-800/40 select-none">
                {[
                  { id: 'scores', label: 'Scores & Safety', icon: Activity },
                  { id: 'nearby', label: 'Nearby Discoveries', icon: Compass },
                  { id: 'commute', label: 'Commute Analyzer', icon: Car },
                  { id: 'insights', label: 'AI & Investment', icon: DollarSign },
                  { id: 'heatmap', label: 'Market Heatmap', icon: Map },
                  { id: 'comparison', label: 'Locality Compare', icon: TrendingUp }
                ].map(tab => {
                  const IconComp = tab.icon;
                  const isActive = activeIntelTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveIntelTab(tab.id)}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <IconComp size={14} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab Panel Content */}
              <div className="min-h-[280px]">
                
                {/* 1. SCORES & SAFETY INDEX PANEL */}
                {activeIntelTab === 'scores' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                    {/* Location Scores List */}
                    <div className="flex flex-col gap-4">
                      <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Neighborhood Quality Indices</h4>
                      <div className="flex flex-col gap-3">
                        {[
                          { label: 'Connectivity Index', val: locationIntel.data.locationScore?.connectivity || 85, color: 'bg-indigo-500' },
                          { label: 'Safety rating', val: locationIntel.data.locationScore?.safety || 80, color: 'bg-emerald-500' },
                          { label: 'Educational proximity', val: locationIntel.data.locationScore?.education || 85, color: 'bg-amber-500' },
                          { label: 'Healthcare access', val: locationIntel.data.locationScore?.healthcare || 82, color: 'bg-rose-500' },
                          { label: 'Lifestyle & Recreation', val: locationIntel.data.locationScore?.lifestyle || 84, color: 'bg-violet-500' },
                          { label: 'Public Transport Index', val: locationIntel.data.locationScore?.publicTransport || 80, color: 'bg-cyan-500' },
                          { label: 'Employment Opportunities', val: locationIntel.data.locationScore?.employmentOpportunities || 88, color: 'bg-teal-500' }
                        ].map((idxData, i) => (
                          <div key={i} className="text-xs">
                            <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 mb-1">
                              <span>{idxData.label}</span>
                              <span>{idxData.val}/100</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className={`h-full ${idxData.color} rounded-full`} style={{ width: `${idxData.val}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Safety Index Visual Box */}
                    <div className="p-5 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.01] border border-emerald-500/10 rounded-2xl flex flex-col gap-4">
                      <div className="flex items-center gap-2 border-b border-emerald-500/10 pb-3">
                        <span className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                          <CheckCircle2 size={16} />
                        </span>
                        <div>
                          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Safety & Family Index</h4>
                          <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider text-slate-400">Neighborhood Safety Profile</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: 'Area Safety', val: locationIntel.data.safetyIndex?.safetyScore || 85, color: 'text-emerald-500 border-emerald-500/20' },
                          { label: 'Family Friendly', val: locationIntel.data.safetyIndex?.familyFriendlyScore || 88, color: 'text-indigo-500 border-indigo-500/20' },
                          { label: 'Night Security', val: locationIntel.data.safetyIndex?.nightSafetyScore || 82, color: 'text-amber-500 border-amber-500/20' }
                        ].map((sBox, idx) => (
                          <div key={idx} className={`p-3 border rounded-xl text-center flex flex-col gap-1 bg-white/40 dark:bg-slate-900/40 ${sBox.color}`}>
                            <span className="text-xl font-black">{sBox.val}%</span>
                            <span className="text-[10px] font-bold text-slate-400 leading-tight uppercase tracking-wider">{sBox.label}</span>
                          </div>
                        ))}
                      </div>

                      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50/50 dark:bg-slate-900/30 p-3 rounded-xl border border-slate-100/50 dark:border-slate-800/10">
                        🛡️ <span className="font-extrabold text-slate-700 dark:text-slate-350">Security Summary:</span> This area features highly responsive police patrolling networks, verified low incident reports, and extensive gated society infrastructures, making it highly family friendly.
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. NEARBY PLACES DISCOVERY */}
                {activeIntelTab === 'nearby' && (
                  <div className="flex flex-col gap-4 animate-fadeIn">
                    {/* Category Selector tag chips */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none select-none">
                      {[
                        { id: 'school', label: 'Schools', icon: School },
                        { id: 'college', label: 'Colleges', icon: GraduationCap },
                        { id: 'hospital', label: 'Hospitals', icon: Hospital },
                        { id: 'pharmacy', label: 'Pharmacies', icon: Activity },
                        { id: 'metro', label: 'Metro', icon: Compass },
                        { id: 'bus', label: 'Bus Stops', icon: Car },
                        { id: 'railway', label: 'Railway', icon: Map },
                        { id: 'airport', label: 'Airports', icon: MapPin },
                        { id: 'mall', label: 'Malls', icon: ShoppingBag },
                        { id: 'supermarket', label: 'Supermarkets', icon: ShoppingBag },
                        { id: 'restaurant', label: 'Restaurants', icon: Sparkles },
                        { id: 'park', label: 'Parks', icon: Map },
                        { id: 'gym', label: 'Gyms', icon: Activity },
                        { id: 'itpark', label: 'IT Parks', icon: CheckCircle2 },
                        { id: 'bank', label: 'Banks', icon: DollarSign }
                      ].map(cat => {
                        const IconComponent = cat.icon;
                        const isCatActive = nearbyCategory === cat.id;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => setNearbyCategory(cat.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
                              isCatActive
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-900/50 dark:text-indigo-400'
                                : 'bg-slate-50/50 border-slate-100 hover:border-slate-200 hover:bg-slate-100 text-slate-500 dark:bg-slate-900/30 dark:border-slate-800/40 dark:hover:bg-slate-800/30'
                            }`}
                          >
                            <IconComponent size={12} />
                            {cat.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Places List Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                      {(locationIntel.data.nearbyPlaces || [])
                        .filter(place => place.category === nearbyCategory)
                        .map((place, i) => (
                          <div 
                            key={i}
                            className="p-3 bg-slate-50/55 dark:bg-slate-950/15 border border-slate-200/10 rounded-2xl flex items-center justify-between gap-4 hover:scale-[1.01] transition-transform"
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0"></span>
                              <span className="font-bold text-xs text-slate-700 dark:text-slate-350 truncate">{place.name}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 text-[11px] font-bold text-slate-500">
                              <span>📍 {place.distance}</span>
                              <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">⏱️ {place.travelTime}</span>
                            </div>
                          </div>
                        ))}
                      
                      {(locationIntel.data.nearbyPlaces || []).filter(place => place.category === nearbyCategory).length === 0 && (
                        <div className="col-span-2 text-center py-6 text-xs text-slate-400 font-semibold">
                          No places indexed in this category within immediate range.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. COMMUTE ANALYZER */}
                {activeIntelTab === 'commute' && (
                  <div className="flex flex-col gap-4 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Commute Duration Calculator</h4>
                      <p className="text-[11px] font-bold text-slate-500">Select commute target destination below:</p>
                    </div>

                    {/* Target Selector Chips */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none select-none">
                      {[
                        { id: 'office', label: 'Office Hubs' },
                        { id: 'college', label: 'Colleges' },
                        { id: 'airport', label: 'Airport' },
                        { id: 'railway', label: 'Railway Station' },
                        { id: 'cityCenter', label: 'City Center' }
                      ].map(dest => (
                        <button
                          key={dest.id}
                          onClick={() => setCompareLocality(dest.id)} // reusing state variable logic locally in commute destination
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                            (compareLocality || 'office') === dest.id
                              ? 'bg-indigo-50 border border-indigo-200 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-900/50 dark:text-indigo-400'
                              : 'bg-slate-50/50 border border-slate-100 hover:border-slate-200 text-slate-500 dark:bg-slate-900/30 dark:border-slate-850 dark:hover:bg-slate-800/30'
                          }`}
                        >
                          {dest.label}
                        </button>
                      ))}
                    </div>

                    {/* Mode Grid Renders */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                      {[
                        { mode: 'Driving Duration', val: locationIntel.data.commuteTimes?.[compareLocality || 'office']?.driving || '10 mins', icon: Car, color: 'text-indigo-500 bg-indigo-500/10' },
                        { mode: 'Walking Duration', val: locationIntel.data.commuteTimes?.[compareLocality || 'office']?.walking || '35 mins', icon: Activity, color: 'text-amber-500 bg-amber-500/10' },
                        { mode: 'Public Transport', val: locationIntel.data.commuteTimes?.[compareLocality || 'office']?.transit || '15 mins', icon: Compass, color: 'text-cyan-500 bg-cyan-500/10' }
                      ].map((cMode, idx) => {
                        const ModeIcon = cMode.icon;
                        return (
                          <div key={idx} className="p-4 bg-slate-55/40 dark:bg-slate-950/15 border border-slate-200/10 rounded-2xl flex items-center gap-3">
                            <span className={`p-2.5 rounded-xl ${cMode.color}`}>
                              <ModeIcon size={16} />
                            </span>
                            <div>
                              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">{cMode.mode}</span>
                              <span className="text-sm font-extrabold text-slate-800 dark:text-slate-150 mt-1 block">{cMode.val}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 4. AI & INVESTMENT PANEL */}
                {activeIntelTab === 'insights' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                    {/* Insights Summary */}
                    <div className="flex flex-col gap-4">
                      <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">AI Neighborhood Assessment</h4>
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 leading-relaxed bg-indigo-500/[0.02] p-4 rounded-2xl border border-indigo-500/5">
                        💡 {locationIntel.data.neighborhoodInsights || 'No summaries available.'}
                      </p>
                      
                      <div className="p-3 bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200/20 dark:border-indigo-900/10 rounded-2xl text-xs">
                        <span className="font-extrabold text-indigo-600 dark:text-indigo-400">🤖 AI Recommendation Suggestion:</span>
                        <p className="text-slate-600 dark:text-slate-400 font-semibold mt-1 leading-normal">
                          {locationIntel.data.aiRecommendations || 'No recommendations indexed.'}
                        </p>
                      </div>
                    </div>

                    {/* Financial stats */}
                    <div className="p-5 bg-indigo-500/[0.03] border border-indigo-500/10 rounded-2xl flex flex-col gap-4">
                      <div className="flex items-center justify-between border-b border-indigo-500/10 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-450 rounded-xl">
                            <DollarSign size={16} />
                          </span>
                          <div>
                            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Investment Intelligence</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Market Yield & Growth</p>
                          </div>
                        </div>
                        <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 bg-indigo-600/10 px-3 py-1 rounded-xl">
                          {(locationIntel.data.investment?.investmentScore || 8.5)}/10
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                        <div className="p-3 bg-white/40 dark:bg-slate-900/40 border border-slate-200/10 rounded-xl text-center">
                          <span className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Rental Yield Score</span>
                          <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                            {locationIntel.data.investment?.rentalYield || '4.5'}%
                          </span>
                        </div>
                        <div className="p-3 bg-white/40 dark:bg-slate-900/40 border border-slate-200/10 rounded-xl text-center">
                          <span className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Appreciation Potential</span>
                          <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                            {locationIntel.data.investment?.appreciationPotential || 'High'}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs font-semibold text-slate-500">
                        <span className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Growth Factors</span>
                        <ul className="list-disc pl-4 flex flex-col gap-1 text-slate-600 dark:text-slate-455 font-semibold leading-normal">
                          {(locationIntel.data.investment?.reasons || ['Strong local residential demand.']).map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. INTERACTIVE HEATMAP PANEL */}
                {activeIntelTab === 'heatmap' && (
                  <div className="flex flex-col gap-4 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Locality Market Heatmap</h4>
                      <div className="flex gap-4 text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> High Demand</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Premium</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Affordable</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Emerging</span>
                      </div>
                    </div>

                    {/* MAP ZONE */}
                    <div className="relative h-[250px] w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center select-none shadow-inner">
                      {/* Grid overlay background */}
                      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px]"></div>
                      
                      {/* Animated Heatmap Blurs */}
                      <div className="absolute top-[20%] left-[30%] w-32 h-32 rounded-full bg-rose-500/20 filter blur-xl animate-pulse"></div>
                      <div className="absolute bottom-[20%] left-[20%] w-40 h-40 rounded-full bg-emerald-500/10 filter blur-2xl animate-pulse [animation-delay:1.5s]"></div>
                      <div className="absolute top-[40%] right-[20%] w-36 h-36 rounded-full bg-indigo-500/15 filter blur-xl animate-pulse [animation-delay:0.8s]"></div>
                      <div className="absolute bottom-[10%] right-[30%] w-28 h-28 rounded-full bg-amber-500/15 filter blur-lg animate-pulse [animation-delay:2.2s]"></div>

                      {/* Map Location Pins */}
                      <div className="absolute top-[35%] left-[35%] group cursor-pointer flex flex-col items-center">
                        <div className="w-4 h-4 rounded-full bg-rose-600 border-2 border-white animate-bounce shadow-md"></div>
                        <span className="absolute -bottom-6 bg-slate-950 text-[9px] font-black text-white px-2 py-0.5 rounded border border-slate-800 shadow whitespace-nowrap opacity-75 group-hover:opacity-100 transition-opacity">
                          Current Property Location
                        </span>
                      </div>

                      <div className="absolute top-[50%] right-[25%] group cursor-pointer flex flex-col items-center">
                        <div className="w-3.5 h-3.5 rounded-full bg-indigo-600 border border-white shadow"></div>
                        <span className="absolute -bottom-6 bg-slate-950 text-[8px] font-bold text-white px-1.5 py-0.5 rounded border border-slate-800 shadow whitespace-nowrap opacity-50 group-hover:opacity-100 transition-opacity">
                          Premium Villa Zone
                        </span>
                      </div>

                      <div className="absolute bottom-[30%] left-[25%] group cursor-pointer flex flex-col items-center">
                        <div className="w-3.5 h-3.5 rounded-full bg-emerald-600 border border-white shadow"></div>
                        <span className="absolute -bottom-6 bg-slate-950 text-[8px] font-bold text-white px-1.5 py-0.5 rounded border border-slate-800 shadow whitespace-nowrap opacity-50 group-hover:opacity-100 transition-opacity">
                          Budget Flats Core
                        </span>
                      </div>

                      <div className="absolute bottom-[20%] right-[35%] group cursor-pointer flex flex-col items-center">
                        <div className="w-3.5 h-3.5 rounded-full bg-amber-600 border border-white shadow"></div>
                        <span className="absolute -bottom-6 bg-slate-950 text-[8px] font-bold text-white px-1.5 py-0.5 rounded border border-slate-800 shadow whitespace-nowrap opacity-50 group-hover:opacity-100 transition-opacity">
                          Emerging IT Ext.
                        </span>
                      </div>

                      {/* Map controls overlay info */}
                      <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[10px] text-slate-400 font-semibold max-w-[200px] leading-tight">
                        📍 <span className="text-white font-extrabold">Market Heatmap:</span> Heatmap shows high demand concentrations centered directly on this micro-district corridor.
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. LOCALITY COMPARISON */}
                {activeIntelTab === 'comparison' && (
                  <div className="flex flex-col gap-4 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Locality Comparison Engine</h4>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-500">Compare vs:</span>
                        <select 
                          value={compareLocality}
                          onChange={e => setCompareLocality(e.target.value)}
                          className="premium-input text-[11px] py-1 px-2.5 rounded-lg border-slate-200 bg-white dark:bg-slate-900 cursor-pointer"
                        >
                          <option value="">-- Choose Locality --</option>
                          {[
                            'gachibowli', 'hitech city', 'kondapur', 'madhapur', 'kokapet', 
                            'narsingi', 'financial district', 'manikonda', 'jubilee hills', 
                            'banjara hills', 'kukatpally', 'miyapur', 'lb nagar', 'uppal', 'kompally'
                          ]
                            .filter(loc => loc !== locationIntel.locality)
                            .map(loc => (
                              <option key={loc} value={loc}>
                                {loc.charAt(0).toUpperCase() + loc.slice(1)}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>

                    {/* Comparison table */}
                    {compareLocality ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-semibold text-slate-600 dark:text-slate-300">
                          <thead>
                            <tr className="border-b border-slate-150 dark:border-slate-800/80">
                              <th className="py-2 text-slate-400 text-[10px] uppercase font-bold tracking-wider">Metric Factor</th>
                              <th className="py-2 text-indigo-600 dark:text-indigo-400 capitalize">{locationIntel.locality || 'This Property'}</th>
                              <th className="py-2 text-amber-600 dark:text-amber-400 capitalize">{compareLocality}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                            {[
                              { label: 'Avg Sale Price Index', v1: locationIntel.locality === 'gachibowli' ? '₹8,500/sqft' : locationIntel.locality === 'hitech city' ? '₹9,800/sqft' : '₹7,500/sqft', v2: compareLocality === 'gachibowli' ? '₹8,500/sqft' : compareLocality === 'hitech city' ? '₹9,800/sqft' : compareLocality === 'kondapur' ? '₹7,500/sqft' : compareLocality === 'madhapur' ? '₹8,900/sqft' : '₹6,500/sqft' },
                              { label: 'Avg Monthly Rental Index', v1: locationIntel.locality === 'gachibowli' ? '₹35,000/mo' : locationIntel.locality === 'hitech city' ? '₹42,000/mo' : '₹28,000/mo', v2: compareLocality === 'gachibowli' ? '₹35,000/mo' : compareLocality === 'hitech city' ? '₹42,000/mo' : compareLocality === 'kondapur' ? '₹28,000/mo' : compareLocality === 'madhapur' ? '₹34,000/mo' : '₹22,000/mo' },
                              { label: 'Connectivity score', v1: `${locationIntel.data.locationScore?.connectivity || 88}/100`, v2: compareLocality === 'hitech city' ? '95/100' : compareLocality === 'gachibowli' ? '92/100' : '85/100' },
                              { label: 'Estimated Rental Yield', v1: `${locationIntel.data.investment?.rentalYield || 4.5}%`, v2: compareLocality === 'hitech city' ? '5.2%' : compareLocality === 'gachibowli' ? '4.8%' : '4.2%' },
                              { label: 'Growth Potential Class', v1: locationIntel.data.investment?.appreciationPotential || 'High', v2: compareLocality === 'hitech city' ? 'Very High' : compareLocality === 'gachibowli' ? 'High' : 'Moderate' },
                              { label: 'Overall Safety index', v1: `${locationIntel.data.safetyIndex?.safetyScore || 85}%`, v2: compareLocality === 'hitech city' ? '90%' : compareLocality === 'gachibowli' ? '88%' : '82%' }
                            ].map((row, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                                <td className="py-2 text-[11px] font-bold text-slate-500">{row.label}</td>
                                <td className="py-2 font-black text-slate-800 dark:text-slate-200">{row.v1}</td>
                                <td className="py-2 font-black text-slate-850 dark:text-slate-150">{row.v2}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-10 text-xs text-slate-400 font-semibold border border-dashed border-slate-200/50 dark:border-slate-850 rounded-2xl bg-slate-50/20">
                        Select a neighborhood from the dropdown list to run a side-by-side location matrix comparison.
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          )}


          {/* NEW: PROPERTY SERVICES OFFERED */}
          <div className="glass-card p-6 rounded-3xl border border-slate-200/30 bg-white/60 dark:bg-slate-900/60 shadow-sm flex flex-col gap-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100 tracking-tight">On-Demand Property Services</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Simplify your relocation and paper trials with custom services managed by EstateAI partner network.</p>
            </div>

            {serviceSuccessMsg && (
              <div className="p-3 bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 text-xs rounded-xl text-center font-semibold">
                {serviceSuccessMsg}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name: 'Packers & Movers', desc: 'Flat rate relocation quotation' },
                { name: 'Deep Cleaning', desc: 'Pre-move sanitation check' },
                { name: 'Legal Audit & Deed', desc: 'Verification of registry docs' },
                { name: 'Vastu Consultation', desc: 'Alignment report by experts' }
              ].map((service, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleBookService(service.name)}
                  className="p-3.5 bg-slate-50/60 dark:bg-slate-950/40 hover:bg-indigo-50/50 dark:hover:bg-slate-800/40 border border-slate-300/20 dark:border-slate-800/40 rounded-2xl text-left transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <h4 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100">{service.name}</h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-normal">{service.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 3. REVIEWS & RATINGS BLOCK */}
          <div className="glass-card p-6 rounded-3xl border border-slate-200/30 bg-white/60 dark:bg-slate-900/60 shadow-sm">
            <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100 tracking-tight mb-4 flex items-center gap-2">
              Reviews & Feedback ({reviews.length})
            </h3>

            {/* Interest tracker summary banner */}
            <div className="flex items-center justify-between p-4 bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/20 rounded-2xl mb-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/10 text-amber-500 dark:text-amber-400 rounded-xl animate-pulse">
                  <Flame size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">High Location Demand</h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal font-semibold">
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{interestStats.total} buyers/tenants</span> showed active interest in this property ({interestStats.visits} visits scheduled).
                  </p>
                </div>
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                Active
              </span>
            </div>
            
            {/* Reviews list */}
            {reviews.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 font-semibold">
                No reviews yet. Be the first to leave a feedback rating!
              </div>
            ) : (
              <div className="flex flex-col gap-4 mb-8">
                {reviews.map((rev, i) => (
                  <div key={i} className="p-4 bg-slate-50/50 dark:bg-slate-950/10 rounded-2xl border border-slate-100/50 dark:border-slate-800/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={rev.author?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80'} 
                          alt="" 
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 flex-wrap">
                            {rev.author?.name}
                            {rev.interestTag && getInterestBadge(rev.interestTag) && (
                              <span className={`text-[10px] sm:text-xs font-extrabold px-2.5 py-0.5 rounded-full capitalize ${getInterestBadge(rev.interestTag).class}`}>
                                {getInterestBadge(rev.interestTag).label}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Rating stars display */}
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star 
                            key={idx} 
                            size={12} 
                            className={idx < rev.rating ? 'fill-amber-500' : 'text-slate-350 dark:text-slate-700'} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-xs leading-relaxed font-medium pl-9">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Leave a review form */}
            {user && (
              <form onSubmit={handleReviewSubmit} className="border-t border-slate-200/10 dark:border-slate-800/50 pt-6">
                <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-4">Rate This Property</h4>
                
                {reviewSuccess && (
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 text-xs rounded-xl mb-4 font-semibold text-center">
                    Review submitted successfully! Thank you.
                  </div>
                )}
                {reviewError && (
                  <div className="p-3 bg-red-100 dark:bg-red-950/20 text-red-600 text-xs rounded-xl mb-4 font-semibold text-center">
                    {reviewError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {/* Rating selection */}
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-350">Your Rating:</span>
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <button 
                          key={idx}
                          type="button"
                          onClick={() => setRating(idx + 1)}
                          className="p-1 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star size={20} className={idx < rating ? 'fill-amber-500' : 'text-slate-300 dark:text-slate-700'} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Interest Tag selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">Your Interest:</span>
                    <select 
                      value={interestTag} 
                      onChange={e => setInterestTag(e.target.value)}
                      className="premium-input text-xs sm:text-sm py-2 cursor-pointer border-slate-200 bg-white dark:bg-slate-900"
                    >
                      <option value="">Just Browsing / Feedback</option>
                      <option value="interested_buying">Interested in Buying</option>
                      <option value="interested_renting">Interested in Renting</option>
                      <option value="scheduled_visit">Scheduled a Visit</option>
                      <option value="local_resident">Local Area Resident</option>
                      <option value="inquired_loan">Inquired about Home Loan</option>
                    </select>
                  </div>
                </div>

                <div className="relative">
                  <textarea 
                    rows="3"
                    placeholder="Provide your feedback details..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    className="premium-input pr-12 min-h-[80px]"
                  ></textarea>
                  <button 
                    type="submit"
                    className="absolute right-3 bottom-3 p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>

        {/* Right 1 Column: Agent contact, Visit scheduler, Fraud audit, Chatbot */}
        <div className="flex flex-col gap-6">
          
          {/* NEW: AI FRAUD DETECTION & SAFETY CHECK */}
          <div className="glass-card p-6 rounded-3xl border border-slate-200/30 bg-white/60 dark:bg-slate-900/60 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-emerald-500" size={20} />
              <div>
                <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">AI Trust & Safety Audit</h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-x-2 gap-y-1 mt-1">
                  <span className={`font-extrabold text-[10px] sm:text-xs tracking-wider uppercase ${
                    (data.riskScore || 10) < 30 ? 'text-emerald-500' : (data.riskScore || 10) < 60 ? 'text-amber-500' : 'text-red-500'
                  }`}>
                    Risk Score: {data.riskScore || 10}/100 ({
                      (data.riskScore || 10) < 30 ? 'Low Risk' : (data.riskScore || 10) < 60 ? 'Medium Risk' : 'High Risk'
                    })
                  </span>
                  <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>
                  <span className="font-extrabold text-[10px] sm:text-xs text-indigo-500 uppercase tracking-wider">
                    Confidence: {data.verificationConfidenceScore !== undefined ? data.verificationConfidenceScore : 20}%
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              {[
                { title: 'Verified Seller Credentials', details: data.seller?.verificationStatus === 'verified' ? 'Approved (ID & photo matched)' : 'Self-declared seller account' },
                { title: 'Price Index Evaluation', details: 'Within standard historical market range' },
                { title: 'Ownership & Legal Records', details: data.verificationStatus === 'verified' ? 'Ownership deeds certified by Admin' : 'Documents under review or pending upload' },
                { title: 'Government Filings Check', details: (data.agent || data.seller)?.agentLicense ? `License code: ${(data.agent || data.seller).agentLicense}` : 'Direct Owner Listing' }
              ].map((item, idx) => {
                const isApproved = item.details.includes('Approved') || item.details.includes('certified') || item.details.includes('Within') || item.details.includes('License');
                return (
                  <div key={idx} className="flex gap-2.5 p-2 bg-slate-100/40 dark:bg-slate-950/30 rounded-xl">
                    {isApproved ? (
                      <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.title}</h4>
                      <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-normal mt-0.5">{item.details}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. AGENT CARD */}
          <div className="glass-card p-6 rounded-3xl text-center border border-slate-200/30 bg-white/60 dark:bg-slate-900/60 shadow-sm">
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-4">Property Manager</h3>
            <img 
              src={(data.agent || data.seller)?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80'} 
              alt="" 
              className="w-20 h-20 rounded-2xl object-cover mx-auto ring-4 ring-indigo-500/20 mb-3"
            />
            <h4 className="font-bold text-base text-slate-800 dark:text-slate-100">{(data.agent || data.seller)?.name}</h4>
            <span className="text-xs text-slate-400 capitalize font-medium">{(data.agent || data.seller)?.role} Manager</span>
            
            {data.agent?.isVerifiedAgent && (
              <span className="block mt-1 text-[11px] sm:text-xs font-extrabold text-emerald-500 uppercase tracking-wider">
                ✓ Verified Agent
              </span>
            )}

            <button 
              onClick={handleContactManager}
              className="btn-primary w-full mt-6 py-3 cursor-pointer text-xs font-bold"
            >
              <MessageSquare size={16} /> Contact Manager
            </button>
          </div>

          {/* NEW: NEIGHBORHOOD AI CHATBOT */}
          <div className="glass-card p-5 rounded-3xl border border-slate-200/30 bg-white/60 dark:bg-slate-900/60 shadow-sm flex flex-col h-[380px] overflow-hidden">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 flex-shrink-0">
              <Sparkles size={16} className="text-indigo-500 animate-pulse" />
              <div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Neighborhood AI Helper</h4>
                <p className="text-[11px] text-slate-400 font-semibold">Instant location Q&A advisor</p>
              </div>
            </div>

            {/* Chat message threads */}
            <div className="flex-grow overflow-y-auto py-3 pr-1 chat-scrollbar flex flex-col gap-2">
              {localChatMessages.map((msg, index) => (
                <div 
                  key={index}
                  className={`flex gap-1.5 max-w-[85%] ${msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
                >
                  <div className={`p-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed font-semibold whitespace-pre-wrap ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-50/80 dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-tl-none border border-slate-200/10 dark:border-slate-800/10'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {localChatLoading && (
                <div className="bg-slate-50/80 dark:bg-slate-900 p-2.5 rounded-2xl rounded-tl-none self-start max-w-[85%] border border-slate-200/10 dark:border-slate-800/10 flex items-center gap-1">
                  <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Action Suggestion Chips */}
            <div className="flex gap-1.5 overflow-x-auto pb-2 select-none flex-shrink-0 scrollbar-none text-[11px] sm:text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <button 
                onClick={() => handleLocalChatSend('Is this area safe at night?')}
                className="px-2.5 py-1 bg-indigo-50/60 dark:bg-indigo-950/30 hover:bg-indigo-100 border border-indigo-200/20 rounded-lg cursor-pointer whitespace-nowrap"
              >
                Safety?
              </button>
              <button 
                onClick={() => handleLocalChatSend('How is the water supply?')}
                className="px-2.5 py-1 bg-indigo-50/60 dark:bg-indigo-950/30 hover:bg-indigo-100 border border-indigo-200/20 rounded-lg cursor-pointer whitespace-nowrap"
              >
                Water/Power?
              </button>
              <button 
                onClick={() => handleLocalChatSend('What are the transit options?')}
                className="px-2.5 py-1 bg-indigo-50/60 dark:bg-indigo-950/30 hover:bg-indigo-100 border border-indigo-200/20 rounded-lg cursor-pointer whitespace-nowrap"
              >
                Transit?
              </button>
            </div>

            {/* Input Form */}
            <form 
              onSubmit={e => { e.preventDefault(); handleLocalChatSend(); }}
              className="relative mt-1 flex-shrink-0"
            >
              <input 
                type="text"
                placeholder="Ask about water, security, metro..."
                value={localInput}
                onChange={e => setLocalInput(e.target.value)}
                disabled={localChatLoading}
                className="premium-input text-xs sm:text-sm pr-10 py-2.5 rounded-2xl"
              />
              <button 
                type="submit"
                disabled={localChatLoading || !localInput.trim()}
                className="absolute right-1.5 top-1.5 p-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl shadow-md cursor-pointer"
              >
                <Send size={10} />
              </button>
            </form>
          </div>

          {/* 5. VISIT SCHEDULER */}
          <div className="glass-card p-6 rounded-3xl border border-slate-200/30 bg-white/60 dark:bg-slate-900/60 shadow-sm">
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-4 text-center">Schedule a Visit</h3>
            
            {bookingSuccess && (
              <div className="p-4 bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 text-xs rounded-2xl text-center mb-4 font-semibold">
                🎉 Visit request submitted! The manager will notify you upon confirmation.
              </div>
            )}
            {bookingError && (
              <div className="p-3 bg-red-100 dark:bg-red-950/20 text-red-600 text-xs rounded-xl mb-4 font-semibold">
                {bookingError}
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="flex flex-col gap-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Date</label>
                <div className="relative">
                  <input 
                    type="date"
                    required
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="premium-input pl-10 cursor-pointer text-xs sm:text-sm"
                  />
                  <Calendar className="absolute left-3 top-3 text-slate-400" size={14} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Time</label>
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="e.g. 11:30 AM or 3:00 PM"
                    required
                    value={visitTime}
                    onChange={(e) => setVisitTime(e.target.value)}
                    className="premium-input pl-10 text-xs sm:text-sm"
                  />
                  <Clock className="absolute left-3 top-3.5 text-slate-400" size={14} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Custom Notes (Optional)</label>
                <textarea 
                  placeholder="e.g. Prefer weekend slot, or have questions on area..."
                  rows="3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="premium-input text-xs sm:text-sm"
                ></textarea>
              </div>

              <button 
                type="submit"
                className="btn-primary w-full py-3 cursor-pointer text-xs sm:text-sm font-bold"
              >
                Schedule Visit Request
              </button>
            </form>
          </div>

        </div>

      </div>

      {/* 6. SIMILAR PROPERTIES ROW */}
      {similar.length > 0 && (
        <div className="border-t border-slate-200/50 dark:border-slate-800/40 pt-12 mt-16">
          <h2 className="font-extrabold text-xl text-slate-800 dark:text-slate-100 mb-6 tracking-tight">
            Similar Listings You May Interest
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {similar.slice(0, 3).map(p => (
              <PropertyCard 
                key={p._id} 
                property={p} 
                onViewDetails={onSelectProperty}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
