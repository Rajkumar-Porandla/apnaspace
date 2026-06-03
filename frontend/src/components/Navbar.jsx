import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { Sun, Moon, Bell, MessageSquare, LogOut, User, Home, Shield, Award, Layers, ArrowLeft, CheckCheck, Send, Image as ImageIcon, X } from 'lucide-react';

export default function Navbar({ currentTab, setCurrentTab }) {
  const { user, logout } = useAuth();
  const { 
    notifications, 
    setNotifications, 
    conversations, 
    activeChat, 
    setActiveChat, 
    messages, 
    sendMessage, 
    setTyping, 
    isPartnerTyping,
    showChat,
    setShowChat 
  } = useChat();
  
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' || 
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Floating Chat local states and handlers
  const [text, setText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  // Auto-scroll chat history when messages append
  useEffect(() => {
    if (showChat && activeChat) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeChat, showChat]);

  const handleTextChange = (e) => {
    setText(e.target.value);
    if (e.target.value.trim().length > 0) {
      setTyping(true);
    } else {
      setTyping(false);
    }
  };

  const handleBlur = () => {
    setTyping(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const clearImageSelection = () => {
    setSelectedImage(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !selectedImage) return;

    await sendMessage(text.trim(), selectedImage);
    setText('');
    clearImageSelection();
    setTyping(false);
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Apply dark mode theme
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const totalUnreadMessages = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  const clearNotifications = () => {
    setNotifications([]);
    setShowNotifications(false);
  };

  const handleNotificationClick = (notif) => {
    setShowNotifications(false);
    if (notif.sender) {
      // If it is a chat alert, open that chat partner
      const partner = conversations.find(c => c.partner._id === notif.sender)?.partner || { _id: notif.sender, name: 'User' };
      setActiveChat(partner);
      setShowChat(true);
    } else {
      // Go to dashboard
      setCurrentTab('dashboard');
    }
  };

  return (
    <nav className="sticky top-0 z-50 px-6 py-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/40">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* LOGO */}
        <div 
          onClick={() => setCurrentTab('home')} 
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1C1917] to-[#2E2A25] dark:from-[#2E2A25] dark:to-[#44403C] border border-[#C5A880]/30 flex items-center justify-center text-[#C5A880] shadow-sm group-hover:scale-105 transition-all">
            <Layers size={18} className="text-[#C5A880] animate-pulse" />
          </div>
          <div>
            <span className="font-serif italic font-semibold text-xl tracking-tight text-[#1C1917] dark:text-[#FAF9F6]">
              ApnaSpace
            </span>
            <span className="block text-[9px] text-[#C5A880] font-bold tracking-widest uppercase mt-0.5">
              Bespoke Marketplace
            </span>
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <div className="hidden md:flex items-center gap-1 bg-slate-100/50 dark:bg-slate-950/40 p-1.5 rounded-xl border border-slate-200/20 dark:border-slate-800/20 text-sm">
          <button 
            onClick={() => setCurrentTab('home')} 
            className={`px-4 py-2 rounded-lg font-medium transition-all ${currentTab === 'home' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'}`}
          >
            Discover
          </button>
          <button 
            onClick={() => setCurrentTab('ai-assistant')} 
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-1.5 ${currentTab === 'ai-assistant' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'}`}
          >
            <span className="w-2 h-2 rounded-full bg-[#C5A880] animate-pulse"></span>
            AI Assistant
          </button>
          <button 
            onClick={() => setCurrentTab('comparison')} 
            className={`px-4 py-2 rounded-lg font-medium transition-all ${currentTab === 'comparison' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'}`}
          >
            Compare
          </button>
          {user && (
            <button 
              onClick={() => setCurrentTab('dashboard')} 
              className={`px-4 py-2 rounded-lg font-medium transition-all ${currentTab === 'dashboard' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'}`}
            >
              Dashboard
            </button>
          )}
        </div>

        {/* CONTROLS */}
        <div className="flex items-center gap-3">
          
          {/* DARK MODE */}
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {user && (
            <>
              {/* CHAT LAUNCHER WITH FLOATING DROPDOWN */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowChat(!showChat);
                    setShowNotifications(false);
                    setShowProfileMenu(false);
                  }}
                  className={`relative p-2.5 rounded-xl transition-colors ${
                    showChat 
                      ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400' 
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                  aria-label="Chats"
                >
                  <MessageSquare size={20} />
                  {totalUnreadMessages > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-indigo-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-slate-900">
                      {totalUnreadMessages}
                    </span>
                  )}
                </button>

                {showChat && (
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 h-[480px] bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-800/40 z-50 flex flex-col overflow-hidden text-slate-800 dark:text-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
                    {activeChat ? (
                      /* ACTIVE CONVERSATION PANEL */
                      <>
                        {/* Header */}
                        <div className="p-3 border-b border-slate-100 dark:border-slate-800/50 flex items-center gap-3 bg-white dark:bg-slate-900">
                          <button 
                            type="button"
                            onClick={() => setActiveChat(null)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg text-slate-500 transition-colors"
                            title="Back to all threads"
                          >
                            <ArrowLeft size={16} />
                          </button>
                          <img 
                            src={activeChat.avatar} 
                            alt="" 
                            className="w-8 h-8 rounded-xl object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                          />
                          <div className="flex-grow min-w-0">
                            <h4 className="font-bold text-xs truncate text-slate-800 dark:text-slate-100">{activeChat.name}</h4>
                            <span className="block text-[9px] text-slate-400 capitalize mt-0.5">{activeChat.role} Manager</span>
                          </div>
                          <button 
                            type="button"
                            onClick={() => setShowChat(false)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg text-slate-400 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-grow overflow-y-auto p-4 chat-scrollbar flex flex-col gap-3 bg-slate-50/20 dark:bg-slate-950/10">
                          {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 text-[10px] py-20">
                              Start typing to begin conversations.
                            </div>
                          ) : (
                            messages.map((msg, i) => {
                              const isMe = msg.sender === (user._id || user.id);
                              return (
                                <div 
                                  key={i}
                                  className={`flex gap-2 max-w-[85%] ${isMe ? 'self-end flex-row-reverse' : 'self-start'}`}
                                >
                                  <img 
                                    src={isMe ? user.avatar : activeChat.avatar} 
                                    alt="" 
                                    className="w-6 h-6 rounded-lg object-cover flex-shrink-0"
                                  />
                                  <div className="flex flex-col gap-0.5">
                                    <div className={`p-2.5 rounded-xl text-[11px] leading-relaxed whitespace-pre-line ${
                                      isMe 
                                        ? 'bg-indigo-650 dark:bg-indigo-600 text-white rounded-tr-none' 
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-750 dark:text-slate-200 rounded-tl-none border border-slate-200/40 dark:border-slate-700/30 shadow-sm'
                                    }`}>
                                      {msg.image && (
                                        <img 
                                          src={msg.image} 
                                          alt="Attachment" 
                                          className="rounded-lg object-cover max-w-[150px] mb-1.5 cursor-zoom-in"
                                        />
                                      )}
                                      {msg.content}
                                    </div>
                                    <div className={`flex items-center gap-1 mt-0.5 text-[8px] text-slate-400 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                      <span>{formatTime(msg.createdAt)}</span>
                                      {isMe && (
                                        <CheckCheck size={10} className={msg.isRead ? 'text-indigo-500' : 'text-slate-400'} />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                          {isPartnerTyping && (
                            <div className="flex gap-2 self-start max-w-[80%] items-center">
                              <img src={activeChat.avatar} alt="" className="w-6 h-6 rounded-lg object-cover" />
                              <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200/40 dark:border-slate-700/30 px-2.5 py-1.5 rounded-xl rounded-tl-none text-[9px] text-slate-400 font-semibold italic animate-pulse">
                                typing...
                              </div>
                            </div>
                          )}
                          <div ref={chatEndRef} />
                        </div>

                        {/* Image Preview inside dropdown */}
                        {imagePreview && (
                          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-850/50 flex items-center justify-between gap-4 z-10 shadow-sm">
                            <div className="flex items-center gap-2">
                              <img src={imagePreview} className="w-12 h-9 object-cover rounded-lg border border-slate-200" />
                              <span className="text-[9px] text-slate-400 font-semibold">Image attachment ready</span>
                            </div>
                            <button 
                              type="button" 
                              onClick={clearImageSelection} 
                              className="p-1 px-2.5 bg-red-50 text-red-650 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400 rounded text-[9px] font-bold transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        )}

                        {/* Input Footer */}
                        <form onSubmit={handleFormSubmit} className="p-3 border-t border-slate-100 dark:border-slate-800/50 bg-white dark:bg-slate-900">
                          <div className="relative flex items-center gap-2">
                            <input 
                              type="file" 
                              accept="image/*"
                              ref={fileInputRef}
                              onChange={handleImageChange}
                              className="hidden"
                            />
                            <button 
                              type="button" 
                              onClick={() => fileInputRef.current?.click()}
                              className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-850 rounded-xl text-slate-450 transition-colors"
                              title="Attach Image"
                            >
                              <ImageIcon size={14} />
                            </button>

                            <input 
                              type="text" 
                              placeholder="Type a message..."
                              value={text}
                              onChange={handleTextChange}
                              onBlur={handleBlur}
                              className="w-full px-3 py-2 bg-slate-50 focus:bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs pr-10"
                            />

                            <button 
                              type="submit"
                              disabled={!text.trim() && !selectedImage}
                              className="absolute right-1.5 top-1.5 p-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg shadow-sm transition-all"
                            >
                              <Send size={12} />
                            </button>
                          </div>
                        </form>
                      </>
                    ) : (
                      /* CONVERSATIONS THREAD LIST VIEW */
                      <>
                        {/* Header */}
                        <div className="p-3.5 border-b border-slate-100 dark:border-slate-800/50 flex items-center justify-between bg-white dark:bg-slate-900">
                          <h3 className="font-extrabold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">Messages ({conversations.length})</h3>
                          <button 
                            type="button"
                            onClick={() => setShowChat(false)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg text-slate-500 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>

                        {/* List */}
                        <div className="flex-grow overflow-y-auto chat-scrollbar p-2 flex flex-col gap-1 bg-white dark:bg-slate-900">
                          {conversations.length === 0 ? (
                            <div className="text-center py-24 text-[10px] text-slate-400 font-semibold select-none">
                              No active conversations yet
                            </div>
                          ) : (
                            conversations.map(conv => {
                              const isUnread = conv.unreadCount > 0;
                              return (
                                <div 
                                  key={conv.chatId}
                                  onClick={() => setActiveChat(conv.partner)}
                                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors border border-transparent ${
                                    isUnread 
                                      ? 'bg-slate-50 hover:bg-slate-100/80 dark:bg-slate-800/30 dark:hover:bg-slate-800/50' 
                                      : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/20'
                                  }`}
                                >
                                  <img 
                                    src={conv.partner.avatar} 
                                    alt="" 
                                    className="w-8 h-8 rounded-lg object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                                  />
                                  <div className="min-w-0 flex-grow">
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-xs truncate max-w-[130px] text-slate-800 dark:text-slate-100">{conv.partner.name}</span>
                                      <span className="text-[8px] text-slate-400">{formatTime(conv.lastMessage.createdAt)}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 truncate mt-0.5 max-w-[180px] font-medium">
                                      {conv.lastMessage.content}
                                    </p>
                                  </div>
                                  {isUnread && (
                                    <span className="w-4 h-4 bg-indigo-650 text-white rounded-full text-[8px] font-extrabold flex items-center justify-center">
                                      {conv.unreadCount}
                                    </span>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* NOTIFICATION CENTER */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell size={20} />
                  {notifications.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-800/40 p-4 z-50">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50 pb-2 mb-2">
                      <span className="font-bold text-sm">In-App Notifications</span>
                      {notifications.length > 0 && (
                        <button onClick={clearNotifications} className="text-[11px] text-indigo-500 font-semibold hover:underline">
                          Clear all
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-400">
                        No new notifications
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 max-h-60 overflow-y-auto chat-scrollbar">
                        {notifications.map((n, i) => (
                          <div 
                            key={i} 
                            onClick={() => handleNotificationClick(n)}
                            className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer text-xs transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
                          >
                            <div className="font-semibold text-slate-800 dark:text-slate-200">{n.title}</div>
                            <div className="text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{n.message}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* USER ACCOUNT DROPDOWN */}
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-8 h-8 rounded-lg object-cover ring-2 ring-indigo-500/20"
                />
                <span className="hidden sm:inline text-xs font-semibold max-w-[80px] truncate">
                  {user.name.split(' ')[0]}
                </span>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-800/40 p-2 z-50">
                  <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800/50 text-xs">
                    <div className="font-bold text-slate-800 dark:text-slate-200">{user.name}</div>
                    <div className="text-slate-400 truncate mt-0.5">{user.email}</div>
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-md font-bold uppercase text-[9px]">
                      {user.role === 'admin' && <Shield size={10} />}
                      {user.role === 'agent' && <Award size={10} />}
                      {user.role}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 mt-1">
                    <button 
                      onClick={() => { setShowProfileMenu(false); setCurrentTab('dashboard'); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
                    >
                      <User size={14} /> My Dashboard
                    </button>
                    <button 
                      onClick={() => { setShowProfileMenu(false); logout(); setCurrentTab('home'); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-left text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                    >
                      <LogOut size={14} /> Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={() => setCurrentTab('login')}
              className="btn-primary"
            >
              Sign In
            </button>
          )}

        </div>
      </div>
    </nav>
  );
}
