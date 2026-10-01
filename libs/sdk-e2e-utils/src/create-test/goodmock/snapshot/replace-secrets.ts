// (C) 2026 GoodData Corporation

import { type ISecretMapping } from "../types.js";

import { buildMaskedFormPattern } from "./build-masked-form-pattern.js";
import { getEffectiveSecretMappings } from "./get-effective-secret-mappings.js";

/**
 * Replace secrets typed into the UI / sent by API helpers during recording with their
 * replay-time placeholders. JSON-escape both sides so values containing characters that
 * JSON.stringify escapes (quotes, backslashes) are still found in the serialized output.
 * Provider error messages echo keys in a masked form ("sk-prox***********abcd"), so that
 * shape is rewritten too — it still leaks the ends of a real key.
 */
export function replaceSecrets(output: string, secretMappings: ISecretMapping[] | undefined): string {
    let result = output;
    for (const { secret, placeholder } of getEffectiveSecretMappings(secretMappings)) {
        const escapedSecret = JSON.stringify(secret).slice(1, -1);
        const escapedPlaceholder = JSON.stringify(placeholder).slice(1, -1);
        result = result.replaceAll(escapedSecret, escapedPlaceholder);
        const maskedForm = buildMaskedFormPattern(escapedSecret);
        if (maskedForm) {
            result = result.replace(maskedForm, escapedPlaceholder);
        }
    }
    return result;
}
