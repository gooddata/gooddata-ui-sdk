// (C) 2025 GoodData Corporation

import type { IExistingResources, IStyleReconciliationPlan } from "./types.js";
import { removeLayerIfExists, removeSourceIfExists } from "../../layers/common/layerOps.js";
import type { IMapFacade } from "../../layers/common/mapFacade.js";

/**
 * Removes all sources and layers specified in the plan from the map.
 *
 * @param map - Map facade instance
 * @param plan - Plan containing resources to remove
 */
function removePlannedResources(map: IMapFacade, plan: IStyleReconciliationPlan): void {
    const layerIds = new Set(plan.layers.map((entry) => entry.id));
    const sourceIds = new Set(plan.sources.map((entry) => entry.id));

    layerIds.forEach((layerId) => removeLayerIfExists(map, layerId));
    sourceIds.forEach((sourceId) => removeSourceIfExists(map, sourceId));
}

/**
 * Applies desired sources and layers to the map, removing specified existing resources first.
 *
 * @remarks
 * Use this function when transitioning between different layer variants where the
 * new plan doesn't include all the IDs that need to be removed. For example, when
 * switching from clustered to non-clustered mode, the cluster-specific layers
 * need to be explicitly removed even though they're not in the new plan.
 *
 * For the common case where you only need to update your own resources,
 * use {@link applyStylePlan} instead.
 *
 * @param map - Map facade instance to modify
 * @param plan - Reconciliation plan with sources and layers to add
 * @param existing - Resources to remove before applying the plan
 *
 * @example Transitioning between clustered and non-clustered modes
 * ```typescript
 * // When disabling clustering, we need to remove cluster-specific layers
 * const existingClusteredResources: IExistingResources = {
 *   layers: ["clusters", "cluster-count", "unclustered-point"],
 *   sources: ["clustered-data"]
 * };
 *
 * // New plan only has a simple point layer
 * const nonClusteredPlan = createStylePlan()
 *   .addSource("point-data", { type: "geojson", data: features })
 *   .addLayer({ id: "points", type: "circle", source: "point-data", ... })
 *   .build();
 *
 * // Remove old resources, then add new ones
 * reconcileStyle(map, nonClusteredPlan, existingClusteredResources);
 * ```
 *
 * @internal
 */
export function reconcileStyle(
    map: IMapFacade,
    plan: IStyleReconciliationPlan,
    existing: IExistingResources,
): void {
    existing.layers.forEach((layerId) => removeLayerIfExists(map, layerId));
    existing.sources.forEach((sourceId) => removeSourceIfExists(map, sourceId));

    plan.sources.forEach(({ id, source }) => {
        map.addSource(id, source);
    });

    plan.layers.forEach(({ layer }) => {
        map.addLayer(layer);
    });
}

/**
 * Applies a style plan after clearing any resources referenced by the plan itself.
 *
 * @remarks
 * This is the primary function for applying style plans. It covers the common case
 * where adapters only need to keep their own sources and layers in sync. The function:
 *
 * 1. Removes all layers with IDs matching `plan.layers`
 * 2. Removes all sources with IDs matching `plan.sources`
 * 3. Adds all sources from the plan
 * 4. Adds all layers from the plan
 *
 * This makes the function idempotent - safe to call multiple times with the same plan,
 * and safe to call with an updated plan that has the same resource IDs.
 *
 * Use {@link reconcileStyle} directly if you need to remove resources that are
 * not listed in the plan (e.g., when transitioning between different layer variants
 * like clustered vs non-clustered).
 *
 * @param map - Map facade instance to modify
 * @param plan - Reconciliation plan with sources and layers to apply
 *
 * @example Basic usage in an adapter
 * ```typescript
 * function syncToMap(layer: IGeoLayer, map: IMapFacade, output: IGeoLayerOutput): void {
 *   const plan = createStylePlan()
 *     .addSource(`${layer.id}-source`, output.source)
 *     .addLayer(createFillLayer(layer.id, output))
 *     .addLayer(createOutlineLayer(layer.id, output))
 *     .build();
 *
 *   applyStylePlan(map, plan);
 * }
 * ```
 *
 * @example Updating existing layers
 * ```typescript
 * // Safe to call repeatedly - old resources are removed before new ones are added
 * function updateColors(map: IMapFacade, newColors: ColorData): void {
 *   const plan = createStylePlan()
 *     .addSource("regions", { type: "geojson", data: newColors.features })
 *     .addLayer({ id: "region-fill", ... })
 *     .build();
 *
 *   // Old "regions" source and "region-fill" layer are removed first
 *   applyStylePlan(map, plan);
 * }
 * ```
 *
 * @internal
 */
export function applyStylePlan(map: IMapFacade, plan: IStyleReconciliationPlan): void {
    removePlannedResources(map, plan);

    plan.sources.forEach(({ id, source }) => {
        map.addSource(id, source);
    });

    plan.layers.forEach(({ layer }) => {
        map.addLayer(layer);
    });
}
