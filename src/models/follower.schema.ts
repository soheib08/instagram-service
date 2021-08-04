import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FollowerDocument = Follower & Document;

@Schema({ timestamps: true })
export class Follower {
  @Prop()
  _id: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Account' })
  user_id: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Account' })
  account_id: Types.ObjectId

  @Prop({ type: Object })
  follower_obejct: Object

  @Prop()
  follow_date: number

  // @Prop()
  // likes_count: number

  // @Prop()
  // comment_count: number
  
}
export const FollowerSchema =
  SchemaFactory.createForClass(Follower)
