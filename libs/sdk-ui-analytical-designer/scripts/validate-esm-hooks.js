// (C) 2026 GoodData Corporation

import { readFile } from "node:fs/promises";

// Browser-only modules Node cannot import: these packages reach for `window` as soon as they load, and
// the listed module of sdk-ui-metric-component renders into `document` at load. The smoke test
// replaces each of them with a stub that exports the same names; the rest of that package is imported
// for real.
const STUBBED_PACKAGES = new Set(["jquery.browser"]);
const STUBBED_PACKAGE_PREFIXES = ["monaco-editor/", "monaco-languageclient/"];
const STUBBED_MODULES = [
    "/sdk-ui-metric-component/esm/MetricComponent/Form/MaqlEditorField/MaqlEditorEditor.js",
];
const STUB_MARKER = "?validate-esm-stub";
// Vite's `?worker&url` / `?url` imports evaluate to the asset's URL string. The query has to go before
// Node resolves the specifier, because an `exports` map such as `./*` -> `./esm/vs/*.js` would otherwise
// append `.js` to the query instead of the file name.
const URL_IMPORT_QUERY = /\?(?:worker&)?url$/;
const URL_MARKER = "?validate-esm-url";
const ASSET_EXTENSION = /\.(svg|png|gif|jpe?g|webp|ico|woff2?|ttf|eot)$/;

function isStubbed(specifier, url) {
    return (
        STUBBED_PACKAGES.has(specifier) ||
        STUBBED_PACKAGE_PREFIXES.some((prefix) => specifier.startsWith(prefix)) ||
        STUBBED_MODULES.some((path) => new URL(url).pathname.endsWith(path))
    );
}

function exportedNames(source) {
    const names = new Set();
    for (const [, list] of source.matchAll(/export\s*\{([^}]*)\}/g)) {
        for (const entry of list.split(",")) {
            const name = entry
                .trim()
                .split(/\s+as\s+/)
                .pop();
            if (name && name !== "default") {
                names.add(name);
            }
        }
    }
    for (const [, name] of source.matchAll(
        /export\s+(?:const|let|var|class|(?:async\s+)?function\*?)\s+([A-Za-z_$][\w$]*)/g,
    )) {
        names.add(name);
    }
    return [...names];
}

function stubSource(names) {
    const declarations = names.map((name) => `export const ${name} = stub;`).join("\n");
    return `const stub = new Proxy(function () {}, {
    get: (_target, key) => (key === "then" ? undefined : stub),
    apply: () => stub,
    construct: () => stub,
});
export default stub;
${declarations}`;
}

export async function resolve(specifier, context, nextResolve) {
    if (URL_IMPORT_QUERY.test(specifier)) {
        const resolved = await nextResolve(specifier.replace(URL_IMPORT_QUERY, ""), context);
        return { ...resolved, url: resolved.url + URL_MARKER };
    }
    const resolved = await nextResolve(specifier, context);
    return isStubbed(specifier, resolved.url) ? { ...resolved, url: resolved.url + STUB_MARKER } : resolved;
}

export async function load(url, context, nextLoad) {
    if (url.endsWith(STUB_MARKER)) {
        const source = await readFile(new URL(url), "utf8");
        return { format: "module", source: stubSource(exportedNames(source)), shortCircuit: true };
    }
    if (url.endsWith(URL_MARKER)) {
        const source = `export default ${JSON.stringify(url.slice(0, -URL_MARKER.length))};`;
        return { format: "module", source, shortCircuit: true };
    }
    const path = new URL(url).pathname;
    if (path.endsWith(".module.css")) {
        const source = "export default new Proxy({}, { get: (_target, key) => String(key) });";
        return { format: "module", source, shortCircuit: true };
    }
    if (path.endsWith(".css")) {
        return { format: "module", source: "", shortCircuit: true };
    }
    if (ASSET_EXTENSION.test(path)) {
        return { format: "module", source: `export default ${JSON.stringify(url)};`, shortCircuit: true };
    }
    return nextLoad(url, context);
}
