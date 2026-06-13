# Aden Agent Command Centre v2.0

Your personal AI agent dashboard — 8 agents covering your full business cycle.

---

## Deploy to Render (15 minutes total)

### Step 1 — Get your Anthropic API Key (2 mins)
1. Go to https://console.anthropic.com
2. Click **API Keys** → **Create Key**
3. Copy it (starts with `sk-ant-...`) — save it somewhere safe

### Step 2 — Upload to GitHub (5 mins)
1. Go to https://github.com → **New Repository**
2. Name it `aden-agents` → **Create repository**
3. Click **uploading an existing file**
4. Drag and drop ALL files from this folder (keep folder structure)
5. Click **Commit changes**

### Step 3 — Deploy on Render (5 mins)
1. Go to https://render.com → Sign in
2. Click **New +** → **Static Site**
3. Connect GitHub → select `aden-agents`
4. Fill in settings:
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `build`
5. Click **Advanced** → **Add Environment Variable**:
   - Key: `REACT_APP_ANTHROPIC_API_KEY`
   - Value: your API key from Step 1
6. Click **Create Static Site**
7. Wait ~3 minutes for first deploy

### Step 4 — Add to phone home screen (1 min)
- **iPhone:** Open URL in Safari → Share → Add to Home Screen
- **Android:** Open URL in Chrome → Menu (⋮) → Add to Home Screen

---

## Your 8 Agents

| Agent | Role | Claude.ai Project |
|---|---|---|
| 🎯 Lead Hunter | Qualify leads, WhatsApp scripts | Property Business |
| 🎬 Content Studio | Video scripts, captions | Content & Marketing |
| 📣 Ad Manager | Meta ads, campaigns | Content & Marketing |
| 🏠 Listing Manager | Inventory, fact sheets | Property Business |
| 🤝 Deal Closer | OTP prep, objections | Property Business |
| 📊 Business Intel | Market data, URA trends | Investments & Trading |
| 📦 SpaceSaver AI | Shopify, dropship, products | SpaceSaver |
| 🕵️ Competitor Spy | Analyse competitor content | Competitor Intel |

---

## Features
- ✅ Chat with any agent — powered by Claude AI
- ✅ Build new agents by describing them in plain English
- ✅ 🔗 One-tap links to your Claude.ai Projects
- ✅ Memory per agent — saves in browser, reloads next session
- ✅ Sticky notes per agent
- ✅ Edit or delete custom agents
- ✅ Pipeline view, Business Cycle overview, Connectors map
- ✅ Live SGT clock
- ✅ Mobile-optimised — works great on phone

---

Built for Aden Yang · ERA Realty Network · CEA R063636G
