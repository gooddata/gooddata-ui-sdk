// (C) 2025-2026 GoodData Corporation

import { useMemo } from "react";

import { type IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { type IDataVisualizationProps } from "@gooddata/sdk-ui";

import { hasGeoLayerContext } from "../../layers/execution/layerContext.js";
import { type GeoLayerType, type IGeoLayer } from "../../types/layers/index.js";
import { type ILayerExecutionRecord } from "../../types/props/geoChart/internal.js";
import { createExecutionBucketsFingerprint } from "../../utils/fingerprint.js";

type WithoutExecutions<T> = Omit<T, "execution" | "executions">;

/**
 * Props that may include layer type information for fallback layer creation.
 */
interface IPropsWithLayerType {
    type?: GeoLayerType;
}

function executionContextFingerprint(execution: IPreparedExecution): string {
    if (!hasGeoLayerContext(execution)) {
        return "";
    }

    const { id, type, name } = execution.context;
    return `${type}:${id}:${name ?? ""}`;
}

function executionNormalizationFingerprint(execution: IPreparedExecution, index: number): string {
    return [
        index,
        execution.fingerprint(),
        createExecutionBucketsFingerprint(execution),
        executionContextFingerprint(execution),
    ].join("|");
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
 * Unsupported context shapes are ignored; a minimal fallback layer is created.
 *
 * @internal
 */
function extractLayerFromContext(
    _execution: IPreparedExecution,
    index: number,
    fallbackType: GeoLayerType,
    usedIds: Set<string>,
): IGeoLayer {
    const id = generateUniqueId(`${fallbackType}-layer-${index}`, usedIds);
    return createMinimalLayer(id, fallbackType);
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
    TCoreProps extends IDataVisualizationProps & IPropsWithLayerType & { backend?: unknown },
>(props: TCoreProps): INormalizedLayerExecutions<WithoutExecutions<TCoreProps>> {
    const { execution, executions, type: rootLayerType } = props;

    const normalizationFingerprint = [
        rootLayerType ?? "",
        executionNormalizationFingerprint(execution, 0),
        ...(executions ?? []).map((e, index) => executionNormalizationFingerprint(e, index + 1)),
    ].join("||");

    const layerExecutionsCache = useMemo(() => new Map<string, ILayerExecutionRecord[]>(), []);

    const layerExecutions = useMemo(() => {
        const cached = layerExecutionsCache.get(normalizationFingerprint);
        if (cached) {
            return cached;
        }

        const allExecutions = [execution, ...(executions ?? [])];

        const normalizedLayerExecutions: ILayerExecutionRecord[] = [];
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

            normalizedLayerExecutions.push({
                layerId: layer.id,
                layer,
                execution: candidate,
            });
        });

        // Prevent unbounded growth in case the fingerprint changes frequently.
        // The cache is only used to stabilize outputs and avoid flicker.
        if (layerExecutionsCache.size > 20) {
            layerExecutionsCache.clear();
        }
        layerExecutionsCache.set(normalizationFingerprint, normalizedLayerExecutions);

        return normalizedLayerExecutions;
    }, [layerExecutionsCache, normalizationFingerprint, execution, executions, rootLayerType]);

    const layers = useMemo(() => layerExecutions.map((record) => record.layer), [layerExecutions]);

    const propsWithLayers = useMemo(() => {
        const { execution: _execution, executions: _executions, type: _type, ...rest } = props;
        return {
            ...rest,
            layers,
            type: rootLayerType,
        } as WithoutExecutions<TCoreProps> & { layers: IGeoLayer[] };
    }, [props, layers, rootLayerType]);

    return { layerExecutions, propsWithLayers };
}
