/**
 * Test S3 Connection
 * Simple script to verify S3 credentials and connection work in standalone mode
 */

// Load environment variables FIRST
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { S3Client, ListBucketsCommand, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

console.log('🧪 Testing S3 Connection...\n');

// Display loaded credentials (partially masked)
console.log('Environment Variables:');
console.log(`  AWS_ACCESS_KEY_ID: ${process.env.AWS_ACCESS_KEY_ID ? process.env.AWS_ACCESS_KEY_ID.substring(0, 10) + '...' : 'NOT SET'}`);
console.log(`  AWS_SECRET_ACCESS_KEY: ${process.env.AWS_SECRET_ACCESS_KEY ? '***' + process.env.AWS_SECRET_ACCESS_KEY.substring(process.env.AWS_SECRET_ACCESS_KEY.length - 4) : 'NOT SET'}`);
console.log(`  AWS_BUCKET: ${process.env.AWS_BUCKET || 'NOT SET'}`);
console.log(`  AWS_ENDPOINT: ${process.env.AWS_ENDPOINT || 'NOT SET'}`);
console.log(`  AWS_DEFAULT_REGION: ${process.env.AWS_DEFAULT_REGION || 'NOT SET'}`);
console.log(`  AWS_USE_PATH_STYLE_ENDPOINT: ${process.env.AWS_USE_PATH_STYLE_ENDPOINT || 'NOT SET'}\n`);

// Create S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_DEFAULT_REGION || 'eu-central-1',
  endpoint: process.env.AWS_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  forcePathStyle: process.env.AWS_USE_PATH_STYLE_ENDPOINT === 'true',
});

async function testConnection() {
  try {
    console.log('✅ S3 Client created successfully\n');

    // Test 1: Upload a small test file
    console.log('Test 1: Uploading test file...');
    const testContent = Buffer.from('S3 connection test - ' + new Date().toISOString());
    const testKey = 'test/connection-test.txt';

    const putCommand = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET,
      Key: testKey,
      Body: testContent,
      ContentType: 'text/plain',
    });

    await s3Client.send(putCommand);
    console.log(`✅ Test file uploaded successfully: ${testKey}\n`);

    // Test 2: Generate presigned URL
    console.log('Test 2: Generating presigned URL...');
    const getCommand = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET,
      Key: testKey,
    });

    const presignedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });
    console.log(`✅ Presigned URL generated successfully`);
    console.log(`   URL: ${presignedUrl.substring(0, 80)}...\n`);

    console.log('🎉 All tests passed! S3 connection is working correctly.\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('   Error details:', error);
    process.exit(1);
  }
}

testConnection()
  .then(() => {
    console.log('✅ S3 connection test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ S3 connection test failed:', error);
    process.exit(1);
  });