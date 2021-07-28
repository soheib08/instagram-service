import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AccountFollowersDocument = AccountFollowers & Document;

@Schema({ timestamps: true })
export class AccountFollowers {
  @Prop()
  _id: Types.ObjectId;

  @Prop()
  username: string;

  @Prop()
  user_id: string;

  @Prop()
  full_name: string;

  @Prop()
  bussines_username: string;

  @Prop({ type: Object })
  follower_obejct: Object;

  @Prop()
  follow_date: number;
}
export const AccountFollowersSchema =
  SchemaFactory.createForClass(AccountFollowers);
