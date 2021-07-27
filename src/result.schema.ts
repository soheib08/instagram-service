import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ResultDocument = Result & Document;

@Schema({ timestamps: true })
export class Result {
  @Prop()
  username: string;

  @Prop()
  valid_mentions: number;

  @Prop()
  invalid_mentions: number;

  @Prop()
  pending_mentions: number;

  @Prop()
  score: number;

  @Prop()
  valid_users: Array<string>;

  @Prop()
  inValid_users: Array<string>;

  @Prop()
  pending_users: Array<string>;
}
export const ResultSchema = SchemaFactory.createForClass(Result);
