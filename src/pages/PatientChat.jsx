import React, { useState, useEffect } from 'react';
import Navbar from '../components/dashboard/Navbar';
import ChatHeader from '../components/chat/ChatHeader';
import MessageBubble from '../components/chat/MessageBubble';
import ChatInputBox from '../components/chat/ChatInputBox';
import { Search, Loader } from 'lucide-react';
import apiService from '../services/api';
import { useAuth } from '../context/AuthContext';

const PatientChat = () => {
  const { user } = useAuth();
  const [selectedPhysio, setSelectedPhysio] = useState(null);
  const [messages, setMessages] = useState([]);
  const [physiotherapists, setPhysiotherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPhysiotherapists();
  }, []);

  useEffect(() => {
    if (selectedPhysio) {
      fetchMessages(selectedPhysio.id);
    }
  }, [selectedPhysio]);

  const fetchPhysiotherapists = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUsers({ user_type: 'physiotherapist' });
      const physios = response.results || response;
      
      // Add mock chat data for demonstration
      const physiosWithChat = physios.map(physio => ({
        ...physio,
        lastMessage: 'Available for consultation',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        avatar: physio.first_name?.charAt(0) || '👨‍⚕️',
        isOnline: Math.random() > 0.5 // Mock online status
      }));
      
      setPhysiotherapists(physiosWithChat);
      if (physiosWithChat.length > 0) {
        setSelectedPhysio(physiosWithChat[0]);
      }
    } catch (error) {
      console.error('Failed to fetch physiotherapists:', error);
      setError('Failed to load physiotherapists');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (physioId) => {
    try {
      // Mock messages for demonstration since chat API might not be implemented
      const mockMessages = [
        { 
          id: 1, 
          text: "Hello! How are you feeling today?", 
          isSent: false, 
          timestamp: new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sender: selectedPhysio?.first_name || 'Doctor'
        },
        { 
          id: 2, 
          text: "I'm doing better, thanks for asking!", 
          isSent: true, 
          timestamp: new Date(Date.now() - 3300000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sender: user?.first_name || 'You'
        },
        { 
          id: 3, 
          text: "That's great to hear! How did the exercises go?", 
          isSent: false, 
          timestamp: new Date(Date.now() - 3000000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sender: selectedPhysio?.first_name || 'Doctor'
        },
        { 
          id: 4, 
          text: "They were challenging but I managed to complete them all", 
          isSent: true, 
          timestamp: new Date(Date.now() - 2700000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sender: user?.first_name || 'You'
        },
        { 
          id: 5, 
          text: "Excellent work! Keep it up 💪", 
          isSent: false, 
          timestamp: new Date(Date.now() - 2400000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sender: selectedPhysio?.first_name || 'Doctor'
        }
      ];
      
      setMessages(mockMessages);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleSendMessage = async (messageText) => {
    if (!messageText.trim() || !selectedPhysio) return;
    
    setSendingMessage(true);
    
    const newMessage = {
      id: Date.now(),
      text: messageText,
      isSent: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: user?.first_name || 'You'
    };
    
    // Optimistically add message to UI
    setMessages(prev => [...prev, newMessage]);
    
    try {
      // In a real app, this would send to the backend
      // await apiService.sendMessage(selectedPhysio.id, messageText);
      
      // Mock response from physiotherapist
      setTimeout(() => {
        const responseMessage = {
          id: Date.now() + 1,
          text: "Thank you for the update! Keep up the great work.",
          isSent: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sender: selectedPhysio.first_name
        };
        setMessages(prev => [...prev, responseMessage]);
      }, 2000);
      
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove the optimistically added message on error
      setMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading chat...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchPhysiotherapists}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="h-[calc(100vh-80px)] flex">
        {/* Physiotherapist List Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Chat</h2>
            <p className="text-sm text-gray-600 mb-4">Chat with your Physiotherapists</p>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search physiotherapists"
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {physiotherapists.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No physiotherapists available
              </div>
            ) : (
              physiotherapists.map((physio) => (
                <button
                  key={physio.id}
                  onClick={() => setSelectedPhysio(physio)}
                  className={`w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 transition-colors ${
                    selectedPhysio?.id === physio.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-lg font-semibold text-blue-600">
                        {physio.avatar}
                      </div>
                      {physio.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-900 truncate">
                          {physio.first_name} {physio.last_name}
                        </h4>
                        <span className="text-xs text-gray-500">{physio.time}</span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{physio.lastMessage}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedPhysio ? (
            <>
              <ChatHeader 
                userName={`${selectedPhysio.first_name} ${selectedPhysio.last_name}`} 
                isOnline={selectedPhysio.isOnline} 
              />
              
              <div className="flex-1 p-6 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Start a conversation with {selectedPhysio.first_name}
                  </div>
                ) : (
                  messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message.text}
                      isSent={message.isSent}
                      timestamp={message.timestamp}
                    />
                  ))
                )}
                {sendingMessage && (
                  <div className="flex justify-end mb-4">
                    <div className="bg-blue-500 text-white px-4 py-2 rounded-lg opacity-50">
                      <Loader className="w-4 h-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
              
              <ChatInputBox 
                onSendMessage={handleSendMessage} 
                disabled={sendingMessage}
              />
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a physiotherapist to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientChat;