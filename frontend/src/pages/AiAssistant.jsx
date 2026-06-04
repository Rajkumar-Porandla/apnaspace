import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import PropertyCard from '../components/PropertyCard';
import { Send, Bot, User, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AiAssistant({ onViewDetails }) {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! I am your ApnaSpace Assistant. Tell me what kind of property you are looking for in natural language. For example:\n\n• \"I need a 2 BHK apartment in Delhi under ₹60 lakh.\"\n• \"Suggest properties in Mumbai near schools.\"\n• \"Find investment-friendly plots or lands.\""
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [chatProperties, setChatProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchInitialProperties = async () => {
      try {
        const res = await axios.get('/properties?limit=100');
        if (res.data.success) {
          setChatProperties(res.data.properties || []);
        }
      } catch (err) {
        console.error('Failed to load initial properties:', err);
      }
    };
    fetchInitialProperties();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = inputText.trim();
    setInputText('');
    
    // Add user message to log
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await axios.post('/ai/chat', { message: userMsg });
      if (res.data.success) {
        // Add AI response text
        setMessages(prev => [...prev, { 
          sender: 'bot', 
          text: res.data.explanation,
          filters: res.data.filters
        }]);
        
        // Populate matching properties side grid
        setChatProperties(res.data.properties || []);
      } else {
        setMessages(prev => [...prev, { 
          sender: 'bot', 
          text: res.data.message || 'Sorry, I encountered an issue processing that request. Please try again.' 
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: 'Sorry, I encountered an issue processing that request. Please try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const applySamplePrompt = (promptText) => {
    setInputText(promptText);
  };

  const formatCurrency = (val) => {
    if (!val) return '';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(0)} Lakh`;
    return `₹${val.toLocaleString()}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Sparkles className="text-indigo-500 animate-pulse" /> AI Conversational Assistant
        </h1>
        <p className="text-xs text-slate-400 mt-1">Talk to our artificial intelligence to search, filter, and extract perfect property listings.</p>
      </div>

      {/* Split Layout: Left Chat, Right Properties List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left 2 Columns: Chat log */}
        <div className="lg:col-span-2 flex flex-col h-[70vh] bg-[#FDFCFB]/90 dark:bg-[#161513]/90 border border-[#C5A880]/25 dark:border-slate-800/40 rounded-3xl overflow-hidden shadow-lg shadow-[#1C1917]/5">
          
          {/* Chat Messages Area */}
          <div className="flex-grow overflow-y-auto p-6 chat-scrollbar flex flex-col gap-4 bg-[#FAF8F5]/80 dark:bg-[#12110E]/60">
            {messages.map((msg, index) => (
              <div 
                key={index}
                className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold ${msg.sender === 'user' ? 'bg-[#1C1917] dark:bg-indigo-600' : 'bg-gradient-to-tr from-[#C5A880] to-[#b09570] dark:from-purple-500 dark:to-indigo-600'}`}>
                  {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>

                {/* Bubble */}
                <div className="flex flex-col gap-1">
                  <div className={`p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${msg.sender === 'user' ? 'bg-[#1C1917] dark:bg-indigo-600 text-[#FAF9F6] rounded-tr-none shadow-sm' : 'bg-[#F7F5EE] dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-none border border-[#C5A880]/15 dark:border-slate-800/30 shadow-sm'}`}>
                    {msg.text}
                  </div>

                  {/* Filter tags generated by bot */}
                  {msg.sender === 'bot' && msg.filters && (msg.filters.city || msg.filters.propertyType || msg.filters.bedrooms > 0) && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {msg.filters.city && (
                        <span className="px-2 py-0.5 bg-[#FAF8F5] dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md text-[10px] font-bold capitalize border border-[#C5A880]/10 dark:border-transparent">
                          City: {msg.filters.city}
                        </span>
                      )}
                      {msg.filters.propertyType && (
                        <span className="px-2 py-0.5 bg-[#FAF8F5] dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md text-[10px] font-bold capitalize border border-[#C5A880]/10 dark:border-transparent">
                          Type: {msg.filters.propertyType}
                        </span>
                      )}
                      {msg.filters.bedrooms > 0 && (
                        <span className="px-2 py-0.5 bg-[#FAF8F5] dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md text-[10px] font-bold border border-[#C5A880]/10 dark:border-transparent">
                          Bedrooms: {msg.filters.bedrooms} BHK
                        </span>
                      )}
                      {msg.filters.maxPrice > 0 && (
                        <span className="px-2 py-0.5 bg-[#FAF8F5] dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md text-[10px] font-bold border border-[#C5A880]/10 dark:border-transparent">
                          Budget: {formatCurrency(msg.filters.maxPrice)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-3 self-start max-w-[85%] items-center">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#C5A880] to-[#b09570] flex items-center justify-center text-white"><Bot size={14} /></div>
                <div className="bg-[#F7F5EE] dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-[#C5A880]/15 dark:border-slate-800/30 flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Suggestion Chips */}
          <div className="px-6 py-2 border-t border-[#C5A880]/10 dark:border-slate-800/20 bg-[#FBF9F6] dark:bg-[#151412]/50 flex flex-wrap gap-2 text-[10px] font-semibold text-slate-500 select-none">
            <span className="self-center">Suggested prompts:</span>
            <button onClick={() => applySamplePrompt('I need a 2 BHK apartment in Delhi under ₹60 lakh')} className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/60 rounded-lg cursor-pointer">
              2 BHK in Delhi under ₹60L
            </button>
            <button onClick={() => applySamplePrompt('Suggest properties in Mumbai near schools')} className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/60 rounded-lg cursor-pointer">
              Near schools in Mumbai
            </button>
            <button onClick={() => applySamplePrompt('Find investment-friendly plots')} className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/60 rounded-lg cursor-pointer">
              Investment plots
            </button>
          </div>

          {/* Input Box Footer */}
          <form onSubmit={handleSend} className="p-4 border-t border-[#C5A880]/10 dark:border-slate-800/40 bg-[#FBF9F6] dark:bg-[#151412]/50">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Ask me: 'Show me apartments in Mumbai around 1 crore'..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={loading}
                className="premium-input pr-12"
              />
              <button 
                type="submit"
                disabled={loading || !inputText.trim()}
                className="absolute right-2 top-2 p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl shadow-md transition-all"
              >
                <Send size={14} />
              </button>
            </div>
          </form>

        </div>

        {/* Right Column: Dynamic Matched Properties Grid */}
        <div className="flex flex-col gap-4">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30 rounded-2xl flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 rounded-xl text-white">
              <Sparkles size={16} />
            </div>
            <div>
              <h4 className="font-bold text-xs text-indigo-700 dark:text-indigo-400">AI Matched Properties</h4>
              <p className="text-[10px] text-indigo-500/70 font-semibold mt-0.5">Results updates automatically per query.</p>
            </div>
          </div>

          {chatProperties.length === 0 ? (
            <div className="glass-card py-20 text-center text-xs text-slate-400 font-semibold p-4">
              Submit a natural language search query on the left to display matching properties.
            </div>
          ) : (
            <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto chat-scrollbar pr-1">
              {chatProperties.map(p => (
                <div 
                  key={p._id} 
                  onClick={() => onViewDetails(p._id)}
                  className="glass-card p-3 rounded-2xl flex gap-3 cursor-pointer hover:bg-white/80"
                >
                  <img 
                    src={p.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80'} 
                    alt="" 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80';
                    }}
                    className="w-20 h-16 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="flex-grow min-w-0">
                    <h4 className="font-bold text-xs truncate text-slate-800 dark:text-slate-200">{p.title}</h4>
                    <div className="text-[10px] text-slate-400 capitalize mt-0.5">{p.city}, {p.state}</div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="font-extrabold text-xs text-indigo-600 dark:text-indigo-400">
                        {p.listingType === 'rent'
                          ? (p.price >= 100000 ? `₹${(p.price / 100000).toFixed(2)} L/mo` : `₹${p.price.toLocaleString()}/mo`)
                          : (p.price >= 10000000 ? `₹${(p.price / 10000000).toFixed(2)} Cr` : `₹${(p.price / 100000).toFixed(0)} L`)
                        }
                      </span>
                      <span className="text-[9px] text-slate-500 font-medium">{p.bedrooms} BHK • {p.area} sqft</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
