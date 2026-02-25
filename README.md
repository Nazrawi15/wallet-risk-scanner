# AI Wallet Risk Scanner

A simple tool that lets you scan any Ethereum wallet for risk — and charges $0.01 USDC automatically before giving you the results.

---

## The idea

Before sending crypto to someone or interacting with a wallet, you probably want to know if it's safe. This tool scans the wallet's transaction history and gives you a plain English explanation of how risky it is.

The twist — it costs $0.01 USDC per scan, paid automatically on Base via the x402 protocol. No sign up, no subscription. Just pay and get your answer.

---

## How it works

1. You enter a wallet address
2. The server asks for payment — $0.01 USDC on Base
3. You confirm the payment
4. It pulls the wallet's transaction history from Etherscan
5. Calculates a risk score based on failed transactions, wallet age, and contract interactions
6. An AI writes a plain English explanation of what the data means
7. You get the full report

---

## Real transactions on Base

This isn't simulated. The PinionOS agent in this project made real USDC payments on Base network during development.

You can verify here:
https://basescan.org/address/0xb3Ad1a22b8483Bc1abac5449F7508B8779e82B1C#tokentxns

---

## Tech stack

- PinionOS — for the autonomous agent and x402 payment handling
- x402 protocol — the payment layer
- Base network — where USDC payments settle
- Etherscan API — pulls live wallet data
- Groq AI — writes the risk explanation
- Express.js — backend server

---

## Run it yourself

Install dependencies:
```bash
npm install
```

Create a `.env` file in the root folder:
```
ETHERSCAN_API_KEY=your_key_here
GROQ_API_KEY=your_key_here
WALLET_ADDRESS=your_wallet_address
PINION_PRIVATE_KEY=your_private_key
PORT=3000
```

Start the server:
```bash
node index.js
```

Open your browser and go to:
```
http://localhost:3000
```

---

## What the risk score means

- **0-24** — Low risk. Wallet looks normal.
- **25-49** — Medium risk. A few things worth noting.
- **50+** — High risk. Proceed with caution.

The AI explanation tells you exactly why it scored the way it did.

---

## Project structure
```
wallet-risk-scanner/
├── index.js          — backend server and scan logic
├── agent-demo.mjs    — PinionOS agent demo
├── public/
│   └── index.html    — frontend UI
└── .env              — your API keys (never shared)
```
