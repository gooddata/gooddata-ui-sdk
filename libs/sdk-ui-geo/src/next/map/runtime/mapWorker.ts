// (C) 2026 GoodData Corporation

/**
 * Part of the maplibre-gl module this file uses. Declared structurally so that tests need not
 * load the real bundle.
 *
 * @internal
 */
export interface IMapLibreWorkerConfig {
    getWorkerUrl: () => string;
    setWorkerUrl: (url: string) => void;
}

/**
 * URL of the self-contained MapLibre worker file that this package ships, relative to this module.
 *
 * @remarks
 * maplibre-gl 6 does not inline its web worker. It resolves `maplibre-gl-worker.mjs` next to its
 * own module through `import.meta.url`, which does not survive bundling. The build of this package
 * bundles the worker and its shared chunk into `worker/maplibre-gl-worker.js` (see
 * `scripts/build.sh`), and this URL points at that file relative to this module.
 *
 * The relative path is the same from `src/next/map/runtime/` and from `esm/next/map/runtime/`, so
 * it also holds when a dev server aliases this package to its sources. webpack and Vite recognise
 * the `new URL("...", import.meta.url)` pattern and emit the file as an asset. Other bundlers do
 * not: esbuild leaves a URL that resolves next to the bundle and does not exist, and webpack with
 * `parser.javascript.url: false` (Angular CLI) inlines a build-time `file:` URL. The URL must
 * therefore be checked before MapLibre uses it, see {@link resolveMapLibreWorkerUrl}.
 *
 * @internal
 */
export function getBundledMapLibreWorkerUrl(): string {
    return new URL("../../../../worker/maplibre-gl-worker.js", import.meta.url).href;
}

/**
 * Tells whether MapLibre can start the worker from the URL directly: the URL is a same-origin
 * `http(s)` URL and the server has the file as JavaScript.
 *
 * @remarks
 * A cross-origin worker is not used even when it exists: MapLibre starts such a worker through an
 * importing Blob, which needs `blob:` in the content security policy anyway, and webpack breaks
 * that code path. The inline Blob worker is the better choice there.
 *
 * The MIME type is checked because single-page application servers often answer a missing file
 * with `index.html` and status 200, and browsers do not start a module worker from HTML.
 */
async function isReachableSameOriginScript(url: string): Promise<boolean> {
    const pageOrigin = typeof location === "undefined" ? undefined : location.origin;

    if (!pageOrigin) {
        return false;
    }

    let parsed: URL;

    try {
        parsed = new URL(url);
    } catch {
        return false;
    }

    if (!/^https?:$/.test(parsed.protocol) || parsed.origin !== pageOrigin) {
        return false;
    }

    try {
        const response = await fetch(url, { method: "HEAD" });

        return (
            response.ok &&
            /^(text|application)\/(javascript|ecmascript)\b/.test(response.headers.get("content-type") ?? "")
        );
    } catch {
        return false;
    }
}

/**
 * Starts the worker from the worker code this package ships inline. The Blob URL carries the
 * origin of the page, so MapLibre starts it directly. The URL is never revoked: MapLibre creates
 * its workers lazily and the one Blob lives as long as the page.
 */
async function createInlineWorkerUrl(): Promise<string> {
    const { default: source } = await import("../../../../worker/maplibre-gl-worker.source.js");

    return URL.createObjectURL(new Blob([source], { type: "text/javascript" }));
}

/**
 * Resolves the URL MapLibre starts its worker from: the bundled worker file when the bundler
 * emitted it next to the page, the inline worker otherwise.
 *
 * @param assetUrl - URL of the bundled worker file, defaults to {@link getBundledMapLibreWorkerUrl}
 * @internal
 */
export async function resolveMapLibreWorkerUrl(
    assetUrl: string = getBundledMapLibreWorkerUrl(),
): Promise<string> {
    return (await isReachableSameOriginScript(assetUrl)) ? assetUrl : createInlineWorkerUrl();
}

/**
 * Creates the function that points MapLibre at a worker unless a worker URL is configured already.
 *
 * @remarks
 * The worker URL is global to the maplibre-gl module. A consumer that called maplibre's own
 * `setWorkerUrl` before the first map is created keeps its own worker; this is also the way to
 * host the worker file yourself on a page whose content security policy does not allow `blob:`
 * workers. Otherwise the bundled worker is resolved once and shared by all maps, which is why the
 * cache lives in the created function: tests create their own, the runtime uses
 * {@link ensureMapLibreWorkerUrl}.
 *
 * @param resolveWorkerUrl - resolves the URL of the worker this package ships
 * @internal
 */
export function createMapLibreWorkerUrlEnsurer(
    resolveWorkerUrl: () => Promise<string> = resolveMapLibreWorkerUrl,
): (maplibregl: IMapLibreWorkerConfig) => Promise<void> {
    let resolvedWorkerUrl: Promise<string> | undefined;

    return async (maplibregl) => {
        if (maplibregl.getWorkerUrl()) {
            return;
        }

        resolvedWorkerUrl ??= resolveWorkerUrl().catch((error: unknown) => {
            resolvedWorkerUrl = undefined;
            throw error;
        });

        const workerUrl = await resolvedWorkerUrl;

        // the consumer can configure its own worker while the bundled one is being resolved
        if (!maplibregl.getWorkerUrl()) {
            maplibregl.setWorkerUrl(workerUrl);
        }
    };
}

/**
 * Points MapLibre at a worker unless a worker URL is configured already, see
 * {@link createMapLibreWorkerUrlEnsurer}.
 *
 * @internal
 */
export const ensureMapLibreWorkerUrl = createMapLibreWorkerUrlEnsurer();
