import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type CommentDocument = Comment & Document

@Schema({timestamps:true})
export class Comment {
  @Prop()
  _id: Types.ObjectId

  @Prop()
  comment_id: string

  @Prop()
  text: string

  @Prop()
  owner_username : string

  @Prop()
  owner_id : string

  @Prop()
  date: number

  @Prop({type:Object})
  comment_object : Object



}
export const CommentSchema = SchemaFactory.createForClass(Comment)

