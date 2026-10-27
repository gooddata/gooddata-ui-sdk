// (C) 2026 GoodData Corporation

import { readFile } from "fs/promises";

// Browser-only modules Node cannot import. Monaco reaches for `window` as soon as it loads, and the
// listed modules of this package render into `document` at load. The smoke test replaces each of
// them with a stub that exports the same names; everything else is imported for real.
const STUBBED_PACKAGE_PREFIXES = ["monaco-editor/", "monaco-languageclient/"];
const STUBBED_MODULES = ["/esm/MetricComponent/Form/MaqlEditorField/MaqlEditorEditor.js"];
const STUB_MARKER = "?validate-esm-stub";
// Only Monaco may import CSS; the package itself ships none.
const MONACO_CSS = /\/monaco-editor\/.*\.css$/;

function isStubbed(specifier, url) {
    return (
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
    const resolved = await nextResolve(specifier, context);
    return isStubbed(specifier, resolved.url) ? { ...resolved, url: resolved.url + STUB_MARKER } : resolved;
}

export async function load(url, context, nextLoad) {
    if (url.endsWith(STUB_MARKER)) {
        const source = await readFile(new URL(url), "utf8");
        return { format: "module", source: stubSource(exportedNames(source)), shortCircuit: true };
    }
    if (MONACO_CSS.test(new URL(url).pathname)) {
        return { format: "module", source: "", shortCircuit: true };
    }
    return nextLoad(url, context);
}
