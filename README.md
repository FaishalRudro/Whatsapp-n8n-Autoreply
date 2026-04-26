# WhatsApp Auto-Reply with n8n

Personal WhatsApp number-এ automatic away message পাঠানোর system।

## Stack
- **n8n** — workflow automation
- **whatsapp-web.js** — WhatsApp connection
- **Docker** — containerization

## Setup

### 1. Clone করো
git clone https://github.com/YOUR_USERNAME/whatsapp-n8n-autoreply
cd whatsapp-n8n-autoreply

### 2. Environment variables set করো
cp .env.example .env
# .env ফাইলে নিজের values দাও

### 3. চালু করো
docker compose up --build -d

### 4. QR code scan করো
docker logs whatsapp-bridge -f
# Terminal-এ QR code দেখাবে, WhatsApp দিয়ে scan করো

## Deploy
Railway.app-এ deploy করা হয়েছে।
Environment variables Railway dashboard-এ set করতে হবে।
