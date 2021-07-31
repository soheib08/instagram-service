import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LottoryResultDocument = LottoryResult & Document;

@Schema({ timestamps: true })
export class LottoryResult {
  @Prop()
  index: number;
  @Prop()
  username: string;
  @Prop()
  tagged_user: string;
  @Prop()
  status: string;
}

export const LottoryResultSchema = SchemaFactory.createForClass(LottoryResult);
