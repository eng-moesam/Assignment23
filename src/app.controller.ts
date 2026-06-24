import { Body, Controller, Get, Req } from '@nestjs/common';
import { AppService } from './app.service';
import type{ Express } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("home{/:id}")
  getHello(@Body() reqAtt:Request, @Req() req: any): string {
    console.log({reqAtt,id:req.params});
    
    return this.appService.getHello();
  }
}
