import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class MailService {
  constructor(@InjectQueue('send-mail') private sendMailQueue: Queue) {}

  async sendMailVerifyToken(email: string, codeId: string, name: string) {
    console.log('Send mail verify token');

    await this.sendMailQueue.add('sendMailVerifyToken', {
      email,
      codeId,
      name,
    });
  }
}
