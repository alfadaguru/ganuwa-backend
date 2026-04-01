const { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3Client } = require('../config/s3');
const crypto = require('crypto');
const path = require('path');

/**
 * Upload file to S3-compatible storage (Contabo)
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} originalname - Original filename
 * @param {string} mimetype - File MIME type
 * @param {string} folder - Folder path in bucket (e.g., 'hero-banners', 'news', 'projects')
 * @returns {Promise<{key: string, url: string}>}
 */
async function uploadToS3(fileBuffer, originalname, mimetype, folder = 'uploads') {
  try {
    // Generate unique filename
    const fileExt = path.extname(originalname);
    const fileName = `${crypto.randomBytes(16).toString('hex')}${fileExt}`;
    const key = `${folder}/${fileName}`;

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET,
      Key: key,
      Body: fileBuffer,
      ContentType: mimetype,
      // ACL is not needed for private bucket - we'll use presigned URLs
    });

    await s3Client.send(command);

    // Generate direct public URL (container is public)
    const url = getPublicUrl(key);

    return {
      key,
      url,
      bucket: process.env.AWS_BUCKET,
      publicId: key, // For compatibility with existing code
    };
  } catch (error) {
    console.error('S3 Upload Error:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
}

/**
 * Delete file from S3
 * @param {string} key - File key in S3
 * @returns {Promise<void>}
 */
async function deleteFromS3(key) {
  try {
    if (!key) return;

    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error('S3 Delete Error:', error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

/**
 * Get presigned URL for private file access
 * @param {string} key - File key in S3
 * @param {number} expiresIn - URL expiration in seconds (default: 7 days)
 * @returns {Promise<string>}
 */
async function getPresignedUrl(key, expiresIn = 604800) {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error('Presigned URL Error:', error);
    throw new Error(`Failed to generate presigned URL: ${error.message}`);
  }
}

/**
 * Refresh presigned URL for existing file
 * Useful for updating URLs before they expire
 * @param {string} key - File key in S3
 * @returns {Promise<string>}
 */
async function refreshPresignedUrl(key) {
  return getPresignedUrl(key);
}

/**
 * Get direct public URL for a file (container must be public)
 * @param {string} key - File key in S3
 * @returns {string}
 */
function getPublicUrl(key) {
  const endpoint = process.env.AWS_ENDPOINT || 'https://eu2.contabostorage.com';
  const bucket = process.env.AWS_BUCKET;
  return `${endpoint}/${bucket}/${key}`;
}

module.exports = {
  uploadToS3,
  deleteFromS3,
  getPresignedUrl,
  refreshPresignedUrl,
  getPublicUrl,
};