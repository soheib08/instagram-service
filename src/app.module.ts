import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountFollowersSchema } from './account.followers';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommentSchema } from './comment.schema';
import { LottoryResultSchema } from './LottoryResult.schema';
import { RequestSchema } from './request.schema';
import { ResultSchema } from './result.schema';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb://netware:Netware%40408009@185.231.180.248:27017/instagram-lottry?serverSelectionTimeoutMS=5000&connectTimeoutMS=10000&authSource=admin&authMechanism=SCRAM-SHA-256',
    ),
    MongooseModule.forFeature([{ name: 'Request', schema: RequestSchema }]),
    MongooseModule.forFeature([{ name: 'Comment', schema: CommentSchema }]),
    MongooseModule.forFeature([{ name: 'Result', schema: ResultSchema }]),
    MongooseModule.forFeature([
      { name: 'LottoryResult', schema: LottoryResultSchema },
    ]),
    MongooseModule.forFeature([
      { name: 'AccountFollower', schema: AccountFollowersSchema },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
