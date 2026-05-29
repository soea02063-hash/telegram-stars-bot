const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
‎const token = '8918147171:AAG5yp36aps-C4vN2z5seF62qRtBh399g9U'; 
‎const MERCHANT_TON_WALLET = 'UQBOX11KteGifZymS8X8NRERrB41Dz8Utv0JSxvAQ6uDkhc7'; 
const bot = new TelegramBot(token, { polling: true });
const STAR_PRICE_IN_TON = 0.015; // TON price per 1 Star

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "👋 Welcome to Telegram Stars Top-up Bot!\n\nPlease enter the amount of Stars you want to buy (e.g., 100):");
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (isNaN(text) || parseInt(text) <= 0) {
        if (text !== '/start') bot.sendMessage(chatId, "❌ Please enter a valid number.");
        return;
    }

    const starsAmount = parseInt(text);
    const tonRequired = (starsAmount * STAR_PRICE_IN_TON).toFixed(4);
    const uniqueMemo = `STARS-${chatId}-${Date.now()}`;

    const paymentMessage = `
🛒 **Order Details**
- Stars Amount: ${starsAmount} Stars
- Total Amount: ${tonRequired} TON

⚠️ **IMPORTANT:** You must include the exact **Comment/Memo** below when making the transaction. Otherwise, the top-up will not be automated.

🏦 **Wallet Address:** \`${MERCHANT_TON_WALLET}\`
📝 **Comment/Memo:** \`${uniqueMemo}\`

*System is listening to the blockchain for your payment...*
    `;

    bot.sendMessage(chatId, paymentMessage, { parse_mode: 'Markdown' });
});
