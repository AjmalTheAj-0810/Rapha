import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Timer, Target, TrendingUp, Search, Filter, Plus } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { 
  useExercises, 
  useMyExercisePlans, 
  useTodaysExercises,
  useExerciseCategories,
  useCreateExerciseProgress,
  useCurrentUser
} from '../hooks/useApi';

const Exercises = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [activeExercise, setActiveExercise] = useState(null);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // API hooks
  const { data: currentUser } = useCurrentUser();
  const { data: exercises, loading: exercisesLoading, refetch: refetchExercises } = useExercises();
  const { data: exercisePlans, loading: plansLoading } = useMyExercisePlans();
  const { data: todaysExercises, loading: todaysLoading } = useTodaysExercises();
  const { data: categories } = useExerciseCategories();
  
  // Mutations
  const { mutate: createProgress, loading: creatingProgress } = useCreateExerciseProgress();

  // Timer effect
  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(timer => timer + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Filter exercises
  const getFilteredExercises = () => {
    let filtered = exercises || [];

    if (searchTerm) {
      filtered = filtered.filter(exercise =>
        exercise.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.target_body_parts?.some(part => 
          part.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(exercise => exercise.category === selectedCategory);
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(exercise => exercise.difficulty === selectedDifficulty);
    }

    return filtered;
  };

  const filteredExercises = getFilteredExercises();

  const startExercise = (exercise) => {
    setActiveExercise(exercise);
    setTimer(0);
    setIsTimerRunning(true);
  };

  const pauseExercise = () => {
    setIsTimerRunning(false);
  };

  const resumeExercise = () => {
    setIsTimerRunning(true);
  };

  const completeExercise = async (sets, reps, weight, notes) => {
    if (!activeExercise) return;

    try {
      await createProgress({
        exercise: activeExercise.id,
        sets_completed: sets,
        reps_completed: reps,
        weight_used: weight,
        duration_seconds: timer,
        notes: notes,
        date_completed: new Date().toISOString().split('T')[0]
      });

      setActiveExercise(null);
      setTimer(0);
      setIsTimerRunning(false);
    } catch (error) {
      console.error('Failed to log exercise progress:', error);
    }
  };

  const resetTimer = () => {
    setTimer(0);
    setIsTimerRunning(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Exercises</h1>
          <p className="text-gray-600">Browse and perform your exercise routines</p>
        </div>

        {/* Today's Exercises Section */}
        {todaysExercises && todaysExercises.length > 0 && (
          <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">Today's Exercises</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todaysExercises.slice(0, 3).map((exercise) => (
                <div key={exercise.id} className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="font-medium text-gray-900 mb-2">{exercise.exercise_name}</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {exercise.sets} sets × {exercise.reps} reps
                  </p>
                  <button
                    onClick={() => startExercise(exercise)}
                    className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    Start Exercise
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search exercises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Active Exercise Timer */}
        {activeExercise && (
          <div className="mb-6 p-6 bg-green-50 rounded-lg border border-green-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-green-900">{activeExercise.name}</h3>
                <p className="text-green-700">Currently active</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-2xl font-mono font-bold text-green-900">
                  {formatTime(timer)}
                </div>
                <div className="flex gap-2">
                  {isTimerRunning ? (
                    <button
                      onClick={pauseExercise}
                      className="p-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                    >
                      <Pause className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={resumeExercise}
                      className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Play className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={resetTimer}
                    className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => completeExercise(1, 10, 0, '')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Complete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Exercises Grid */}
        {exercisesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="h-32 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredExercises.length === 0 ? (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No exercises found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExercises.map((exercise) => (
              <div key={exercise.id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{exercise.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(exercise.difficulty)}`}>
                    {exercise.difficulty}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{exercise.description}</p>
                
                {exercise.target_body_parts && exercise.target_body_parts.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Target Areas:</p>
                    <div className="flex flex-wrap gap-1">
                      {exercise.target_body_parts.map((part, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {part}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                  {exercise.duration_minutes && (
                    <div className="flex items-center gap-1">
                      <Timer className="h-4 w-4" />
                      <span>{exercise.duration_minutes} min</span>
                    </div>
                  )}
                  {exercise.equipment_needed && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {exercise.equipment_needed}
                    </span>
                  )}
                </div>
                
                <button
                  onClick={() => startExercise(exercise)}
                  disabled={activeExercise?.id === exercise.id}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {activeExercise?.id === exercise.id ? 'Active' : 'Start Exercise'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Exercises;