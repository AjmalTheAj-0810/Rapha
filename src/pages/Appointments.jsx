import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, MapPin, Phone, Plus, Filter, Search, RefreshCw } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { 
  useAppointments, 
  useUpcomingAppointments, 
  useTodaysAppointments,
  usePhysiotherapists,
  useCreateAppointment,
  useCancelAppointment,
  useCurrentUser
} from '../hooks/useApi';

const Appointments = () => {
  const [filter, setFilter] = useState('all'); // all, upcoming, past, today
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // API hooks
  const { data: currentUser } = useCurrentUser();
  const { data: allAppointments, loading: appointmentsLoading, refetch: refetchAppointments } = useAppointments();
  const { data: upcomingAppointments, loading: upcomingLoading } = useUpcomingAppointments();
  const { data: todaysAppointments, loading: todaysLoading } = useTodaysAppointments();
  const { data: physiotherapists } = usePhysiotherapists();
  
  // Mutations
  const { mutate: createAppointment, loading: creating } = useCreateAppointment();
  const { mutate: cancelAppointment, loading: cancelling } = useCancelAppointment();

  // Filter appointments based on selected filter
  const getFilteredAppointments = () => {
    let appointments = [];
    
    switch (filter) {
      case 'upcoming':
        appointments = upcomingAppointments || [];
        break;
      case 'today':
        appointments = todaysAppointments || [];
        break;
      case 'past':
        appointments = allAppointments?.filter(apt => 
          new Date(apt.date) < new Date() && apt.status === 'completed'
        ) || [];
        break;
      default:
        appointments = allAppointments || [];
    }

    // Apply search filter
    if (searchTerm) {
      appointments = appointments.filter(apt =>
        apt.physiotherapist_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.appointment_type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return appointments;
  };

  const filteredAppointments = getFilteredAppointments();

  const handleCreateAppointment = async (appointmentData) => {
    try {
      await createAppointment(appointmentData);
      setShowCreateModal(false);
      refetchAppointments();
    } catch (error) {
      console.error('Failed to create appointment:', error);
    }
  };

  const handleCancelAppointment = async (appointmentId, reason) => {
    try {
      await cancelAppointment({ id: appointmentId, reason });
      refetchAppointments();
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no_show':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Appointments</h1>
            <p className="text-gray-600">Manage your appointments and schedule</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => refetchAppointments()}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            {currentUser?.is_patient && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Book Appointment
              </button>
            )}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2">
            {['all', 'today', 'upcoming', 'past'].map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-4 py-2 rounded-lg capitalize ${
                  filter === filterOption
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filterOption}
              </button>
            ))}
          </div>
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Appointments List */}
        {appointmentsLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2 w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2 w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all' 
                ? "You don't have any appointments yet."
                : `No ${filter} appointments found.`}
            </p>
            {currentUser?.is_patient && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Book Your First Appointment
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {appointment.appointment_type || 'Physiotherapy Session'}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status?.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(appointment.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>
                          {currentUser?.is_patient 
                            ? appointment.physiotherapist_name 
                            : appointment.patient_name}
                        </span>
                      </div>
                      {appointment.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{appointment.location}</span>
                        </div>
                      )}
                    </div>

                    {appointment.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{appointment.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    {appointment.status === 'scheduled' && (
                      <button
                        onClick={() => handleCancelAppointment(appointment.id, 'Cancelled by user')}
                        disabled={cancelling}
                        className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedAppointment(appointment)}
                      className="px-3 py-1 text-sm text-blue-600 border border-blue-300 rounded hover:bg-blue-50"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Appointments;