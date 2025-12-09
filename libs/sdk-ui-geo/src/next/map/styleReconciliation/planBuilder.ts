// (C) 2025 GoodData Corporation

import type {
    IReconciliationLayerEntry,
    IReconciliationSourceEntry,
    IStyleReconciliationPlan,
} from "./types.js";
import type { GeoJSONSourceSpecification, IMapFacade } from "../../layers/common/mapFacade.js";

type LayerSpecification = Parameters<IMapFacade["addLayer"]>[0];

/**
 * Fluent builder interface for creating style reconciliation plans.
 *
 * @remarks
 * Use the builder pattern to construct plans in a readable, chainable way.
 * Sources and layers are added in the order specified, which determines
 * their application order on the map.
 *
 * @example
 * ```typescript
 * const plan = createStylePlan()
 *   .addSource("my-data", geojsonSourceSpec)
 *   .addLayer({ id: "fill", type: "fill", source: "my-data", paint: {...} })
 *   .addLayer({ id: "outline", type: "line", source: "my-data", paint: {...} })
 *   .build();
 * ```
 *
 * @internal
 */
interface IStylePlanBuilder {
    /**
     * Add a GeoJSON source to the plan.
     *
     * @param id - Unique identifier for the source
     * @param source - GeoJSON source specification
     * @returns The builder for chaining
     */
    addSource(id: string, source: GeoJSONSourceSpecification): IStylePlanBuilder;

    /**
     * Add a layer to the plan.
     *
     * @param layer - MapLibre layer specification
     * @param options - Optional overrides (e.g., custom ID)
     * @returns The builder for chaining
     */
    addLayer(layer: LayerSpecification, options?: { id?: string }): IStylePlanBuilder;

    /**
     * Build the final reconciliation plan.
     *
     * @returns Immutable plan ready to be applied to the map
     */
    build(): IStyleReconciliationPlan;
}

/**
 * Creates a new style reconciliation plan builder.
 *
 * @remarks
 * Adapters use this fluent helper to construct declarative plans that describe
 * the desired map state. The plan can then be applied using {@link applyStylePlan}
 * or {@link reconcileStyle}.
 *
 * This approach provides several benefits:
 * - **Declarative**: Describe what you want, not how to get there
 * - **Idempotent**: Safe to apply the same plan multiple times
 * - **Explicit**: All sources and layers are clearly enumerated
 * - **Consistent**: Enforces a standard pattern across adapters
 *
 * @returns A new builder instance
 *
 * @example Basic usage
 * ```typescript
 * import { createStylePlan, applyStylePlan } from "../map/styleReconciliation";
 *
 * const plan = createStylePlan()
 *   .addSource("points", {
 *     type: "geojson",
 *     data: { type: "FeatureCollection", features: [...] }
 *   })
 *   .addLayer({
 *     id: "points-circle",
 *     type: "circle",
 *     source: "points",
 *     paint: { "circle-radius": 6, "circle-color": "#ff0000" }
 *   })
 *   .build();
 *
 * applyStylePlan(map, plan);
 * ```
 *
 * @example With clustering
 * ```typescript
 * const plan = createStylePlan()
 *   .addSource("clustered-points", {
 *     type: "geojson",
 *     data: featureCollection,
 *     cluster: true,
 *     clusterMaxZoom: 14,
 *     clusterRadius: 50
 *   })
 *   .addLayer({ id: "clusters", type: "circle", source: "clustered-points", filter: ["has", "point_count"], ... })
 *   .addLayer({ id: "cluster-count", type: "symbol", source: "clustered-points", filter: ["has", "point_count"], ... })
 *   .addLayer({ id: "unclustered", type: "circle", source: "clustered-points", filter: ["!", ["has", "point_count"]], ... })
 *   .build();
 * ```
 *
 * @internal
 */
export function createStylePlan(): IStylePlanBuilder {
    const sources: IReconciliationSourceEntry[] = [];
    const layers: IReconciliationLayerEntry[] = [];

    const builder: IStylePlanBuilder = {
        addSource: (id, source) => {
            sources.push({ id, source });
            return builder;
        },
        addLayer: (layer, options) => {
            const layerId = options?.id ?? layer.id;
            if (!layerId) {
                throw new Error("Layer specification must define an id or be provided via options.");
            }

            const normalizedLayer = layerId === layer.id ? layer : { ...layer, id: layerId };

            layers.push({
                id: layerId,
                layer: normalizedLayer,
            });

            return builder;
        },
        build: () => ({
            sources: sources.slice(),
            layers: layers.slice(),
        }),
    };

    return builder;
}
