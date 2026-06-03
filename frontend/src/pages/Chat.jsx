import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { Send, Image, Bot, User, CheckCheck, Smile, Paperclip } from 'lucide-react';

export default function Chat() {
  const { user } = useAuth();
  const { 
    conversations, 
    activeChat, 
    setActiveChat, 
    messages, 
    sendMessage, 
    setTyping, 
    isPartnerTyping,
    fetchConversations 
  } = useChat();

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col items-center justify-center text-center gap-4">
        <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-200">Sign in to read messages</h3>
        <p className="text-xs text-slate-400 max-w-xs">You must be logged in to view your conversation threads and messages.</p>
      </div>
    );
  }

  const [text, setText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);
  const messageEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  // Auto-scroll chat history when messages append
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Typing status triggers
  const handleTextChange = (e) => {
    setText(e.target.value);
    
    // Broadcast typing event
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
      // Create local URL for preview
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

    // Send via ChatContext (handles both socket and HTTP fallback)
    await sendMessage(text.trim(), selectedImage);
    
    // Clear inputs
    setText('');
    clearImageSelection();
    setTyping(false);
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      
      <div className="grid grid-cols-1 md:grid-cols-4 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl overflow-hidden shadow-lg h-[75vh]">
        
        {/* Left 1 Column: Conversations Sidebar */}
        <div className="md:col-span-1 border-r border-slate-100 dark:border-slate-800/50 flex flex-col h-full bg-slate-50/20 dark:bg-slate-950/20">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800/50">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider">Messages threads</h3>
          </div>
          <div className="flex-grow overflow-y-auto chat-scrollbar p-2 flex flex-col gap-1">
            {conversations.length === 0 ? (
              <div className="text-center py-12 text-[10px] text-slate-400 font-medium">
                No active conversations yet.
              </div>
            ) : (
              conversations.map(conv => {
                const isActive = activeChat && (activeChat._id || activeChat.id) === conv.partner._id;
                return (
                  <div 
                    key={conv.chatId}
                    onClick={() => setActiveChat(conv.partner)}
                    className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-colors border border-transparent ${
                      isActive 
                        ? 'bg-indigo-50 border-indigo-100/50 dark:bg-indigo-950/30 dark:border-indigo-900/20 text-indigo-600 dark:text-indigo-400' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                    }`}
                  >
                    <img 
                      src={conv.partner.avatar} 
                      alt="" 
                      className="w-9 h-9 rounded-xl object-cover ring-2 ring-slate-200/40"
                    />
                    <div className="min-w-0 flex-grow">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs truncate max-w-[100px] text-slate-800 dark:text-slate-100">{conv.partner.name}</span>
                        <span className="text-[9px] text-slate-400">{formatTime(conv.lastMessage.createdAt)}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5 max-w-[140px] font-medium">
                        {conv.lastMessage.content}
                      </p>
                    </div>
                    
                    {/* Unread message count badge */}
                    {conv.unreadCount > 0 && !isActive && (
                      <span className="w-4 h-4 bg-indigo-600 text-white rounded-full text-[9px] font-extrabold flex items-center justify-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 3 Columns: Active Conversational Window */}
        <div className="md:col-span-3 flex flex-col h-full bg-white dark:bg-slate-900 relative">
          
          {activeChat ? (
            <>
              {/* Partner profile header */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800/50 flex items-center gap-3 bg-slate-50/10">
                <img 
                  src={activeChat.avatar} 
                  alt="" 
                  className="w-10 h-10 rounded-xl object-cover"
                />
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">{activeChat.name}</h4>
                  <span className="text-[10px] text-slate-400 capitalize font-medium">{activeChat.role} Manager</span>
                </div>
              </div>

              {/* Message log items */}
              <div className="flex-grow overflow-y-auto p-6 chat-scrollbar flex flex-col gap-4 bg-slate-50/20 dark:bg-slate-950/10">
                {messages.map((msg, i) => {
                  const isMe = msg.sender === (user._id || user.id);
                  return (
                    <div 
                      key={i}
                      className={`flex gap-3 max-w-[70%] ${isMe ? 'self-end flex-row-reverse' : 'self-start'}`}
                    >
                      <img 
                        src={isMe ? user.avatar : activeChat.avatar} 
                        alt="" 
                        className="w-7 h-7 rounded-lg object-cover flex-shrink-0"
                      />
                      
                      <div className="flex flex-col gap-1">
                        <div className={`p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                          isMe 
                            ? 'bg-indigo-600 text-white rounded-tr-none' 
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-none border border-slate-200/50 dark:border-slate-800/40 shadow-sm'
                        }`}>
                          {msg.image && (
                            <img 
                              src={msg.image} 
                              alt="Attachment" 
                              className="rounded-xl object-cover max-w-[200px] mb-2 cursor-zoom-in"
                            />
                          )}
                          {msg.content}
                        </div>
                        
                        <div className={`flex items-center gap-1 mt-0.5 text-[9px] text-slate-400 ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <span>{formatTime(msg.createdAt)}</span>
                          {isMe && (
                            <CheckCheck size={11} className={msg.isRead ? 'text-indigo-500' : 'text-slate-300'} />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Typing alert */}
                {isPartnerTyping && (
                  <div className="flex gap-3 self-start max-w-[70%] items-center">
                    <img src={activeChat.avatar} alt="" className="w-7 h-7 rounded-lg object-cover" />
                    <div className="bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-2xl rounded-tl-none text-[10px] text-slate-400 font-semibold italic animate-pulse">
                      {activeChat.name.split(' ')[0]} is typing...
                    </div>
                  </div>
                )}
                
                <div ref={messageEndRef} />
              </div>

              {/* Selected image preview drawer */}
              {imagePreview && (
                <div className="absolute bottom-20 left-4 right-4 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-between gap-4 z-10 shadow-lg">
                  <div className="flex items-center gap-2">
                    <img src={imagePreview} className="w-16 h-12 object-cover rounded-xl border" />
                    <span className="text-[10px] text-slate-400 font-semibold">Image attachment ready</span>
                  </div>
                  <button onClick={clearImageSelection} className="p-1 bg-slate-200 hover:bg-slate-300 rounded-lg text-xs font-bold px-2">Cancel</button>
                </div>
              )}

              {/* Message inputs box */}
              <form onSubmit={handleFormSubmit} className="p-4 border-t border-slate-100 dark:border-slate-800/40 bg-slate-50/20">
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
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-slate-400 transition-colors"
                    title="Attach Image"
                  >
                    <Image size={18} />
                  </button>

                  <input 
                    type="text" 
                    placeholder="Type your message details here..."
                    value={text}
                    onChange={handleTextChange}
                    onBlur={handleBlur}
                    className="premium-input pr-12"
                  />

                  <button 
                    type="submit"
                    disabled={!text.trim() && !selectedImage}
                    className="absolute right-2 top-2 p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl shadow-md transition-all"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 gap-2">
              <MessageSquare size={36} className="text-slate-300 dark:text-slate-700 animate-bounce" />
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">No active thread selected</h4>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">Choose a user from the messages sidebar to open communication logs.</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
