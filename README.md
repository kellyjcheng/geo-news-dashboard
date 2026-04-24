# Geo-News Command Center

A real-time geopolitical intelligence dashboard that combines a live news feed, active conflict tracker, and interactive world map into a single desktop application.

Built with a **Python FastAPI backend** and a **React + Electron frontend**, styled as a dark command-center interface.

---

## Features

- **Live News Feed** — pulls the latest geopolitical headlines from NewsAPI, categorized by region and topic (War, Cyber, Diplomacy, Economy, etc.)
- **Article Briefings** — one-click AI summaries powered by Google Gemini, formatted as intelligence-style reports with risk level, key findings, and watch items
- **Active Conflict Tracker** — scrollable list of ongoing global conflicts sorted by severity, with involved parties and start year
- **Interactive Conflict Map** — world map with color-coded dots indicating conflict severity using react-leaflet on a CartoDB dark tile layer
- **Desktop App** — packaged as an Electron app; launchable from a Windows desktop shortcut via a silent VBScript launcher

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 7, Tailwind CSS v4 |
| Desktop | Electron 41 |
| Map | react-leaflet + Leaflet, CartoDB dark tiles |
| Backend | Python 3.14, FastAPI, uvicorn |
| AI | Google Gemini 2.0 Flash |
| News data | NewsAPI.org |
| Conflict data | UCDP / GDELT (with static fallback) |
| Icons | Lucide React |

---

## Project Structure

```
geo-news-dashboard/
├── client/                  # React + Electron frontend
│   ├── electron/
│   │   └── main.cjs         # Electron main process
│   ├── src/
│   │   ├── App.jsx           # Root component
│   │   ├── components.jsx    # ArticleList, ConflictList, ConflictMap
│   │   ├── data.jsx          # API fetch functions
│   │   └── components/
│   │       └── TitleBar.jsx
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── main.py              # FastAPI app
│   └── .env                 # API keys (not committed)
└── launch.vbs               # Silent single-click desktop launcher
```

---

## Setup

### Prerequisites
- Python 3.11+ with `venv`
- Node.js 18+

### 1. Clone the repo

```bash
git clone https://github.com/kellyjcheng/geo-news-dashboard.git
cd geo-news-dashboard
```

### 2. Configure environment variables

Create `server/.env` (UTF-8 encoded):

```
NEWS_API_KEY=your_newsapi_key
VITE_GEMINI_API_KEY=your_gemini_key
GEMINI_MODEL=gemini-2.0-flash
```

- Get a free NewsAPI key at [newsapi.org](https://newsapi.org)
- Get a Gemini key at [aistudio.google.com](https://aistudio.google.com)

### 3. Install backend dependencies

```bash
cd server
python -m venv venv
venv\Scripts\activate        # Windows
pip install fastapi uvicorn httpx python-dotenv
```

### 4. Install frontend dependencies

```bash
cd client
npm install
```

---

## Running in Development

Open two terminals:

**Terminal 1 — Backend:**
```bash
cd server
venv\Scripts\activate
python -m uvicorn main:app --reload
```

**Terminal 2 — Frontend (browser):**
```bash
cd client
npm run dev
```

Then open `http://localhost:5173` in your browser.

---

## Building & Running as a Desktop App

### Build the frontend

```bash
cd client
npm run electron:build
```

### Launch the Electron app

```bash
cd client
npm run electron:start
```

Or double-click `launch.vbs` in the project root for a silent launch (no terminal window).

---

## Updating the App

After pulling changes from GitHub:

```bash
git pull
cd server && pip install -r requirements.txt  # if dependencies changed
cd ../client && npm install                   # if packages changed
npm run electron:build                        # rebuild frontend
```

Then relaunch via `launch.vbs` or `npm run electron:start`.

---

## Notes

- The Electron app spawns the Python backend automatically and waits for it to be ready before opening the window
- CORS is set to `*` since Electron uses a `file://` origin
- Conflict data is cached for 1 hour; static fallback data is used if the live source is unavailable
- API keys are stored in `server/.env` and are excluded from version control via `.gitignore`
