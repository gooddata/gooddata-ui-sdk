// (C) 2025 GoodData Corporation

/**
 * Style Reconciliation Types
 *
 * @remarks
 * This module defines types for declarative MapLibre style management.
 * Instead of imperatively adding/removing sources and layers, adapters
 * declare their desired state in a plan, and reconciliation functions
 * handle the actual map mutations.
 *
 * @internal
 */

import type { GeoJSONSourceSpecification, IMapFacade } from "../../layers/common/mapFacade.js";

type LayerSpecification = Parameters<IMapFacade["addLayer"]>[0];

/**
 * Entry representing a GeoJSON source to be added to the map.
 *
 * @remarks
 * Each source entry contains a unique identifier and its GeoJSON specification.
 * Sources are added to the map before layers that reference them.
 *
 * @internal
 */
export interface IReconciliationSourceEntry {
    /**
     * Unique identifier for the source.
     *
     * @remarks
     * Used to reference this source from layer specifications via `source` property.
     * Should be unique within the map to avoid conflicts with other adapters.
     */
    id: string;

    /**
     * GeoJSON source specification.
     *
     * @remarks
     * Contains the GeoJSON data and optional source configuration like clustering.
     */
    source: GeoJSONSourceSpecification;
}

/**
 * Entry representing a MapLibre layer to be added to the map.
 *
 * @remarks
 * Each layer entry contains a unique identifier and its layer specification.
 * Layers are added in array order, which determines their z-order on the map.
 *
 * @internal
 */
export interface IReconciliationLayerEntry {
    /**
     * Unique identifier for the layer.
     *
     * @remarks
     * Used to remove existing layers during reconciliation.
     * Should be unique within the map to avoid conflicts.
     */
    id: string;

    /**
     * MapLibre layer specification.
     *
     * @remarks
     * Defines the layer type, source reference, styling, and filters.
     */
    layer: LayerSpecification;
}

/**
 * Declarative plan for sources and layers to apply to the map.
 *
 * @remarks
 * A reconciliation plan describes the desired map state. When applied,
 * the reconciliation functions ensure the map matches this state by
 * removing stale resources and adding new ones.
 *
 * @example
 * ```typescript
 * const plan: IStyleReconciliationPlan = {
 *   sources: [
 *     { id: "my-source", source: { type: "geojson", data: featureCollection } }
 *   ],
 *   layers: [
 *     { id: "my-fill", layer: { id: "my-fill", type: "fill", source: "my-source", paint: {...} } }
 *   ]
 * };
 * ```
 *
 * @internal
 */
export interface IStyleReconciliationPlan {
    /**
     * Sources to add to the map.
     *
     * @remarks
     * Sources are added in array order before any layers.
     */
    sources: IReconciliationSourceEntry[];

    /**
     * Layers to add to the map.
     *
     * @remarks
     * Layers are added in array order after all sources.
     * Later layers appear on top of earlier ones.
     */
    layers: IReconciliationLayerEntry[];
}

/**
 * Tracks existing map resources that should be removed during reconciliation.
 *
 * @remarks
 * Used by {@link reconcileStyle} to specify resources that exist on the map
 * but are not part of the new plan. This is necessary when transitioning
 * between different layer variants (e.g., clustered vs non-clustered).
 *
 * @example
 * ```typescript
 * const existing: IExistingResources = {
 *   layers: ["old-layer-1", "old-layer-2"],
 *   sources: ["old-source"]
 * };
 * reconcileStyle(map, newPlan, existing);
 * ```
 *
 * @internal
 */
export interface IExistingResources {
    /**
     * IDs of existing layers to remove before applying the plan.
     */
    layers: string[];

    /**
     * IDs of existing sources to remove before applying the plan.
     *
     * @remarks
     * Sources should be removed after all layers that reference them.
     */
    sources: string[];
}
