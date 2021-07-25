import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { GetUserScore } from './dto/get-user-score';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

 @Get('get-comments')
 async getCommentsFromIG() {
  return  await this.appService.getComments();
  }

  
 @Get('get-followers')
 async getFollowers() {
  return  await this.appService.getFollowers();
  }


  @Post()
  async getUserScore(@Body() getUserScoreDto: GetUserScore) {
   return  await this.appService.calculateUserScore(getUserScoreDto.username);
   }
}
