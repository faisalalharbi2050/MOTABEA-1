const bcrypt = require('bcrypt');

async function testPassword() {
  const password = 'admin123';
  const existingHash = '$2b$10$f8MjI3vmED9.0buRfNgBluQVc9rM64Op6dgDTBhFzUxB/bny2KCPu';
  
  console.log('Testing password:', password);
  console.log('Against hash:', existingHash);
  
  try {
    const isValid = await bcrypt.compare(password, existingHash);
    console.log('Password is valid:', isValid);
    
    if (!isValid) {
      console.log('Generating new hash...');
      const newHash = await bcrypt.hash(password, 10);
      console.log('New hash:', newHash);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testPassword();
