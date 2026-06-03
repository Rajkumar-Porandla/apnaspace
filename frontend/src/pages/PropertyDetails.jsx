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
  Flame
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
      const res = await axios.post('/bookings', {
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
                    <img src={img} alt="" className="w-full h-full object-cover" />
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

          {/* NEW: NEARBY SUGGESTIONS & DELIVERY STATUS */}
          {nearby && (
            <div className="glass-card p-6 rounded-3xl border border-slate-200/30 bg-white/60 dark:bg-slate-900/60 shadow-sm flex flex-col gap-6">
              <div>
                <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100 tracking-tight">Location & Neighborhood Insights</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Explore transit, facilities, and direct coverage distances verified by local experts.</p>
              </div>

              {/* Delivery Services Banner */}
              <div className="flex items-center gap-3 p-4 bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200/20 dark:border-indigo-900/10 rounded-2xl">
                <div className="p-2.5 bg-indigo-600 text-white rounded-xl">
                  <Truck size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Doorstep Delivery Coverage</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-semibold">
                    {nearby.delivery.available ? '✓ Zomato, Swiggy, Zepto & Blinkit Active' : '⚠ Limited Coverage'} • <span className="font-bold text-indigo-600 dark:text-indigo-400">{nearby.delivery.speed}</span>
                  </p>
                </div>
              </div>

              {/* Nearby Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Schools */}
                <div className="p-4 bg-slate-50/50 dark:bg-slate-950/15 border border-slate-200/10 rounded-2xl flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                    <School size={14} /> Schools
                  </div>
                  <div className="flex flex-col gap-2">
                    {nearby.schools.map((item, idx) => (
                      <div key={idx} className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 flex justify-between gap-2">
                        <span className="truncate">{item.name}</span>
                        <span className="text-slate-500 dark:text-slate-400 flex-shrink-0">{item.distance}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hospitals */}
                <div className="p-4 bg-slate-50/50 dark:bg-slate-950/15 border border-slate-200/10 rounded-2xl flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-sm">
                    <Hospital size={14} /> Healthcare
                  </div>
                  <div className="flex flex-col gap-2">
                    {nearby.hospitals.map((item, idx) => (
                      <div key={idx} className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 flex justify-between gap-2">
                        <span className="truncate">{item.name}</span>
                        <span className="text-slate-500 dark:text-slate-400 flex-shrink-0">{item.distance}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Malls / Markets */}
                <div className="p-4 bg-slate-50/50 dark:bg-slate-950/15 border border-slate-200/10 rounded-2xl flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
                    <ShoppingBag size={14} /> Markets & Malls
                  </div>
                  <div className="flex flex-col gap-2">
                    {nearby.malls.map((item, idx) => (
                      <div key={idx} className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 flex justify-between gap-2">
                        <span className="truncate">{item.name}</span>
                        <span className="text-slate-500 dark:text-slate-400 flex-shrink-0">{item.distance}</span>
                      </div>
                    ))}
                  </div>
                </div>
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
                <span className="block text-emerald-500 font-extrabold text-xs tracking-wider mt-1">✓ Passed (96% Trust Index)</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              {[
                { title: 'Verified Seller Credentials', details: 'Owner ID & photo matched' },
                { title: 'Price Index Evaluation', details: 'Matches area average' },
                { title: 'Government RERA Filing', details: 'RERA documents verified' },
                { title: 'AI Legal Title Search', details: 'No active lien or mortgage' }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-2.5 p-2 bg-slate-100/40 dark:bg-slate-950/30 rounded-xl">
                  <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.title}</h4>
                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-normal mt-0.5">{item.details}</p>
                  </div>
                </div>
              ))}
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
