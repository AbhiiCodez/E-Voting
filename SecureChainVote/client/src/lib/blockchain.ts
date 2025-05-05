import { SHA256 } from 'crypto-js';

/**
 * Generate a key pair for a user
 * For browser compatibility, we use a simplified version that returns mock values
 */
export async function generateKeyPair() {
  // For browser compatibility, generate random strings as keys
  const randomString = (length: number) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const publicKey = `-----BEGIN PUBLIC KEY-----\n${randomString(400)}\n-----END PUBLIC KEY-----`;
  const privateKey = `-----BEGIN PRIVATE KEY-----\n${randomString(800)}\n-----END PRIVATE KEY-----`;
  
  return { publicKey, privateKey };
}

/**
 * Create a hash for a block using crypto-js
 */
export function createHash(previousHash: string, transactions: string[], nonce: number, timestamp: Date): string {
  const data = previousHash + JSON.stringify(transactions) + nonce + timestamp.toISOString();
  return SHA256(data).toString();
}

/**
 * Create a new block
 */
export function createBlock(previousHash: string, transactions: string[], transactionCount: number) {
  const timestamp = new Date();
  const blockId = `#${Math.floor(1000000 + Math.random() * 9000000)}`;
  
  return {
    blockId,
    timestamp,
    previousHash,
    hash: "", // Will be calculated during mining
    nonce: 0, // Will be calculated during mining
    transactions,
    transactionCount,
  };
}

/**
 * Mine a block (proof of work)
 */
export async function mineBlock(block: any) {
  let nonce = 0;
  let hash = "";
  
  // Target: first 4 digits should be zeros
  const difficulty = "0000";
  
  // Mine until we get a valid hash
  while (true) {
    hash = createHash(
      block.previousHash,
      block.transactions,
      nonce,
      block.timestamp
    );
    
    if (hash.substring(0, 4) === difficulty) {
      break;
    }
    
    nonce++;
  }
  
  return {
    ...block,
    hash,
    nonce,
  };
}

/**
 * Verify a block's hash
 */
export function verifyBlock(block: any): boolean {
  const hash = createHash(
    block.previousHash,
    block.transactions,
    block.nonce,
    new Date(block.timestamp)
  );
  
  return hash === block.hash;
}

/**
 * Verify a blockchain (all blocks)
 */
export function verifyChain(blocks: any[]): boolean {
  // Check each block
  for (let i = 1; i < blocks.length; i++) {
    const currentBlock = blocks[i];
    const previousBlock = blocks[i - 1];
    
    // Verify hash
    if (!verifyBlock(currentBlock)) {
      return false;
    }
    
    // Verify chain link
    if (currentBlock.previousHash !== previousBlock.hash) {
      return false;
    }
  }
  
  return true;
}
