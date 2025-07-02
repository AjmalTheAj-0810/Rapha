// Test script to verify API integration
const API_BASE_URL = 'http://localhost:12000/api';

async function testAPIIntegration() {
  console.log('Testing API Integration...\n');

  try {
    // Test 1: Login
    console.log('1. Testing Login...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    console.log(`   Token: ${loginData.token.substring(0, 20)}...`);
    console.log(`   User: ${loginData.user.username} (${loginData.user.user_type})\n`);

    const token = loginData.token;

    // Test 2: Get Users
    console.log('2. Testing Get Users...');
    const usersResponse = await fetch(`${API_BASE_URL}/users/`, {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      }
    });

    if (!usersResponse.ok) {
      throw new Error(`Get users failed: ${usersResponse.status}`);
    }

    const usersData = await usersResponse.json();
    console.log('✅ Get users successful');
    console.log(`   Found ${usersData.results?.length || usersData.length || 0} users\n`);

    // Test 3: Get Appointments
    console.log('3. Testing Get Appointments...');
    const appointmentsResponse = await fetch(`${API_BASE_URL}/appointments/`, {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      }
    });

    if (!appointmentsResponse.ok) {
      throw new Error(`Get appointments failed: ${appointmentsResponse.status}`);
    }

    const appointmentsData = await appointmentsResponse.json();
    console.log('✅ Get appointments successful');
    console.log(`   Found ${appointmentsData.results?.length || appointmentsData.length || 0} appointments\n`);

    // Test 4: Get Exercises
    console.log('4. Testing Get Exercises...');
    const exercisesResponse = await fetch(`${API_BASE_URL}/exercises/`, {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      }
    });

    if (!exercisesResponse.ok) {
      throw new Error(`Get exercises failed: ${exercisesResponse.status}`);
    }

    const exercisesData = await exercisesResponse.json();
    console.log('✅ Get exercises successful');
    console.log(`   Found ${exercisesData.results?.length || exercisesData.length || 0} exercises\n`);

    // Test 5: Get Exercise Plans
    console.log('5. Testing Get Exercise Plans...');
    const plansResponse = await fetch(`${API_BASE_URL}/exercise-plans/`, {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      }
    });

    if (!plansResponse.ok) {
      throw new Error(`Get exercise plans failed: ${plansResponse.status}`);
    }

    const plansData = await plansResponse.json();
    console.log('✅ Get exercise plans successful');
    console.log(`   Found ${plansData.results?.length || plansData.length || 0} exercise plans\n`);

    console.log('🎉 All API integration tests passed!');

  } catch (error) {
    console.error('❌ API integration test failed:', error.message);
  }
}

// Run the test
testAPIIntegration();