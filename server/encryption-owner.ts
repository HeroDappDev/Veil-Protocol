import crypto from "crypto";
import type { Request, Response } from "express";

const OWNER_COOKIE = "veil_key_owner";
const WALLET_CHALLENGE_COOKIE = "veil_wallet_challenge";
const OWNER_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;
const OWNER_ID_PATTERN = /^[A-Za-z0-9_-]{16,128}$/;

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must contain at least 32 characters");
  }
  return secret;
}

function signOwner(ownerId: string): string {
  return crypto
    .createHmac("sha256", getSessionSecret())
    .update(`veil-key-owner:v1:${ownerId}`)
    .digest("base64url");
}

function parseCookies(header: string | undefined): Map<string, string> {
  const cookies = new Map<string, string>();
  if (!header) return cookies;

  for (const item of header.split(";")) {
    const separator = item.indexOf("=");
    if (separator === -1) continue;
    const name = item.slice(0, separator).trim();
    const value = item.slice(separator + 1).trim();
    cookies.set(name, decodeURIComponent(value));
  }
  return cookies;
}

function verifyOwnerToken(token: string | undefined): string | null {
  if (!token) return null;
  const separator = token.lastIndexOf(".");
  if (separator === -1) return null;

  const ownerId = token.slice(0, separator);
  const receivedSignature = token.slice(separator + 1);
  if (!OWNER_ID_PATTERN.test(ownerId)) return null;

  const expected = Buffer.from(signOwner(ownerId));
  const received = Buffer.from(receivedSignature);
  if (expected.length !== received.length) return null;

  return crypto.timingSafeEqual(expected, received) ? ownerId : null;
}

export function getOrCreateEncryptionOwner(req: Request, res: Response): string {
  const existingOwner = verifyOwnerToken(parseCookies(req.headers.cookie).get(OWNER_COOKIE));
  if (existingOwner) {
    res.setHeader("Cache-Control", "no-store");
    return existingOwner;
  }

  const ownerId = `anon_${crypto.randomBytes(24).toString("base64url")}`;
  const token = `${ownerId}.${signOwner(ownerId)}`;
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";

  res.append(
    "Set-Cookie",
    `${OWNER_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${OWNER_COOKIE_MAX_AGE_SECONDS}${secure}`,
  );
  res.setHeader("Cache-Control", "no-store");
  return ownerId;
}

export function setEncryptionOwner(res: Response, ownerId: string): void {
  if (!OWNER_ID_PATTERN.test(ownerId)) {
    throw new Error("Invalid encryption owner");
  }

  const token = `${ownerId}.${signOwner(ownerId)}`;
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.append(
    "Set-Cookie",
    `${OWNER_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${OWNER_COOKIE_MAX_AGE_SECONDS}${secure}`,
  );
  res.setHeader("Cache-Control", "no-store");
}

interface WalletChallenge {
  walletAddress: string;
  nonce: string;
  expiresAt: number;
}

function walletChallengeMessage(challenge: WalletChallenge): string {
  return [
    "Veil Protocol encryption key access",
    `Wallet: ${challenge.walletAddress}`,
    `Nonce: ${challenge.nonce}`,
    `Expires: ${new Date(challenge.expiresAt).toISOString()}`,
  ].join("\n");
}

function signWalletChallenge(payload: string): string {
  return crypto
    .createHmac("sha256", getSessionSecret())
    .update(`veil-wallet-challenge:v1:${payload}`)
    .digest("base64url");
}

export function createWalletChallenge(walletAddress: string, res: Response): string {
  const challenge: WalletChallenge = {
    walletAddress,
    nonce: crypto.randomBytes(24).toString("base64url"),
    expiresAt: Date.now() + 5 * 60 * 1000,
  };
  const payload = Buffer.from(JSON.stringify(challenge), "utf8").toString("base64url");
  const token = `${payload}.${signWalletChallenge(payload)}`;
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";

  res.append(
    "Set-Cookie",
    `${WALLET_CHALLENGE_COOKIE}=${encodeURIComponent(token)}; Path=/api/encryption; HttpOnly; SameSite=Strict; Max-Age=300${secure}`,
  );
  res.setHeader("Cache-Control", "no-store");
  return walletChallengeMessage(challenge);
}

export function verifyWalletChallenge(
  req: Request,
  walletAddress: string,
): string | null {
  const token = parseCookies(req.headers.cookie).get(WALLET_CHALLENGE_COOKIE);
  if (!token) return null;
  const separator = token.lastIndexOf(".");
  if (separator === -1) return null;

  const payload = token.slice(0, separator);
  const receivedSignature = token.slice(separator + 1);
  const expected = Buffer.from(signWalletChallenge(payload));
  const received = Buffer.from(receivedSignature);
  if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
    return null;
  }

  try {
    const challenge = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as WalletChallenge;
    if (
      challenge.walletAddress !== walletAddress
      || challenge.expiresAt < Date.now()
      || challenge.expiresAt > Date.now() + 5 * 60 * 1000
    ) {
      return null;
    }
    return walletChallengeMessage(challenge);
  } catch {
    return null;
  }
}