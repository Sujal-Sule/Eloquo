# 🎙️ E L O Q U O
> Speak clearly, confidently, and persuasively.

```
    ______   __        ______    ______    __    __    ______
   /      \ /  |      /      \  /      \  /  |  /  |  /      \
  /$$$$$$  |$$ |     /$$$$$$  |/$$$$$$  | $$ |  $$ | /$$$$$$  |
  $$ |__$$ |$$ |     $$ |  $$ |$$ |  $$ | $$ |  $$ | $$ |  $$ |
  $$    $$/ $$ |     $$ |  $$ |$$ |  $$ | $$ |  $$ | $$ |  $$ |
  $$$$$$$/  $$ |     $$ |  $$ |$$ |  $$ | $$ |  $$ | $$ |  $$ |
  $$ |_____ $$ |____ $$ \__$$ |$$ \__$$ | $$ \__$$ | $$ \__$$ |
  $$       |$$      |$$      / $$      /  $$    $$/  $$      /
  $$$$$$$$/ $$$$$$$$/  $$$$$$/   $$$$$$/    $$$$$$/    $$$$$$/
```

Eloquo is a premium, AI-powered Group Discussion (GD) simulation and preparation platform. Built for aspiring developers, job seekers, and students, Eloquo places you in realistic classroom-style group discussions with active, simulated AI peers. Practice speaking in real-time, master group dynamics, conquer stage fright, and secure your target placement offer.

---

## ⚡ Interactive Self-Assessment: Is Your Speaking Ready?

Check if you have what it takes to excel in professional placement group discussions:

<details>
  <summary>🤔 Scenario 1: An AI peer makes an factually incorrect statement in the discussion. What do you do?</summary>
  <br>
  <blockquote>
    <b>A)</b> Interrupt them immediately and correct them loudly to show superiority.<br>
    <b>B)</b> Wait for them to finish, acknowledge their statement, and politely present the correct data.
  </blockquote>
  <details>
    <summary>👉 See Recommended Action</summary>
    <br>
    Choose <b>B</b>! Interruption and aggression lower your <i>Participation</i> and <i>Leadership</i> score. Eloquo’s real-time discussion engine monitors group behaviors, scoring your capability to build consensus and maintain group poise.
  </details>
</details>

<details>
  <summary>🤔 Scenario 2: You get nervous, hesitate, and stay silent for more than 2 minutes. What happens?</summary>
  <br>
  <blockquote>
    <b>A)</b> The moderator ignores you and you fail the round.<br>
    <b>B)</b> Active peers will nudge you, or you can leverage structural hooks to jump in with key vocabulary.
  </blockquote>
  <details>
    <summary>👉 See Recommended Action</summary>
    <br>
    Choose <b>B</b>! Silences crush your confidence rating. Eloquo features interactive prompts and real-time transcripts to help you jump back in, build speaking momentum, and regain confidence.
  </details>
</details>

---

## 💎 Core Features

Click on each feature to reveal the engine under the hood:

<details>
  <summary>🤖 <b>Realistic AI Peers & Moderator Engine</b></summary>
  <br>
  Engage with simulated participants, each with distinct speaking temperaments (analytical, supportive, competitive). A virtual AI moderator governs the discussion timeline, introduces topics, keeps discussions focused, and guides consensus building.
</details>

<details>
  <summary>🎙️ <b>Real-Time Audio & Transcription Pipeline</b></summary>
  <br>
  A high-fidelity Web Speech API pipeline translates your voice directly to text, allowing you to participate naturally. Read incoming transcripts from other AI peers in real-time.
</details>

