// (C) 2026 GoodData Corporation

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, dirname, join, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

import { type Plugin, type ViteDevServer } from "vite";

import { findRepoRoot } from "../../shared/paths.js";

const SDK_SCOPE = "@gooddata/";
const GDC_PREFIX = "gdc-";

/**
 * Source roots for the two monorepo lib families the plugin serves live, by package name:
 *  - `@gooddata/<pkg>`  -> sdk/libs/<pkg>     (published SDK packages)
 *  - `gdc-<pkg>`        -> libs/<pkg>         (internal pluggable-app libs)
 */
interface ISourceRoots {
    sdkLibsDir: string;
    libsDir: string;
}

interface IParsedSpec {
    root: string;
    subpath: string;
}

/**
 * Options for {@link gooddataSdkSourcePlugin}.
 */
export interface IGooddataSdkSourcePluginOptions {
    /**
     * Monorepo root. Defaults to the nearest ancestor of the working directory holding a `rush.json`.
     */
    repoRoot?: string;
}

// True when `child` is `parent` itself or a path nested inside it. Guards against `..` segments in
// the (interpolated) package/subpath escaping the intended directory.
function isInside(child: string, parent: string): boolean {
    return child === parent || child.startsWith(parent + sep);
}

function isFile(path: string): boolean {
    try {
        return statSync(path).isFile();
    } catch {
        return false;
    }
}

// Map a bare specifier (no query) to its source root + remaining subpath, or null when it is not a
// monorepo lib we serve / the package dir is absent / the name escapes its root.
function parseSpec(spec: string, roots: ISourceRoots): IParsedSpec | null {
    let base: string;
    let rest: string;

    if (spec.startsWith(SDK_SCOPE)) {
        base = roots.sdkLibsDir;
        rest = spec.slice(SDK_SCOPE.length);
    } else if (spec.startsWith(GDC_PREFIX)) {
        base = roots.libsDir;
        rest = spec;
    } else {
        return null;
    }

    const slash = rest.indexOf("/");
    const dir = slash === -1 ? rest : rest.slice(0, slash);
    const subpath = slash === -1 ? "" : rest.slice(slash + 1);
    const root = resolve(base, dir);

    if (!isInside(root, base) || !existsSync(root)) {
        return null;
    }

    return { root, subpath };
}

// First existing FILE among `<root>/<rel>`, `.ts(x)`, `/index.ts(x)`. Never returns a directory.
function resolveSourceFile(root: string, rel: string): string | null {
    for (const candidate of [rel, `${rel}.ts`, `${rel}.tsx`, `${rel}/index.ts`, `${rel}/index.tsx`]) {
        const path = resolve(root, candidate);
        if (isInside(path, root) && isFile(path)) {
            return path;
        }
    }

    return null;
}

/**
 * Resolve a `@gooddata/<pkg>` / `gdc-<pkg>` specifier (with optional `/<subpath>`) to a live
 * monorepo source file:
 *  - `styles/css/<name>.css` -> the `styles/scss/<name>.scss` it is compiled from (so scss edits HMR).
 *  - other `styles/<file>` -> the same live file (icons/fonts/images/scss partials).
 *  - `esm/assets/<file>` (referenced by scss `url(...)`) -> the `src/assets/<file>` source (falls back
 *    to the built copy if no src twin); other `esm/*` -> null (left to the published artifact).
 *  - everything else (`.`, `internal`, `src/@ui/...`, ...) -> the matching `src/*` source file.
 * Returns null when there is no matching source file (then the published artifact stays).
 */
function findLibSource(spec: string, roots: ISourceRoots): string | null {
    const parsed = parseSpec(spec, roots);
    if (!parsed) {
        return null;
    }
    const { root, subpath } = parsed;

    const cssMatch = /^styles\/css\/(.+)\.css$/.exec(subpath);
    if (cssMatch) {
        const scss = resolve(root, "styles/scss", `${cssMatch[1]}.scss`);
        return isInside(scss, root) && isFile(scss) ? scss : null;
    }
    if (subpath.startsWith("styles/")) {
        const asset = resolve(root, subpath);
        return isInside(asset, root) && isFile(asset) ? asset : null;
    }
    // Built `esm/assets/*` (referenced by scss `url(...)`) -> live `src/assets/*` source so asset
    // edits reflect; fall back to the built copy if there is no src twin. Other `esm/*` stays on the
    // published artifact.
    const esmAssetMatch = /^esm\/assets\/(.+)$/.exec(subpath);
    if (esmAssetMatch) {
        const srcAsset = resolve(root, "src/assets", esmAssetMatch[1]!);
        if (isInside(srcAsset, root) && isFile(srcAsset)) {
            return srcAsset;
        }
        const builtAsset = resolve(root, "esm/assets", esmAssetMatch[1]!);
        return isInside(builtAsset, root) && isFile(builtAsset) ? builtAsset : null;
    }
    if (subpath.startsWith("esm/")) {
        return null;
    }
    // `src/...` is already rooted at the package; any other subpath lives under `src/`.
    const rel = subpath.startsWith("src/") ? subpath : `src/${subpath || "index"}`;
    return resolveSourceFile(root, rel);
}

