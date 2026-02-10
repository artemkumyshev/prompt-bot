import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Bot, Context } from 'grammy';

@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(TelegramService.name);
    private bot: Bot | null = null;

    constructor(private readonly configService: ConfigService) { }

    async onModuleInit() {
        const botToken = this.configService.get<string>('telegram.botToken');
        const botName = this.configService.get<string>('telegram.botName');

        if (!botToken) {
            this.logger.warn('TELEGRAM_BOT_TOKEN not configured, bot will not start');
            return;
        }

        this.bot = new Bot(botToken as string);
        this.bot.command('start', async (ctx: Context) => await this.handleStart(ctx));

        try {
            await this.bot.start();
            this.logger.log(`Telegram bot started (@${botName || 'unknown'})`);
        } catch (error) {
            this.logger.error(
                `Failed to start Telegram bot: ${error instanceof Error ? error.message : 'Unknown error'}`,
                error instanceof Error ? error.stack : undefined,
            );
            this.logger.warn('Telegram bot will not be available. Check TELEGRAM_BOT_TOKEN configuration.');
            this.bot = null; // Reset bot to null so other methods know it's not available
        }
    }

    async onModuleDestroy() {
        if (this.bot) {
            await this.bot.stop();
            this.logger.log('Telegram bot stopped');
        }
    }

    isAvailable(): boolean {
        return this.bot !== null;
    }

    async sendMessage(chatId: string | number, text: string): Promise<boolean> {
        if (!this.bot) return false;
        try {
            await this.bot.api.sendMessage(chatId, text);
            return true;
        } catch (error) {
            this.logger.error(
                `Send message failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
            return false;
        }
    }

    private async handleStart(ctx: Context) {
        const telegramId = ctx.from?.id.toString();
        if (!telegramId) {
            await ctx.reply('Не удалось определить ваш Telegram ID');
            return;
        }

        await ctx.reply('👋 Добро пожаловать в Prompt Bot!');
    }

}