// backend/src/utils/blobStorage.util.js
import { BlobServiceClient } from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';
import path from 'path';

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME || 'eventsphereimages01';
const blobServiceClient = new BlobServiceClient(
  `https://${accountName}.blob.core.windows.net`,
  new DefaultAzureCredential()
);

const CONTAINER_NAME = 'event-images';

/**
 * Upload file to Azure Blob Storage with organized folder structure
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {string} originalName - Original filename
 * @param {string} type - 'avatar' or 'event'
 * @param {string|number} entityId - User ID or Event ID for folder organization
 * @returns {Promise<string>} - Blob URL
 */
export const uploadToBlob = async (fileBuffer, originalName, type = 'event', entityId = null) => {
  try {
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(originalName);
    
    // ✅ Improved folder structure
    let blobName;
    if (type === 'avatar' && entityId) {
      // users/{userId}/avatar-{timestamp}.jpg
      blobName = `users/${entityId}/avatar-${uniqueSuffix}${ext}`;
    } else if (type === 'event' && entityId) {
      // events/{eventId}/event-{timestamp}.jpg
      blobName = `events/${entityId}/event-${uniqueSuffix}${ext}`;
    } else {
      // Fallback to simple structure if no entityId provided
      blobName = `${type}/${type}-${uniqueSuffix}${ext}`;
    }

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Detect content type
    const contentType = getContentType(ext);

    // Upload buffer with metadata
    await blockBlobClient.uploadData(fileBuffer, {
      blobHTTPHeaders: { 
        blobContentType: contentType 
      },
      metadata: {
        uploadedAt: new Date().toISOString(),
        type: type,
        entityId: entityId?.toString() || 'unknown'
      }
    });

    return blockBlobClient.url;
  } catch (error) {
    console.error('Blob upload error:', error);
    throw new Error('Failed to upload file to Azure Blob Storage');
  }
};

/**
 * Delete blob from Azure Blob Storage
 * @param {string} blobUrl - Full blob URL
 * @returns {Promise<void>}
 */
export const deleteBlob = async (blobUrl) => {
  try {
    if (!blobUrl || !blobUrl.includes('.blob.core.windows.net')) {
      return;
    }

    const url = new URL(blobUrl);
    const pathParts = url.pathname.split('/').filter(p => p);
    const containerName = pathParts[0];
    const blobName = pathParts.slice(1).join('/');

    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.deleteIfExists();
    console.log(`✅ Deleted blob: ${blobName}`);
  } catch (error) {
    console.error('Blob delete error:', error);
  }
};

/**
 * Replace existing image with new one
 * @param {Object} file - Multer file object
 * @param {string} oldImageUrl - Existing image URL
 * @param {string} type - 'avatar' or 'event'
 * @param {string|number} entityId - User ID or Event ID
 * @returns {Promise<string|null>} - New blob URL or null
 */
export const replaceImage = async (file, oldImageUrl, type = 'event', entityId = null) => {
  try {
    if (!file) {
      return null;
    }

    // Delete old image
    if (oldImageUrl) {
      await deleteBlob(oldImageUrl);
    }

    // Upload new image
    const newImageUrl = await uploadToBlob(file.buffer, file.originalname, type, entityId);
    
    return newImageUrl;
  } catch (error) {
    console.error('Image replacement error:', error);
    throw new Error('Failed to replace image');
  }
};

/**
 * ✅ NEW: Delete all blobs in a folder (useful for cleanup)
 * @param {string} folderPath - Folder path (e.g., 'users/123' or 'events/456')
 */
export const deleteFolderBlobs = async (folderPath) => {
  try {
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
    
    // List all blobs with the prefix
    const blobsToDelete = [];
    for await (const blob of containerClient.listBlobsFlat({ prefix: folderPath })) {
      blobsToDelete.push(blob.name);
    }

    // Delete all blobs in parallel
    await Promise.all(
      blobsToDelete.map(blobName => 
        containerClient.getBlockBlobClient(blobName).deleteIfExists()
      )
    );

    console.log(`✅ Deleted ${blobsToDelete.length} blobs from ${folderPath}`);
  } catch (error) {
    console.error('Folder deletion error:', error);
  }
};

function getContentType(ext) {
  const types = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
  };
  return types[ext.toLowerCase()] || 'application/octet-stream';
}
