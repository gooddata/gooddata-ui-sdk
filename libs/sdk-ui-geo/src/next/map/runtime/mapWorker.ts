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
 * URL of the self-contained MapLibre worker script that this package ships.
 *
 * @remarks
 * maplibre-gl 6 does not inline its web worker. It resolves `maplibre-gl-worker.mjs` next to its
 * own module through `import.meta.url`, which does not survive bundling: Vite emits no worker file
 * and webpack replaces `import.meta.url` with a build-time `file:` path. The build of this package
 * bundles the worker and its shared chunk into `worker/maplibre-gl-worker.js` (see
 * `scripts/build.sh`), and this URL points at that file relative to this module.
 *
 * The relative path is the same from `src/next/map/runtime/` and from `esm/next/map/runtime/`, so
 * it also holds when a dev server aliases this package to its sources. Bundlers recognise the
 * `new URL("...", import.meta.url)` pattern and emit the file as an asset.
 *
 * @internal
 */
export function getBundledMapLibreWorkerUrl(): string {
    return new URL("../../../../worker/maplibre-gl-worker.js", import.meta.url).href;
}

/**
 * Points MapLibre at the bundled worker unless a worker URL is configured already.
 *
 * @remarks
 * The worker URL is global to the maplibre-gl module. A consumer that called `setWorkerUrl`
 * before the first map is created keeps its own worker.
 *
 * @internal
 */
export function ensureMapLibreWorkerUrl(maplibregl: IMapLibreWorkerConfig): void {
    if (maplibregl.getWorkerUrl()) {
        return;
    }

    maplibregl.setWorkerUrl(getBundledMapLibreWorkerUrl());
}
