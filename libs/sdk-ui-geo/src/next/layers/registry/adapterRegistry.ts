// (C) 2025 GoodData Corporation

import type { IGeoLayerAdapterByType } from "./adapterTypes.js";
import type { GeoLayerType, IGeoLayer } from "../../types/layers/index.js";
import { areaAdapter } from "../area/adapter.js";
import { pushpinAdapter } from "../pushpin/adapter.js";

/**
 * Runtime adapter type that accepts any IGeoLayer.
 *
 * @remarks
 * This type is used by the registry to return adapters that can be called
 * with any layer type. The caller is responsible for ensuring the layer
 * type matches the adapter type (which is guaranteed by selecting the
 * adapter based on layer.type).
 *
 * @internal
 */

const adapters: Partial<Record<GeoLayerType, IGeoLayerAdapterByType<GeoLayerType>>> = {};

/**
 * Register or override adapter for the given layer type.
 *
 * @internal
 */
export function registerLayerAdapter<TType extends GeoLayerType>(
    type: TType,
    adapter: IGeoLayerAdapterByType<TType>,
): void {
    adapters[type] = adapter;
}

/**
 * Clears all registered adapters.
 *
 * @remarks
 * Intended for tests or advanced extension scenarios. Consumers must re-register
 * the adapters they need (e.g., via {@link registerLayerAdapter}) after calling this.
 *
 * @internal
 */
export function clearLayerAdapters(): void {
    (Object.keys(adapters) as GeoLayerType[]).forEach((key) => {
        delete adapters[key];
    });
}

registerLayerAdapter("pushpin", pushpinAdapter);
registerLayerAdapter("area", areaAdapter);

/**
 * Retrieve adapter for the given layer type.
 *
 * @remarks
 * The returned adapter is typed to accept any IGeoLayer. At runtime,
 * the adapter is guaranteed to match the layer type (since we select
 * based on layer.type), but TypeScript cannot prove this statically.
 *
 * @internal
 */
export function getLayerAdapter<TType extends GeoLayerType>(type: TType): IGeoLayerAdapterByType<TType>;
export function getLayerAdapter<TLayer extends IGeoLayer>(
    layer: TLayer,
): IGeoLayerAdapterByType<TLayer["type"]>;
export function getLayerAdapter(typeOrLayer: GeoLayerType | IGeoLayer) {
    const type = typeof typeOrLayer === "string" ? typeOrLayer : typeOrLayer.type;
    const adapter = adapters[type];
    if (!adapter) {
        throw new Error(`No adapter registered for layer type: ${type}`);
    }
    return adapter;
}
