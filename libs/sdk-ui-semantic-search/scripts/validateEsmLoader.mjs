// (C) 2025 GoodData Corporation

/**
 * Custom Node.js loader for ESM validation that handles CSS imports.
 * This loader intercepts .css imports and returns empty modules,
 * allowing Node.js to validate ESM packages that import CSS files.
 */

export function resolve(specifier, context, defaultResolve) {
    // If it's a CSS file, return a special URL
    if (specifier.endsWith(".css")) {
        return {
            url: "css:" + specifier,
            shortCircuit: true,
        };
    }

    // Otherwise, use the default resolver
    return defaultResolve(specifier, context, defaultResolve);
}

export function load(url, context, defaultLoad) {
    // If it's our CSS URL, return an empty module
    if (url.startsWith("css:")) {
        return {
            format: "module",
            source: "export default {};",
            shortCircuit: true,
        };
    }

    // Otherwise, use the default loader
    return defaultLoad(url, context, defaultLoad);
}
