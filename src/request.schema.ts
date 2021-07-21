import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type RequestDocument = Request & Document

@Schema({timestamps:true})
export class Request {
  @Prop()
  _id: Types.ObjectId

  @Prop()
  cursor: string

  @Prop()
  type: string

}
export const RequestSchema = SchemaFactory.createForClass(Request)

