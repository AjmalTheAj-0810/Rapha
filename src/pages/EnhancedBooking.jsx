import React, { useState, useEffect } from 'react';
import Navbar from '../components/dashboard/Navbar';
import { 
  Search, 
  Star, 
  Clock, 
  MapPin, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  Loader,
  User,
  Phone,
  Mail
} from 'lucide-react';
import apiService from '../services/api';

const EnhancedBooking = () => {
  const [physiotherapists, setPhysiotherapists] = useState([]);
  const [selectedPhysio, setSelectedPhysio] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [appointmentType, setAppointmentType] = useState('consultation');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadPhysiotherapists();
  }, []);

  useEffect(() => {
    if (selectedPhysio && selectedDate) {
      loadAvailableSlots();
    } else {
      setAvailableSlots([]);
      setSelectedTime('');
    }
  }, [selectedPhysio, selectedDate]);

  const loadPhysiotherapists = async () => {
    try {
      setLoading(true);
      // Get physiotherapist profiles
      const profiles = await apiService.get('/physiotherapist-profiles/');
      setPhysiotherapists(profiles.results || profiles);
    } catch (error) {
      console.error('Failed to load physiotherapists:', error);
      setError('Failed to load physiotherapists. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSlots = async () => {
    try {
      setSlotsLoading(true);
      const slots = await apiService.getAvailableTimeSlots(selectedPhysio.id, selectedDate);
      setAvailableSlots(slots);
      setSelectedTime(''); // Reset selected time when slots change
    } catch (error) {
      console.error('Failed to load available slots:', error);
      setError('Failed to load available time slots.');
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedPhysio || !selectedDate || !selectedTime) {
      setError('Please select a physiotherapist, date, and time slot');
      return;
    }

    try {
      setBookingLoading(true);
      setError(null);

      const appointmentData = {
        physiotherapist: selectedPhysio.id,
        date: selectedDate,
        start_time: selectedTime.split(' - ')[0],
        end_time: selectedTime.split(' - ')[1],
        appointment_type: appointmentType,
        notes: notes.trim()
      };

      const result = await apiService.bookAppointment(appointmentData);
      
      setSuccess(`Appointment successfully booked with ${selectedPhysio.user?.first_name} ${selectedPhysio.user?.last_name} on ${selectedDate} at ${selectedTime}`);
      
      // Reset form
      setSelectedPhysio(null);
      setSelectedDate('');
      setSelectedTime('');
      setAvailableSlots([]);
      setNotes('');
      
    } catch (error) {
      console.error('Booking failed:', error);
      setError(error.message || 'Failed to book appointment. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const filteredPhysiotherapists = physiotherapists.filter(physio =>
    physio.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    physio.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    physio.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Generate next 14 days for date selection
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip weekends (optional - remove if physios work weekends)
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push(date.toISOString().split('T')[0]);
      }
    }
    
    return dates;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading physiotherapists...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Book an Appointment</h1>
          <p className="text-gray-600">Schedule your session with our qualified physiotherapists</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-green-800 font-medium">Booking Successful!</p>
              <p className="text-green-700 text-sm mt-1">{success}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">Booking Error</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Step 1: Select Physiotherapist */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Step 1: Choose Physiotherapist
            </h2>
            
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Physiotherapist List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredPhysiotherapists.map((physio) => (
                <div
                  key={physio.id}
                  onClick={() => setSelectedPhysio(physio)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedPhysio?.id === physio.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900">
                        {physio.user?.first_name} {physio.user?.last_name}
                      </h3>
                      <p className="text-sm text-gray-600">{physio.specialization}</p>
                      <div className="flex items-center mt-1">
                        <MapPin className="h-3 w-3 text-gray-400 mr-1" />
                        <span className="text-xs text-gray-500">{physio.clinic_address}</span>
                      </div>
                      {physio.user?.email && (
                        <div className="flex items-center mt-1">
                          <Mail className="h-3 w-3 text-gray-400 mr-1" />
                          <span className="text-xs text-gray-500">{physio.user.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredPhysiotherapists.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  {searchTerm ? 'No physiotherapists found matching your search.' : 'No physiotherapists available.'}
                </p>
              )}
            </div>
          </div>

          {/* Step 2: Select Date and Time */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Step 2: Choose Date & Time
            </h2>
            
            {!selectedPhysio ? (
              <p className="text-gray-500 text-center py-8">
                Please select a physiotherapist first
              </p>
            ) : (
              <>
                {/* Date Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Date
                  </label>
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Choose a date...</option>
                    {getAvailableDates().map((date) => (
                      <option key={date} value={date}>
                        {formatDate(date)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Time Slots */}
                {selectedDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available Time Slots
                    </label>
                    
                    {slotsLoading ? (
                      <div className="text-center py-4">
                        <Loader className="h-5 w-5 animate-spin text-blue-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Loading available slots...</p>
                      </div>
                    ) : availableSlots.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {availableSlots.map((slot, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedTime(slot.display)}
                            className={`p-2 text-sm border rounded-lg transition-all ${
                              selectedTime === slot.display
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <Clock className="h-3 w-3 inline mr-1" />
                            {slot.display}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">
                        No available slots for this date
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Step 3: Appointment Details */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Step 3: Appointment Details
            </h2>
            
            {/* Appointment Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Appointment Type
              </label>
              <select
                value={appointmentType}
                onChange={(e) => setAppointmentType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="consultation">Initial Consultation</option>
                <option value="follow_up">Follow-up Session</option>
                <option value="therapy">Therapy Session</option>
                <option value="assessment">Assessment</option>
              </select>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any specific concerns or requirements..."
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Booking Summary */}
            {selectedPhysio && selectedDate && selectedTime && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Booking Summary</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>Physiotherapist:</strong> {selectedPhysio.user?.first_name} {selectedPhysio.user?.last_name}</p>
                  <p><strong>Date:</strong> {formatDate(selectedDate)}</p>
                  <p><strong>Time:</strong> {selectedTime}</p>
                  <p><strong>Type:</strong> {appointmentType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                </div>
              </div>
            )}

            {/* Book Button */}
            <button
              onClick={handleBooking}
              disabled={!selectedPhysio || !selectedDate || !selectedTime || bookingLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                selectedPhysio && selectedDate && selectedTime && !bookingLoading
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {bookingLoading ? (
                <div className="flex items-center justify-center">
                  <Loader className="h-4 w-4 animate-spin mr-2" />
                  Booking...
                </div>
              ) : (
                'Book Appointment'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedBooking;