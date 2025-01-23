import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailProcessor } from './processors/mail.processor';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'send-mail',
      prefix: 'mail',
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAIL_HOST'),
          port: configService.get<number>('MAIL_PORT'),
          secure: configService.get<boolean>('MAIL_SECURE'),
          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASS'),
          },
        },
        defaults: {
          from: configService.get<string>('MAIL_FROM'),
        },
        // preview: true,
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(
            {},
            {
              inlineCssEnabled: false,
            },
          ),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService, MailProcessor],
  exports: [MailService],
})
export class MailModule {}
