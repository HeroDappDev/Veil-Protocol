# Versioned Encryption Key Rotation

## Goal

Every successful click of the privacy page's key-generation button must create and display a new RSA-2048 public key. Previously generated keypairs must remain securely stored so older encrypted data is not orphaned.

## Key lifecycle

- A signed, HTTP-only browser privacy session may own multiple immutable encryption-key records.
- Each key has a monotonically increasing version, a cryptographic fingerprint, and an active status.
- Exactly one key per owner is active after a successful rotation.
- Existing records are never overwritten or deleted during rotation.
- Private keys remain encrypted at rest and are never included in client responses.

## Uniqueness

- RSA keypairs are generated with the platform cryptographic random-number generator.
- The public-key fingerprint is protected by a database uniqueness constraint.
- A detected collision causes generation to retry rather than returning an existing key.
- The generation endpoint never returns a previously stored key as the result of a new generation request.

## Atomic rotation

Generating and activating a key is one database transaction:

1. Lock or otherwise serialize rotation for the owner.
2. Determine the next key version.
3. Generate a new RSA-2048 keypair and unique fingerprint.
4. Encrypt the private key with authenticated AES-256-GCM using a purpose-separated key derived from a server-managed secret.
5. Mark the previous active record inactive.
6. Insert the new record as active.
7. Commit and return the new public-key details.

If any step fails, the transaction rolls back and the previous active key remains unchanged.

## API behavior

- `POST /api/encryption/generate-keys` always attempts a fresh rotation.
- The server derives the owner from a signed, HTTP-only, SameSite cookie; callers cannot submit another owner's identifier.
- Its successful response contains the new public key, Key ID/fingerprint, version, key type, key size, creation time, and retained-history count.
- `GET /api/encryption/keys` returns the signed browser session's newest active public key.
- Terminal privacy commands receive the verified encryption owner from the server instead of trusting a client-provided owner ID.

## Privacy page behavior

- The generation button remains visible after a key exists.
- Its initial label is `Generate Encryption Keys`; afterward it is `Generate New Encryption Keys`.
- The button is disabled and shows a generating label while a request is pending.
- A successful response immediately replaces the displayed active public key without waiting for a later refetch.
- The page states that previous encrypted private keys are retained securely.
- The page may show the active version and retained-key count, but it does not expose private keys or historical private-key ciphertext.
- A failed request leaves the currently displayed key unchanged and shows an error toast.

## Compatibility

- Terminal and privacy operations resolve the active key by default.
- Historical keys remain addressable by their record ID, version, or fingerprint for future old-data decryption work.
- Existing single-key records are migrated to version 1 and active status.
- Former anonymous local-storage histories are moved once into the protected session.
- Former wallet histories remain reachable after an Ed25519 wallet-signature challenge. If browser-session history also exists, both histories merge atomically, are re-versioned chronologically, and retain the newest key as active.
- Replit's development schema push and Publish schema-diff flow apply the additive schema changes; no startup-time or deployment-time DDL is added.

## Verification

- Several consecutive button clicks produce distinct public keys and Key IDs.
- One immutable history record is added per successful click.
- Exactly one record per owner is active after concurrent or sequential rotations.
- Refreshing the privacy page displays the latest key and leaves the generation button available.
- Collision handling retries and never returns a duplicate key.
- TypeScript checks and focused key-rotation tests pass.