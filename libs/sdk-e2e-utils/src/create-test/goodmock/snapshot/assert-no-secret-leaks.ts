// (C) 2026 GoodData Corporation

import { type ISecretMapping } from "../types.js";

import { buildMaskedFormPattern } from "./build-masked-form-pattern.js";
import { getEffectiveSecretMappings } from "./get-effective-secret-mappings.js";

/** Leak guard: never write a recording that still contains a real secret (full or masked). */
export function assertNoSecretLeaks(
    output: string,
    secretMappings: ISecretMapping[] | undefined,
    mappingFilePath: string,
): void {
    for (const { secret } of getEffectiveSecretMappings(secretMappings)) {
        const escapedSecret = JSON.stringify(secret).slice(1, -1);
        const maskedForm = buildMaskedFormPattern(escapedSecret);
        if (output.includes(escapedSecret) || output.includes(secret) || maskedForm?.test(output)) {
            throw new Error(
                `Recording for ${mappingFilePath} still contains a secret after sanitization ` +
                    `(e.g. in an encoded form). Refusing to save the mapping file.`,
            );
        }
    }
}
