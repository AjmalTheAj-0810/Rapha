import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Phone, 
  Video,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

const DynamicBooking = () => {
  const { addNotification } = useNotifications();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [appointmentType, setAppointmentType] = useState('in-person');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const therapists = [
    {
      id: 1,
      name: 'Dr. Sarah Wilson',
      specialty: 'Sports Physiotherapy',
      rating: 4.9,
      avatar: '👩‍⚕️',
      nextAvailable: 'Today at 2:00 PM'
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      specialty: 'Orthopedic Rehabilitation',
      rating: 4.8,
      avatar: '👨‍⚕️',
      nextAvailable: 'Tomorrow at 10:00 AM'
    },
    {
      id: 3,
      name: 'Dr. Emily Rodriguez',
      specialty: 'Neurological Physiotherapy',
      rating: 4.9,
      avatar: '👩‍⚕️',
      nextAvailable: 'Today at 4:00 PM'
    }
  ];

  // Generate available time slots
  useEffect(() => {
    const generateSlots = () => {
      const slots = [];
      const startHour = 9;
      const endHour = 17;
      
      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          const isAvailable = Math.random() > 0.3; // 70% chance of being available
          slots.push({
            time,
            available: isAvailable,
            price: appointmentType === 'video' ? 80 : 120
          });
        }
      }
      return slots;
    };

    setLoading(true);
    setTimeout(() => {
      setAvailableSlots(generateSlots());
      setLoading(false);
    }, 500);
  }, [selectedDate, selectedTherapist, appointmentType]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const isDateDisabled = (date) => {
    if (!date) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleBookAppointment = () => {
    if (!selectedTherapist || !selectedDate || !selectedTime) {
      addNotification({
        type: 'error',
        title: 'Incomplete Booking',
        message: 'Please select a therapist, date, and time slot.'
      });
      return;
    }

    setLoading(true);
    
    // Simulate booking process
    setTimeout(() => {
      setLoading(false);
      addNotification({
        type: 'success',
        title: 'Appointment Booked!',
        message: `Your appointment with ${selectedTherapist.name} is confirmed for ${selectedDate.toLocaleDateString()} at ${selectedTime}.`,
        duration: 8000
      });
      
      // Reset form
      setSelectedTime(null);
      setSelectedTherapist(null);
    }, 2000);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Your Appointment</h1>
        <p className="text-gray-600">Choose your preferred therapist, date, and time</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Therapist Selection */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Select Therapist
          </h2>
          
          <div className="space-y-3">
            {therapists.map((therapist, index) => (
              <motion.button
                key={therapist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                onClick={() => setSelectedTherapist(therapist)}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  selectedTherapist?.id === therapist.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{therapist.avatar}</div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-gray-900">{therapist.name}</h3>
                    <p className="text-sm text-gray-600">{therapist.specialty}</p>
                    <div className="flex items-center mt-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm text-gray-600 ml-1">{therapist.rating}</span>
                      <span className="text-xs text-green-600 ml-2">{therapist.nextAvailable}</span>
                    </div>
                  </div>
                  {selectedTherapist?.id === therapist.id && (
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Appointment Type */}
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-3">Appointment Type</h3>
            <div className="space-y-2">
              {[
                { value: 'in-person', label: 'In-Person Visit', icon: MapPin, price: 120 },
                { value: 'video', label: 'Video Consultation', icon: Video, price: 80 },
                { value: 'phone', label: 'Phone Consultation', icon: Phone, price: 60 }
              ].map((type) => (
                <motion.button
                  key={type.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setAppointmentType(type.value)}
                  className={`w-full p-3 rounded-lg border-2 transition-all ${
                    appointmentType === type.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <type.icon className="w-4 h-4" />
                      <span className="font-medium">{type.label}</span>
                    </div>
                    <span className="text-green-600 font-semibold">${type.price}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth(currentMonth).map((date, index) => (
              <motion.button
                key={index}
                disabled={isDateDisabled(date)}
                onClick={() => date && setSelectedDate(date)}
                className={`p-2 text-sm rounded-lg transition-all ${
                  !date
                    ? 'invisible'
                    : isDateDisabled(date)
                    ? 'text-gray-300 cursor-not-allowed'
                    : selectedDate?.toDateString() === date.toDateString()
                    ? 'bg-blue-500 text-white'
                    : 'hover:bg-blue-100 text-gray-700'
                }`}
                whileHover={date && !isDateDisabled(date) ? { scale: 1.1 } : {}}
                whileTap={date && !isDateDisabled(date) ? { scale: 0.95 } : {}}
              >
                {date?.getDate()}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Time Slots */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Available Times
          </h2>

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="h-12 bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              <AnimatePresence>
                {availableSlots.map((slot, index) => (
                  <motion.button
                    key={slot.time}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    disabled={!slot.available}
                    onClick={() => setSelectedTime(slot.time)}
                    className={`w-full p-3 rounded-lg border-2 transition-all ${
                      !slot.available
                        ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                        : selectedTime === slot.time
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{slot.time}</span>
                      {slot.available ? (
                        <span className="text-green-600 font-semibold">${slot.price}</span>
                      ) : (
                        <span className="text-gray-400">Unavailable</span>
                      )}
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Book Button */}
          <motion.button
            onClick={handleBookAppointment}
            disabled={loading || !selectedTherapist || !selectedDate || !selectedTime}
            className="w-full mt-6 py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Booking...</span>
              </div>
            ) : (
              'Book Appointment'
            )}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default DynamicBooking;