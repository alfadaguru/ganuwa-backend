#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs');

async function getAuthToken() {
  try {
    const response = await axios.post('http://localhost:5001/api/v1/auth/login', {
      email: 'admin@kanostate.gov.ng',
      password: 'Admin@2025!ChangeMe'
    });

    if (response.data.success && response.data.data.accessToken) {
      const token = response.data.data.accessToken;

      // Save token to file
      fs.writeFileSync('/tmp/kano-admin-token.txt', token);

      console.log('✅ Authentication successful!');
      console.log('Token:', token.substring(0, 50) + '...');
      console.log('\nToken saved to: /tmp/kano-admin-token.txt');
      console.log('\nYou can now run the import script with:');
      console.log('ADMIN_TOKEN=' + token + ' node scripts/import-real-kano-data.js');

      return token;
    } else {
      console.error('❌ Login failed:', response.data);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error logging in:', error.response?.data || error.message);
    process.exit(1);
  }
}

getAuthToken();