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
  const [visits, setVisits] = useState([]);
  const [reschedulingVisitId, setReschedulingVisitId] = useState(null);
  const [newVisitDate, setNewVisitDate] = useState('');
  const [newVisitTime, setNewVisitTime] = useState('');
  
  // Document Upload States
  const [userAadhaarFile, setUserAadhaarFile] = useState(null);
  const [userOwnershipFile, setUserOwnershipFile] = useState(null);
  const [userTaxFile, setUserTaxFile] = useState(null);
  const [userUtilityFile, setUserUtilityFile] = useState(null);
  const [userDocSuccess, setUserDocSuccess] = useState('');
  const [userDocLoading, setUserDocLoading] = useState(false);

  const [uploadingPropId, setUploadingPropId] = useState(null);
  const [propOwnershipFile, setPropOwnershipFile] = useState(null);
  const [propTaxFile, setPropTaxFile] = useState(null);
  const [propUtilityFile, setPropUtilityFile] = useState(null);
  const [propDocSuccess, setPropDocSuccess] = useState('');
  const [propDocLoading, setPropDocLoading] = useState(false);

  // Notification States
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fraud Alert States
  const [fraudAlerts, setFraudAlerts] = useState([]);
  
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
  const [availableCities, setAvailableCities] = useState([]);


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
      fetchNotifications();
      // Set default tab based on user role
      if (user.role === 'buyer') {
        setActiveTab('visits');
        fetchVisits();
      } else if (user.role === 'seller' || user.role === 'agent') {
        setActiveTab('listings');
        fetchMyListings();
        fetchVisits();
      } else if (user.role === 'admin') {
        setActiveTab('admin-stats');
        fetchAdminData();
        fetchFraudAlerts();
      }
    }
  }, [user]);

  // Fetch centralized notifications
  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.error('Notifications load error:', err.message);
    }
  };

  const markNotificationRead = async (id) => {
    try {
      const res = await axios.put(`/notifications/${id}/read`);
      if (res.data.success) {
        fetchNotifications();
      }
    } catch (err) {
      console.error('Mark notification read error:', err.message);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      const res = await axios.put('/notifications/read-all');
      if (res.data.success) {
        fetchNotifications();
      }
    } catch (err) {
      console.error('Mark all notifications read error:', err.message);
    }
  };

  // Fetch Fraud alerts (Admin only)
  const fetchFraudAlerts = async () => {
    try {
      const res = await axios.get('/admin/fraud-alerts');
      if (res.data.success) {
        setFraudAlerts(res.data.alerts);
      }
    } catch (err) {
      console.error('Fraud alerts load error:', err.message);
    }
  };

  const handleResolveFraudAlert = async (id) => {
    try {
      const res = await axios.put(`/admin/fraud-alerts/${id}/resolve`);
      if (res.data.success) {
        fetchFraudAlerts();
        fetchAdminData();
      }
    } catch (err) {
      alert('Error resolving fraud alert: ' + err.message);
    }
  };

  // User Document Upload Verification handler
  const handleUserDocsSubmit = async (e) => {
    e.preventDefault();
    setUserDocSuccess('');
    setUserDocLoading(true);

    try {
      const formData = new FormData();
      if (userAadhaarFile) formData.append('aadhaarPan', userAadhaarFile);
      if (userOwnershipFile) formData.append('ownershipDoc', userOwnershipFile);
      if (userTaxFile) formData.append('taxReceipt', userTaxFile);
      if (userUtilityFile) formData.append('utilityBill', userUtilityFile);

      const res = await axios.put('/auth/verify-docs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setUserDocSuccess('Identity verification documents submitted successfully! Under Review.');
        // Refresh local cache via reload profile info or alert
        setUserAadhaarFile(null);
        setUserOwnershipFile(null);
        setUserTaxFile(null);
        setUserUtilityFile(null);
      }
    } catch (err) {
      alert('Document upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setUserDocLoading(false);
    }
  };

  // Property Document Upload Verification handler
  const handlePropertyDocsSubmit = async (e, propertyId) => {
    e.preventDefault();
    setPropDocSuccess('');
    setPropDocLoading(true);

    try {
      const formData = new FormData();
      if (propOwnershipFile) formData.append('ownershipDoc', propOwnershipFile);
      if (propTaxFile) formData.append('taxReceipt', propTaxFile);
      if (propUtilityFile) formData.append('utilityBill', propUtilityFile);

      const res = await axios.put(`/properties/${propertyId}/verify-docs`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setPropDocSuccess('Property verification documents uploaded successfully! Status updated to Under Review.');
        setPropOwnershipFile(null);
        setPropTaxFile(null);
        setPropUtilityFile(null);
        setUploadingPropId(null);
        fetchMyListings();
      }
    } catch (err) {
      alert('Property documents upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setPropDocLoading(false);
    }
  };

  // Admin Verification approvals
  const handleAdminVerifyUser = async (id, status) => {
    try {
      const res = await axios.put(`/admin/users/${id}/verify`, { status: status ? 'verified' : 'rejected' });
      if (res.data.success) {
        fetchAdminData();
        fetchFraudAlerts();
      }
    } catch (err) {
      alert('Error updating user verification: ' + err.message);
    }
  };

  const handleAdminVerifyProperty = async (id, status) => {
    try {
      const res = await axios.put(`/admin/listings/${id}/verify`, { status: status ? 'verified' : 'rejected' });
      if (res.data.success) {
        fetchAdminData();
        fetchFraudAlerts();
      }
    } catch (err) {
      alert('Error updating property verification: ' + err.message);
    }
  };

  const handleAdminSuspendUser = async (id) => {
    try {
      const res = await axios.put(`/admin/users/${id}/suspend`);
      if (res.data.success) {
        fetchAdminData();
        fetchFraudAlerts();
      }
    } catch (err) {
      alert('Error toggling user suspension: ' + err.message);
    }
  };

  // Fetch visits scheduled with or by the user
  const fetchVisits = async () => {
    try {
      const res = await axios.get('/visits');
      if (res.data.success) {
        setVisits(res.data.data);
        // Map to bookings to support legacy layouts if any fallback is needed
        setBookings(res.data.data);
      }
    } catch (err) {
      console.error('Visits load error:', err.message);
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

  // Visit status updates (Approve, Reject, Reschedule)
  const handleVisitStatus = async (id, status, visitDate = null, visitTime = null) => {
    try {
      const payload = { status };
      if (visitDate) payload.visitDate = visitDate;
      if (visitTime) payload.visitTime = visitTime;
      const res = await axios.put(`/visits/${id}/status`, payload);
      if (res.data.success) {
        fetchVisits();
        setReschedulingVisitId(null);
        if (status === 'approved') {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.8 }
          });
        }
      }
    } catch (err) {
      alert('Error updating visit request: ' + (err.response?.data?.message || err.message));
    }
  };

  // Confirm visit completion (both buyer and seller)
  const handleCompleteVisit = async (id) => {
    try {
      const res = await axios.put(`/visits/${id}/complete`);
      if (res.data.success) {
        fetchVisits();
        confetti({
          particleCount: 50,
          spread: 40,
          origin: { y: 0.8 }
        });
      }
    } catch (err) {
      alert('Error completing visit: ' + (err.response?.data?.message || err.message));
    }
  };

  // Submit buyer interest level
  const handleSubmitInterest = async (id, interestLevel) => {
    try {
      const res = await axios.post(`/visits/${id}/interest`, { interestLevel });
      if (res.data.success) {
        fetchVisits();
      }
    } catch (err) {
      alert('Error submitting interest: ' + (err.response?.data?.message || err.message));
    }
  };

  // Submit buyer purchase decision
  const handleSubmitDecision = async (id, decision) => {
    try {
      const res = await axios.post(`/visits/${id}/decision`, { decision });
      if (res.data.success) {
        fetchVisits();
      }
    } catch (err) {
      alert('Error submitting purchase decision: ' + (err.response?.data?.message || err.message));
    }
  };

  // Confirm property sold to a buyer
  const handleSellProperty = async (id) => {
    if (!window.confirm("Are you sure you want to mark this property as SOLD to this buyer? This action will permanently archive active listings and search results for this property.")) {
      return;
    }
    try {
      const res = await axios.post(`/visits/${id}/sell`);
      if (res.data.success) {
        fetchVisits();
        fetchMyListings();
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.5 }
        });
      }
    } catch (err) {
      alert('Error finalizing property sale: ' + (err.response?.data?.message || err.message));
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
  const triggerMarketInsights = async (overrideCity) => {
    const targetCity = overrideCity || insightCity;
    setInsightsLoading(true);
    setInsights(null);
    try {
      const res = await axios.get(`/ai/market-insights?city=${targetCity}`);
      if (res.data.success) {
        setInsights(res.data.insights);
      }
    } catch (err) {
      alert('Insights error: ' + err.message);
    } finally {
      setInsightsLoading(false);
    }
  };

  const handleTabClickAiInsights = async () => {
    setActiveTab('ai-insights');
    try {
      const res = await axios.get('/ai/cities');
      if (res.data.success) {
        setAvailableCities(res.data.cities);
        const list = res.data.cities;
        let defaultCity = 'delhi';
        if (list && list.length > 0) {
          if (list.includes('hyderabad')) {
            defaultCity = 'hyderabad';
          } else if (list.includes('delhi')) {
            defaultCity = 'delhi';
          } else {
            defaultCity = list[0];
          }
          setInsightCity(defaultCity);
        }
        await triggerMarketInsights(defaultCity);
      }
    } catch (err) {
      console.error('Error fetching available cities:', err.message);
      await triggerMarketInsights(insightCity || 'delhi');
    }
  };

  // Admin deletion handlers

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
                  onClick={() => { setActiveTab('visits-host'); fetchVisits(); }}
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
                  onClick={handleTabClickAiInsights}
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
              onClick={() => { setActiveTab('notifications'); markAllNotificationsRead(); }}
              className={`w-full text-left px-4 py-3 rounded-xl font-medium text-xs transition-colors flex items-center gap-2 ${activeTab === 'notifications' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'}`}
            >
              <ShieldAlert size={16} /> Notification Center
              {unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">{unreadCount}</span>
              )}
            </button>

            {user?.role === 'admin' && (
              <button 
                onClick={() => { setActiveTab('admin-fraud'); fetchFraudAlerts(); }}
                className={`w-full text-left px-4 py-3 rounded-xl font-medium text-xs transition-colors flex items-center gap-2 ${activeTab === 'admin-fraud' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'}`}
              >
                <ShieldAlert size={16} /> Risk Alert Center
              </button>
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
                <Calendar /> My Scheduled Property Visits
              </h2>
              {visits.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  You have not scheduled any visits yet. Go to Discover to find listings.
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {visits.map(v => {
                    const isSold = v.property?.status === 'sold';
                    return (
                      <div key={v._id} className="p-5 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/35 dark:border-slate-800/30 rounded-2xl flex flex-col gap-4 shadow-xs">
                        
                        {/* Property & Seller Title Info */}
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 
                              onClick={() => onViewProperty(v.property?._id)}
                              className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-200 hover:text-indigo-500 cursor-pointer transition-colors flex items-center gap-2"
                            >
                              {v.property?.title}
                              {isSold && (
                                <span className="bg-red-500 text-white text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">SOLD</span>
                              )}
                            </h4>
                            <div className="text-xs text-slate-400 mt-1 flex flex-wrap gap-x-4">
                              <span>📅 Date: {new Date(v.visitDate).toDateString()}</span>
                              <span>⏰ Time: {v.visitTime}</span>
                              <span>👤 Host: {v.seller?.name || 'Listing Manager'}</span>
                            </div>
                            {v.notes && (
                              <p className="text-xs text-slate-500 mt-2 bg-slate-100/50 dark:bg-slate-900/40 p-2 rounded-lg italic">
                                Notes: "{v.notes}"
                              </p>
                            )}
                          </div>
                          
                          {/* Main visit status badge */}
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            v.status === 'completed'
                              ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                              : v.status === 'approved' 
                              ? 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                              : v.status === 'rejected'
                              ? 'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400'
                              : 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                          }`}>
                            {v.status}
                          </span>
                        </div>

                        {/* Interactive flow for approved/completed visits */}
                        {v.status === 'approved' && (
                          <div className="mt-2 p-3 bg-indigo-50/25 dark:bg-indigo-950/20 border border-indigo-200/20 rounded-xl flex items-center justify-between gap-4">
                            <span className="text-xs text-indigo-600/90 dark:text-indigo-400/90 font-medium">
                              Have you visited this property? Let the seller know once you complete the tour.
                            </span>
                            <button
                              onClick={() => handleCompleteVisit(v._id)}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1"
                            >
                              <Check size={14} /> Yes, Visited Property
                            </button>
                          </div>
                        )}

                        {v.status === 'completed' && (
                          <div className="mt-2 p-4 bg-emerald-50/10 dark:bg-emerald-950/5 border border-emerald-200/20 rounded-xl flex flex-col gap-4">
                            <div className="text-xs text-emerald-600/90 dark:text-emerald-400/90 font-semibold flex items-center gap-1">
                              🎉 Visit tour completed successfully!
                            </div>
                            
                            {/* Step 5: Post Visit Feedback / Interest level */}
                            <div className="border-t border-slate-200/20 pt-3">
                              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Did you like this property?</p>
                              <div className="flex flex-wrap gap-2">
                                {[
                                  { level: 'very_interested', label: '🤩 Very Interested' },
                                  { level: 'interested', label: '😊 Interested' },
                                  { level: 'not_interested', label: '😐 Not Interested' }
                                ].map(opt => {
                                  const isSelected = v.interest?.interestLevel === opt.level;
                                  return (
                                    <button
                                      key={opt.level}
                                      onClick={() => handleSubmitInterest(v._id, opt.level)}
                                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                                        isSelected 
                                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs' 
                                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                      }`}
                                    >
                                      {opt.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Step 6: Purchase Decision */}
                            <div className="border-t border-slate-200/20 pt-3">
                              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Have you decided to purchase this property?</p>
                              <div className="flex flex-wrap gap-2">
                                {[
                                  { dec: 'yes_purchase', label: '🤝 Yes, I want to purchase' },
                                  { dec: 'still_negotiating', label: '💬 Still Negotiating' },
                                  { dec: 'not_interested', label: '❌ Not Interested' }
                                ].map(opt => {
                                  const isSelected = v.purchaseRequest?.decision === opt.dec;
                                  return (
                                    <button
                                      key={opt.dec}
                                      onClick={() => handleSubmitDecision(v._id, opt.dec)}
                                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                                        isSelected 
                                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs' 
                                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                      }`}
                                    >
                                      {opt.label}
                                    </button>
                                  );
                                })}
                              </div>
                              {v.purchaseRequest?.decision === 'yes_purchase' && (
                                <div className="mt-2 text-[11px] text-indigo-500 font-medium">
                                  {v.transaction 
                                    ? '🎉 Final sale confirmed! The transaction record has been generated.' 
                                    : '⏳ Purchase intent submitted to the listing manager. Seller is preparing transaction details.'
                                  }
                                </div>
                              )}
                            </div>

                          </div>
                        )}

                      </div>
                    );
                  })}
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
                  You have not listed any properties yet. Click "Add Property" to get started.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {myProperties.map(p => {
                    const isUploadingThis = uploadingPropId === p._id;
                    return (
                      <div key={p._id} className="p-4 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/35 dark:border-slate-800/30 rounded-2xl flex flex-col gap-3 relative shadow-xs">
                        
                        <div className="flex gap-4">
                          <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=120&h=80&q=80'} className="w-24 h-20 rounded-xl object-cover flex-shrink-0" />
                          <div className="min-w-0 flex-grow">
                            <h4 className="font-bold text-xs sm:text-sm truncate">{p.title}</h4>
                            <div className="text-[10px] text-slate-400 capitalize mt-1">{p.type} | {p.city}</div>
                            <div className="text-xs font-bold text-indigo-500 mt-2">
                              ₹{p.price >= 10000000 ? `${(p.price / 10000000).toFixed(2)} Cr` : `${(p.price / 100000).toFixed(0)} Lakh`}
                            </div>
                            <div className="flex items-center gap-3 mt-3">
                              <button 
                                onClick={() => onEditProperty(p)}
                                className="text-xs text-slate-500 hover:text-indigo-500 flex items-center gap-1 font-semibold"
                              >
                                <Edit size={12} /> Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteListing(p._id)}
                                className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 font-semibold"
                              >
                                <Trash2 size={12} /> Delete
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Property Verification section */}
                        <div className="border-t border-slate-200/20 pt-3 flex flex-col gap-2 mt-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-400 uppercase text-[9px]">Verification Registry</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              p.verificationStatus === 'verified'
                                ? 'bg-emerald-100 text-emerald-700'
                                : p.verificationStatus === 'under_review'
                                ? 'bg-indigo-100 text-indigo-700 animate-pulse'
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {p.verificationStatus === 'verified' ? '✓ Verified Property' : p.verificationStatus === 'under_review' ? '⏳ Under Review' : '⚠ Action Required'}
                            </span>
                          </div>

                          {p.verificationStatus !== 'verified' && p.verificationStatus !== 'under_review' && !isUploadingThis && (
                            <button
                              onClick={() => {
                                setUploadingPropId(p._id);
                                setPropDocSuccess('');
                              }}
                              className="w-full text-center py-1.5 bg-indigo-50 dark:bg-indigo-950/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-bold"
                            >
                              Upload Ownership Deeds for Verification
                            </button>
                          )}

                          {isUploadingThis && (
                            <form onSubmit={(e) => handlePropertyDocsSubmit(e, p._id)} className="flex flex-col gap-2 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/10 text-[10px]">
                              {propDocSuccess && (
                                <div className="p-2 bg-emerald-100 text-emerald-600 rounded mb-1 font-bold text-center">
                                  {propDocSuccess}
                                </div>
                              )}
                              
                              <div>
                                <label className="block font-bold text-slate-400 uppercase text-[8px] mb-1">Ownership Deed / Certificate</label>
                                <input
                                  type="file"
                                  required
                                  onChange={(e) => setPropOwnershipFile(e.target.files[0])}
                                  className="w-full text-[9px]"
                                />
                              </div>
                              <div>
                                <label className="block font-bold text-slate-400 uppercase text-[8px] mb-1">Recent Property Tax Receipt</label>
                                <input
                                  type="file"
                                  onChange={(e) => setPropTaxFile(e.target.files[0])}
                                  className="w-full text-[9px]"
                                />
                              </div>
                              <div>
                                <label className="block font-bold text-slate-400 uppercase text-[8px] mb-1">Utility / Electricity Bill</label>
                                <input
                                  type="file"
                                  onChange={(e) => setPropUtilityFile(e.target.files[0])}
                                  className="w-full text-[9px]"
                                />
                              </div>

                              <div className="flex gap-2 mt-1">
                                <button
                                  type="submit"
                                  disabled={propDocLoading}
                                  className="flex-1 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold rounded"
                                >
                                  {propDocLoading ? 'Uploading...' : 'Submit files'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setUploadingPropId(null)}
                                  className="py-1 px-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded"
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          )}
                        </div>

                        <span className={`absolute top-2 right-2 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          p.status === 'sold' 
                            ? 'bg-red-500 text-white' 
                            : p.status === 'pending'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {p.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SELLER/AGENT VISIT REQUESTS & PIPELINES */}
          {activeTab === 'visits-host' && (() => {
            // Local state inside an IIFE render block
            const [visitsSubTab, setVisitsSubTab] = useState('pipeline');
            const stats = (() => {
              const res = {};
              visits.forEach(v => {
                if (!v.property) return;
                const pid = v.property._id;
                if (!res[pid]) {
                  res[pid] = {
                    id: pid,
                    title: v.property.title,
                    price: v.property.price,
                    city: v.property.city,
                    status: v.property.status,
                    total: 0,
                    approved: 0,
                    completed: 0,
                    interested: 0,
                    purchaseRequests: 0,
                    soldTo: null,
                    scheduledBuyers: [],
                    attendedBuyers: [],
                    interestedBuyers: [],
                    purchaseIntentBuyers: [],
                    finalPurchasedBuyers: []
                  };
                }
                
                const buyerInfo = {
                  id: v.buyer?._id,
                  name: v.buyer?.name,
                  email: v.buyer?.email
                };

                res[pid].total += 1;
                res[pid].scheduledBuyers.push(buyerInfo);

                if (v.status === 'approved') {
                  res[pid].approved += 1;
                }
                if (v.status === 'completed') {
                  res[pid].completed += 1;
                  res[pid].approved += 1;
                  res[pid].attendedBuyers.push(buyerInfo);
                }
                if (v.interest && ['very_interested', 'interested'].includes(v.interest.interestLevel)) {
                  res[pid].interested += 1;
                  res[pid].interestedBuyers.push(buyerInfo);
                }
                if (v.purchaseRequest && v.purchaseRequest.decision === 'yes_purchase') {
                  res[pid].purchaseRequests += 1;
                  res[pid].purchaseIntentBuyers.push(buyerInfo);
                }
                if (v.transaction || v.property.status === 'sold') {
                  res[pid].soldTo = v.buyer?.name;
                  res[pid].finalPurchasedBuyers.push(buyerInfo);
                }
              });

              // Unique values filtering
              Object.values(res).forEach(item => {
                const uniq = (arr) => Array.from(new Map(arr.map(x => [x.id, x])).values());
                item.scheduledBuyers = uniq(item.scheduledBuyers);
                item.attendedBuyers = uniq(item.attendedBuyers);
                item.interestedBuyers = uniq(item.interestedBuyers);
                item.purchaseIntentBuyers = uniq(item.purchaseIntentBuyers);
                item.finalPurchasedBuyers = uniq(item.finalPurchasedBuyers);
              });

              return Object.values(res);
            })();

            return (
              <div className="glass-card p-6 rounded-3xl">
                {/* Headers and mini tab navigation */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h2 className="font-extrabold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Calendar /> Client Visits & Pipeline Control
                  </h2>
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button
                      onClick={() => setVisitsSubTab('pipeline')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${visitsSubTab === 'pipeline' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs' : 'text-slate-500'}`}
                    >
                      Visits & Pipelines
                    </button>
                    <button
                      onClick={() => setVisitsSubTab('analytics')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${visitsSubTab === 'analytics' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs' : 'text-slate-500'}`}
                    >
                      Conversion Analytics
                    </button>
                  </div>
                </div>

                {visitsSubTab === 'pipeline' ? (
                  /* SUBTAB 1: LISTINGS PIPELINES */
                  visits.length === 0 ? (
                    <div className="text-center py-12 text-xs text-slate-400">
                      No client visit requests scheduled yet.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-6">
                      {visits.map(v => {
                        // Calculate active steps in visual pipeline
                        const stepScheduled = true;
                        const stepApproved = v.status === 'approved' || v.status === 'completed';
                        const stepCompleted = v.status === 'completed';
                        const stepInterested = v.interest && ['very_interested', 'interested'].includes(v.interest.interestLevel);
                        const stepPurchasedRequested = v.purchaseRequest && v.purchaseRequest.decision === 'yes_purchase';
                        const stepSold = v.transaction || v.property?.status === 'sold';

                        const steps = [
                          { label: 'Visit Scheduled', active: stepScheduled },
                          { label: 'Visit Approved', active: stepApproved },
                          { label: 'Visit Completed', active: stepCompleted },
                          { label: 'Interested', active: stepInterested },
                          { label: 'Purchase Request', active: stepPurchasedRequested },
                          { label: 'Property Purchased', active: stepSold }
                        ];

                        const isRescheduling = reschedulingVisitId === v._id;

                        return (
                          <div key={v._id} className="p-5 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/35 dark:border-slate-800/30 rounded-2xl flex flex-col gap-4">
                            
                            {/* Top Info Header */}
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                              <div>
                                <h4 className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-200">
                                  {v.property?.title}
                                </h4>
                                <div className="text-xs text-slate-400 mt-1 flex flex-wrap gap-x-4">
                                  <span>📅 Date: {new Date(v.visitDate).toDateString()}</span>
                                  <span>⏰ Time: {v.visitTime}</span>
                                  <span>👤 Buyer: <span className="font-semibold text-slate-600 dark:text-slate-300">{v.buyer?.name}</span> ({v.buyer?.email})</span>
                                </div>
                                {v.notes && (
                                  <p className="text-xs text-slate-500 mt-2 bg-slate-100/30 dark:bg-slate-900/30 p-2 rounded-lg italic">
                                    Notes: "{v.notes}"
                                  </p>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div className="flex flex-wrap gap-2 self-end sm:self-center">
                                {v.status === 'pending' && !isRescheduling && (
                                  <>
                                    <button 
                                      onClick={() => {
                                        setReschedulingVisitId(v._id);
                                        setNewVisitDate(new Date(v.visitDate).toISOString().split('T')[0]);
                                        setNewVisitTime(v.visitTime);
                                      }}
                                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold transition-colors"
                                    >
                                      Reschedule
                                    </button>
                                    <button 
                                      onClick={() => handleVisitStatus(v._id, 'rejected')}
                                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                                    >
                                      <X size={12} /> Reject
                                    </button>
                                    <button 
                                      onClick={() => handleVisitStatus(v._id, 'approved')}
                                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                                    >
                                      <Check size={12} /> Approve
                                    </button>
                                  </>
                                )}

                                {v.status === 'approved' && (
                                  <button
                                    onClick={() => handleCompleteVisit(v._id)}
                                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1 transition-colors"
                                  >
                                    <Check size={12} /> Mark Completed
                                  </button>
                                )}

                                {v.status === 'completed' && stepPurchasedRequested && !stepSold && (
                                  <button
                                    onClick={() => handleSellProperty(v._id)}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1"
                                  >
                                    🤝 Confirm Property Sold
                                  </button>
                                )}

                                {v.status !== 'pending' && !stepPurchasedRequested && (
                                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    v.status === 'completed'
                                      ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                                      : 'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400'
                                  }`}>
                                    {v.status}
                                  </span>
                                )}

                                {v.status === 'completed' && stepSold && (
                                  <span className="px-3 py-1 bg-red-600 text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
                                    SOLD
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Rescheduling Input Fields */}
                            {isRescheduling && (
                              <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-xl flex flex-wrap items-center gap-3 mt-1">
                                <span className="text-xs text-slate-500 font-bold uppercase">Reschedule Request:</span>
                                <input
                                  type="date"
                                  value={newVisitDate}
                                  onChange={(e) => setNewVisitDate(e.target.value)}
                                  className="premium-input max-w-[150px] text-xs py-1"
                                />
                                <input
                                  type="text"
                                  value={newVisitTime}
                                  onChange={(e) => setNewVisitTime(e.target.value)}
                                  className="premium-input max-w-[120px] text-xs py-1"
                                  placeholder="e.g. 10:00 AM"
                                />
                                <button
                                  onClick={() => handleVisitStatus(v._id, 'pending', newVisitDate, newVisitTime)}
                                  className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
                                >
                                  Save Reschedule
                                </button>
                                <button
                                  onClick={() => setReschedulingVisitId(null)}
                                  className="px-3 py-1 bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold"
                                >
                                  Cancel
                                </button>
                              </div>
                            )}

                            {/* Section 8: Visual Pipeline View */}
                            <div className="border-t border-slate-200/20 pt-4 mt-2">
                              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Buyer Lifecycle Stage</p>
                              
                              {/* Horizontal steps line */}
                              <div className="grid grid-cols-6 gap-2 text-center text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                {steps.map((st, sIdx) => (
                                  <div key={st.label} className="flex flex-col items-center gap-2">
                                    {/* Circle node indicator */}
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                                      st.active 
                                        ? 'bg-emerald-500 text-white shadow-xs' 
                                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                                    }`}>
                                      {st.active ? <Check size={12} /> : sIdx + 1}
                                    </div>
                                    <span className={st.active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}>
                                      {st.label}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  )
                ) : (
                  /* SUBTAB 2: CONVERSION BREAKDOWN & BUYER DETAILS */
                  stats.length === 0 ? (
                    <div className="text-center py-12 text-xs text-slate-400">
                      No conversion statistics available. Need scheduled visit interactions.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-6">
                      {stats.map(item => (
                        <div key={item.id} className="p-5 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/35 dark:border-slate-800/30 rounded-2xl flex flex-col gap-4">
                          {/* Property Identity header */}
                          <div className="flex justify-between items-center border-b border-slate-200/20 pb-3">
                            <div>
                              <h3 className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-slate-200">{item.title}</h3>
                              <p className="text-[10px] text-slate-400 capitalize mt-0.5">{item.city} | Price: ₹{(item.price / 100000).toFixed(0)} Lakh</p>
                            </div>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                              item.status === 'sold' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
                            }`}>
                              {item.status}
                            </span>
                          </div>

                          {/* Numeric metrics metrics grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            <div className="bg-white dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200/10 text-center">
                              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Visits</span>
                              <span className="text-lg font-black text-slate-700 dark:text-slate-300 mt-1 block">{item.total}</span>
                            </div>
                            <div className="bg-white dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200/10 text-center">
                              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Approved Visits</span>
                              <span className="text-lg font-black text-slate-700 dark:text-slate-300 mt-1 block">{item.approved}</span>
                            </div>
                            <div className="bg-white dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200/10 text-center">
                              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completed Visits</span>
                              <span className="text-lg font-black text-slate-700 dark:text-slate-300 mt-1 block">{item.completed}</span>
                            </div>
                            <div className="bg-white dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200/10 text-center">
                              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Interested Buyers</span>
                              <span className="text-lg font-black text-indigo-500 mt-1 block">{item.interested}</span>
                            </div>
                            <div className="bg-white dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200/10 text-center">
                              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Purchase Requests</span>
                              <span className="text-lg font-black text-emerald-500 mt-1 block">{item.purchaseRequests}</span>
                            </div>
                          </div>

                          {/* Section 10: Buyer details directories */}
                          <div className="bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/20 mt-2 flex flex-col gap-3">
                            <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Buyer Conversion Log Directory</h4>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                              {/* scheduled */}
                              <div>
                                <span className="font-bold text-slate-500">Scheduled Visit ({item.scheduledBuyers.length})</span>
                                <ul className="mt-1 list-disc pl-4 text-slate-400 flex flex-col gap-0.5">
                                  {item.scheduledBuyers.map(b => <li key={b.id}>{b.name}</li>)}
                                  {item.scheduledBuyers.length === 0 && <li>None</li>}
                                </ul>
                              </div>
                              {/* attended */}
                              <div>
                                <span className="font-bold text-slate-500">Attended Tour ({item.attendedBuyers.length})</span>
                                <ul className="mt-1 list-disc pl-4 text-slate-400 flex flex-col gap-0.5">
                                  {item.attendedBuyers.map(b => <li key={b.id}>{b.name}</li>)}
                                  {item.attendedBuyers.length === 0 && <li>None</li>}
                                </ul>
                              </div>
                              {/* interested */}
                              <div>
                                <span className="font-bold text-slate-500">Expressed Interest ({item.interestedBuyers.length})</span>
                                <ul className="mt-1 list-disc pl-4 text-slate-400 flex flex-col gap-0.5">
                                  {item.interestedBuyers.map(b => <li key={b.id}>{b.name}</li>)}
                                  {item.interestedBuyers.length === 0 && <li>None</li>}
                                </ul>
                              </div>
                              {/* purchase requests */}
                              <div>
                                <span className="font-bold text-slate-500">Purchase Intent ({item.purchaseIntentBuyers.length})</span>
                                <ul className="mt-1 list-disc pl-4 text-slate-400 flex flex-col gap-0.5">
                                  {item.purchaseIntentBuyers.map(b => <li key={b.id}>{b.name}</li>)}
                                  {item.purchaseIntentBuyers.length === 0 && <li>None</li>}
                                </ul>
                              </div>
                              {/* finally purchased */}
                              <div>
                                <span className="font-bold text-emerald-600">Finally Purchased ({item.finalPurchasedBuyers.length})</span>
                                <ul className="mt-1 list-disc pl-4 text-emerald-500/80 font-semibold flex flex-col gap-0.5">
                                  {item.finalPurchasedBuyers.map(b => <li key={b.id}>{b.name}</li>)}
                                  {item.finalPurchasedBuyers.length === 0 && <li>None</li>}
                                </ul>
                              </div>
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  )
                )}

              </div>
            );
          })()}

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
                    onChange={(e) => { setInsightCity(e.target.value); triggerMarketInsights(e.target.value); }}
                    className="premium-input w-36 py-2 capitalize"
                  >
                    {availableCities.length > 0 ? (
                      availableCities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))
                    ) : (
                      <>
                        <option value="hyderabad">Hyderabad</option>
                        <option value="delhi">Delhi</option>
                        <option value="mumbai">Mumbai</option>
                        <option value="bangalore">Bangalore</option>
                      </>
                    )}
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
                <div className="glass-card p-5 text-center bg-white dark:bg-slate-900/60 shadow-xs border border-slate-200/10">
                  <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl w-fit mx-auto mb-3"><Users size={20} /></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Users</span>
                  <span className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1 block">{adminMetrics.totalUsers}</span>
                </div>
                <div className="glass-card p-5 text-center bg-white dark:bg-slate-900/60 shadow-xs border border-slate-200/10">
                  <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl w-fit mx-auto mb-3"><Building size={20} /></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Listings</span>
                  <span className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1 block">{adminMetrics.totalProperties}</span>
                </div>
                <div className="glass-card p-5 text-center bg-white dark:bg-slate-900/60 shadow-xs border border-slate-200/10">
                  <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-2xl w-fit mx-auto mb-3"><ShieldAlert size={20} /></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Risk Alerts</span>
                  <span className="text-2xl font-black text-amber-500 mt-1 block">{adminMetrics.riskAlerts || 0}</span>
                </div>
                <div className="glass-card p-5 text-center bg-white dark:bg-slate-900/60 shadow-xs border border-slate-200/10">
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl w-fit mx-auto mb-3"><DollarSign size={20} /></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Platform Revenue</span>
                  <span className="text-2xl font-black text-emerald-500 mt-1 block">₹{(adminMetrics.platformRevenue / 100000).toFixed(2)} L</span>
                </div>
              </div>

              {/* Extra Analytics cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass-card p-4 flex justify-between items-center bg-white/60 dark:bg-slate-900/40 border border-slate-200/10">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending Verifications</span>
                    <span className="text-lg font-black text-slate-800 dark:text-slate-100 block mt-1">{adminMetrics.pendingVerifications || 0}</span>
                  </div>
                  <span className="text-xs text-indigo-500 font-semibold bg-indigo-50 dark:bg-indigo-950/45 px-2 py-1 rounded-lg">Queue</span>
                </div>
                <div className="glass-card p-4 flex justify-between items-center bg-white/60 dark:bg-slate-900/40 border border-slate-200/10">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Flagged Accounts</span>
                    <span className="text-lg font-black text-red-500 block mt-1">{adminMetrics.flaggedAccounts || 0}</span>
                  </div>
                  <span className="text-xs text-red-500 font-semibold bg-red-50 dark:bg-red-950/45 px-2 py-1 rounded-lg">High Risk</span>
                </div>
                <div className="glass-card p-4 flex justify-between items-center bg-white/60 dark:bg-slate-900/40 border border-slate-200/10">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Completed Transactions</span>
                    <span className="text-lg font-black text-emerald-500 block mt-1">{adminMetrics.propertyTransactions || 0}</span>
                  </div>
                  <span className="text-xs text-emerald-500 font-semibold bg-emerald-50 dark:bg-emerald-950/45 px-2 py-1 rounded-lg">Sales Ledger</span>
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
                <table className="w-full text-xs text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="p-3">User Profile</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Risk score</th>
                      <th className="p-3">Verification files</th>
                      <th className="p-3">Identity status</th>
                      <th className="p-3 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminUsers.map(u => (
                      <tr key={u._id} className={`border-b border-slate-100/50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 ${u.isSuspended ? 'bg-red-50/20 dark:bg-red-950/10' : ''}`}>
                        <td className="p-3 flex items-center gap-2">
                          <img src={u.avatar} className="w-8 h-8 rounded-full object-cover" />
                          <div>
                            <div className="font-bold flex items-center gap-1">
                              {u.name}
                              {u.isSuspended && <span className="bg-red-500 text-white text-[8px] px-1 rounded uppercase">Suspended</span>}
                            </div>
                            <div className="text-slate-400">{u.email}</div>
                          </div>
                        </td>
                        <td className="p-3 capitalize font-semibold">{u.role}</td>
                        <td className="p-3 font-bold">
                          <span className={u.riskScore > 50 ? 'text-red-500' : u.riskScore > 20 ? 'text-amber-500' : 'text-emerald-500'}>
                            {u.riskScore || 15}/100
                          </span>
                          <span className="block text-[10px] text-slate-400 font-medium mt-1">
                            Confidence: {u.verificationConfidenceScore !== undefined ? u.verificationConfidenceScore : 20}%
                          </span>
                        </td>
                        <td className="p-3">
                          {u.verificationDocuments?.aadhaarPan ? (
                            <div className="flex flex-col gap-1 text-[10px]">
                              <a href={u.verificationDocuments.aadhaarPan} target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline">📄 PAN/Aadhaar</a>
                              {u.verificationDocuments.ownershipDoc && <a href={u.verificationDocuments.ownershipDoc} target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline">📄 Land Title</a>}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">No files uploaded</span>
                          )}
                        </td>
                        <td className="p-3 font-semibold">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.verificationStatus === 'verified' ? 'bg-emerald-100 text-emerald-700' : u.verificationStatus === 'under_review' ? 'bg-indigo-100 text-indigo-700 animate-pulse' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {u.verificationStatus || 'pending'}
                          </span>
                        </td>
                        <td className="p-3 text-right flex items-center justify-end gap-1.5 pt-4">
                          {u.verificationStatus === 'under_review' && (
                            <>
                              <button 
                                onClick={() => handleAdminVerifyUser(u._id, false)}
                                className="px-2 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded font-bold text-[9px]"
                              >
                                Reject Docs
                              </button>
                              <button 
                                onClick={() => handleAdminVerifyUser(u._id, true)}
                                className="px-2 py-1 bg-emerald-600 text-white hover:bg-emerald-500 rounded font-bold text-[9px]"
                              >
                                Verify Identity
                              </button>
                            </>
                          )}
                          <button 
                            onClick={() => handleAdminSuspendUser(u._id)}
                            className={`px-2 py-1 rounded font-bold text-[9px] ${
                              u.isSuspended ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                            }`}
                          >
                            {u.isSuspended ? 'Unsuspend' : 'Suspend Account'}
                          </button>
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
                <table className="w-full text-xs text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="p-3">Property Listing</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Risk score</th>
                      <th className="p-3">Property verification files</th>
                      <th className="p-3">Owner Seller</th>
                      <th className="p-3">Verify Status</th>
                      <th className="p-3 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminListings.map(p => (
                      <tr key={p._id} className="border-b border-slate-100/50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                        <td className="p-3 flex items-center gap-2">
                          <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=120&h=80&q=80'} className="w-10 h-8 rounded-lg object-cover" />
                          <div className="max-w-[150px] truncate font-bold">{p.title}</div>
                        </td>
                        <td className="p-3 font-semibold text-indigo-500">₹{(p.price / 100000).toFixed(0)} L</td>
                        <td className="p-3 font-bold text-slate-700 dark:text-slate-300">
                          <div>{p.riskScore || 10}/100</div>
                          <div className="text-[10px] text-slate-400 font-medium mt-1">
                            Confidence: {p.verificationConfidenceScore !== undefined ? p.verificationConfidenceScore : 20}%
                          </div>
                        </td>
                        <td className="p-3">
                          {p.verificationDocuments?.ownershipDoc ? (
                            <div className="flex flex-col gap-1 text-[10px]">
                              <a href={p.verificationDocuments.ownershipDoc} target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline">📄 Ownership Deed</a>
                              {p.verificationDocuments.taxReceipt && <a href={p.verificationDocuments.taxReceipt} target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline">📄 Tax Receipt</a>}
                              {p.verificationDocuments.utilityBill && <a href={p.verificationDocuments.utilityBill} target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline">📄 Utility Bill</a>}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">No files</span>
                          )}
                        </td>
                        <td className="p-3">{p.seller?.name || 'Deleted'}</td>
                        <td className="p-3 capitalize font-semibold">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.verificationStatus === 'verified' ? 'bg-emerald-100 text-emerald-700' : p.verificationStatus === 'under_review' ? 'bg-indigo-100 text-indigo-700 animate-pulse' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {p.verificationStatus || 'pending'}
                          </span>
                        </td>
                        <td className="p-3 text-right flex items-center justify-end gap-1.5 pt-4">
                          {p.verificationStatus === 'under_review' && (
                            <>
                              <button 
                                onClick={() => handleAdminVerifyProperty(p._id, false)}
                                className="px-2 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded font-bold text-[9px]"
                              >
                                Reject Docs
                              </button>
                              <button 
                                onClick={() => handleAdminVerifyProperty(p._id, true)}
                                className="px-2 py-1 bg-emerald-600 text-white hover:bg-emerald-505 rounded font-bold text-[9px]"
                              >
                                Verify Property
                              </button>
                            </>
                          )}
                          {p.status === 'under_review' && (
                            <button 
                              onClick={() => handleAdminListingStatus(p._id, 'available')}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-[9px] uppercase"
                            >
                              Approve Listing
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
                          <button 
                            onClick={() => handleDeleteListing(p._id)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg"
                            title="Remove listing"
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

          {/* TAB: NOTIFICATION CENTER */}
          {activeTab === 'notifications' && (
            <div className="glass-card p-6 rounded-3xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-extrabold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <ShieldAlert /> Notification Center
                </h2>
                <button
                  onClick={markAllNotificationsRead}
                  className="px-3 py-1 bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold"
                >
                  Mark All Read
                </button>
              </div>

              {notifications.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  No notifications yet. You will receive alerts for visits, approvals, and sales.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {notifications.map(n => (
                    <div 
                      key={n._id} 
                      onClick={() => !n.isRead && markNotificationRead(n._id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        n.isRead 
                          ? 'bg-slate-50/50 dark:bg-slate-900/10 border-slate-100 dark:border-slate-800 text-slate-500' 
                          : 'bg-indigo-50/20 dark:bg-indigo-950/15 border-indigo-200/30 text-slate-800 dark:text-slate-200 shadow-xs'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm">{n.title}</h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                          <span className="block text-[10px] text-slate-400 mt-2 font-medium">
                            🕒 {new Date(n.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {!n.isRead && (
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 flex-shrink-0 animate-pulse mt-1" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: ADMIN FRAUD CONTROL CENTER */}
          {activeTab === 'admin-fraud' && (
            <div className="glass-card p-6 rounded-3xl">
              <h2 className="font-extrabold text-lg text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                <ShieldAlert className="text-red-500" /> Fraud Risk & Security Alert Center
              </h2>

              {fraudAlerts.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  No security alerts or anomalous activity flags at this time.
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {fraudAlerts.map(alert => (
                    <div key={alert._id} className="p-4 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/35 dark:border-slate-800/30 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            alert.riskScore > 60 ? 'bg-red-100 text-red-700' : alert.riskScore > 30 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            Score: {alert.riskScore} ({alert.riskScore > 60 ? 'High' : alert.riskScore > 30 ? 'Medium' : 'Low'})
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{alert.triggerType}</span>
                        </div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 mt-2">
                          {alert.description}
                        </h4>
                        <div className="text-xs text-slate-400 mt-1 flex flex-wrap gap-x-4">
                          <span>Target: {alert.targetType.toUpperCase()}</span>
                          {alert.user && <span>User: {alert.user.name} ({alert.user.email})</span>}
                          {alert.property && <span>Property: {alert.property.title}</span>}
                          <span>Alert Date: {new Date(alert.createdAt).toDateString()}</span>
                        </div>
                      </div>

                      {alert.status === 'active' ? (
                        <button
                          onClick={() => handleResolveFraudAlert(alert._id)}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg text-xs font-semibold"
                        >
                          Resolve Alert
                        </button>
                      ) : (
                        <span className="text-emerald-500 font-bold text-xs">✓ Resolved</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 10: USER PROFILE DETAILS */}
          {activeTab === 'profile' && (
            <div className="glass-card p-6 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Left Column: Update Info Form */}
              <div>
                <h2 className="font-extrabold text-lg text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                  <UserCheck /> Profile Details
                </h2>
                {profileSuccess && (
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 text-xs rounded-xl mb-4 font-semibold">
                    {profileSuccess}
                  </div>
                )}
                <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
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
                  <button type="submit" className="btn-primary py-3 cursor-pointer">Save Profile Updates</button>
                </form>
              </div>

              {/* Right Column: Seller Trust & Document Verification */}
              {['seller', 'agent'].includes(user?.role) && (
                <div className="bg-slate-50 dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-200/20 flex flex-col gap-4">
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-200/20 pb-3 flex items-center gap-1.5">
                    <ShieldCheck className="text-indigo-500" size={16} /> Trust & Verification Hub
                  </h3>

                  <div className="flex justify-between items-center bg-white dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200/10">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Status</span>
                      <span className={`text-xs font-extrabold capitalize block mt-1 ${
                        user?.verificationStatus === 'verified' 
                          ? 'text-emerald-500' 
                          : user?.verificationStatus === 'under_review'
                          ? 'text-indigo-500'
                          : 'text-amber-500'
                      }`}>
                        {user?.verificationStatus === 'verified' ? '✓ Verified Seller' : user?.verificationStatus === 'under_review' ? '⏳ Under Review' : '⚠ Action Required (Pending)'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fraud Risk Score</span>
                      <span className="text-xs font-black text-slate-700 dark:text-slate-300 block mt-1">{user?.riskScore || 15}/100</span>
                    </div>
                  </div>

                  {userDocSuccess && (
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 text-xs rounded-xl font-semibold">
                      {userDocSuccess}
                    </div>
                  )}

                  {user?.verificationStatus !== 'verified' && (
                    <form onSubmit={handleUserDocsSubmit} className="flex flex-col gap-3 text-xs">
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                        Upload identity files to lower your risk profile and gain the **Verified Seller Badge** visible to all buyers.
                      </p>
                      
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">PAN or Aadhaar Card</label>
                        <input
                          type="file"
                          required
                          onChange={(e) => setUserAadhaarFile(e.target.files[0])}
                          className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-950/30 dark:file:text-indigo-400 file:cursor-pointer"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Land Deed / Ownership Certificate</label>
                        <input
                          type="file"
                          onChange={(e) => setUserOwnershipFile(e.target.files[0])}
                          className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-950/30 dark:file:text-indigo-400 file:cursor-pointer"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Property Tax Receipt</label>
                          <input
                            type="file"
                            onChange={(e) => setUserTaxFile(e.target.files[0])}
                            className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-indigo-50 file:text-indigo-700 file:cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Electricity/Utility Bill</label>
                          <input
                            type="file"
                            onChange={(e) => setUserUtilityFile(e.target.files[0])}
                            className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-indigo-50 file:text-indigo-700 file:cursor-pointer"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={userDocLoading}
                        className="mt-2 w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl font-bold cursor-pointer transition-colors"
                      >
                        {userDocLoading ? 'Uploading Files...' : 'Submit Verification Docs'}
                      </button>
                    </form>
                  )}

                  {user?.verificationStatus === 'verified' && (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-center flex flex-col items-center gap-1 mt-2">
                      <ShieldCheck className="text-emerald-500" size={32} />
                      <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400">✓ Account Verified</span>
                      <p className="text-[10px] text-slate-400 mt-1">Your identity documents are verified. Risk score reduced successfully.</p>
                    </div>
                  )}

                  {user?.verificationStatus === 'under_review' && (
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-900/30 rounded-xl text-center flex flex-col items-center gap-1 mt-2">
                      <span className="text-xs font-bold text-indigo-800 dark:text-indigo-400 animate-pulse">⏳ Verification Pending Review</span>
                      <p className="text-[10px] text-slate-400 mt-1">Admin is reviewing your credentials. You will receive notification status updates shortly.</p>
                    </div>
                  )}

                </div>
              )}

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
                    <input type="text" required value={formCity} onChange={(e) => setFormCity(e.target.value)} className="premium-input" placeholder="e.g. Hyderabad" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">State</label>
                    <input type="text" required value={formState} onChange={(e) => setFormState(e.target.value)} className="premium-input" placeholder="e.g. Telangana" />
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
