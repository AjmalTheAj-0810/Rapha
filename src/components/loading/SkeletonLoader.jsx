import React from 'react';
import { motion } from 'framer-motion';

const SkeletonLoader = ({ 
  width = 'w-full', 
  height = 'h-4', 
  className = '', 
  animate = true,
  variant = 'default' 
}) => {
  const baseClasses = `bg-gray-200 rounded ${width} ${height} ${className}`;
  
  if (!animate) {
    return <div className={baseClasses} />;
  }

  return (
    <motion.div
      className={baseClasses}
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
};

export const CardSkeleton = ({ showAvatar = false }) => (
  <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
    {showAvatar && (
      <div className="flex items-center space-x-3">
        <SkeletonLoader width="w-12" height="h-12" className="rounded-full" />
        <div className="space-y-2">
          <SkeletonLoader width="w-24" height="h-4" />
          <SkeletonLoader width="w-16" height="h-3" />
        </div>
      </div>
    )}
    <SkeletonLoader width="w-3/4" height="h-6" />
    <SkeletonLoader width="w-full" height="h-4" />
    <SkeletonLoader width="w-5/6" height="h-4" />
    <div className="flex space-x-2">
      <SkeletonLoader width="w-20" height="h-8" className="rounded-md" />
      <SkeletonLoader width="w-16" height="h-8" className="rounded-md" />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <div className="p-4 border-b">
      <SkeletonLoader width="w-48" height="h-6" />
    </div>
    <div className="divide-y">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="p-4 flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <SkeletonLoader 
              key={colIndex} 
              width={colIndex === 0 ? "w-32" : "w-24"} 
              height="h-4" 
            />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex justify-between items-center">
      <SkeletonLoader width="w-64" height="h-8" />
      <SkeletonLoader width="w-32" height="h-10" className="rounded-md" />
    </div>
    
    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <SkeletonLoader width="w-16" height="h-4" />
              <SkeletonLoader width="w-12" height="h-8" />
            </div>
            <SkeletonLoader width="w-8" height="h-8" className="rounded-full" />
          </div>
        </div>
      ))}
    </div>
    
    {/* Main Content */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <CardSkeleton />
      <CardSkeleton showAvatar />
    </div>
  </div>
);

export const ChatSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
        <div className={`max-w-xs p-3 rounded-lg ${index % 2 === 0 ? 'bg-gray-100' : 'bg-blue-100'}`}>
          <SkeletonLoader width="w-full" height="h-4" />
          <SkeletonLoader width="w-3/4" height="h-4" className="mt-2" />
        </div>
      </div>
    ))}
  </div>
);

export default SkeletonLoader;