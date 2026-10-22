import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { IStorageProvider, UploadResult } from './storage.interface.js';
import { StorageProvider } from '../../../common/enums/index.js';

@Injectable()
export class LocalStorageProvider implements IStorageProvider {
  private readonly logger = new Logger(LocalStorageProvider.name);
  private readonly uploadDir: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadDir = path.resolve(
      process.cwd(),
      this.configService.get<string>('media.uploadDir') || './uploads',
    );
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    subfolder = '',
  ): Promise<UploadResult> {
    const targetFolder = path.join(this.uploadDir, subfolder);
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueId = crypto.randomUUID();
    const filename = `${uniqueId}${ext}`;
    const destinationPath = path.join(targetFolder, filename);

    await fs.promises.writeFile(destinationPath, file.buffer);

    const relativePath = path.join(subfolder, filename).replace(/\\/g, '/');
    const apiPrefix = this.configService.get<string>('apiPrefix') || 'api/v1';
    const fileUrl = `/${apiPrefix}/media/file/${relativePath}`;

    return {
      fileUrl,
      publicId: relativePath,
      provider: StorageProvider.LOCAL,
      fileSize: file.size,
      mimeType: file.mimetype,
    };
  }

  async deleteFile(publicId: string): Promise<boolean> {
    try {
      // Prevent path traversal
      const safeRelative = publicId.replace(/\.\./g, '');
      const filePath = path.join(this.uploadDir, safeRelative);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        return true;
      }
      return false;
    } catch (err) {
      this.logger.error(`Error deleting local file ${publicId}: ${(err as any).message}`);
      return false;
    }
  }

  getFilePath(publicId: string | string[]): string | null {
    const raw = Array.isArray(publicId) ? publicId.join('/') : String(publicId || '');
    const safeRelative = raw.replace(/\.\./g, '');
    const filePath = path.join(this.uploadDir, safeRelative);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
    // Check in public/models
    const modelBase = path.basename(safeRelative);
    const modelPath = path.resolve(process.cwd(), 'public/models', modelBase);
    if (fs.existsSync(modelPath)) {
      return modelPath;
    }
    // If requesting a .glb file that was on ephemeral storage, fallback to golden_enigma.glb
    if (safeRelative.endsWith('.glb')) {
      const fallbackGolden = path.resolve(process.cwd(), 'public/models', 'golden_enigma.glb');
      if (fs.existsSync(fallbackGolden)) {
        return fallbackGolden;
      }
    }
    return null;
  }
}
