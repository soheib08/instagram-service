import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type MentionDocument = Mention & Document

@Schema()
export class Mention {
  @Prop()
  _id: Types.ObjectId

  @Prop()
  owner_username: string

  @Prop()
  mentioned_username : string

  @Prop()
  date: Date

}
export const MentionSchema = SchemaFactory.createForClass(Mention)