// Sass-style file resolution for an extensionless (or explicit) import target: `<name>.scss`,
// `_<name>.scss`, `<name>/index.scss`, `<name>/_index.scss`. Returns the first existing file.
function resolveScssFile(base: string): string | null {
    const dir = dirname(base);
    const name = basename(base);
    const candidates = /\.s?css$/.test(name)
        ? [name, `_${name}`]
        : [`${name}.scss`, `_${name}.scss`, `${name}/index.scss`, `${name}/_index.scss`];

    for (const candidate of candidates) {
        const file = resolve(dir, candidate);
        if (isFile(file)) {
            return file;
        }
    }

    return null;
}

const SCSS_IMPORT_RE = /@(?:use|forward|import)\s+["']([^"']+)["']/g;

// True when compiling `file` from source would run AG Grid's Sass API, directly or through nested
// source-compiled imports (relative, or cross-package non-`styles/css/*` — a `styles/css/*` child
// resolves to a built stylesheet, see the importer below, so it cannot run sass).
function usesAgGridSassApi(file: string, roots: ISourceRoots, seen = new Set<string>()): boolean {
    if (seen.has(file)) {
        return false;
    }
    seen.add(file);

    let text: string;
    try {
        text = readFileSync(file, "utf8");
    } catch {
        return false;
    }

    for (const [, spec] of text.matchAll(SCSS_IMPORT_RE)) {
        if (spec!.startsWith("ag-grid-community/styles")) {
            return true;
        }
        let target: string | null = null;
        const parsed = parseSpec(spec!, roots);
        if (parsed) {
            if (!parsed.subpath.startsWith("styles/css/")) {
                const base = resolve(parsed.root, parsed.subpath);
                target = isInside(base, parsed.root) ? resolveScssFile(base) : null;
            }
        } else if (!spec!.includes(":")) {
            target = resolveScssFile(resolve(dirname(file), spec!));
        }
        if (target && usesAgGridSassApi(target, roots, seen)) {
            return true;
        }
    }

    return false;
}

// Dart-sass file importer for `@use "@gooddata/<pkg>/..."` / `@use "gdc-<pkg>/..."` so cross-package
// scss imports resolve to the live source (the injected package copy has no `src/`). Vite resolves
// scss `@use`/`@import` via importers, not the JS resolveId pipeline, so this is needed in addition.
function gooddataSassImporter(roots: ISourceRoots) {
    return {
        findFileUrl(url: string): URL | null {
            const parsed = parseSpec(url, roots);
            if (!parsed) {
                return null;
            }
            const { root, subpath } = parsed;
            const candidates: string[] = [];
            // `styles/css/<name>[.css]` @use targets the COMPILED stylesheet; remap to the live
            // `styles/scss/<name>.scss` SOURCE first so scss edits hot-reload (most such @use are
            // extensionless, e.g. `@gooddata/sdk-ui-kit/styles/css/main` — mirrors findLibSource).
            // EXCEPT stylesheets that run AG Grid's Sass API: grid-styles emits AG Grid's base CSS
            // only once per sass compilation, so folded into a larger stylesheet after another
            // grid-styles include they would silently lose their scoped copy of it. Those keep the
            // live BUILT css (compiled standalone, so complete) — scss edits there need a rebuild.
            const cssMatch = /^styles\/css\/(.+)$/.exec(subpath);
            if (cssMatch) {
                const name = cssMatch[1]!.replace(/\.css$/, "");
                const scss = resolve(root, "styles/scss", `${name}.scss`);
                const keepBuilt = isInside(scss, root) && isFile(scss) && usesAgGridSassApi(scss, roots);
                candidates.push(keepBuilt ? `styles/css/${name}.css` : `styles/scss/${name}.scss`);
            }
            // Otherwise use the path as-is (already has an scss/css extension) or append `.scss`.
            candidates.push(/\.s?css$/.test(subpath) ? subpath : `${subpath}.scss`);
            for (const rel of candidates) {
                const file = resolve(root, rel);
                if (isInside(file, root) && existsSync(file)) {
                    return pathToFileURL(file);
                }
            }
            return null;
        },
    };
}

