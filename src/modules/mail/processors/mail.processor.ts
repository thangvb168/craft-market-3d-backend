import { Processor, WorkerHost, OnQueueEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import {
  LOGO_URL,
  PRIVACY_POLICY_URL,
  SUPPORT_URL,
  TERMS_URL,
  VERIFICATION_URL,
} from '@/common/constants';
import { MailerService } from '@nestjs-modules/mailer';

@Processor('send-mail')
export class MailProcessor extends WorkerHost {
  constructor(private readonly mailerService: MailerService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'sendMailVerifyToken':
        console.log('Processor::', job.name, '::', job.id);
        await this.sendMailVerifyToken(job);
        break;
      default:
        console.log('Invalid job name');
        break;
    }
  }

  async sendMailVerifyToken(job: Job) {
    const { data } = job;
    const { email, codeId, name } = data;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Confirm your email',
      text: "Welcome to Craft Market 3D! Let's confirm your email address.",
      template: 'register.hbs',
      context: {
        userName: name,
        verificationToken: codeId,
        verificationLink: `${VERIFICATION_URL}/${codeId}`,
        logoUrl: LOGO_URL,
        currentYear: new Date().getFullYear(),
        privacyPolicyUrl: PRIVACY_POLICY_URL,
        termsUrl: TERMS_URL,
        supportUrl: SUPPORT_URL,
      },
    });
  }
}
