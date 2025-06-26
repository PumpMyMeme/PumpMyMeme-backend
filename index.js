const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const axios = require('axios');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

const promotedCoinsFile = './promotedCoins.json';
const TELEGRAM_BOT_TOKEN = '7208818089:AAGqeYYPv_4TqA2PcLkTx47hL_7AX5PTLvs';
const TELEGRAM_CHANNEL_ID = '@PumpMyMeme';

app.post('/promote', async (req, res) => {
    const { tokenAddress, tier } = req.body;
    if (!tokenAddress || !tier) {
        return res.status(400).json({ error: 'Missing tokenAddress or tier' });
    }

    const message = `🚀 New Meme Coin Promoted!
Token: ${tokenAddress}
Tier: ${tier}
Promote yours at https://pumpmymemes.com`;

    try {
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            chat_id: TELEGRAM_CHANNEL_ID,
            text: message
        });

        let coins = [];
        if (fs.existsSync(promotedCoinsFile)) {
            coins = JSON.parse(fs.readFileSync(promotedCoinsFile));
        }
        coins.unshift({ tokenAddress, tier, timestamp: new Date().toISOString() });
        coins = coins.slice(0, 10);
        fs.writeFileSync(promotedCoinsFile, JSON.stringify(coins, null, 2));

        res.json({ success: true, message: 'Promotion successful' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to post to Telegram', details: err.message });
    }
});

app.get('/recent', (req, res) => {
    if (fs.existsSync(promotedCoinsFile)) {
        const coins = JSON.parse(fs.readFileSync(promotedCoinsFile));
        return res.json(coins);
    }
    res.json([]);
});

app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});