/**
 * Dev-only Vite plugin (`apply: "serve"`) that serves GoodData monorepo libraries from their live
 * source instead of the published/built artifact, so edits hot-reload in pluggable-app dev servers:
 *  - `@gooddata/<pkg>` -> `sdk/libs/<pkg>/src` (+ styles)
 *  - `gdc-<pkg>`       -> `libs/<pkg>/src` (+ styles)
 *
 * Why a plugin (not an export `source` condition): the SDK is a pnpm `file:` dep injected into the
 * store as its published `files` (esm/ + scss) — there is NO `src/` at the resolved location, and a
 * `source` condition would also ship to npm and break client apps. Several `gdc-*` libs publish no
 * `source` export at all. Remapping by package name to the live source tree (outside node_modules,
 * so Vite treats it as project source and does not pre-bundle it) covers both uniformly.
 *
 * Covers: JS `resolveId` (`@gooddata/<pkg>` / `gdc-<pkg>` -> live `src`); scss `@use` (a sass
 * importer); and scss `url()` assets, which Vite resolves via `resolve.alias` (NOT resolveId) — a
 * dev-only alias remaps the built `esm/assets/*` refs to the live `src/assets/*` source. Assets are
 * served un-inlined (assetsInlineLimit:0) so every asset edit hot-reloads granularly (a `css-update`,
 * no page reload, no server restart). No-op in production.
 */
export function gooddataSdkSourcePlugin(options: IGooddataSdkSourcePluginOptions = {}): Plugin {
    const repoRoot = options.repoRoot ?? findRepoRoot();
    const roots: ISourceRoots = {
        sdkLibsDir: join(repoRoot, "sdk", "libs"),
        libsDir: join(repoRoot, "libs"),
    };

    return {
        name: "gooddata-sdk-source",
        apply: "serve",
        enforce: "pre",
        config(_config, env) {
            if (env.command !== "serve") {
                return undefined;
            }
            return {
                // Dev only: don't base64-inline assets (an inlined asset is cached by Vite's CSS
                // plugin and can't refresh without a server restart). Served as a plain file URL, an
                // asset edit hot-reloads as a granular css-update.
                build: { assetsInlineLimit: 0 },
                resolve: {
                    // scss `url()` is resolved via resolve.alias (NOT resolveId), so remap the SDK's
                    // built `esm/assets/*` refs to the live `src/assets/*` source here — otherwise the
                    // css points at the built copy and src/assets edits don't reflect. Every esm/assets
                    // asset has a src twin (verified), so a plain alias is safe — no `customResolver`
                    // (deprecated, removed in Vite 9). The url then points at source Vite tracks -> HMR.
                    alias: [
                        {
                            find: /^@gooddata\/([a-z0-9-]+)\/esm\/assets\/(.+)$/,
                            replacement: `${roots.sdkLibsDir}/$1/src/assets/$2`,
                        },
                        {
                            find: /^(gdc-[a-z0-9-]+)\/esm\/assets\/(.+)$/,
                            replacement: `${roots.libsDir}/$1/src/assets/$2`,
                        },
                    ],
                },
                css: {
                    preprocessorOptions: {
                        scss: { importers: [gooddataSassImporter(roots)] },
                    },
                },
            };
        },
        // SDK/gdc source lives OUTSIDE the harness root, so Vite wouldn't watch it. Add the served
        // asset dirs (styles/* and src/assets/*) to the watcher so Vite notices an out-of-root asset
        // edit and granularly updates the CSS that references it (a css-update, no reload).
        configureServer(server: ViteDevServer) {
            for (const base of [roots.sdkLibsDir, roots.libsDir]) {
                let libs;
                try {
                    libs = readdirSync(base, { withFileTypes: true });
                } catch {
                    continue;
                }
                for (const lib of libs) {
                    if (!lib.isDirectory()) {
                        continue;
                    }
                    for (const sub of ["styles", "src/assets"]) {
                        const dir = resolve(base, lib.name, sub);
                        if (existsSync(dir)) {
                            server.watcher.add(dir);
                        }
                    }
                }
            }
        },
        // Not memoized: each resolve hits the filesystem (a handful of cheap stat calls, and Vite
        // already caches resolution in its module graph) so a newly added source file is picked up
        // without restarting the dev server.
        resolveId(source: string) {
            if (!source.startsWith(SDK_SCOPE) && !source.startsWith(GDC_PREFIX)) {
                return null;
            }
            // Split on the FIRST "?" only, so a query string that itself contains "?" is preserved.
            const q = source.indexOf("?");
            const spec = q === -1 ? source : source.slice(0, q);
            const query = q === -1 ? "" : source.slice(q + 1);
            const resolved = findLibSource(spec, roots);
            if (!resolved) {
                return null;
            }
            return query ? `${resolved}?${query}` : resolved;
        },
    };
}