<details>
  <summary>📊 <b>Advanced Analytical Dashboard</b></summary>
  <br>
  <ul>
    <li><b>Progress Overview:</b> A circular gauge scoring key speaking vectors—Content quality, speaking Confidence, Participation intensity, and Vocabulary level.</li>
    <li><b>Confidence Growth:</b> Interactive timeline charting your progression across multiple sessions.</li>
    <li><b>Placement Readiness:</b> A compact indicator determining your recruitment tier (Bronze, Silver, Gold) and automatically mapping your target companies (TCS, Infosys, Wipro, Cognizant, and tier-1 product firms).</li>
  </ul>
</details>

<details>
  <summary>🛡️ <b>Designed Achievements & Badges</b></summary>
  <br>
  Unlock premium, interactive hexagonal achievements (e.g., <i>Vocabulary Master</i>, <i>Initiator</i>, <i>First Victory</i>) that hover and shift with subtle micro-animations to recognize your milestones.
</details>

---

## 🛠️ Tech Stack

*   **Frontend**: React (Vite-powered), Framer Motion, Recharts, Lucide React, Zustand State Management, Custom CSS variables.
*   **Backend**: Node.js, Express, Socket.io (real-time state sharing & chat coordination), Express Rate Limit (DDoS prevention).
*   **Database**: MongoDB, Mongoose ODM.
*   **AI Engine**: Google Gemini API (`gemini-2.0-flash-lite` or similar model) driving context-aware peer generation, evaluation pipelines, and speech analytics.

---

## 🚀 Installation & Quick Start

Follow these steps to set up and run Eloquo on your local workspace:

### 1. Prerequisites
Ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (v18+ recommended)
*   [MongoDB](https://www.mongodb.com/) (Local server or MongoDB Atlas Cluster)
*   [Google Gemini API Key](https://aistudio.google.com/)

---

### 2. Clone and Setup Environment Variables

```bash
# Clone the repository
git clone https://github.com/Sujal-Sule/Eloquo.git
cd Eloquo
```

#### 📁 Server Environment Setup (`server/.env`)
Create a `.env` file inside the `server/` directory:
```env
PORT=5000
NODE_ENV=development

# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/eloquo

# JWT authentication secret
JWT_SECRET=your-super-long-secure-random-secret

# Google Gemini API Config
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.0-flash-lite

# Production Client Origin
CLIENT_URL=http://localhost:5173
```

#### 📁 Client Environment Setup (`client/.env`)
Create a `.env` file inside the `client/` directory:
```env
# API Base URL (leave blank in local development; Vite proxy routes it to /api)
VITE_API_URL=
```

---

### 3. Run Commands

To fire up the application in local development mode, follow these scripts:

#### 🌐 Run the Server
```bash
cd server
npm install
npm run seed     # Populates placement topics (Business, Tech, Social, Ethics)
npm run dev      # Starts Express server on http://localhost:5000
```

#### 💻 Run the Client
```bash
cd client
npm install
npm run dev      # Starts Vite server on http://localhost:5173
```

Now, navigate to **`http://localhost:5173`** in your browser. Register your account and start speaking!

---

## 📦 Production Deployment

Eloquo is built for easy, single-server deployments:

1.  **Configure production settings**: Set `NODE_ENV=production` inside `server/.env`.
2.  **Build client bundle**:
    ```bash
    cd client
    npm run build
    ```
    This generates static output inside `client/dist`.
3.  **Start Express**: Run `npm start` in the `server` directory. The Node server automatically serves the production React code, routing any fallback requests to client pages safely.

---

## 🏆 Scoring & Calibration Engine

Your speech is evaluated in real-time on four vectors:
1.  **Content (0-100)**: Relevancy, structure, and logical depth.
2.  **Confidence (0-100)**: Speaking pace, tone consistency, and conviction.
3.  **Participation (0-100)**: Speaking frequency, turn-taking, and group focus.
4.  **Vocabulary (0-100)**: Lexical variety, grammar, and transition markers.

Your placement tier rises dynamically from **Bronze** to **Gold** as your overall score advances, automatically mapping you to recruiters.

---

🏆 *Unlock your speaking potential and stand out in placement rounds with Eloquo.*
