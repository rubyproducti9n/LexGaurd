# ⚖️ LexGuard — Legal Document Intelligence

**LexGuard** is an AI-powered legal document intelligence web application built with Google Gemini and Firebase. It transforms complex legal contracts, agreements, NDAs, and leases into plain English, interactive risk visualizations, obligation timelines, side-by-side clause comparisons, and structured lawyer consultation briefing packs.

---

## 🌟 Key Features

- **🛡️ Instant Risk Assessment & Arc Meter**: Evaluates document liability score (0–100) with key risk factors and severity indicators.
- **🗺️ Interactive Clause Map & Obligations Timeline**: Maps categorized clauses and visualizes time-bound commitments.
- **⚔️ Side-by-Side Document Comparison**: Analyzes differences, altered rights, and potential risks between two document drafts.
- **📋 Lawyer Consultation Briefing**: Generates actionable questions, key red flags, negotiation leverage points, and print-ready briefs.
- **🔒 Privacy-First Architecture**: 
  - Zero document storage or logging.
  - Zero client-side API key exposure.
  - All Gemini API calls are proxied securely server-side.
  - Anonymous session telemetry via Firebase Realtime Database.
- **💎 Ethereal Glass Aesthetic**: OLED dark palette with double-bezel cards, fluid animations, and responsive single-screen shell.

---

## 🛠️ Technology Stack

- **Frontend**: Vanilla HTML5, CSS3 (Ethereal Glass Design System), JavaScript (ES Modules)
- **Backend / Proxy**: Node.js HTTP server (`dotenv`, native `https`)
- **AI Engine**: Google Gemini API (`gemini-2.5-flash` / `gemini-3.1-flash-lite`)
- **Telemetry & Analytics**: Firebase Realtime Database & Google Analytics

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** (v16.0.0 or higher)
- **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Firebase Project** with Realtime Database enabled

### 2. Installation & Setup

1. **Clone or Navigate to the Project Directory**:
   ```bash
   cd LexGaurd
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create or edit the `.env` file in the root directory:
   ```env
   # Google Gemini API Key
   GEMINI_API_KEY=your_gemini_api_key_here

   # Firebase Configuration
   FIREBASE_API_KEY=your_firebase_api_key
   FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.firebaseio.com
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
   FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   FIREBASE_APP_ID=your_app_id
   FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

### 3. Run the Application

Start the local server:
```bash
npm start
```
Or run in development mode:
```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```

---

## 🔐 Firebase Security Rules

To ensure client data is write-only and cannot be read by third parties, apply these rules in **Firebase Console → Realtime Database → Rules**:

```json
{
  "rules": {
    "sessions": {
      "$session_id": {
        ".write": true,
        ".read": false
      }
    },
    "analyses": {
      ".write": true,
      ".read": false
    },
    "events": {
      ".write": true,
      ".read": false
    }
  }
}
```

---

## 📁 Project Structure

```
LexGaurd/
├── .env                # Local secrets and API keys (gitignored)
├── .gitignore          # Git exclusions for secrets and node_modules
├── index.html          # Standalone client application & UI shell
├── package.json        # Dependencies and startup scripts
├── README.md           # Project documentation
└── server.js           # Lightweight Node.js proxy server
```

---

## 📜 Disclaimer

*LexGuard provides informational document analysis powered by artificial intelligence. It is designed to assist preparation for legal consultations and does not constitute professional legal advice.*
