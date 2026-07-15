// (C) 2026 GoodData Corporation

// Minimal crypto shim for WASM (QuickJS has neither node:crypto nor a global Web Crypto API).
// Covers two distinct call shapes seen in the bundle:
// - `import ... from "crypto"` (Node-style) — resolved to this module via esbuild's --alias:crypto.
// - a bare global `crypto` reference (e.g. uuid's browser build reads `crypto.getRandomValues`
//   directly, without importing anything) — installed onto globalThis by wasm/entry.js.
//
// SECURITY: backed by Math.random(), NOT cryptographically secure. wasm/entry.js installs
// this as globalThis.crypto for the whole bundle, so it's fine for the current use (dashboard
// filter-context UUIDs) but must never be relied on for tokens, secrets, or other
// security-sensitive randomness.

/**
 * @param {Uint8Array} typedArray - array to fill with pseudo-random bytes.
 * @returns {Uint8Array} the same array, filled in place.
 */
export function getRandomValues(typedArray) {
    for (let i = 0; i < typedArray.length; i++) {
        typedArray[i] = Math.floor(Math.random() * 256);
    }
    return typedArray;
}

/**
 * @returns {string} a v4-formatted UUID string (not cryptographically random — see module note above).
 */
export function randomUUID() {
    const bytes = getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 1
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(
        20,
    )}`;
}
