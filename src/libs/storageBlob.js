import { BlobServiceClient } from '@azure/storage-blob';
import { config } from '../config/index.js';
import path from 'path';

const blobServiceClient = BlobServiceClient.fromConnectionString(config.azureStorageConnectionString);

const uploadBlob = async (containerName, blobName, file) => {
  const extname = path.extname(file.originalname);

  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(`${blobName}${extname}`);
  await blockBlobClient.uploadData(file.buffer);

  return blockBlobClient.url;
};

const deleteBlob = async (containerName, blobName) => {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.delete();
};

export default { uploadBlob, deleteBlob };
