# 🔍 LedgerLens

> **Blockchain Transaction Fraud Detection Platform** — Analyze, detect, and visualize fraudulent activity on-chain with AI-powered insights and a modern full-stack interface.

---

## 📌 Overview

LedgerLens is a full-stack decentralized application (DApp) that combines blockchain transparency with machine learning to detect fraudulent transactions in real time. It provides an intuitive dashboard for monitoring transaction health, flagging suspicious activity, and exploring on-chain data — all backed by a smart contract layer and a Python-powered fraud detection engine.

---

## ✨ Features

- 🧠 **AI-Powered Fraud Detection** — Machine learning models (Python) analyze transaction patterns and flag anomalies
- ⛓️ **Smart Contract Integration** — Fraud flags are logged immutably on-chain via the `FraudDetectionDApp` smart contract
- 📊 **Interactive Dashboard** — Real-time charts, risk scores, and transaction explorer built with React + Vite
- 🗄️ **Persistent Storage** — PostgreSQL with Drizzle ORM for structured transaction history and audit trails
- 🔐 **Secure API Layer** — Node.js/Express backend with typed shared schemas across client and server
- 🎨 **Responsive UI** — Tailwind CSS + shadcn/ui components for a clean, modern interface

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React, Vite, TypeScript, Tailwind CSS, shadcn/ui |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | PostgreSQL, Drizzle ORM |
| **ML / Detection** | Python |
| **Blockchain** | Solidity Smart Contracts (FraudDetectionDApp) |
| **Tooling** | PostCSS, ESLint, Replit |

---

## 📁 Project Structure

```
LedgerLens/
├── client/                  # React frontend (Vite + TypeScript)
│   └── src/
│       ├── components/      # UI components
│       ├── pages/           # Route-level views
│       └── lib/             # Utilities & API clients
├── server/                  # Express backend (Node.js + TypeScript)
│   ├── routes/              # API endpoints
│   └── db/                  # Drizzle ORM setup
├── shared/                  # Shared types and schemas (client + server)
├── FraudDetectionDApp/      # Smart contracts & blockchain layer
│   └── contracts/           # Solidity contracts
├── attached_assets/         # Static assets
├── drizzle.config.ts        # Drizzle ORM configuration
├── vite.config.ts           # Vite build configuration
├── tailwind.config.ts       # Tailwind CSS configuration
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **Python** 3.9+
- **PostgreSQL** (or a managed DB connection string)
- A compatible Ethereum wallet / RPC provider (e.g., MetaMask, Infura)

### 1. Clone the Repository

```bash
git clone https://github.com/venkatesh0029/LedgerLens.git
cd LedgerLens
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file at the root:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/ledgerlens
RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
CONTRACT_ADDRESS=0xYourDeployedContractAddress
PORT=3000
```

### 4. Set Up the Database

```bash
npm run db:push
```

### 5. Start the Development Server

```bash
npm run dev
```

This starts both the frontend (Vite) and backend (Express) concurrently. Visit `http://localhost:5173` to view the app.

---

## 🐍 Running the Fraud Detection Engine

The Python ML module is located inside the project and can be run independently:

```bash
cd server   # or wherever the Python scripts are located
pip install -r requirements.txt
python fraud_detector.py
```

The detection engine processes transaction data from the database and writes risk scores back, which are then served through the API.

---

## ⛓️ Smart Contract Deployment

Navigate to the `FraudDetectionDApp` directory:

```bash
cd FraudDetectionDApp
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network <your-network>
```

Update your `.env` with the deployed contract address.

---

## 📡 API Endpoints

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/transactions` | Fetch all transactions |
| `GET` | `/api/transactions/:id` | Get a specific transaction |
| `POST` | `/api/analyze` | Trigger fraud analysis on new data |
| `GET` | `/api/alerts` | Get flagged fraud alerts |
| `GET` | `/api/stats` | Get dashboard summary statistics |


## 🤝 Contributing

Contributions are welcome! To get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.


> *LedgerLens — Bringing clarity and security to every transaction on the ledger.*
