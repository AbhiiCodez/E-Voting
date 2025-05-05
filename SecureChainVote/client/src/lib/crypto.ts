import crypto from "crypto";

/**
 * Encrypt data using a public key
 */
export function encryptWithPublicKey(publicKey: string, data: string): string {
  const buffer = Buffer.from(data, "utf-8");
  const encrypted = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    },
    buffer
  );
  
  return encrypted.toString("base64");
}

/**
 * Decrypt data using a private key
 */
export function decryptWithPrivateKey(privateKey: string, encryptedData: string): string {
  const buffer = Buffer.from(encryptedData, "base64");
  const decrypted = crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    },
    buffer
  );
  
  return decrypted.toString("utf-8");
}

/**
 * Sign data using a private key
 */
export function signData(privateKey: string, data: string): string {
  const sign = crypto.createSign("SHA256");
  sign.update(data);
  sign.end();
  return sign.sign(privateKey, "base64");
}

/**
 * Verify signature using a public key
 */
export function verifySignature(publicKey: string, data: string, signature: string): boolean {
  const verify = crypto.createVerify("SHA256");
  verify.update(data);
  verify.end();
  return verify.verify(publicKey, signature, "base64");
}

/**
 * Generate a unique transaction ID
 */
export function generateTransactionId(): string {
  return crypto.randomBytes(16).toString("hex");
}

/**
 * Hash sensitive data
 */
export function hashData(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}
