import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, User, Calendar, FileText, Activity } from 'lucide-react';
import { useLiveSearch } from '../../hooks/useRealTimeData';

const LiveSearch = ({ onSelect, placeholder = "Search..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef(null);

  // Mock search function - in real app, this would call your API
  const searchFunction = async (query) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const mockData = [
      { id: 1, type: 'patient', title: 'John Doe', subtitle: 'Patient ID: P001', icon: User },
      { id: 2, type: 'patient', title: 'Jane Smith', subtitle: 'Patient ID: P002', icon: User },
      { id: 3, type: 'appointment', title: 'Appointment with Dr. Wilson', subtitle: 'Today at 2:00 PM', icon: Calendar },
      { id: 4, type: 'exercise', title: 'Shoulder Rehabilitation', subtitle: 'Exercise Program', icon: Activity },
      { id: 5, type: 'document', title: 'Medical Report - March 2024', subtitle: 'PDF Document', icon: FileText },
      { id: 6, type: 'patient', title: 'Mike Johnson', subtitle: 'Patient ID: P003', icon: User },
      { id: 7, type: 'appointment', title: 'Follow-up Session', subtitle: 'Tomorrow at 10:00 AM', icon: Calendar },
      { id: 8, type: 'exercise', title: 'Core Strengthening', subtitle: 'Exercise Program', icon: Activity },
    ];

    return mockData.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase())
    );
  };

  const { query, setQuery, results, loading, error } = useLiveSearch(searchFunction);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item) => {
    setQuery('');
    setIsOpen(false);
    if (onSelect) onSelect(item);
  };

  const getTypeColor = (type) => {
    const colors = {
      patient: 'text-blue-600 bg-blue-100',
      appointment: 'text-green-600 bg-green-100',
      exercise: 'text-purple-600 bg-purple-100',
      document: 'text-yellow-600 bg-yellow-100',
    };
    return colors[type] || 'text-gray-600 bg-gray-100';
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (query || results.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
          >
            {error && (
              <div className="p-4 text-red-600 text-sm">
                Error: {error}
              </div>
            )}
            
            {!loading && !error && results.length === 0 && query && (
              <div className="p-4 text-gray-500 text-sm text-center">
                No results found for "{query}"
              </div>
            )}

            {results.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSelect(item)}
                  className="w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${getTypeColor(item.type)}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {item.title}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {item.subtitle}
                      </p>
                    </div>
                    <div className="text-xs text-gray-400 capitalize">
                      {item.type}
                    </div>
                  </div>
                </motion.button>
              );
            })}

            {!query && (
              <div className="p-4 text-gray-500 text-sm text-center">
                Start typing to search...
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LiveSearch;