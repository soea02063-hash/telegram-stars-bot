const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// ⚠️ Configurations
const token = '8918147171:AAG5yp36aps-C4vN2z5seF62qRtBh399g9U'; 
const MERCHANT_TON_WALLET = 'UQBOX11KteGifZymS8X8NRERrB41Dz8Utv0JSxvAQ6uDkhc7'; 

// ⚠️ TON Center API Key
const TON_CENTER_API_KEY = '8ed5cc6829a89bd87168e20a423316c0b796d14037600468c987972a8a32c6f0'; 

// Telegram Bot initialization
const bot = new TelegramBot(token, { polling: true });
const STAR_PRICE_IN_TON = 0.015; // TON price per 1 Star

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "👋 Welcome to Telegram Stars Top-up Bot!\n\nPlease enter the amount of Stars you want to buy (e.g., 100):");
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Ignore commands like /start
    if (text.startsWith('/')) return;

    if (isNaN(text) || parseInt(text) <= 0) {
        bot.sendMessage(chatId, "❌ Please enter a valid number.");
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

*🔄 System is now listening to the blockchain for your payment (Expires in 5 minutes)...*
    `;

    bot.sendMessage(chatId, paymentMessage, { parse_mode: 'Markdown' });

    // Start checking for payment on the blockchain
    checkPaymentInterval(chatId, tonRequired, uniqueMemo, starsAmount);
});

// Function to scan blockchain every 10 seconds automatically
function checkPaymentInterval(chatId, tonRequired, uniqueMemo, starsAmount) {
    let attempts = 0;
    const interval = setInterval(async () => {
        attempts++;
        if (attempts > 30) { // Stop checking after 5 minutes
            clearInterval(interval);
            bot.sendMessage(chatId, "❌ Payment timeout. Your order has been canceled. Please try again.");
            return;
        }

        try {
            // Fetch recent transactions using official TON Center API endpoint
            const response = await axios.get(`https://toncenter.com{MERCHANT_TON_WALLET}&limit=10&api_key=${TON_CENTER_API_KEY}`);
            const transactions = response.data.result;

            for (let tx of transactions) {
                const inMsg = tx.in_msg;
                // Match the unique memo/comment sent by the user
                if (inMsg && inMsg.message === uniqueMemo) {
                    const valueInNanoton = inMsg.value;
                    const valueInTon = valueInNanoton / 1000000000;

                    // Verify if the paid amount is sufficient
                    if (valueInTon >= parseFloat(tonRequired)) {
                        clearInterval(interval);
                        bot.sendMessage(chatId, `✅ Payment detected! You have successfully paid ${valueInTon} TON.\n\n*Note:* Automated Stars distribution will happen once your Stars Provider API is integrated!`);
                        return;
                    }
                }
            }
        } catch (error) {
            console.error("TON API Error:", error.message);
        }
    }, 10000); // Check every 10 seconds
}
