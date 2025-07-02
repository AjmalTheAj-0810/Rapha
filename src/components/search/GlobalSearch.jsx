import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  Calendar, 
  Activity, 
  User, 
  MessageSquare, 
  Clock,
  ArrowRight,
  Loader
} from 'lucide-react';
import { Link } from 'react-router-dom';
import apiService from '../../services/api';

const GlobalSearch = ({ isOpen, onClose, className = '' }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    // Handle clicks outside search container
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  const handleEscapeKey = (event) => {
    if (event.key === 'Escape') {
      onClose();
    }
  };

  const handleSearch = async (searchQuery) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.searchWithCache(searchQuery, 30000);
      setResults(response.results || []);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      handleSearch(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleResultClick = (result) => {
    // Save to recent searches
    const newRecentSearches = [
      { query, result },
      ...recentSearches.filter(item => item.query !== query).slice(0, 4)
    ];
    setRecentSearches(newRecentSearches);
    localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
    
    onClose();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const getResultIcon = (type) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case 'exercise':
        return <Activity className="h-4 w-4 text-green-600" />;
      case 'user':
        return <User className="h-4 w-4 text-purple-600" />;
      case 'message':
        return <MessageSquare className="h-4 w-4 text-orange-600" />;
      default:
        return <Search className="h-4 w-4 text-gray-600" />;
    }
  };

  const getResultTypeLabel = (type) => {
    switch (type) {
      case 'appointment':
        return 'Appointment';
      case 'exercise':
        return 'Exercise';
      case 'user':
        return 'User';
      case 'message':
        return 'Message';
      default:
        return 'Result';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
      <div 
        ref={searchContainerRef}
        className={`bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-96 overflow-hidden ${className}`}
      >
        {/* Search Input */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search appointments, exercises, users..."
              value={query}
              onChange={handleInputChange}
              className="w-full pl-10 pr-10 py-3 text-lg border-none outline-none focus:ring-0"
            />
            <button
              onClick={onClose}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Search Results */}
        <div className="max-h-80 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader className="h-6 w-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Searching...</span>
            </div>
          )}

          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>No results found for "{query}"</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Search Results
              </div>
              {results.map((result, index) => (
                <Link
                  key={index}
                  to={result.url}
                  onClick={() => handleResultClick(result)}
                  className="block px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getResultIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {result.title}
                        </h4>
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                          {getResultTypeLabel(result.type)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {result.description}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {!loading && query.length < 2 && recentSearches.length > 0 && (
            <div className="py-2">
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Recent Searches
                </span>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Clear
                </button>
              </div>
              {recentSearches.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(item.query);
                    handleSearch(item.query);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <div className="flex-1">
                      <span className="text-sm text-gray-900">{item.query}</span>
                      {item.result && (
                        <p className="text-xs text-gray-500 mt-1">
                          {getResultTypeLabel(item.result.type)} • {item.result.title}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          {!loading && query.length < 2 && (
            <div className="py-2 border-t border-gray-200">
              <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Quick Actions
              </div>
              <div className="grid grid-cols-2 gap-2 px-4 pb-4">
                <Link
                  to="/booking"
                  onClick={onClose}
                  className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-900">Book Appointment</span>
                </Link>
                <Link
                  to="/exercises"
                  onClick={onClose}
                  className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Activity className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-900">View Exercises</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;