// (C) 2026 GoodData Corporation

/**
 * Wraps the bundled MapLibre worker into an ES module that exports the worker code as a string,
 * plus the declaration file for that module. The geo runtime starts the worker from a Blob made of
 * this string when the consumer's bundler did not emit `worker/maplibre-gl-worker.js` as an
 * asset. See src/next/map/runtime/mapWorker.ts.
 *
 * Usage: node scripts/buildWorkerSource.js <bundled worker.js> <output .source.js>
 */

import { readFileSync, writeFileSync } from "node:fs";

const [workerPath, sourceModulePath] = process.argv.slice(2);

if (!workerPath || !sourceModulePath?.endsWith(".js")) {
    console.error("Usage: node scripts/buildWorkerSource.js <bundled worker.js> <output .source.js>");
    process.exit(1);
}

const code = readFileSync(workerPath, "utf8");

writeFileSync(sourceModulePath, `export default ${JSON.stringify(code)};\n`);
writeFileSync(
    sourceModulePath.replace(/\.js$/, ".d.ts"),
    "declare const source: string;\n\nexport default source;\n",
);
