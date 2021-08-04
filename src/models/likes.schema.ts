import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LikeDocument = Like & Document;

@Schema({ timestamps: true })
export class Like {
  @Prop()
  _id: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Follower' })
  follower_id: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Post' })
  post_id: string

  @Prop()
  date: number
}
export const LikeSchema = SchemaFactory.createForClass(Like);
