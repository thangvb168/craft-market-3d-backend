import { UploadFileFormatOptions, UploadFileOptions } from '@/interfaces';
import { Injectable } from '@nestjs/common';
import {
  UploadApiErrorResponse,
  UploadApiResponse,
  UploadApiOptions,
} from 'cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  async uploadFile(
    file: Express.Multer.File,
    uploadFileOptions?: UploadFileOptions,
    uploadFileFormatOptions?: UploadFileFormatOptions,
  ) {
    const result = await this.cloudianryUploadFile(file, uploadFileOptions);

    const format = {
      sign_url: true,
      ...uploadFileFormatOptions,
    };

    return cloudinary.url(result.public_id, format);
  }

  async cloudianryUploadFile(
    file: Express.Multer.File,
    options?: UploadApiOptions,
  ) {
    return new Promise<UploadApiResponse | UploadApiErrorResponse>(
      (resolve, reject) => {
        let uploadStream = null;
        if (options) {
          uploadStream = cloudinary.uploader.upload_stream(
            options,
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            },
          );
        } else {
          uploadStream = cloudinary.uploader.upload_stream((error, result) => {
            if (error) return reject(error);
            resolve(result);
          });
        }

        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      },
    );
  }
}
