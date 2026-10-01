// (C) 2026 GoodData Corporation

import { type ILeakPattern } from "../types.js";

/**
 * Pattern guard: catch credential-shaped values from ANY source (not just the ones the
 * tests typed), e.g. a real key stored in a backend org setting under an unexpected field.
 * Patterns are consumer-supplied — this module has no built-in notion of what a secret
 * looks like for a given domain (see ISnapshotAndSaveRecordingOptions.leakPatterns).
 */
export function assertNoLeakPatterns(
    output: string,
    leakPatterns: ILeakPattern[] | undefined,
    mappingFilePath: string,
): void {
    for (const { label, pattern } of leakPatterns ?? []) {
        // Reset lastIndex in case pattern carries the g/y flag — exec() on a stateful regex
        // would otherwise resume from wherever a previous call (e.g. a prior recording) left off.
        pattern.lastIndex = 0;
        const match = pattern.exec(output);
        if (match) {
            throw new Error(
                `Recording for ${mappingFilePath} contains a value shaped like a ${label} ` +
                    `("${match[0].slice(0, 8)}…"). Refusing to save the mapping file — extend ` +
                    `sanitizeMappings / secretMappings so it gets sanitized.`,
            );
        }
    }
}
