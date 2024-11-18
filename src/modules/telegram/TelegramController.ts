import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import handleMessage from "./MessageHandler";

@ApiTags('Telegram bot')
@Controller('telegram')
export class TelegramController {
  @Post()
  async handlePost(@Body() body: any): Promise<any> {
    // console.log("POST body:", body);

    const cleanedBody = { ...body };

    return await this.handler(cleanedBody, 'post');
  }

  @Get()
  async handleGet(@Req() req: any): Promise<any> {
    // console.log("GET request:", req);

    const simplifiedReq = {
      method: req.method,
      headers: req.headers,
      url: req.url,
    };

    return await this.handler(simplifiedReq, 'get');
  }

  private async handler(req: any, method: string): Promise<any> {
    const body  = req;

    if (body) {
        const messageObj = body.message;
        await handleMessage(messageObj);
    }
    return;
  }
}
