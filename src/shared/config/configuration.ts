export default () => ({
    telegram: {
        botToken: process.env.TELEGRAM_BOT_TOKEN,
        botName: process.env.TELEGRAM_BOT_NAME,
    },
    database: {
        url: process.env.DATABASE_URL,
    },
});