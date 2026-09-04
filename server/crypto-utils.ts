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
 * Create a stable, non-secret identifier for a public key.
 */
export function fingerprintPublicKey(publicKey: string): string {
  return crypto.createHash('sha256').update(publicKey).digest('hex');
}

function getKeyEncryptionSecret(): Buffer {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must contain at least 32 characters");
  }
  return Buffer.from(secret, "utf8");
}

/**
 * Derive a purpose-separated private-key encryption key from a server secret.
 */
export function deriveKeyForOwner(ownerId: string): Buffer {
  return Buffer.from(crypto.hkdfSync(
    "sha256",
    getKeyEncryptionSecret(),
    Buffer.from(ownerId, "utf8"),
    Buffer.from("veil-private-key-encryption:v2", "utf8"),
    32,
  ));
}

/**
 * Encrypt retained private keys with authenticated AES-256-GCM.
 */
export function encryptPrivateKey(privateKey: string, key: Buffer): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(privateKey, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    "gcm",
    "v2",
    iv.toString("base64url"),
    authTag.toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(":");
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

