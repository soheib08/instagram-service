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
  mentions_before: number;

  @Prop()
  followed_before: number;

  @Prop()
  pending_mentions: number;

  @Prop()
  score: number;

  @Prop()
  valid_users: Array<string>;

  @Prop()
  mentions_before_users: Array<string>;

  @Prop()
  followed_before_users: Array<string>;

  @Prop()
  pending_users: Array<string>;
}
export const ResultSchema = SchemaFactory.createForClass(Result);
