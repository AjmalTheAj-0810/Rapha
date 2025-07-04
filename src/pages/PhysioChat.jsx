import React, { useState, useEffect } from 'react';
import Navbar from '../components/dashboard/Navbar';
import ChatHeader from '../components/chat/ChatHeader';
import MessageBubble from '../components/chat/MessageBubble';
import ChatInputBox from '../components/chat/ChatInputBox';
import { Search, Loader } from 'lucide-react';
import apiService from '../services/api';
import { useAuth } from '../context/AuthContext';

const PhysioChat = () => {
  const { user } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      fetchMessages(selectedPatient.id);
    }
  }, [selectedPatient]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUsers({ user_type: 'patient' });
      const patientList = response.results || response;
      
      // Add mock chat data for demonstration
      const patientsWithChat = patientList.map(patient => ({
        ...patient,
        lastMessage: 'Available for consultation',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        avatar: patient.first_name?.charAt(0) || '👤',
        isOnline: Math.random() > 0.5 // Mock online status
      }));
      
      setPatients(patientsWithChat);
      if (patientsWithChat.length > 0) {
        setSelectedPatient(patientsWithChat[0]);
      }
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      setError('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (patientId) => {
    try {
      // Mock messages for now - in real app would fetch from chat API
      const mockMessages = [
        { id: 1, text: `Good morning ${selectedPatient?.first_name}! How are you feeling today?`, isSent: true, timestamp: "9:00 AM" },
        { id: 2, text: "Hi Dr. Smith! I'm feeling much better, thank you!", isSent: false, timestamp: "9:05 AM" },
        { id: 3, text: "That's wonderful to hear! How did yesterday's exercises go?", isSent: true, timestamp: "9:10 AM" },
        { id: 4, text: "They were tough but I completed all of them. My knee feels stronger!", isSent: false, timestamp: "9:15 AM" },
        { id: 5, text: "Excellent progress! Keep up the great work 🎉", isSent: true, timestamp: "9:16 AM" }
      ];
      setMessages(mockMessages);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleSendMessage = async (messageText) => {
    if (!selectedPatient || !messageText.trim()) return;
    
    setSendingMessage(true);
    try {
      const newMessage = {
        id: messages.length + 1,
        text: messageText,
        isSent: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...messages, newMessage]);
      
      // In real app, would send message via API
      // await apiService.sendMessage(selectedPatient.id, messageText);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="h-[calc(100vh-80px)] flex">
        {/* Patient List Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Physiotherapist Chat</h2>
            <p className="text-sm text-gray-600 mb-4">Chat with your Patients</p>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-600">
                {error}
              </div>
            ) : patients.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No patients found
              </div>
            ) : (
              patients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => setSelectedPatient(patient)}
                  className={`w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 transition-colors ${
                    selectedPatient?.id === patient.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg relative">
                      {patient.avatar}
                      {patient.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-900 truncate">
                          {patient.first_name} {patient.last_name}
                        </h4>
                        <span className="text-xs text-gray-500">{patient.time}</span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{patient.lastMessage}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <ChatHeader 
            userName={selectedPatient ? `${selectedPatient.first_name} ${selectedPatient.last_name}` : 'Select a patient'} 
            isOnline={selectedPatient?.isOnline || false} 
          />
          
          <div className="flex-1 p-6 overflow-y-auto">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message.text}
                isSent={message.isSent}
                timestamp={message.timestamp}
              />
            ))}
          </div>
          
          <ChatInputBox onSendMessage={handleSendMessage} />
        </div>
      </div>
    </div>
  );
};

export default PhysioChat;