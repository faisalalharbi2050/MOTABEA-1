const bcrypt = require('bcrypt');

async function generatePasswords() {
  const passwords = ['admin123', 'vice123', 'super123', 'teacher123'];
  
  console.log('Generating hashed passwords...\n');
  
  for (const pwd of passwords) {
    try {
      const hash = await bcrypt.hash(pwd, 10);
      console.log(`${pwd}: ${hash}`);
    } catch (error) {
      console.error(`Error hashing ${pwd}:`, error);
    }
  }
}

generatePasswords();
