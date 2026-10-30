// (C) 2026 GoodData Corporation

/**
 * Hashed output file names under `static/`, the layout the host nginx and the S3 publish expect.
 */
export const STATIC_OUTPUT_FILE_NAMES = {
    entryFileNames: "static/js/[name].[hash].js",
    chunkFileNames: "static/js/[name].[hash].chunk.js",
    assetFileNames: "static/[hash][extname]",
};

/**
 * Parses the `PORT` env value, falling back to the preset's port.
 */
export function resolvePort(envValue: string | undefined, fallback: number | undefined): number | undefined {
    return envValue ? parseInt(envValue, 10) : fallback;
}
