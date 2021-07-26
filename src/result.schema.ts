import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type ResultDocument = Result & Document

@Schema({ timestamps: true })
export class Result {

    @Prop()
    username: string

    @Prop()
    valid_mentions: number

    @Prop()
    invalid_mentions: number

    @Prop()
    pending_mentions: number

    @Prop()
    score: number

}
export const ResultSchema = SchemaFactory.createForClass(Result)
