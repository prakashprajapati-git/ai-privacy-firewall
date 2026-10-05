/**
 * Fast deterministic hash function (FNV-1a 32-bit) for privacy-preserving value hashing.
 * Allows tracking token mappings without storing raw user credentials.
 */
export function hashValue(val: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < val.length; i++) {
    hash ^= val.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}
