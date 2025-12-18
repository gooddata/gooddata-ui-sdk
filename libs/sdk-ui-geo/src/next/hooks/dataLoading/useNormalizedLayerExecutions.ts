// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { type IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { type IDataVisualizationProps } from "@gooddata/sdk-ui";

import { hasGeoLayerContext } from "../../layers/execution/layerContext.js";
import { type GeoLayerType, type IGeoLayer } from "../../types/layers/index.js";
import { type ILayerExecutionRecord } from "../../types/props/geoChartNext/internal.js";
import { isRecord } from "../../utils/guards.js";

type WithoutExecutions<T> = Omit<T, "execution" | "executions">;

/**
 * Props that may include layer type information for fallback layer creation.
 */
interface IPropsWithLayerType {
    type?: GeoLayerType;
}

/**
 * Result of normalizing layer executions
 *
 * @internal
 */
export interface INormalizedLayerExecutions<TCoreProps> {
    /**
     * All layer executions paired with their layer definitions
     */
    layerExecutions: ILayerExecutionRecord[];

    /**
     * Core props with derived layers array and resolved type
     */
    propsWithLayers: TCoreProps & { layers: IGeoLayer[] };
}

/**
 * Checks if a layer has a valid (non-empty) ID.
 *
 * @internal
 */
function hasValidLayerId(layer: IGeoLayer): boolean {
    return typeof layer.id === "string" && layer.id.length > 0;
}

/**
 * Generates a unique layer ID that doesn't collide with existing IDs.
 *
 * @internal
 */
function generateUniqueId(baseId: string, usedIds: Set<string>): string {
    if (!usedIds.has(baseId)) {
        return baseId;
    }

    let suffix = 1;
    let uniqueId = `${baseId}-${suffix}`;
    while (usedIds.has(uniqueId)) {
        suffix++;
        uniqueId = `${baseId}-${suffix}`;
    }
    return uniqueId;
}

/**
 * Ensures a layer has a unique ID by checking against already used IDs.
 * If the layer's ID is empty or already used, generates a new unique ID.
 *
 * @internal
 */
function ensureUniqueLayerId(layer: IGeoLayer, usedIds: Set<string>, index: number): IGeoLayer {
    if (hasValidLayerId(layer) && !usedIds.has(layer.id)) {
        return layer;
    }

    // Generate unique ID for layers with missing or duplicate IDs
    const uniqueId = generateUniqueId(`${layer.type}-layer-${index}`, usedIds);
    return { ...layer, id: uniqueId };
}

/**
 * Tries to extract a layer definition from an execution's context.
 * Even if the context is not a complete IGeoLayer, we try to preserve
 * as much information as possible (type, properties, etc).
 *
 * @internal
 */
function extractLayerFromContext(
    execution: IPreparedExecution,
    index: number,
    fallbackType: GeoLayerType,
    usedIds: Set<string>,
): IGeoLayer {
    const context = execution.context;

    // If no context at all, create minimal fallback
    if (!isRecord(context)) {
        const id = generateUniqueId(`${fallbackType}-layer-${index}`, usedIds);
        return createMinimalLayer(id, fallbackType);
    }

    // Extract type from context if available
    const contextType = context["type"];
    const layerType: GeoLayerType =
        contextType === "pushpin" || contextType === "area" ? contextType : fallbackType;

    // Generate or fix the ID
    const contextId = context["id"];
    const hasValidId = typeof contextId === "string" && contextId.length > 0 && !usedIds.has(contextId);
    const id = hasValidId ? contextId : generateUniqueId(`${layerType}-layer-${index}`, usedIds);

    // Preserve all context properties and ensure required fields are set
    // This maintains layer configuration (filters, sortBy, etc.) even if some fields were missing
    return {
        ...context,
        id,
        type: layerType,
    } as IGeoLayer;
}

/**
 * Creates a minimal layer definition with just id and type.
 *
 * @internal
 */
function createMinimalLayer(id: string, type: GeoLayerType): IGeoLayer {
    if (type === "area") {
        return {
            id,
            type: "area",
            area: undefined as never,
        };
    }

    return {
        id,
        type: "pushpin",
        latitude: undefined as never,
        longitude: undefined as never,
    };
}

/**
 * Normalizes executions into paired layer execution records.
 *
 * @remarks
 * Extracts layer metadata from execution contexts and pairs them together
 * so downstream hooks can rely on the combined data.
 *
 * If an execution doesn't have proper layer context, a fallback layer is
 * created to maintain proper ordering (root layer first, then additional layers).
 *
 * Ensures all layers have unique IDs to prevent key collisions in data Maps.
 *
 * @internal
 */
export function useNormalizedLayerExecutions<
    TCoreProps extends IDataVisualizationProps & IPropsWithLayerType,
>(props: TCoreProps): INormalizedLayerExecutions<WithoutExecutions<TCoreProps>> {
    const { execution, executions, type: rootLayerType, ...coreProps } = props;

    return useMemo(() => {
        const allExecutions = [execution, ...(executions ?? [])];

        const layerExecutions: ILayerExecutionRecord[] = [];
        const usedIds = new Set<string>();

        allExecutions.forEach((candidate, index) => {
            if (!candidate) {
                return;
            }

            let layer: IGeoLayer;

            if (hasGeoLayerContext(candidate)) {
                // Execution has complete layer context - ensure unique ID
                layer = ensureUniqueLayerId(candidate.context, usedIds, index);
            } else {
                // Execution missing or incomplete layer context
                // Try to extract as much info as possible from the context
                // First execution (index 0) uses root layer type as fallback
                const fallbackType = index === 0 ? (rootLayerType ?? "pushpin") : "pushpin";
                layer = extractLayerFromContext(candidate, index, fallbackType, usedIds);
            }

            usedIds.add(layer.id);

            layerExecutions.push({
                layerId: layer.id,
                layer,
                execution: candidate,
            });
        });

        const layers = layerExecutions.map((record) => record.layer);

        const propsWithLayers = {
            ...coreProps,
            layers,
        } as WithoutExecutions<TCoreProps> & { layers: IGeoLayer[] };

        return { layerExecutions, propsWithLayers };
    }, [execution, executions, rootLayerType, coreProps]);
}
