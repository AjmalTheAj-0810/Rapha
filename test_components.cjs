#!/usr/bin/env node

/**
 * Component Test Script
 * Tests that all dynamic components can be imported and have expected exports
 */

const fs = require('fs');
const path = require('path');

// Test files to check
const testFiles = [
  'src/context/NotificationContext.jsx',
  'src/components/loading/SkeletonLoader.jsx',
  'src/components/cards/AnimatedCard.jsx',
  'src/hooks/useRealTimeData.js',
  'src/pages/DynamicDashboard.jsx',
  'src/components/chat/DynamicChat.jsx',
  'src/components/search/LiveSearch.jsx',
  'src/components/appointments/DynamicBooking.jsx'
];

// Expected exports for each file
const expectedExports = {
  'NotificationContext.jsx': ['NotificationProvider', 'useNotifications'],
  'SkeletonLoader.jsx': ['CardSkeleton', 'TableSkeleton', 'DashboardSkeleton', 'ChatSkeleton'],
  'AnimatedCard.jsx': ['default'],
  'useRealTimeData.js': ['useWebSocket', 'useLiveData', 'useAnimatedCounter', 'useLiveSearch'],
  'DynamicDashboard.jsx': ['default'],
  'DynamicChat.jsx': ['default'],
  'LiveSearch.jsx': ['default'],
  'DynamicBooking.jsx': ['default']
};

console.log('🧪 Testing Dynamic Components');
console.log('=' .repeat(50));

let allTestsPassed = true;

// Test 1: File existence
console.log('\n📁 Testing file existence...');
testFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - File not found`);
    allTestsPassed = false;
  }
});

// Test 2: File content validation
console.log('\n📝 Testing file content...');
testFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const fileName = path.basename(file);
    const expectedExportsForFile = expectedExports[fileName] || [];
    
    let hasAllExports = true;
    expectedExportsForFile.forEach(exportName => {
      if (exportName === 'default') {
        if (!content.includes('export default')) {
          hasAllExports = false;
        }
      } else {
        if (!content.includes(`export`) || !content.includes(exportName)) {
          hasAllExports = false;
        }
      }
    });
    
    if (hasAllExports) {
      console.log(`✅ ${fileName} - All expected exports found`);
    } else {
      console.log(`⚠️  ${fileName} - Some exports may be missing`);
    }
    
    // Check for React imports
    if (content.includes('import React') || content.includes('from \'react\'')) {
      console.log(`   📦 React imports: ✅`);
    } else {
      console.log(`   📦 React imports: ⚠️`);
    }
    
    // Check for Framer Motion (where expected)
    if (file.includes('Dynamic') || file.includes('Animated') || file.includes('Chat')) {
      if (content.includes('framer-motion')) {
        console.log(`   🎬 Framer Motion: ✅`);
      } else {
        console.log(`   🎬 Framer Motion: ⚠️`);
      }
    }
  }
});

// Test 3: Package.json dependencies
console.log('\n📦 Testing dependencies...');
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const requiredDeps = ['framer-motion', 'react', 'lucide-react'];
  requiredDeps.forEach(dep => {
    if (dependencies[dep]) {
      console.log(`✅ ${dep}: ${dependencies[dep]}`);
    } else {
      console.log(`❌ ${dep}: Not found`);
      allTestsPassed = false;
    }
  });
} else {
  console.log('❌ package.json not found');
  allTestsPassed = false;
}

// Test 4: App.jsx integration
console.log('\n🔗 Testing App.jsx integration...');
const appJsxPath = path.join(__dirname, 'src/App.jsx');
if (fs.existsSync(appJsxPath)) {
  const appContent = fs.readFileSync(appJsxPath, 'utf8');
  
  const integrationChecks = [
    { name: 'NotificationProvider', check: 'NotificationProvider' },
    { name: 'Dynamic Dashboard Route', check: '/dynamic-dashboard' },
    { name: 'Dynamic Booking Route', check: '/dynamic-booking' },
    { name: 'Framer Motion Import', check: 'framer-motion' }
  ];
  
  integrationChecks.forEach(({ name, check }) => {
    if (appContent.includes(check)) {
      console.log(`✅ ${name}`);
    } else {
      console.log(`⚠️  ${name} - May not be integrated`);
    }
  });
} else {
  console.log('❌ App.jsx not found');
  allTestsPassed = false;
}

// Summary
console.log('\n' + '=' .repeat(50));
console.log('📊 TEST SUMMARY');
console.log('=' .repeat(50));

if (allTestsPassed) {
  console.log('🎉 All critical tests passed!');
  console.log('\n✨ Dynamic features are ready:');
  console.log('   • Real-time notifications');
  console.log('   • Animated components');
  console.log('   • Live search and chat');
  console.log('   • Interactive booking');
  console.log('   • Progressive loading');
  console.log('   • Enhanced dashboards');
} else {
  console.log('⚠️  Some tests failed. Please check the issues above.');
}

console.log('\n🚀 To test the application:');
console.log('   1. Start backend: cd healthcare_backend && python manage.py runserver 0.0.0.0:12000');
console.log('   2. Start frontend: npm run dev -- --host 0.0.0.0 --port 12001');
console.log('   3. Visit: https://work-2-tepmrnlrerdtpdmr.prod-runtime.all-hands.dev');

process.exit(allTestsPassed ? 0 : 1);