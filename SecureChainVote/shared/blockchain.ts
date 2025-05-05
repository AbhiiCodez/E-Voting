// This file is for the server-side blockchain implementation
// For Node.js environment
import crypto from "crypto";

/**
 * Generate a key pair for a user
 */
export async function generateKeyPair() {
  return new Promise<{ publicKey: string; privateKey: string }>((resolve, reject) => {
    try {
      // For server, use actual crypto if available
      crypto.generateKeyPair(
        "rsa",
        {
          modulusLength: 2048,
          publicKeyEncoding: {
            type: "spki",
            format: "pem",
          },
          privateKeyEncoding: {
            type: "pkcs8",
            format: "pem",
          },
        },
        (err, publicKey, privateKey) => {
          if (err) {
            // Fallback to simulated keys
            const randomString = (length: number) => {
              let result = '';
              const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
              for (let i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * characters.length));
              }
              return result;
            };
            
            const simulatedPublicKey = `-----BEGIN PUBLIC KEY-----\n${randomString(400)}\n-----END PUBLIC KEY-----`;
            const simulatedPrivateKey = `-----BEGIN PRIVATE KEY-----\n${randomString(800)}\n-----END PRIVATE KEY-----`;
            
            resolve({ publicKey: simulatedPublicKey, privateKey: simulatedPrivateKey });
          } else {
            resolve({ publicKey, privateKey });
          }
        }
      );
    } catch (error) {
      // Fallback to simulated keys if crypto not available
      const randomString = (length: number) => {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < length; i++) {
          result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
      };
      
      const simulatedPublicKey = `-----BEGIN PUBLIC KEY-----\n${randomString(400)}\n-----END PUBLIC KEY-----`;
      const simulatedPrivateKey = `-----BEGIN PRIVATE KEY-----\n${randomString(800)}\n-----END PRIVATE KEY-----`;
      
      resolve({ publicKey: simulatedPublicKey, privateKey: simulatedPrivateKey });
    }
  });
}

/**
 * Create a hash for a block
 */
export function createHash(previousHash: string, transactions: string[], nonce: number, timestamp: Date): string {
  const data = previousHash + JSON.stringify(transactions) + nonce + timestamp.toISOString();
  try {
    // Use Node.js crypto if available
    return crypto.createHash("sha256").update(data).digest("hex");
  } catch (error) {
    // Fallback if crypto not available (should never happen on server)
    console.error("Error using crypto for hashing, falling back to simpler hash", error);
    // Simple hash function as fallback
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).padStart(64, '0');
  }
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
