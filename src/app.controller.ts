import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { GetUserScore } from './dto/get-user-score';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('get-comments')
  async getCommentsFromIG() {
    return await this.appService.getComments();
  }

  @Get('get-followers')
  async getFollowers() {
    return await this.appService.getFollowers();
  }

  @Post()
  async getUserScore(@Body() getUserScoreDto: GetUserScore) {
    return await this.appService.calculateUserScore(getUserScoreDto.username);
  }

  @Get('calculate-result')
  async calculateResult() {
    return await this.appService.getResults();
  }

  @Get('get-results')
  async getResults() {
    return await this.appService.getFinalResults();
  }

  @Get('search/:id')
  async getUserResults(@Param('id') id: string) {
    return await this.appService.getUserResult(id);
  }

  @Get('shuffle')
  async shuffle() {
    return await this.appService.getShuffleData();
  }

  @Get('add-lottory-result')
  async addResultDb() {
    return await this.appService.addResultsToDB();
  }
}
