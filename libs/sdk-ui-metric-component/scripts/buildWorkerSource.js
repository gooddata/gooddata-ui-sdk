// (C) 2026 GoodData Corporation

/**
 * Finishes the bundled Monaco editor worker and wraps it into an ES module that exports the worker
 * code as a string, plus the declaration file for that module. The editor starts the worker from a
 * Blob made of this string when the consumer's bundler did not emit `worker/monaco-editor-worker.js`
 * as an asset. See src/MaqlEditor/monaco/monacoWorkers.ts. sdk-ui-geo ships its MapLibre worker the
 * same way.
 *
 * Monaco loads its optional external diff algorithm (`@vscode/diff`) with an `import()` of a URL it
 * computes at runtime, marked with `webpackIgnore` and `@vite-ignore` so bundlers leave it alone. The
 * minifier drops those comments, and the Vite dev server then warns that it cannot analyze the
 * import whenever it serves the worker file. The hints are put back into the bundled worker.
 *
 * Usage: node scripts/buildWorkerSource.js <bundled worker.js> <output .source.js>
 */

import { readFileSync, writeFileSync } from "node:fs";

const [workerPath, sourceModulePath] = process.argv.slice(2);

if (!workerPath || !sourceModulePath?.endsWith(".js")) {
    console.error("Usage: node scripts/buildWorkerSource.js <bundled worker.js> <output .source.js>");
    process.exit(1);
}

// A self-contained bundle has no import of a module specifier left; an `import()` of a template literal
// is a URL computed at runtime.
const RUNTIME_IMPORT = /\bimport\(`/g;
const IMPORT_HINTS = "/* webpackIgnore: true */ /* @vite-ignore */ ";

const code = readFileSync(workerPath, "utf8").replace(RUNTIME_IMPORT, `import(${IMPORT_HINTS}\``);

writeFileSync(workerPath, code);
writeFileSync(sourceModulePath, `export default ${JSON.stringify(code)};\n`);
writeFileSync(
    sourceModulePath.replace(/\.js$/, ".d.ts"),
    "declare const source: string;\n\nexport default source;\n",
);
