import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Phone, 
  Video, 
  MoreVertical,
  User,
  Bot,
  Mic,
  MicOff
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

const DynamicChat = ({ recipientId, recipientName = "Dr. Smith" }) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(['Dr. Smith', 'Nurse Johnson']);
  const messagesEndRef = useRef(null);

  // Simulate real-time messages
  useEffect(() => {
    const initialMessages = [
      {
        id: 1,
        sender: recipientName,
        content: "Hello! How are you feeling today?",
        timestamp: new Date(Date.now() - 300000),
        type: 'text'
      },
      {
        id: 2,
        sender: user?.first_name || 'You',
        content: "I'm doing well, thank you! Completed my exercises this morning.",
        timestamp: new Date(Date.now() - 240000),
        type: 'text'
      },
      {
        id: 3,
        sender: recipientName,
        content: "That's great to hear! How did the shoulder exercises feel?",
        timestamp: new Date(Date.now() - 180000),
        type: 'text'
      }
    ];
    setMessages(initialMessages);

    // Simulate incoming messages
    const messageInterval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance every 10 seconds
        const responses = [
          "Keep up the great work!",
          "Remember to stay hydrated during exercises.",
          "How's your pain level today on a scale of 1-10?",
          "I've updated your exercise plan. Please check it out.",
          "Don't forget about your appointment tomorrow at 2 PM."
        ];
        
        const newMsg = {
          id: Date.now(),
          sender: recipientName,
          content: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date(),
          type: 'text'
        };
        
        setMessages(prev => [...prev, newMsg]);
        addNotification({
          type: 'info',
          title: 'New Message',
          message: `${recipientName}: ${newMsg.content.substring(0, 50)}...`
        });
      }
    }, 10000);

    return () => clearInterval(messageInterval);
  }, [recipientName, user, addNotification]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate typing indicator
  useEffect(() => {
    if (newMessage.length > 0) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [newMessage]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      sender: user?.first_name || 'You',
      content: newMessage,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate response after a delay
    setTimeout(() => {
      const responses = [
        "Thanks for the update!",
        "I'll review this and get back to you.",
        "That sounds good. Keep me posted on your progress.",
        "Let me know if you have any questions.",
        "Great! I'm proud of your dedication."
      ];
      
      const response = {
        id: Date.now() + 1,
        sender: recipientName,
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, response]);
    }, 2000 + Math.random() * 3000);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      addNotification({
        type: 'info',
        title: 'Voice Recording',
        message: 'Voice recording started'
      });
    } else {
      addNotification({
        type: 'success',
        title: 'Voice Message',
        message: 'Voice message sent successfully'
      });
    }
  };

  const MessageBubble = ({ message, isOwn }) => (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        isOwn 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-100 text-gray-900'
      }`}>
        <p className="text-sm">{message.content}</p>
        <p className={`text-xs mt-1 ${
          isOwn ? 'text-blue-100' : 'text-gray-500'
        }`}>
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
      </div>
    </motion.div>
  );

  const TypingIndicator = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex justify-start mb-4"
    >
      <div className="bg-gray-100 px-4 py-2 rounded-lg">
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-gray-400 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Chat Header */}
      <motion.div 
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h3 className="font-semibold">{recipientName}</h3>
              <p className="text-sm text-blue-100">Online</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <Phone className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <Video className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <AnimatePresence>
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.sender === (user?.first_name || 'You')}
            />
          ))}
          {isTyping && <TypingIndicator />}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <motion.div 
        className="border-t border-gray-200 p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Paperclip className="w-5 h-5" />
          </motion.button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
            >
              <Smile className="w-4 h-4" />
            </motion.button>
          </div>
          
          <motion.button
            type="button"
            onClick={toggleRecording}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`p-2 rounded-full transition-colors ${
              isRecording 
                ? 'bg-red-500 text-white' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </motion.button>
          
          <motion.button
            type="submit"
            disabled={!newMessage.trim()}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default DynamicChat;