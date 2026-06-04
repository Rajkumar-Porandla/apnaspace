import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { 
  Building, Calendar, UserCheck, ShieldAlert, Plus, Check, X, 
  Sparkles, TrendingUp, BarChart3, Users, DollarSign, Edit, Trash2,
  FileText, Share2, Compass, BadgeInfo
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function Dashboard({ onViewProperty, onEditProperty, setCurrentTab }) {
  const { user, toggleSaveProperty, updateProfile } = useAuth();
  const { setActiveChat } = useChat();

  const [activeTab, setActiveTab] = useState('');
  const [bookings, setBookings] = useState([]);
  const [myProperties, setMyProperties] = useState([]);
  
  // Admin Specific
  const [adminMetrics, setAdminMetrics] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminListings, setAdminListings] = useState([]);

  // AI Description Generator Form
  const [aiType, setAiType] = useState('apartment');
  const [aiLocation, setAiLocation] = useState('');
  const [aiSize, setAiSize] = useState('');
  const [aiAmenities, setAiAmenities] = useState('');
  const [aiListingType, setAiListingType] = useState('sale');
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // AI Market Insights State
  const [insightCity, setInsightCity] = useState('delhi');
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  // Create/Edit Listing Form Modal
  const [showAddForm, setShowAddForm] = useState(false);
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [editId, setEditId] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formType, setFormType] = useState('apartment');
  const [formBedrooms, setFormBedrooms] = useState('2');
  const [formBathrooms, setFormBathrooms] = useState('2');
  const [formArea, setFormArea] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formState, setFormState] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formAmenities, setFormAmenities] = useState('');
  const [formImages, setFormImages] = useState(null); // File list
  const [formListingType, setFormListingType] = useState('sale');
  const [formFurnishing, setFormFurnishing] = useState('');
  const [formTenants, setFormTenants] = useState('');
  
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Profile Form States
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileAvatar, setProfileAvatar] = useState(user?.avatar || '');
  const [profileLicense, setProfileLicense] = useState(user?.agentLicense || '');
  const [profileSuccess, setProfileSuccess] = useState('');

  useEffect(() => {
    if (user) {
      // Set default tab based on user role
      if (user.role === 'buyer') {
        setActiveTab('visits');
        fetchBookings();
      } else if (user.role === 'seller' || user.role === 'agent') {
        setActiveTab('listings');
        fetchMyListings();
        fetchBookings();
      } else if (user.role === 'admin') {
        setActiveTab('admin-stats');
        fetchAdminData();
      }
    }
  }, [user]);

  // Fetch bookings scheduled with or by the user
  const fetchBookings = async () => {
    try {
      const res = await axios.get('/bookings');
      if (res.data.success) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      console.error('Bookings load error:', err.message);
    }
  };

  // Fetch properties listed by seller/agent
  const fetchMyListings = async () => {
    try {
      const url = user?.role === 'agent'
        ? `/properties?agent=${user._id}&limit=100`
        : `/properties?seller=${user._id}&limit=100`;
      const res = await axios.get(url);
      if (res.data.success) {
        setMyProperties(res.data.properties);
      }
    } catch (err) {
      console.error('My listings load error:', err.message);
    }
  };

  // Admin Data Pull
  const fetchAdminData = async () => {
    try {
      const metricsRes = await axios.get('/admin/metrics');
      if (metricsRes.data.success) {
        setAdminMetrics(metricsRes.data.metrics);
      }
      const usersRes = await axios.get('/admin/users');
      if (usersRes.data.success) {
        setAdminUsers(usersRes.data.users);
      }
      const listingsRes = await axios.get('/admin/listings');
      if (listingsRes.data.success) {
        setAdminListings(listingsRes.data.properties);
      }
    } catch (err) {
      console.error('Admin analytics load error:', err.message);
    }
  };

  // Booking approvals
  const handleBookingStatus = async (id, status) => {
    try {
      const res = await axios.put(`/bookings/${id}`, { status });
      if (res.data.success) {
        // Refresh bookings lists
        fetchBookings();
        if (status === 'approved') {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.8 }
          });
        }
      }
    } catch (err) {
      alert('Error updating booking status: ' + err.message);
    }
  };

  // Property listings creation and edit
  const handlePropertySubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setFormLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', formTitle);
      formData.append('description', formDescription);
      formData.append('price', Number(formPrice));
      formData.append('propertyType', formType);
      formData.append('bedrooms', Number(formBedrooms));
      formData.append('bathrooms', Number(formBathrooms));
      formData.append('area', Number(formArea));
      formData.append('city', formCity.toLowerCase().trim());
      formData.append('state', formState.toLowerCase().trim());
      formData.append('address', formAddress);
      formData.append('listingType', formListingType);
      formData.append('furnishing', formFurnishing);
      formData.append('tenants', formTenants);
      
      const amenitiesList = formAmenities.split(',').map(a => a.trim()).filter(a => a.length > 0);
      formData.append('amenities', JSON.stringify(amenitiesList));

      if (formImages && formImages.length > 0) {
        for (let i = 0; i < formImages.length; i++) {
          formData.append('images', formImages[i]);
        }
      }

      let res;
      if (formMode === 'add') {
        res = await axios.post('/properties', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await axios.put(`/properties/${editId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (res.data.success) {
        setFormSuccess(`Property listing ${formMode === 'add' ? 'created' : 'updated'} successfully!`);
        // Reset fields
        resetFormFields();
        setShowAddForm(false);
        fetchMyListings();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to submit property listing.');
    } finally {
      setFormLoading(false);
    }
  };

  const resetFormFields = () => {
    setFormTitle('');
    setFormDescription('');
    setFormPrice('');
    setFormType('apartment');
    setFormBedrooms('2');
    setFormBathrooms('2');
    setFormArea('');
    setFormCity('');
    setFormState('');
    setFormAddress('');
    setFormAmenities('');
    setFormImages(null);
    setFormListingType('sale');
    setFormFurnishing('');
    setFormTenants('');
    setEditId(null);
    setAiResult(null);
  };

  const triggerEditListing = (prop) => {
    setFormMode('edit');
    setEditId(prop._id);
    setFormTitle(prop.title);
    setFormDescription(prop.description);
    setFormPrice(prop.price);
    setFormType(prop.propertyType);
    setFormBedrooms(prop.bedrooms?.toString() || '0');
    setFormBathrooms(prop.bathrooms?.toString() || '0');
    setFormArea(prop.area?.toString());
    setFormCity(prop.city);
    setFormState(prop.state);
    setFormAddress(prop.address);
    setFormAmenities(prop.amenities?.join(', ') || '');
    setFormListingType(prop.listingType || 'sale');
    setFormFurnishing(prop.furnishing || '');
    setFormTenants(prop.tenants || '');
    setShowAddForm(true);
  };

  const handleDeleteListing = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing? This action is permanent.')) return;
    try {
      const res = await axios.delete(`/properties/${id}`);
      if (res.data.success) {
        fetchMyListings();
      }
    } catch (err) {
      alert('Delete error: ' + err.message);
    }
  };

  // AI Description Generator Execution
  const triggerAiGenerator = async () => {
    if (!aiLocation || !aiSize) {
      alert('Type, Location and Size are required to generate descriptions.');
      return;
    }
    setAiLoading(true);
    setAiResult(null);
    try {
      const listAmenities = aiAmenities.split(',').map(a => a.trim()).filter(a => a.length > 0);
      const res = await axios.post('/ai/generate-description', {
        propertyType: aiType,
        location: aiLocation,
        size: Number(aiSize),
        amenities: listAmenities,
        listingType: aiListingType
      });

      if (res.data.success) {
        setAiResult(res.data.descriptions);
      }
    } catch (err) {
      alert('AI Generation error: ' + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const applyGeneratedDescription = () => {
    if (!aiResult) return;
    setFormTitle(`Premium ${aiType.charAt(0).toUpperCase() + aiType.slice(1)} in ${aiLocation}`);
    setFormDescription(aiResult.marketingDescription);
    setFormAmenities(aiAmenities);
    setFormArea(aiSize);
    // Autofill city
    setFormCity(aiLocation.split(',')[0].trim());
    setFormAddress(aiLocation);
    setFormListingType(aiListingType);
    setAiResult(null);
  };

  // AI Market Insights Puller
  const triggerMarketInsights = async () => {
    setInsightsLoading(true);
    setInsights(null);
    try {
      const res = await axios.get(`/ai/market-insights?city=${insightCity}`);
      if (res.data.success) {
        setInsights(res.data.insights);
      }
    } catch (err) {
      alert('Insights error: ' + err.message);
    } finally {
      setInsightsLoading(false);
    }
  };

  // Admin approval togglers
  const handleAdminVerifyUser = async (id, status) => {
    try {
      const res = await axios.put(`/admin/users/${id}`, { isVerifiedAgent: status });
      if (res.data.success) {
        fetchAdminData();
      }
    } catch (err) {
      alert('Verification error: ' + err.message);
    }
  };

  const handleAdminDeleteUser = async (id) => {
    if (!window.confirm('Delete user and all their listings? This cannot be undone.')) return;
    try {
      const res = await axios.delete(`/admin/users/${id}`);
      if (res.data.success) {
        fetchAdminData();
      }
    } catch (err) {
      alert('Error deleting user: ' + err.message);
    }
  };

  const handleAdminListingStatus = async (id, status) => {
    try {
      const res = await axios.put(`/admin/listings/${id}/status`, { status });
      if (res.data.success) {
        fetchAdminData();
      }
    } catch (err) {
      alert('Listing moderation error: ' + err.message);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    const res = await updateProfile({
      name: profileName,
      avatar: profileAvatar,
      agentLicense: profileLicense
    });
    if (res.success) {
      setProfileSuccess('Profile updated successfully!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      
      {/* 1. LAYOUT SIDEBAR AND TABS MENU */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Nav Control */}
        <div className="lg:col-span-1 flex flex-col gap-2">
          
          <div className="glass-card p-4 rounded-3xl mb-4 text-center sm:text-left flex items-center sm:items-start lg:flex-col gap-4">
            <img 
              src={user?.avatar} 
              alt={user?.name} 
              className="w-14 h-14 rounded-2xl object-cover ring-4 ring-indigo-500/20"
            />
            <div>
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 leading-tight">{user?.name}</h3>
              <span className="text-xs text-indigo-500 capitalize font-semibold tracking-wider block mt-1">{user?.role} Portal</span>
            </div>
          </div>

          <div className="flex lg:flex-col flex-wrap gap-1">
            {/* Buyer Specific */}
            {user?.role === 'buyer' && (
              <>
                <button 
                  onClick={() => setActiveTab('visits')}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium text-xs transition-colors flex items-center gap-2 ${activeTab === 'visits' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'}`}
                >
                  <Calendar size={16} /> My Scheduled Visits
                </button>
                <button 
                  onClick={() => setActiveTab('wishlist')}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium text-xs transition-colors flex items-center gap-2 ${activeTab === 'wishlist' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'}`}
                >
                  <Compass size={16} /> Property Wishlist
                </button>
              </>
            )}

            {/* Seller/Agent Specific */}
            {(user?.role === 'seller' || user?.role === 'agent') && (
              <>
                <button 
                  onClick={() => { setActiveTab('listings'); fetchMyListings(); }}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium text-xs transition-colors flex items-center gap-2 ${activeTab === 'listings' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'}`}
                >
                  <Building size={16} /> Manage Listings
                </button>
                <button 
                  onClick={() => { setActiveTab('visits-host'); fetchBookings(); }}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium text-xs transition-colors flex items-center gap-2 ${activeTab === 'visits-host' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'}`}
                >
                  <Calendar size={16} /> Client Visits Requests
                </button>
                <button 
                  onClick={() => setActiveTab('ai-desc-gen')}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium text-xs transition-colors flex items-center gap-2 ${activeTab === 'ai-desc-gen' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'}`}
                >
                  <Sparkles size={16} /> AI Desc Generator
                </button>
                <button 
                  onClick={() => { setActiveTab('ai-insights'); triggerMarketInsights(); }}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium text-xs transition-colors flex items-center gap-2 ${activeTab === 'ai-insights' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'}`}
                >
                  <TrendingUp size={16} /> AI Market Insights
                </button>
              </>
            )}

            {/* Admin Specific */}
            {user?.role === 'admin' && (
              <>
                <button 
                  onClick={() => { setActiveTab('admin-stats'); fetchAdminData(); }}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium text-xs transition-colors flex items-center gap-2 ${activeTab === 'admin-stats' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'}`}
                >
                  <BarChart3 size={16} /> System Metrics
                </button>
                <button 
                  onClick={() => { setActiveTab('admin-users'); fetchAdminData(); }}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium text-xs transition-colors flex items-center gap-2 ${activeTab === 'admin-users' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'}`}
                >
                  <Users size={16} /> Moderate Accounts
                </button>
                <button 
                  onClick={() => { setActiveTab('admin-listings'); fetchAdminData(); }}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium text-xs transition-colors flex items-center gap-2 ${activeTab === 'admin-listings' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'}`}
                >
                  <Building size={16} /> Moderate Listings
                </button>
              </>
            )}

            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left px-4 py-3 rounded-xl font-medium text-xs transition-colors flex items-center gap-2 ${activeTab === 'profile' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'}`}
            >
              <UserCheck size={16} /> Edit Profile Info
            </button>
          </div>
        </div>

        {/* Right 3 Columns: Active Tab Panel */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {/* TAB 1: BUYER VISIT BOOKINGS */}
          {activeTab === 'visits' && (
            <div className="glass-card p-6 rounded-3xl">
              <h2 className="font-extrabold text-lg text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                <Calendar /> My Scheduled Visits
              </h2>
              {bookings.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  You have not scheduled any visits yet. Go to Discover to find listings.
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {bookings.map(b => (
                    <div key={b._id} className="p-4 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/35 dark:border-slate-800/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h4 
                          onClick={() => onViewProperty(b.property?._id)}
                          className="font-bold text-sm text-slate-800 dark:text-slate-200 hover:text-indigo-500 cursor-pointer transition-colors"
                        >
                          {b.property?.title}
                        </h4>
                        <div className="text-xs text-slate-400 mt-1">
                          Date: {new Date(b.visitDate).toDateString()} | Time slot: {b.visitTime}
                        </div>
                        <div className="text-xs text-slate-400 mt-1 capitalize">
                          Listing Host: {b.sellerOrAgent?.name}
                        </div>
                      </div>
                      
                      {/* Booking status badge */}
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                        b.status === 'approved' 
                          ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                          : b.status === 'rejected'
                          ? 'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400'
                          : 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                      }`}>
                        {b.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: BUYER WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="glass-card p-6 rounded-3xl">
              <h2 className="font-extrabold text-lg text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                <Compass /> Property Wishlist
              </h2>
              {user?.savedProperties?.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  Your saved listings wishlist is currently empty.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user?.savedProperties?.map(p => (
                    <div key={p._id} className="p-4 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/35 dark:border-slate-800/30 rounded-2xl flex gap-3 relative">
                      <img src={p.images?.[0]} className="w-20 h-16 rounded-xl object-cover flex-shrink-0" />
                      <div className="min-w-0 flex-grow">
                        <h4 
                          onClick={() => onViewProperty(p._id)} 
                          className="font-bold text-xs truncate cursor-pointer hover:text-indigo-500"
                        >
                          {p.title}
                        </h4>
                        <div className="text-[10px] text-slate-400 capitalize mt-0.5">{p.city}, {p.state}</div>
                        <div className="text-xs font-bold text-indigo-500 mt-1">
                          ₹{p.price >= 10000000 ? `${(p.price / 10000000).toFixed(2)} Cr` : `${(p.price / 100000).toFixed(0)} Lakh`}
                        </div>
                      </div>
                      <button 
                        onClick={() => toggleSaveProperty(p._id)}
                        className="absolute top-2 right-2 text-slate-400 hover:text-red-500 p-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SELLER/AGENT LISTINGS */}
          {activeTab === 'listings' && (
            <div className="glass-card p-6 rounded-3xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-extrabold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Building /> My Listed Properties
                </h2>
                <button 
                  onClick={() => { setFormMode('add'); resetFormFields(); setShowAddForm(true); }}
                  className="btn-primary flex items-center gap-1 py-2"
                >
                  <Plus size={14} /> Add Property
                </button>
              </div>

              {myProperties.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  You have not created any property listings yet. Click 'Add Property' to get started.
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {myProperties.map(p => (
                    <div key={p._id} className="p-4 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/35 dark:border-slate-800/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex gap-3">
                        <img src={p.images[0]} className="w-16 h-12 rounded-lg object-cover flex-shrink-0" />
                        <div>
                          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{p.title}</h4>
                          <span className="text-[10px] text-slate-400 capitalize">{p.propertyType} | {p.city}</span>
                          <span className={`ml-2 px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                            p.status === 'available' ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600' : 'bg-slate-100 text-slate-500'
                          }`}>{p.status}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button 
                          onClick={() => triggerEditListing(p)}
                          className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 hover:text-indigo-500 rounded-xl transition-colors"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteListing(p._id)}
                          className="p-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 dark:bg-slate-800 rounded-xl transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SELLER/AGENT BOOKING VISITS HOST */}
          {activeTab === 'visits-host' && (
            <div className="glass-card p-6 rounded-3xl">
              <h2 className="font-extrabold text-lg text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                <Calendar /> Scheduled Client Visit Requests
              </h2>
              {bookings.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  No client visit requests scheduled yet.
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {bookings.map(b => (
                    <div key={b._id} className="p-4 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/35 dark:border-slate-800/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                          {b.property?.title}
                        </h4>
                        <div className="text-xs text-slate-400 mt-1">
                          Date: {new Date(b.visitDate).toDateString()} | Time: {b.visitTime}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          Scheduled by client: <span className="font-semibold">{b.buyer?.name}</span> ({b.buyer?.email})
                        </div>
                        {b.notes && (
                          <div className="text-xs text-indigo-500/70 mt-2 bg-indigo-50/20 p-2 rounded-lg italic">
                            "{b.notes}"
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {b.status === 'pending' ? (
                          <>
                            <button 
                              onClick={() => handleBookingStatus(b._id, 'rejected')}
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                            >
                              <X size={12} /> Reject
                            </button>
                            <button 
                              onClick={() => handleBookingStatus(b._id, 'approved')}
                              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                            >
                              <Check size={12} /> Approve
                            </button>
                          </>
                        ) : (
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                            b.status === 'approved' 
                              ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                              : 'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400'
                          }`}>
                            {b.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: AI DESCRIPTION GENERATOR */}
          {activeTab === 'ai-desc-gen' && (
            <div className="glass-card p-6 rounded-3xl">
              <h2 className="font-extrabold text-lg text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
                <Sparkles className="text-indigo-500 animate-pulse" /> AI Property Description Generator
              </h2>
              <p className="text-xs text-slate-400 mb-6">Enter specifications of the property to generate SEO descriptions, marketing copies, and social media captions using Gemini LLM.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                
                {/* Form Column */}
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Property Type</label>
                      <select value={aiType} onChange={(e) => setAiType(e.target.value)} className="premium-input">
                        <option value="apartment">Apartment</option>
                        <option value="house">House</option>
                        <option value="villa">Villa</option>
                        <option value="plot">Plot / Land</option>
                        <option value="commercial">Commercial</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Listing Purpose</label>
                      <select value={aiListingType} onChange={(e) => setAiListingType(e.target.value)} className="premium-input">
                        <option value="sale">For Sale (Buy)</option>
                        <option value="rent">For Rent</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Location Address</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Carter Road, Bandra West, Mumbai"
                      value={aiLocation}
                      onChange={(e) => setAiLocation(e.target.value)}
                      className="premium-input"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Area Size (sq ft)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 1500"
                      value={aiSize}
                      onChange={(e) => setAiSize(e.target.value)}
                      className="premium-input"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Amenities (comma-separated)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Sea View, Gym, Security, Pool"
                      value={aiAmenities}
                      onChange={(e) => setAiAmenities(e.target.value)}
                      className="premium-input"
                    />
                  </div>

                  <button 
                    onClick={triggerAiGenerator}
                    disabled={aiLoading}
                    className="btn-primary py-3"
                  >
                    {aiLoading ? 'AI Generating text...' : 'Generate AI Listings Content'}
                  </button>
                </div>

                {/* Output Display Column */}
                <div className="border border-slate-200/50 dark:border-slate-800/40 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 min-h-[300px] flex flex-col justify-center">
                  {!aiResult && !aiLoading ? (
                    <div className="text-center text-xs text-slate-400">
                      Submit inputs to populate AI generator results here.
                    </div>
                  ) : aiLoading ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
                      <span className="text-slate-400 text-xs font-semibold">Gemini AI generating copies...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 text-xs">
                      <div>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 mb-1"><FileText size={12} /> SEO Optimized Description</span>
                        <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-100 max-h-24 overflow-y-auto chat-scrollbar truncate text-[11px]" dangerouslySetInnerHTML={{ __html: aiResult.seoDescription }}></div>
                      </div>
                      <div>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 mb-1"><Compass size={12} /> Marketing Copy Description</span>
                        <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-100 max-h-28 overflow-y-auto chat-scrollbar text-[11px]">{aiResult.marketingDescription}</div>
                      </div>
                      <div>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 mb-1"><Share2 size={12} /> Social Media Captions</span>
                        <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-100 max-h-20 overflow-y-auto chat-scrollbar text-[10px] whitespace-pre-line">{aiResult.socialMediaCaption}</div>
                      </div>
                      <button 
                        onClick={() => {
                          applyGeneratedDescription();
                          setShowAddForm(true);
                          setFormMode('add');
                          alert('Autofilled into property adding form! Form opened.');
                        }}
                        className="btn-primary w-full py-2.5 mt-2"
                      >
                        Apply description & Add Property
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 6: AI MARKET INSIGHTS */}
          {activeTab === 'ai-insights' && (
            <div className="glass-card p-6 rounded-3xl">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                <div>
                  <h2 className="font-extrabold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <TrendingUp className="text-indigo-500" /> AI Real Estate Market Analytics
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Pricing trends, demand levels, and growth forecasts.</p>
                </div>

                <div className="flex items-center gap-2">
                  <select 
                    value={insightCity}
                    onChange={(e) => setInsightCity(e.target.value)}
                    className="premium-input w-36 py-2"
                  >
                    <option value="delhi">Delhi / NCR</option>
                    <option value="mumbai">Mumbai</option>
                    <option value="bangalore">Bangalore</option>
                  </select>
                  <button 
                    onClick={triggerMarketInsights}
                    disabled={insightsLoading}
                    className="btn-primary py-2.5 px-4"
                  >
                    Refresh
                  </button>
                </div>
              </div>

              {insightsLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="w-8 h-8 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
                  <span className="text-slate-400 text-xs font-semibold">Gemini AI pulling analytics charts...</span>
                </div>
              ) : insights ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Stats Column */}
                  <div className="md:col-span-1 flex flex-col gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-950/20 rounded-2xl border border-slate-100 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Average Pricing</span>
                      <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1 block">{insights.averagePrice}</span>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-950/20 rounded-2xl border border-slate-100 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Annual growth</span>
                      <span className="text-xl font-black text-emerald-500 mt-1 block">{insights.priceChange}</span>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-950/20 rounded-2xl border border-slate-100 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Demand index</span>
                      <span className="text-xl font-black text-amber-500 mt-1 block">{insights.demandLevel}</span>
                    </div>
                  </div>

                  {/* Trends Chart & Text Advisory Column */}
                  <div className="md:col-span-2 flex flex-col gap-4">
                    
                    {/* Simplified CSS Chart */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-950/10 border border-slate-200/50 rounded-2xl">
                      <h4 className="font-bold text-xs text-slate-400 mb-6 flex items-center gap-1"><BarChart3 size={12} /> Pricing trends (last 5 quarters)</h4>
                      <div className="flex items-end justify-between gap-2 h-24 pt-4 px-2">
                        {insights.chartData?.map((item, index) => {
                          const maxPrice = Math.max(...insights.chartData.map(c => c.price));
                          const heightPct = (item.price / maxPrice) * 100;
                          return (
                            <div key={index} className="flex flex-col items-center flex-grow">
                              <span className="text-[9px] font-bold text-indigo-500 mb-1">₹{item.price}</span>
                              <div 
                                style={{ height: `${heightPct}%` }}
                                className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-md hover:from-indigo-500 hover:to-indigo-300 transition-all max-w-[30px]"
                              ></div>
                              <span className="text-[9px] text-slate-400 mt-2 font-semibold">{item.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* AI Advisory Summary */}
                    <div className="p-5 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30 rounded-2xl">
                      <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5"><BadgeInfo size={14} /> AI Investment Advisory Summary</span>
                      <div className="text-xs text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                        {insights.marketSummary || insights.investmentSuggestions}
                      </div>
                      {insights.riskAssessment && (
                        <div className="text-[11px] text-red-500 dark:text-red-400 mt-3 border-t border-slate-200/30 pt-3">
                          <span className="font-bold">Risk Assessment:</span> {insights.riskAssessment}
                        </div>
                      )}
                      {insights.investmentRating && (
                        <div className="mt-3 flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-500">Buy/Sell Rating:</span>
                          <span className="px-2 py-0.5 bg-indigo-600 text-white rounded text-[10px] font-extrabold uppercase">{insights.investmentRating}</span>
                        </div>
                      )}
                    </div>

                  </div>

                </div>
              ) : (
                <div className="text-center py-12 text-xs text-slate-400">
                  Click refresh to calculate insights charts.
                </div>
              )}
            </div>
          )}

          {/* TAB 7: ADMIN METRICS */}
          {activeTab === 'admin-stats' && adminMetrics && (
            <div className="flex flex-col gap-6">
              
              {/* Dashboard Metric Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="glass-card p-5 text-center">
                  <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl w-fit mx-auto mb-3"><Users size={20} /></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Users</span>
                  <span className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1 block">{adminMetrics.totalUsers}</span>
                </div>
                <div className="glass-card p-5 text-center">
                  <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl w-fit mx-auto mb-3"><Building size={20} /></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Active listings</span>
                  <span className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1 block">{adminMetrics.activeListings}</span>
                </div>
                <div className="glass-card p-5 text-center">
                  <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl w-fit mx-auto mb-3"><Calendar size={20} /></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Booked visits</span>
                  <span className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1 block">{adminMetrics.totalBookings}</span>
                </div>
                <div className="glass-card p-5 text-center">
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl w-fit mx-auto mb-3"><DollarSign size={20} /></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Platform Revenue</span>
                  <span className="text-2xl font-black text-emerald-500 mt-1 block">₹{(adminMetrics.platformRevenue / 100000).toFixed(1)} L</span>
                </div>
              </div>

              {/* Verified Pending Agents checklist alerts */}
              {adminUsers.filter(u => u.role === 'agent' && !u.isVerifiedAgent).length > 0 && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 text-amber-800 dark:text-amber-400 rounded-2xl flex items-center gap-3">
                  <ShieldAlert size={20} className="flex-shrink-0" />
                  <div className="text-xs">
                    <span className="font-bold">Pending Agent Approvals:</span> There are agents waiting for license credential verifications. Go to 'Moderate Accounts' tab to approve licenses.
                  </div>
                </div>
              )}

              {/* Review pending properties alert */}
              {adminMetrics.underReviewListings > 0 && (
                <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-2xl flex items-center gap-3">
                  <Building size={20} className="flex-shrink-0" />
                  <div className="text-xs">
                    <span className="font-bold">Property Listings in Queue:</span> There are {adminMetrics.underReviewListings} listings pending admin approval and verification before going active.
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 8: ADMIN ACCOUNTS MODERATION */}
          {activeTab === 'admin-users' && (
            <div className="glass-card p-6 rounded-3xl">
              <h2 className="font-extrabold text-lg text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                <Users /> Moderate System Accounts
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="p-3">User Profile</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Agent License</th>
                      <th className="p-3">Verify Agent</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminUsers.map(u => (
                      <tr key={u._id} className="border-b border-slate-100/50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                        <td className="p-3 flex items-center gap-2">
                          <img src={u.avatar} className="w-8 h-8 rounded-full object-cover" />
                          <div>
                            <div className="font-bold">{u.name}</div>
                            <div className="text-slate-400">{u.email}</div>
                          </div>
                        </td>
                        <td className="p-3 capitalize font-semibold">{u.role}</td>
                        <td className="p-3">{u.agentLicense || 'N/A'}</td>
                        <td className="p-3">
                          {u.role === 'agent' ? (
                            u.isVerifiedAgent ? (
                              <span className="text-emerald-500 font-bold">✓ Verified</span>
                            ) : (
                              <button 
                                onClick={() => handleAdminVerifyUser(u._id, true)}
                                className="px-2 py-1 bg-amber-500 text-white rounded text-[10px] font-bold"
                              >
                                Approve License
                              </button>
                            )
                          ) : (
                            <span className="text-slate-400">N/A</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <button 
                            onClick={() => handleAdminDeleteUser(u._id)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg"
                            title="Delete user"
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 9: ADMIN LISTINGS MODERATION */}
          {activeTab === 'admin-listings' && (
            <div className="glass-card p-6 rounded-3xl">
              <h2 className="font-extrabold text-lg text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                <Building /> Moderate Listings Queue
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="p-3">Property Listing</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Owner Seller</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Moderate Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminListings.map(p => (
                      <tr key={p._id} className="border-b border-slate-100/50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                        <td className="p-3 flex items-center gap-2">
                          <img src={p.images[0]} className="w-10 h-8 rounded-lg object-cover" />
                          <div className="max-w-[150px] truncate font-bold">{p.title}</div>
                        </td>
                        <td className="p-3 font-semibold text-indigo-500">₹{(p.price / 100000).toFixed(0)} L</td>
                        <td className="p-3">{p.seller?.name || 'Deleted'}</td>
                        <td className="p-3 capitalize font-semibold">{p.status}</td>
                        <td className="p-3 text-right flex items-center justify-end gap-1.5 pt-4">
                          {p.status === 'under_review' && (
                            <button 
                              onClick={() => handleAdminListingStatus(p._id, 'available')}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-[9px] uppercase"
                            >
                              Approve
                            </button>
                          )}
                          {p.status === 'available' && (
                            <button 
                              onClick={() => handleAdminListingStatus(p._id, 'sold')}
                              className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded font-bold text-[9px] uppercase"
                            >
                              Mark Sold
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 10: USER PROFILE DETAILS */}
          {activeTab === 'profile' && (
            <div className="glass-card p-6 rounded-3xl">
              <h2 className="font-extrabold text-lg text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                <UserCheck /> Update My Profile Information
              </h2>
              {profileSuccess && (
                <div className="p-3 bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 text-xs rounded-xl mb-4">
                  {profileSuccess}
                </div>
              )}
              <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4 max-w-md">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Display Name</label>
                  <input 
                    type="text" 
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    required
                    className="premium-input"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Avatar image URL</label>
                  <input 
                    type="text" 
                    value={profileAvatar}
                    onChange={(e) => setProfileAvatar(e.target.value)}
                    className="premium-input"
                  />
                </div>
                {user?.role === 'agent' && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Agent RERA License ID</label>
                    <input 
                      type="text" 
                      value={profileLicense}
                      onChange={(e) => setProfileLicense(e.target.value)}
                      className="premium-input"
                    />
                  </div>
                )}
                <button type="submit" className="btn-primary py-3">Save Profile Updates</button>
              </form>
            </div>
          )}

        </div>

      </div>

      {/* PROPERTY ADD/EDIT MODAL OVERLAY */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/40"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800/50">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-100">
                  {formMode === 'add' ? 'Add New Property Listing' : 'Edit Property Listing'}
                </h3>
                <button onClick={() => setShowAddForm(false)} className="p-2 text-slate-400 hover:text-white rounded-xl">
                  <X size={16} />
                </button>
              </div>

              {formError && (
                <div className="mx-6 mt-4 p-3 bg-red-100 text-red-600 text-xs rounded-xl">{formError}</div>
              )}

              <form onSubmit={handlePropertySubmit} className="p-6 overflow-y-auto max-h-[75vh] flex flex-col gap-4 text-xs chat-scrollbar">
                
                {/* Form fields */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Property Title</label>
                  <input type="text" required value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="premium-input" placeholder="e.g. Modern 2 BHK Apartment Dwarka" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Description</label>
                  <textarea rows="3" required value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className="premium-input" placeholder="Enter detailed property specs..."></textarea>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Price (INR ₹)</label>
                    <input type="number" required value={formPrice} onChange={(e) => setFormPrice(e.target.value)} className="premium-input" placeholder="e.g. 5500000" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Listing Purpose</label>
                    <select value={formListingType} onChange={(e) => setFormListingType(e.target.value)} className="premium-input">
                      <option value="sale">For Sale</option>
                      <option value="rent">For Rent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Type</label>
                    <select value={formType} onChange={(e) => setFormType(e.target.value)} className="premium-input">
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="villa">Villa</option>
                      <option value="plot">Plot / Land</option>
                      <option value="commercial">Commercial</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Beds</label>
                    <input type="number" value={formBedrooms} onChange={(e) => setFormBedrooms(e.target.value)} className="premium-input" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Baths</label>
                    <input type="number" value={formBathrooms} onChange={(e) => setFormBathrooms(e.target.value)} className="premium-input" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Area (sq ft)</label>
                    <input type="number" required value={formArea} onChange={(e) => setFormArea(e.target.value)} className="premium-input" placeholder="e.g. 1200" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">City</label>
                    <input type="text" required value={formCity} onChange={(e) => setFormCity(e.target.value)} className="premium-input" placeholder="delhi" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">State</label>
                    <input type="text" required value={formState} onChange={(e) => setFormState(e.target.value)} className="premium-input" placeholder="delhi" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Street Address</label>
                  <input type="text" required value={formAddress} onChange={(e) => setFormAddress(e.target.value)} className="premium-input" placeholder="Plot 12, Sector 12, Dwarka" />
                </div>

                {formListingType === 'rent' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Furnishing Status</label>
                      <select value={formFurnishing} onChange={(e) => setFormFurnishing(e.target.value)} className="premium-input">
                        <option value="">Select Furnishing</option>
                        <option value="Furnished">Furnished</option>
                        <option value="Semi-Furnished">Semi-Furnished</option>
                        <option value="Unfurnished">Unfurnished</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Preferred Tenants</label>
                      <select value={formTenants} onChange={(e) => setFormTenants(e.target.value)} className="premium-input">
                        <option value="">Select Preferred Tenants</option>
                        <option value="Bachelors/Family">Bachelors/Family</option>
                        <option value="Family">Family Only</option>
                        <option value="Bachelors">Bachelors Only</option>
                      </select>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Amenities (comma-separated)</label>
                  <input type="text" value={formAmenities} onChange={(e) => setFormAmenities(e.target.value)} className="premium-input" placeholder="Metro Connectivity, Gym, Pool" />
                </div>

                {formMode === 'add' && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Upload Images</label>
                    <input type="file" multiple onChange={(e) => setFormImages(e.target.files)} className="premium-input py-2" />
                  </div>
                )}

                <div className="flex gap-2 justify-end mt-4">
                  <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary py-2.5 px-4">Cancel</button>
                  <button type="submit" disabled={formLoading} className="btn-primary py-2.5 px-6">
                    {formLoading ? 'Submitting...' : formMode === 'add' ? 'Publish Listing' : 'Save Changes'}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
