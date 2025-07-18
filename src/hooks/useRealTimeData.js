import { useState, useEffect, useCallback } from 'react';

export const useRealTimeData = (initialData = null, updateInterval = 5000) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const updateData = useCallback((newData) => {
    setData(newData);
    setLastUpdated(new Date());
    setError(null);
  }, []);

  const simulateDataUpdate = useCallback(() => {
    // Simulate real-time data updates
    const updates = {
      heartRate: Math.floor(Math.random() * 40) + 60, // 60-100 bpm
      steps: Math.floor(Math.random() * 1000) + 5000, // 5000-6000 steps
      calories: Math.floor(Math.random() * 200) + 300, // 300-500 calories
      exerciseProgress: Math.floor(Math.random() * 30) + 70, // 70-100%
      activeUsers: Math.floor(Math.random() * 50) + 150, // 150-200 users
      appointments: Math.floor(Math.random() * 10) + 20, // 20-30 appointments
      messages: Math.floor(Math.random() * 5) + 1, // 1-6 new messages
    };
    
    updateData(updates);
  }, [updateData]);

  useEffect(() => {
    // Initial data load
    simulateDataUpdate();

    // Set up interval for updates
    const interval = setInterval(() => {
      simulateDataUpdate();
    }, updateInterval);

    return () => clearInterval(interval);
  }, [simulateDataUpdate, updateInterval]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    updateData,
    refresh: simulateDataUpdate
  };
};

export const useWebSocket = (url, options = {}) => {
  const [socket, setSocket] = useState(null);
  const [lastMessage, setLastMessage] = useState(null);
  const [readyState, setReadyState] = useState(0);
  const [messageHistory, setMessageHistory] = useState([]);

  useEffect(() => {
    if (!url) return;

    const ws = new WebSocket(url);
    setSocket(ws);

    ws.onopen = () => {
      setReadyState(1);
      if (options.onOpen) options.onOpen();
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setLastMessage(message);
      setMessageHistory(prev => [...prev.slice(-99), message]); // Keep last 100 messages
      if (options.onMessage) options.onMessage(message);
    };

    ws.onclose = () => {
      setReadyState(3);
      if (options.onClose) options.onClose();
    };

    ws.onerror = (error) => {
      setReadyState(3);
      if (options.onError) options.onError(error);
    };

    return () => {
      ws.close();
    };
  }, [url]);

  const sendMessage = useCallback((message) => {
    if (socket && readyState === 1) {
      socket.send(JSON.stringify(message));
    }
  }, [socket, readyState]);

  return {
    socket,
    lastMessage,
    readyState,
    messageHistory,
    sendMessage
  };
};

export const useAnimatedCounter = (end, duration = 2000, start = 0) => {
  const [count, setCount] = useState(start);

  useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(easeOutQuart * (end - start) + start);
      
      setCount(currentCount);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration, start]);

  return count;
};

export const useLiveSearch = (searchFunction, debounceMs = 300) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      setError(null);
      
      try {
        const searchResults = await searchFunction(query);
        setResults(searchResults);
      } catch (err) {
        setError(err.message);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [query, searchFunction, debounceMs]);

  return {
    query,
    setQuery,
    results,
    loading,
    error
  };
};

export const useInfiniteScroll = (fetchMore, hasMore = true) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleScroll = async () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000 &&
        hasMore &&
        !loading
      ) {
        setLoading(true);
        try {
          await fetchMore();
        } finally {
          setLoading(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchMore, hasMore, loading]);

  return { loading };
};

export default useRealTimeData;