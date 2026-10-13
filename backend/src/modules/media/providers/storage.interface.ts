import 'multer';
import { StorageProvider } from '../../../common/enums/index.js';

export interface UploadResult {
  fileUrl: string;
  publicId: string;
  provider: StorageProvider;
  fileSize: number;
  mimeType: string;
}

export interface IStorageProvider {
  uploadFile(
    file: Express.Multer.File,
    folder: string,
    resourceType?: 'image' | 'raw' | 'auto',
  ): Promise<UploadResult>;

  deleteFile(publicId: string, resourceType?: 'image' | 'raw'): Promise<boolean>;
}
