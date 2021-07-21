import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

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
}
