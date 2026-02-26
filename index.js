require('dotenv').config();
const express = require('express');
const axios = require('axios');
const Groq = require('groq-sdk');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const USDC_CONTRACT = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const REQUIRED_VALUE = 9000;
const RECEIVER = (process.env.WALLET_ADDRESS || '').toLowerCase();

async function verifyPayment(txHash) {
  try {
    const response = await axios.get('https://base.blockscout.com/api/v2/transactions/' + txHash + '/token-transfers');
    const transfers = response.data.items;
    if (!transfers || transfers.length === 0) return { valid: false, reason: 'Transaction not found on Base network.' };
    const usdcTransfer = transfers.find(t => {
      const tokenMatch = t.token && t.token.address_hash && t.token.address_hash.toLowerCase() === USDC_CONTRACT.toLowerCase();
      const receiverMatch = t.to && t.to.hash && t.to.hash.toLowerCase() === RECEIVER;
      return tokenMatch && receiverMatch;
    });
    if (!usdcTransfer) return { valid: false, reason: 'No USDC payment found to scanner wallet. Make sure you sent USDC on Base to: ' + process.env.WALLET_ADDRESS };
    const value = parseInt(usdcTransfer.total.value);
    if (value < REQUIRED_VALUE) return { valid: false, reason: 'Payment too low. Need $0.01 USDC. Found: $' + (value/1000000).toFixed(4) };
    return { valid: true, amount: (value/1000000).toFixed(4), from: usdcTransfer.from.hash };
  } catch (error) {
    return { valid: false, reason: 'Could not verify payment: ' + error.message };
  }
}

async function analyzeWallet(address) {
  const apiKey = process.env.ETHERSCAN_API_KEY;
  const txResponse = await axios.get('https://api.etherscan.io/v2/api', {
    params: { module: 'account', action: 'txlist', address, startblock: 0, endblock: 99999999, page: 1, offset: 100, sort: 'desc', apikey: apiKey, chainid: 1 }
  });
  const transactions = txResponse.data.result;
  if (!Array.isArray(transactions)) return { error: 'Invalid wallet address or no transactions found' };
  let riskScore = 0, flags = [];
  if (transactions.length === 0) { riskScore += 20; flags.push('No transaction history'); }
  const failedTx = transactions.filter(tx => tx.isError === '1');
  if (failedTx.length > 5) { riskScore += 30; flags.push('High failed transaction count: ' + failedTx.length); }
  if (transactions.length > 0) {
    const firstTx = transactions[transactions.length - 1];
    const ageInDays = (Date.now() / 1000 - parseInt(firstTx.timeStamp)) / 86400;
    if (ageInDays < 30) { riskScore += 25; flags.push('New wallet only ' + Math.floor(ageInDays) + ' days old'); }
  }
  const uniqueContracts = [...new Set(transactions.map(tx => tx.to))];
  if (uniqueContracts.length > 50) { riskScore += 15; flags.push('Interacts with many contracts: ' + uniqueContracts.length); }
  const riskLevel = riskScore >= 50 ? 'HIGH' : riskScore >= 25 ? 'MEDIUM' : 'LOW';
  const aiResponse = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 300,
    messages: [{ role: 'user', content: 'You are a blockchain security expert. Analyze this wallet and give a 3-4 sentence plain English explanation. Wallet: ' + address + ' Risk Score: ' + riskScore + '/100 Risk Level: ' + riskLevel + ' Total Transactions: ' + transactions.length + ' Failed: ' + failedTx.length + ' Unique Contracts: ' + uniqueContracts.length + ' Flags: ' + (flags.join(', ') || 'None') }]
  });
  return { address, riskScore, riskLevel, flags, totalTransactions: transactions.length, failedTransactions: failedTx.length, uniqueContracts: uniqueContracts.length, aiExplanation: aiResponse.choices[0].message.content };
}

app.post('/scan', async (req, res) => {
  const { address, txHash } = req.body;
  if (!address) return res.status(400).json({ error: 'Wallet address required' });
  if (!txHash) {
    return res.status(402).json({
      error: 'Payment Required',
      price: '$0.01 USDC',
      network: 'Base',
      payTo: process.env.WALLET_ADDRESS,
      instructions: 'Send $0.01 USDC on Base network then submit with transaction hash'
    });
  }
  const payment = await verifyPayment(txHash);
  if (!payment.valid) {
    return res.status(402).json({ error: 'Payment verification failed', reason: payment.reason });
  }
  try {
    const result = await analyzeWallet(address);
    res.json({ ...result, paymentVerified: true, paidBy: payment.from, amountPaid: payment.amount });
  } catch (error) {
    res.status(500).json({ error: 'Scan failed', details: error.message });
  }
});

app.get('/', (req, res) => res.sendFile(__dirname + '/public/index.html'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on http://localhost:' + PORT));