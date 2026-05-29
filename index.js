const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// ⚠️ Configurations
const token = '8918147171:AAG5yp36aps-C4vN2z5seF62qRtBh399g9U'; 
const MERCHANT_TON_WALLET = 'UQBOX11KteGifZymS8X8NRERrB41Dz8Utv0JSxvAQ6uDkhc7'; 
const TON_CENTER_API_KEY = '8ed5cc6829a89bd87168e20a423316c0b796d14037600468c987972a8a32c6f0'; 

// Telegram Bot initialization
const bot = new TelegramBot(token, { polling: true });

// Change this rate according to your business (e.g., 0.008438 TON per 1 Star)
const STAR_PRICE_IN_TON = 0.008438; 

// Listen for .star command in Group Chat
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text) return;

    // Check if the message starts with .star command
    if (text.startsWith('.star ')) {
        const args = text.split(' ');
        
        // Expected format: .star @username 100
        if (args.length !== 3) {
            bot.sendMessage(chatId, "❌ Invalid format. Please use: `.star @username amount`", { parse_mode: 'Markdown' });
            return;
        }

        const targetUser = args[1]; // Get @username
        const amountStr = args[2];  // Get amount

        if (!targetUser.startsWith('@')) {
            bot.sendMessage(chatId, "❌ Please provide a valid Telegram @username.", { parse_mode: 'Markdown' });
            return;
        }

        if (isNaN(amountStr) || parseInt(amountStr) <= 0) {
            bot.sendMessage(chatId, "❌ Please provide a valid number of Stars.", { parse_mode: 'Markdown' });
            return;
        }

        const starsAmount = parseInt(amountStr);
        const costInTon = (starsAmount * STAR_PRICE_IN_TON).toFixed(4);
        
        // Simulated balance before and after for Demo Receipt
        // In real business, you should fetch actual wallet balance using TON API
        const mockBalanceBefore = 11.5459; 
        const mockBalanceAfter = (mockBalanceBefore - parseFloat(costInTon)).toFixed(4);
        const currentTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Yangoon' });

        const receiptMessage = `
**Hardkitty Star Topup**         \`Success\`
====== 📑 **STAR RECEIPT** ======
==============================

ℹ️ **Recipient** ⏩ ${targetUser}
⭐ **Stars** ⏩ ${starsAmount}
🪙 **Cost** ⏩ ${costInTon} TON

🔹 **Before** ⏩ ${mockBalanceBefore} TON
🔹 **After** ⏩ ${mockBalanceAfter} TON

🕒 **Created At:**
${currentTime} (MMT)

======= **hardkitty** =======
        `;

        // Send Receipt to Group Chat
        bot.sendMessage(chatId, receiptMessage, { 
            parse_mode: 'Markdown',
            reply_to_message_id: msg.message_id 
        });
    }
});
