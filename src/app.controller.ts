import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Get('/acorn')
  getAcorn(): string {
    return this.appService.getAcorn();
  }

  @Post('/acorn/getFile')
  start(@Req() req: any, @Res() res: any): any {
    console.log(req.body);
    return this.appService.sendFile(req, res);
  }
}
