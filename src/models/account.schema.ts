import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AccountDocument = Account & Document;

@Schema({ timestamps: true })
export class Account {
  @Prop()
  _id: Types.ObjectId

  @Prop()
  username: string

  @Prop()
  instagram_user_id: string

  @Prop()
  full_name: string
  
}
export const AccountSchema =
  SchemaFactory.createForClass(Account)
