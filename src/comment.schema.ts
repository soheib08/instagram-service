import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type CommentDocument = Comment & Document

@Schema()
export class Comment {
  @Prop()
  _id: Types.ObjectId

  @Prop()
  comment: string

  @Prop()
  user_profile : string

  @Prop()
  date: Date

}
export const CommentSchema = SchemaFactory.createForClass(Comment)

