# Aden Agent Command Centre v2.1 — Full Stack

This version uses an Express backend proxy to avoid CORS issues.
The server handles all Anthropic API calls securely.

---

## Deploy to Render as a Web Service

### Step 1 — Upload to GitHub
1. Go to github.com/adenyangera-code/Aden-Agents
2. Delete ALL existing files
3. Upload ALL files from this folder (aden-agents-server)
   - server.js
   - package.json
   - build.sh
   - client/ (entire folder)

### Step 2 — Create a Web Service on Render (NOT Static Site)
1. render.com → New + → **Web Service** (important — not Static Site!)
2. Connect GitHub → select Aden-Agents repo
3. Fill in settings:
   - **Root Directory:** (leave empty)
   - **Build Command:** `npm install && npm run build`  
   - **Start Command:** `npm start`
   - **Environment:** Node

### Step 3 — Add Environment Variable
- Key: `ANTHROPIC_API_KEY`
- Value: your sk-ant-... key

### Step 4 — Deploy
Click "Create Web Service" → wait ~5 mins → done!

---

Note: Web Service (not Static Site) — this is important!
