import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FollowerSchema } from './models/follower.schema';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommentSchema } from './models/comment.schema';
import { LottoryResultSchema } from './models/LottoryResult.schema';
import { RequestSchema } from './models/request.schema';
import { ResultSchema } from './models/result.schema';
import { PostSchema } from './models/post.schema';

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
      { name: 'Follower', schema: FollowerSchema },
    ]),
    MongooseModule.forFeature([
      { name: 'Post', schema: PostSchema },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
