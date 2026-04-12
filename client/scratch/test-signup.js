async function testSignUp() {
  try {
    const response = await fetch('http://localhost:5000/api/auth/sign-up/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000'
      },
      body: JSON.stringify({
        email: `test-${Date.now()}@gmail.com`,
        password: 'Password123!',
        name: 'Test User'
      })
    });
    
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Data:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('Error:', error.message);
  }
}

testSignUp();
