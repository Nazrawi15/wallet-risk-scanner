# AI Wallet Risk Scanner

A tool that scans any Ethereum wallet for risk and charges $0.01 USDC automatically before giving you the results. The payment is verified on-chain on Base network before the scan runs — no fake payments accepted.

Built for the PinionOS hackathon in 3 days by a first-time builder.

---

## Live Demo

https://wallet-risk-scanner-production.up.railway.app

---

## The idea

Before sending crypto to someone or interacting with a wallet, you want to know if it's safe. This tool scans the wallet's transaction history and gives you a plain English explanation of how risky it is.

The twist — it costs $0.01 USDC per scan, paid on Base via real on-chain transaction. You send the payment, paste your transaction hash, and the scanner verifies it actually happened on-chain before running. No tricks, no simulation.

---

## How it works

1. Enter any Ethereum wallet address
2. Send $0.01 USDC to the scanner wallet on Base network
3. Paste your transaction hash as proof
4. Scanner verifies the payment on-chain via Blockscout
5. Pulls the wallet's transaction history from Etherscan
6. Calculates a risk score based on failed transactions, wallet age, and contract interactions
7. AI writes a plain English explanation of what the data means
8. Full risk report returned with payment proof

---

## Real on-chain payments

Every scan requires a real verified USDC payment on Base. The scanner checks Blockscout to confirm the transaction actually happened before returning any results.

Scanner wallet: `0xb3Ad1a22b8483Bc1abac5449F7508B8779e82B1C`

Verify transactions here:
https://basescan.org/address/0xb3Ad1a22b8483Bc1abac5449F7508B8779e82B1C#tokentxns

---

## PinionOS integration

This project uses the PinionOS SDK for autonomous agent operations. The PinionOS agent autonomously pays for blockchain intelligence skills on Base network — balance checks, price feeds, and transaction lookups — all paid automatically with real USDC.

Real agent payment transactions:
https://basescan.org/address/0xb3Ad1a22b8483Bc1abac5449F7508B8779e82B1C#tokentxns

---

## Tech stack

- PinionOS — autonomous agent and x402 payment infrastructure
- Blockscout — on-chain payment verification on Base
- Etherscan API — live Ethereum wallet data
- Groq AI — plain English risk explanation
- Base network — where USDC payments settle
- Express.js — backend server

---

## Run it yourself

Install dependencies:
```bash
npm install --legacy-peer-deps
```

Create a `.env` file:
```
ETHERSCAN_API_KEY=your_key
GROQ_API_KEY=your_key
WALLET_ADDRESS=your_wallet_on_base
PINION_PRIVATE_KEY=your_private_key
PORT=3000
```

Start the server:
```bash
node index.js
```

Open your browser:
```
http://localhost:3000
```

---

## Risk scoring

- **0-24** — Low risk. Wallet looks normal.
- **25-49** — Medium risk. Worth investigating.
- **50+** — High risk. Proceed with caution.

The AI explains exactly why the wallet scored the way it did in plain English.

---

## Project structure
```
wallet-risk-scanner/
├── index.js          — backend, payment verification, scan logic
├── agent-demo.mjs    — PinionOS autonomous agent demo
├── public/
│   └── index.html    — frontend UI
└── .env              — API keys (never committed)
```