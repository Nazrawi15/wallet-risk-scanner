import { PinionClient } from 'pinion-os';
import axios from 'axios';
import { createWalletClient, http, parseUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';

const pinion = new PinionClient({
  privateKey: process.env.PINION_PRIVATE_KEY
});

const SCANNER_URL = process.env.SCANNER_URL || 'http://localhost:3000';
const WALLET_TO_SCAN = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
const USDC_CONTRACT = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const RECEIVER = process.env.WALLET_ADDRESS;

async function runAgentDemo() {
  console.log('🤖 PinionOS Agent Starting...');
  console.log('Mission: Autonomously scan a wallet for risk using PinionOS\n');

  try {
    // Step 1: Check agent balance
    console.log('Step 1: Checking agent wallet balance...');
    const balance = await pinion.skills.balance(
      '0xb3Ad1a22b8483Bc1abac5449F7508B8779e82B1C'
    );
    console.log('Agent Balance:', balance.data.balances);
    console.log('✅ Agent has funds\n');

    // Step 2: Get ETH price for context
    console.log('Step 2: Getting ETH price for risk context...');
    const price = await pinion.skills.price('ETH');
    console.log('ETH Price: $' + price.data.priceUSD);
    console.log('✅ Market context gathered\n');

    // Step 3: Sign and broadcast real USDC payment
    console.log('Step 3: Agent signing and broadcasting $0.01 USDC payment...');
    const account = privateKeyToAccount(process.env.PINION_PRIVATE_KEY);
    const walletClient = createWalletClient({
      account,
      chain: base,
      transport: http('https://mainnet.base.org')
    });

    const transferAbi = [{
      name: 'transfer',
      type: 'function',
      inputs: [
        { name: 'to', type: 'address' },
        { name: 'amount', type: 'uint256' }
      ],
      outputs: [{ name: '', type: 'bool' }]
    }];

    const txHash = await walletClient.writeContract({
      address: USDC_CONTRACT,
      abi: transferAbi,
      functionName: 'transfer',
      args: [RECEIVER, parseUnits('0.01', 6)]
    });

    console.log('Transaction hash:', txHash);
    console.log('✅ Payment broadcast to Base network\n');

    // Step 4: Wait 60 seconds for Blockscout to index
    console.log('Step 4: Waiting for on-chain confirmation...');
    await new Promise(resolve => setTimeout(resolve, 60000));
    console.log('✅ Payment confirmed\n');

    // Step 5: Call scanner with retry logic
    console.log('Step 5: Calling AI Wallet Risk Scanner with payment proof...');
    let scanResponse;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`Attempt ${attempt}...`);
        scanResponse = await axios.post(`${SCANNER_URL}/scan`, {
          address: WALLET_TO_SCAN,
          txHash: txHash
        });
        break;
      } catch (err) {
        if (attempt < 3) {
          console.log('Not indexed yet, waiting 20 more seconds...');
          await new Promise(resolve => setTimeout(resolve, 20000));
        } else {
          throw err;
        }
      }
    }

    const result = scanResponse.data;
    console.log('\n🎯 SCAN COMPLETE!\n');
    console.log('Wallet:', result.address);
    console.log('Risk Level:', result.riskLevel);
    console.log('Risk Score:', result.riskScore + '/100');
    console.log('Payment Verified:', result.paymentVerified);
    console.log('Paid By:', result.paidBy);
    console.log('Amount Paid: $' + result.amountPaid + ' USDC');
    console.log('\n🤖 AI Analysis:');
    console.log(result.aiExplanation);
    console.log('\n✅ PinionOS Agent completed full autonomous scan!');
    console.log('Agent paid → On-chain verified → AI analyzed → Report returned');

  } catch (error) {
    console.log('Agent error:', error.message);
    if (error.response) {
      console.log('Response:', JSON.stringify(error.response.data));
    }
  }
}

runAgentDemo();