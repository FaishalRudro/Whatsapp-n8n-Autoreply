const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

// incoming messages store করবো messageId দিয়ে
const pendingMessages = new Map();

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: './session' }),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
  },
});

client.on('qr', (qr) => {
  console.log('📱 নিচের QR code টা WhatsApp দিয়ে scan করো:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ WhatsApp successfully connected!');
});

client.on('auth_failure', () => {
  console.error('❌ WhatsApp auth failed! Session মুছে আবার চেষ্টা করো।');
});

client.on('message', async (message) => {
  if (message.isGroupMsg) return;

  const msgId = message.id._serialized;
  console.log(`📩 New message [${msgId}]: ${message.body}`);

  // message টা memory-তে রাখো
  pendingMessages.set(msgId, message);

  // 10 মিনিট পর automatically মুছে দাও
  setTimeout(() => {
    pendingMessages.delete(msgId);
  }, 10 * 60 * 1000);

  try {
    await axios.post('http://n8n:5678/webhook/whatsapp-incoming', {
      messageId: msgId,
      body: message.body,
      timestamp: message.timestamp,
    });
    console.log('✅ Forwarded to n8n, messageId:', msgId);
  } catch (err) {
    console.error('❌ n8n webhook error:', err.message);
  }
});

// n8n থেকে reply আসবে এখানে
app.post('/send-message', async (req, res) => {
  const { messageId, message } = req.body;
  console.log('📤 Reply request for messageId:', messageId);

  const originalMessage = pendingMessages.get(messageId);

  if (!originalMessage) {
    console.error('❌ Original message not found for id:', messageId);
    return res.status(404).json({ success: false, error: 'Message not found' });
  }

  try {
    await originalMessage.reply(message);
    console.log('✉️ Reply sent successfully!');
    pendingMessages.delete(messageId);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Send error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    whatsapp: client.info ? 'connected' : 'disconnected',
    pendingMessages: pendingMessages.size,
  });
});

app.listen(3000, () => {
  console.log('🚀 WhatsApp Bridge running on port 3000');
});

client.initialize();