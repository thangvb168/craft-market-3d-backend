import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TokenDocument = HydratedDocument<Token>;

@Schema({ timestamps: true })
export class Token {
  @Prop({ type: String, required: true, ref: 'User' })
  userId: string;

  @Prop({ type: String })
  refreshToken: string;

  @Prop({ type: [String], default: [] })
  refreshTokenUseds: string[];
}

export const TokenSchema = SchemaFactory.createForClass(Token);
