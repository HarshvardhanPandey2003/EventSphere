// backend/src/utils/azureStorage.js
import { BlobServiceClient } from '@azure/storage-blob';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCESS_KEY;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

// Initialize BlobServiceClient
const blobServiceClient = new BlobServiceClient(
  `https://${accountName}.blob.core.windows.net`,
  new StorageSharedKeyCredential(accountName, accountKey)
);

const containerClient = blobServiceClient.getContainerClient(containerName);


export async function uploadImage(fileBuffer, userType, userId, imageType, originalName) {
  const fileExtension = path.extname(originalName);
  const uniqueFileName = `${uuidv4()}${fileExtension}`;
  
  // Create folder path: users/{userId}/profile/filename or owners/{ownerId}/events/filename
  const blobName = `${userType}/${userId}/${imageType}/${uniqueFileName}`;
  
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  
  // Upload with content type
  const contentType = getContentType(fileExtension);
  await blockBlobClient.uploadData(fileBuffer, {
    blobHTTPHeaders: { blobContentType: contentType }
  });
  
  return blockBlobClient.url;
}

/**
 * Delete image from Azure Blob Storage
 * @param {string} blobUrl - Full blob URL
 */
export async function deleteImage(blobUrl) {
  if (!blobUrl) return;
  
  try {
    // Extract blob name from URL
    const blobName = blobUrl.split(`${containerName}/`)[1];
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.deleteIfExists();
  } catch (error) {
    console.error('Delete image error:', error);
  }
}

/**
 * Get content type based on file extension
 */
function getContentType(extension) {
  const types = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
  };
  return types[extension.toLowerCase()] || 'application/octet-stream';
}

