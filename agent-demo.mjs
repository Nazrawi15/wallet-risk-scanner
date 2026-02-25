import { PinionClient } from 'pinion-os';

const pinion = new PinionClient({
  privateKey: process.env.PINION_PRIVATE_KEY
});

async function runAgentDemo() {
  console.log('🤖 PinionOS Agent Starting...');
  console.log('Agent is autonomously scanning a wallet for risk...\n');

  try {
    // Step 1: Check agent balance
    console.log('Step 1: Checking agent wallet balance...');
    const balance = await pinion.skills.balance(
      '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
    );
    console.log('Balance data:', balance.data);
    console.log('✅ Balance check complete\n');

    // Step 2: Get ETH price for context
    console.log('Step 2: Getting ETH price for risk context...');
    const price = await pinion.skills.price('ETH');
    console.log('ETH Price:', price.data);
    console.log('✅ Price check complete\n');

    console.log('🎯 Agent Demo Complete!');
    console.log('This agent used PinionOS SDK to autonomously gather blockchain intelligence.');
    console.log('In production, this agent would pay $0.01 USDC to call our wallet risk scanner.');

  } catch (error) {
    console.log('Agent error:', error.message);
  }
}

runAgentDemo();