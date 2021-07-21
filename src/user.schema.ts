import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type UserDocument = User & Document

@Schema()
export class User {
  @Prop()
  _id: Types.ObjectId

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  invitedUsers: Types.ObjectId[]

  @Prop()
  score : number

}
export const UserSchema = SchemaFactory.createForClass(User)

