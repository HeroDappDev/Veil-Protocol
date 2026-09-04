import crypto from "crypto";

export interface KeyPair {
  publicKey: string;
  privateKey: string;
  keyType: string;
  keySize: number;
}

/**
 * Generate RSA key pair for client-side encryption
 * Returns both public and private keys in PEM format
 */
export function generateRSAKeyPair(): KeyPair {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });

  return {
    publicKey,
    privateKey,
    keyType: 'RSA-OAEP',
    keySize: 2048
  };
}

/**
 * Encrypt data using AES-256-CBC
 * Returns base64-encoded ciphertext with IV prepended
 */
export function encryptWithAES(data: string, key: Buffer): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(data, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  // Prepend IV to ciphertext
  return iv.toString('base64') + ':' + encrypted;
}

/**
 * Decrypt data using AES-256-CBC
 * Expects base64-encoded ciphertext with IV prepended
 */
export function decryptWithAES(ciphertext: string, key: Buffer): string {
  const [ivBase64, encryptedData] = ciphertext.split(':');
  const iv = Buffer.from(ivBase64, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Derive a 256-bit key from a wallet address
 * Used to encrypt the private key before storing in database
 */
export function deriveKeyFromWallet(walletAddress: string): Buffer {
  return crypto.createHash('sha256').update(walletAddress).digest();
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Hash data using SHA-256
 */
export function sha256Hash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

