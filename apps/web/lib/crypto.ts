import crypto from 'crypto';

// ENCRYPTION_KEY must be exactly 32 chars in your .env
// Generate with: openssl rand -base64 24 | tr -d '=+/' | cut -c1-32
const KEY = process.env.ENCRYPTION_KEY;

function getKey(): Buffer {
  if (!KEY || KEY.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be exactly 32 characters in your environment variables.');
  }
  return Buffer.from(KEY, 'utf8');
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', getKey(), iv);
  const encrypted = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

export function decrypt(encrypted: string): string {
  const [ivHex, content] = encrypted.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', getKey(), iv);
  return decipher.update(content, 'hex', 'utf8') + decipher.final('utf8');
}
