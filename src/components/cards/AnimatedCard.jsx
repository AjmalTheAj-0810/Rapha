import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

const AnimatedCard = ({ 
  children, 
  className = '', 
  hover = true, 
  expandable = false,
  title,
  icon: Icon,
  delay = 0,
  ...props 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        delay,
        ease: "easeOut"
      }
    },
    hover: hover ? {
      y: -5,
      scale: 1.02,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    } : {}
  };

  const expandVariants = {
    collapsed: { height: 'auto' },
    expanded: { 
      height: 'auto',
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div
      className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      {...props}
    >
      {(title || expandable) && (
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {Icon && <Icon className="w-5 h-5 text-blue-600" />}
            <h3 className="font-semibold text-gray-900">{title}</h3>
          </div>
          {expandable && (
            <motion.button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              )}
            </motion.button>
          )}
        </div>
      )}
      
      <motion.div
        variants={expandVariants}
        animate={expandable ? (isExpanded ? 'expanded' : 'collapsed') : 'expanded'}
      >
        <AnimatePresence>
          {(!expandable || isExpanded || !title) && (
            <motion.div
              initial={expandable ? { opacity: 0 } : false}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export const StatCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color = 'blue',
  delay = 0 
}) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    red: 'text-red-600 bg-red-100',
    yellow: 'text-yellow-600 bg-yellow-100',
    purple: 'text-purple-600 bg-purple-100',
  };

  return (
    <AnimatedCard delay={delay} className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <motion.p 
            className="text-2xl font-bold text-gray-900 mt-1"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay + 0.3, duration: 0.5, type: "spring" }}
          >
            {value}
          </motion.p>
          {change && (
            <motion.p 
              className={`text-sm mt-1 ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.5 }}
            >
              {change}
            </motion.p>
          )}
        </div>
        {Icon && (
          <motion.div 
            className={`p-3 rounded-full ${colorClasses[color]}`}
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: delay + 0.2, duration: 0.5, type: "spring" }}
          >
            <Icon className="w-6 h-6" />
          </motion.div>
        )}
      </div>
    </AnimatedCard>
  );
};

export const ProgressCard = ({ 
  title, 
  progress, 
  color = 'blue', 
  delay = 0,
  showPercentage = true 
}) => {
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600',
    purple: 'bg-purple-600',
  };

  return (
    <AnimatedCard delay={delay} className="p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {showPercentage && (
          <motion.span 
            className="text-sm font-medium text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.5 }}
          >
            {progress}%
          </motion.span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div
          className={`h-2 rounded-full ${colorClasses[color]}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ 
            delay: delay + 0.3, 
            duration: 1, 
            ease: "easeOut" 
          }}
        />
      </div>
    </AnimatedCard>
  );
};

export default AnimatedCard;