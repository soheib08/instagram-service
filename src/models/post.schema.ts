import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PostDocument = Post & Document;

@Schema({ timestamps: true })
export class Post {
  @Prop()
  _id: Types.ObjectId

  @Prop()
  url: string

  @Prop()
  instagram_id: string
  
}
export const PostSchema =
  SchemaFactory.createForClass(Post)
