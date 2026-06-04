import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { useAuth } from './AuthContext';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // The user object we are chatting with
  const [messages, setMessages] = useState([]);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const socketRef = useRef(null);

  // Helper: Sort and concatenate user IDs to create unique chatId
  const getChatId = (id1, id2) => {
    return [id1.toString(), id2.toString()].sort().join('_');
  };

  // Connect socket when user logs in
  useEffect(() => {
    if (user) {
      // Connect to the socket server
      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';
      socketRef.current = io(socketUrl);
      console.log('Socket.io connected on frontend.');

      // Listen to personal notification events
      socketRef.current.on(`notification_${user._id || user.id}`, (notification) => {
        setNotifications(prev => [notification, ...prev]);
        // Trigger browser audio notification
        try {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav');
          audio.volume = 0.5;
          audio.play();
        } catch (e) {
          // ignore audio load failures
        }
      });

      // Fetch past conversations list on load
      fetchConversations();

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          console.log('Socket.io disconnected.');
        }
      };
    } else {
      setConversations([]);
      setActiveChat(null);
      setMessages([]);
      setNotifications([]);
    }
  }, [user]);

  // Listen to chat room events when activeChat changes
  useEffect(() => {
    if (user && activeChat && socketRef.current) {
      const chatId = getChatId(user._id || user.id, activeChat._id || activeChat.id);
      
      // Join room
      socketRef.current.emit('join_chat', chatId);

      // Fetch messages history via REST API
      fetchMessages(activeChat._id || activeChat.id);

      // Listen to incoming messages
      socketRef.current.on('receive_message', (message) => {
        setMessages(prev => {
          // Prevent duplicates
          if (prev.some(m => m._id === message._id)) return prev;
          return [...prev, message];
        });

        // Trigger read receipt
        if (message.sender !== (user._id || user.id)) {
          socketRef.current.emit('read_receipt', {
            chatId,
            messageId: message._id,
            receiverId: user._id || user.id,
            senderId: activeChat._id || activeChat.id
          });
        }

        // Refresh conversation previews
        fetchConversations();
      });

      // Listen to typing status
      socketRef.current.on('typing_status', (data) => {
        if (data.senderId === (activeChat._id || activeChat.id)) {
          setIsPartnerTyping(data.isTyping);
        }
      });

      // Listen to message read events
      socketRef.current.on('messages_read', (data) => {
        if (data.senderId === (activeChat._id || activeChat.id)) {
          setMessages(prev => prev.map(m => m.receiver === (activeChat._id || activeChat.id) ? { ...m, isRead: true } : m));
        }
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.off('receive_message');
          socketRef.current.off('typing_status');
          socketRef.current.off('messages_read');
        }
        setIsPartnerTyping(false);
      };
    }
  }, [activeChat, user]);

  const fetchConversations = async () => {
    if (!token) return;
    try {
      const res = await axios.get('/chats/conversations');
      if (res.data.success) {
        setConversations(res.data.conversations);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err.message);
    }
  };

  const fetchMessages = async (partnerId) => {
    try {
      const res = await axios.get(`/chats/messages/${partnerId}`);
      if (res.data.success) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      console.error('Error fetching messages:', err.message);
    }
  };

  const sendMessage = async (content, imageFile = null) => {
    if (!user || !activeChat) return;
    const chatId = getChatId(user._id || user.id, activeChat._id || activeChat.id);

    // If sending an image, we use HTTP multipart upload
    if (imageFile) {
      try {
        const formData = new FormData();
        formData.append('receiverId', activeChat._id || activeChat.id);
        formData.append('content', content || '');
        formData.append('image', imageFile);

        const res = await axios.post('/chats/messages', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (res.data.success) {
          const newMsg = res.data.message;
          // Notify backend room via socket that we just added a message via HTTP
          if (socketRef.current) {
            socketRef.current.emit('send_message', {
              chatId,
              senderId: user._id || user.id,
              receiverId: activeChat._id || activeChat.id,
              content: newMsg.content,
              image: newMsg.image,
              isAlreadySaved: true,
              messageId: newMsg._id
            });
          }
          fetchConversations();
        }
      } catch (err) {
        console.error('Error uploading image message:', err.message);
      }
    } else {
      // Direct Socket emit
      if (socketRef.current) {
        socketRef.current.emit('send_message', {
          chatId,
          senderId: user._id || user.id,
          receiverId: activeChat._id || activeChat.id,
          content,
        });
      }
    }
  };

  const setTyping = (isTyping) => {
    if (user && activeChat && socketRef.current) {
      const chatId = getChatId(user._id || user.id, activeChat._id || activeChat.id);
      socketRef.current.emit('typing', {
        chatId,
        senderId: user._id || user.id,
        isTyping
      });
    }
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeChat,
        setActiveChat,
        messages,
        sendMessage,
        setTyping,
        isPartnerTyping,
        notifications,
        setNotifications,
        fetchConversations,
        showChat,
        setShowChat
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
