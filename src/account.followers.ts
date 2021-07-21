import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type AccountFollowersDocument = AccountFollowers & Document

@Schema({timestamps:true})
export class AccountFollowers {
  @Prop()
  _id: Types.ObjectId

  @Prop()
  account_username: string

  @Prop()
  username: string
   
  @Prop()
  user_id: string

  @Prop()
  profile_pic: string

  @Prop()
  full_name: string

}
export const AccountFollowersSchema = SchemaFactory.createForClass(AccountFollowers)

