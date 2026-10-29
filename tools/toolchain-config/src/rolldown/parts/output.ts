// (C) 2026 GoodData Corporation

import { type OutputOptions } from "rolldown";

/**
 * ESM output with `.mjs` entries and hashed chunks under `chunks/`, so Node runs the bundle as ESM
 * regardless of the package `type` and entry names stay stable for the tooling that invokes them.
 */
export function esmOutput(dir = "dist"): OutputOptions {
    return {
        dir,
        format: "esm",
        entryFileNames: "[name].mjs",
        chunkFileNames: "chunks/[name]-[hash].mjs",
    };
}
