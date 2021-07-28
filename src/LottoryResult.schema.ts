import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LottoryResultDocument = LottoryResult & Document;

@Schema({ timestamps: true })
export class LottoryResult {
  @Prop()
  username: string;

  @Prop()
  index: number;
}
export const LottoryResultSchema = SchemaFactory.createForClass(LottoryResult);
