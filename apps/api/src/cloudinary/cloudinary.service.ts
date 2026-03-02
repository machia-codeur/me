import { Injectable, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from "cloudinary";
import * as streamifier from "streamifier";

const MAX_IMAGES = 10;

@Injectable()
export class CloudinaryService {
  constructor(private readonly config: ConfigService) {
    cloudinary.config({
      cloud_name: this.config.getOrThrow<string>("CLOUDINARY_CLOUD_NAME"),
      api_key: this.config.getOrThrow<string>("CLOUDINARY_API_KEY"),
      api_secret: this.config.getOrThrow<string>("CLOUDINARY_API_SECRET"),
    });
  }

  async uploadImages(
    files: Express.Multer.File[],
    folder: string,
  ): Promise<string[]> {
    if (files.length > MAX_IMAGES) {
      throw new BadRequestException(`Maximum ${MAX_IMAGES} images allowed`);
    }

    const uploads = files.map((file) => this.uploadSingle(file, folder));
    return Promise.all(uploads);
  }

  async deleteImage(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }

  private uploadSingle(
    file: Express.Multer.File,
    folder: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder: `cowri/${folder}`,
          transformation: [{ width: 1200, height: 1200, crop: "limit" }],
        },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error) return reject(error);
          resolve(result!.secure_url);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(upload);
    });
  }
}
