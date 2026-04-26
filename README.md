# WhatsApp Auto-Reply with n8n

![CI](https://github.com/FaishalRudro/Whatsapp-n8n-Autoreply/actions/workflows/deploy.yml/badge.svg)

Personal WhatsApp নম্বরে automatic away message পাঠানোর system।
কেউ message করলে automatically reply যাবে যে আপনি এখন available নেই।

## How it works

```
কেউ WhatsApp-এ message করে
        ↓
whatsapp-web.js message ধরে
        ↓
Auto-reply ON থাকলে n8n webhook-এ forward করে
        ↓
n8n auto-reply পাঠায়
```

## Tech Stack

- **n8n** — workflow automation
- **whatsapp-web.js** — WhatsApp connection (personal number)
- **Docker + Docker Compose** — containerization
- **GitHub Actions** — CI/CD (build test)

## Local Setup

### Prerequisites
- Docker Desktop
- Node.js 18+
- Git

### 1. Clone করো
```bash
git clone https://github.com/FaishalRudro/Whatsapp-n8n-Autoreply.git
cd Whatsapp-n8n-Autoreply
```

### 2. Environment variables set করো
```bash
cp .env.example .env
```
`.env` ফাইলে নিজের values দাও।

### 3. চালু করো
```bash
docker compose up --build -d
```

### 4. WhatsApp connect করো
```bash
docker logs whatsapp-bridge -f
```
Terminal-এ QR code দেখাবে — WhatsApp দিয়ে scan করো।

### 5. n8n workflow setup করো
- Browser-এ যাও: `http://localhost:5678`
- Webhook node যোগ করো (path: `whatsapp-incoming`)
- HTTP Request node যোগ করো (`http://whatsapp-bridge:3000/send-message`)
- Body:
```json
{
  "messageId": "{{ $json.body.messageId }}",
  "message": "Hi! I'm currently unavailable right now. I'll get back to you as soon as possible. 🙏"
}
```
- Workflow publish করো

## Auto-reply Control

যখন বাইরে যাবে — **চালু করো:**
```powershell
Invoke-WebRequest -Method POST -Uri http://localhost:3000/enable -UseBasicParsing
```

যখন ফিরবে — **বন্ধ করো:**
```powershell
Invoke-WebRequest -Method POST -Uri http://localhost:3000/disable -UseBasicParsing
```

**Status দেখো:**
```powershell
Invoke-WebRequest -Uri http://localhost:3000/status -UseBasicParsing
```

## Auto-start (PC restart হলে)

Docker Desktop → Settings → General → ✅ Start Docker Desktop when you log in

`restart: unless-stopped` দেওয়া আছে তাই Docker চালু হলে সব automatically start হবে।

> ⚠️ PC restart হলে auto-reply default **OFF** থাকবে। চালু করতে উপরের enable command দাও।

## Project Structure

```
whatsapp-n8n-autoreply/
├── docker-compose.yml          # সব services এক সাথে
├── .env.example                # Environment variables template
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions CI
├── n8n/
│   └── workflows/              # n8n workflow exports
└── whatsapp-bridge/
    ├── index.js                # WhatsApp + Express server
    ├── package.json
    └── Dockerfile
```

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `N8N_BASIC_AUTH_USER` | n8n login username | `admin` |
| `N8N_BASIC_AUTH_PASSWORD` | n8n login password | `yourpassword` |
| `N8N_HOST` | n8n host | `localhost` |
| `WEBHOOK_URL` | n8n webhook base URL | `http://localhost:5678` |
| `N8N_WEBHOOK_URL` | whatsapp-bridge থেকে n8n URL | `http://n8n:5678` |