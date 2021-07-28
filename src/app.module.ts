import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountFollowersSchema } from './account.followers';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommentSchema } from './comment.schema';
import { RequestSchema } from './request.schema';

@Module({
  imports: [
   MongooseModule.forRoot('mongodb://localhost/instagram-lottry'),
   MongooseModule.forFeature([{ name: 'Request', schema: RequestSchema }]),
   MongooseModule.forFeature([{ name: 'Comment', schema: CommentSchema }]),
   MongooseModule.forFeature([{ name: 'AccountFollower', schema: AccountFollowersSchema }]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
