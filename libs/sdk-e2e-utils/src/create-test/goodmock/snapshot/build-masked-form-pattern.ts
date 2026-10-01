// (C) 2026 GoodData Corporation

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// Below this, prefix/suffix would overlap or leave nothing to mask — there's no safe
// "partial reveal" shape to detect, so such secrets rely on the exact-match replace in replaceSecrets.
const MIN_MASKABLE_SECRET_LENGTH = 6;
// Masking keeps a variable-length prefix/suffix of the key around the asterisks; scale how
// much we match by the secret's own length instead of assuming a fixed provider convention
// (e.g. OpenAI's "sk-prox***********abcd") so shorter secrets and other providers' masking
// shapes are still caught.
export const buildMaskedFormPattern = (escapedSecret: string): RegExp | undefined => {
    if (escapedSecret.length < MIN_MASKABLE_SECRET_LENGTH) {
        return undefined;
    }
    const prefixLength = Math.min(7, Math.floor(escapedSecret.length / 3));
    const suffixLength = Math.min(4, Math.floor(escapedSecret.length / 4));
    return new RegExp(
        `${escapeRegex(escapedSecret.slice(0, prefixLength))}[^"*\\\\]*[*]+[^"*\\\\]*${escapeRegex(escapedSecret.slice(-suffixLength))}`,
        "g",
    );
};
