// (C) 2026 GoodData Corporation

import { type IAnalyticalBackend, isGeoAssetUrl } from "@gooddata/sdk-backend-spi";

import type { AddProtocolAction, MapOptions } from "../../layers/common/mapFacade.js";

let nextProtocolSeq = 0;

/**
 * Part of the maplibre-gl module this file uses. Declared structurally so that tests need not
 * load the real bundle.
 *
 * @internal
 */
export interface IMapLibreProtocolRegistry {
    addProtocol: (customProtocol: string, loadFn: AddProtocolAction) => void;
    removeProtocol: (customProtocol: string) => void;
}

/**
 * Authenticated geo asset protocol of one map.
 *
 * @internal
 */
export interface IGeoAssetProtocol {
    /**
     * Map option that moves every GoodData-served asset URL onto the protocol. URLs on third-party
     * hosts are left alone: MapLibre keeps fetching them directly, so they never receive credentials.
     */
    transformRequest: NonNullable<MapOptions["transformRequest"]>;
    /**
     * Unregisters the protocol. Call once the map is removed.
     */
    release: () => void;
}

/**
 * Registers a MapLibre protocol that loads tiles, glyphs and sprites through the backend's
 * authenticated call path.
 *
 * @remarks
 * MapLibre consults its protocol registry only for URLs whose scheme is neither `http(s):` nor
 * `file:`, so the returned `transformRequest` swaps the scheme of GoodData-served asset URLs. The
 * registry is global to the maplibre-gl module, not per map, so each map gets a protocol of its own,
 * bound to its own backend.
 *
 * The handler runs on the main thread. MapLibre's workers do not know the protocol and forward the
 * request to the main thread themselves, which is what lets the handler read the current credential
 * at request time.
 *
 * @internal
 */
export function registerGeoAssetProtocol(
    maplibregl: IMapLibreProtocolRegistry,
    backend: IAnalyticalBackend,
): IGeoAssetProtocol {
    const protocol = `gdc-geo-${nextProtocolSeq++}`;
    const prefix = `${protocol}://`;

    maplibregl.addProtocol(protocol, ({ url, type }, abortController) =>
        backend.geo().getAsset(url.slice(prefix.length), {
            // MapLibre expects parsed JSON for "json" requests and raw bytes for everything else.
            responseType: type === "json" ? "json" : "arraybuffer",
            signal: abortController.signal,
        }),
    );

    return {
        transformRequest: (url) => (isGeoAssetUrl(url) ? { url: `${prefix}${url}` } : undefined),
        release: () => maplibregl.removeProtocol(protocol),
    };
}
