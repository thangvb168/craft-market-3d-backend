import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class ImageValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (!value) {
      return null;
    }
    const maxSize = 1000 * 1024;
    const allowedTypes = ['image/png', 'image/jpeg'];

    if (value.size > maxSize) {
      throw new BadRequestException('File is too large');
    }

    if (!allowedTypes.includes(value.mimetype)) {
      throw new BadRequestException('Invalid file type');
    }

    return value;
  }
}
