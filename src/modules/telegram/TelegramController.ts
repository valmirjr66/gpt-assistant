import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import handleMessage from './MessageHandler';

@ApiTags('Telegram Bot')
@Controller('telegram')
export class TelegramController {
    @Post()
    async handlePost(@Body() body: any): Promise<any> {
        const cleanedBody = { ...body };

        return await this.handler(cleanedBody);
    }

    @Get()
    async handleGet(@Req() req: any): Promise<any> {
        const simplifiedReq = {
            method: req.method,
            headers: req.headers,
            url: req.url,
        };

        return await this.handler(simplifiedReq);
    }

    private async handler(req: any): Promise<any> {
        const body = req;

        if (body) {
            const messageObj = body.message;
            await handleMessage(messageObj);
        }
        return;
    }
}
