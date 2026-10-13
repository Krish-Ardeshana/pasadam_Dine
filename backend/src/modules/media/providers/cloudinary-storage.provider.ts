import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';
import { IStorageProvider, UploadResult } from './storage.interface.js';
import { StorageProvider } from '../../../common/enums/index.js';

@Injectable()
export class CloudinaryStorageProvider implements IStorageProvider {
  private readonly logger = new Logger(CloudinaryStorageProvider.name);
  private isConfigured = false;

  constructor(private readonly configService: ConfigService) {
    const cloudName = this.configService.get<string>('cloudinary.cloudName');
    const apiKey = this.configService.get<string>('cloudinary.apiKey');
    const apiSecret = this.configService.get<string>('cloudinary.apiSecret');

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      });
      this.isConfigured = true;
      this.logger.log('Cloudinary storage provider initialized successfully');
    } else {
      this.logger.warn('Cloudinary credentials not provided or incomplete. Local storage fallback will be used.');
    }
  }

  isAvailable(): boolean {
    return this.isConfigured;
  }

  async uploadFile(
    file: Express.Multer.File,
    subfolder = 'prasadam_dine',
    resourceType: 'image' | 'raw' | 'auto' = 'auto',
  ): Promise<UploadResult> {
    if (!this.isConfigured) {
      throw new Error('Cloudinary is not configured with valid credentials');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: subfolder,
          resource_type: resourceType,
        },
        (error: any, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            this.logger.error(`Cloudinary upload failed: ${error?.message || 'Unknown error'}`);
            return reject(error || new Error('Upload failed'));
          }

          resolve({
            fileUrl: result.secure_url,
            publicId: result.public_id,
            provider: StorageProvider.CLOUDINARY,
            fileSize: result.bytes || file.size,
            mimeType: file.mimetype,
          });
        },
      );

      const stream = new Readable();
      stream.push(file.buffer);
      stream.push(null);
      stream.pipe(uploadStream);
    });
  }

  async deleteFile(publicId: string, resourceType: 'image' | 'raw' = 'image'): Promise<boolean> {
    if (!this.isConfigured) return false;

    try {
      const res = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
      return res.result === 'ok';
    } catch (err) {
      this.logger.error(`Error deleting from Cloudinary (${publicId}): ${(err as any).message}`);
      return false;
    }
  }
}
