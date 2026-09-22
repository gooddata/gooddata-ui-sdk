// (C) 2026 GoodData Corporation

import { type IReferencesResult } from "@gooddata/sdk-backend-spi";
import {
    type IInsight,
    type IdentifierRef,
    insightRef,
    isIdentifierRef,
    serializeObjRef,
} from "@gooddata/sdk-model";

import { type ICatalogInsightParametersState } from "../../store/catalog/catalogState.js";
import { type DashboardContext } from "../../types/commonTypes.js";

/**
 * Loads the dashboard-wide insight -> parameter dependency map from the workspace references service.
 *
 * @remarks
 * Walks the dependency graph in `direction: "down"` from each insight, then collects the parameter
 * nodes reachable from it through metrics and computed attributes. Disabled parameters return
 * `uninitialized`; backend errors return `failed`.
 */
export async function loadInsightParameterDependencies(
    ctx: DashboardContext,
    insights: IInsight[],
    enableParameters: boolean,
): Promise<ICatalogInsightParametersState> {
    if (!enableParameters) {
        return { status: "uninitialized", byInsight: {} };
    }

    const roots = insights.map(insightRef).filter(isIdentifierRef);
    if (roots.length === 0) {
        return { status: "loaded", byInsight: {} };
    }

    try {
        const byInsight = await loadReachableParameterMap(ctx, roots);
        return { status: "loaded", byInsight };
    } catch {
        return { status: "failed", byInsight: {} };
    }
}

/**
 * Asks the workspace references service for the dependency graph below `roots` (one request for all of
 * them) and maps each root (keyed by `serializeObjRef`) to the parameter refs reachable from it. Throws
 * when the service does; the caller decides how that degrades.
 *
 * @internal
 */
export async function loadReachableParameterMap(
    ctx: DashboardContext,
    roots: IdentifierRef[],
): Promise<Record<string, IdentifierRef[]>> {
    const result = await ctx.backend
        .workspace(ctx.workspace)
        .references()
        .getReferences(roots, { direction: "down" });

    return buildReachableParameterMap(roots, result.edges);
}

function buildReachableParameterMap(
    roots: IdentifierRef[],
    edges: IReferencesResult["edges"],
): Record<string, IdentifierRef[]> {
    const adjacency = buildAdjacency(edges);
    const result: Record<string, IdentifierRef[]> = {};
    for (const root of roots) {
        result[serializeObjRef(root)] = reachableParameterRefs(graphInsightRef(root), adjacency);
    }
    return result;
}

function graphInsightRef(root: IdentifierRef): IdentifierRef {
    return root.type ? root : { ...root, type: "insight" };
}

function buildAdjacency(edges: IReferencesResult["edges"]): Map<string, IdentifierRef[]> {
    const adjacency = new Map<string, IdentifierRef[]>();
    for (const edge of edges) {
        const fromKey = serializeObjRef(edge.from);
        const neighbors = adjacency.get(fromKey);
        if (neighbors) {
            neighbors.push(edge.to);
        } else {
            adjacency.set(fromKey, [edge.to]);
        }
    }
    return adjacency;
}

function reachableParameterRefs(
    start: IdentifierRef,
    adjacency: Map<string, IdentifierRef[]>,
): IdentifierRef[] {
    const parameters: IdentifierRef[] = [];
    const visited = new Set<string>([serializeObjRef(start)]);
    const queue: IdentifierRef[] = [start];
    for (let i = 0; i < queue.length; i++) {
        for (const neighbor of adjacency.get(serializeObjRef(queue[i])) ?? []) {
            const key = serializeObjRef(neighbor);
            if (visited.has(key)) {
                continue;
            }
            visited.add(key);
            if (neighbor.type === "parameter") {
                parameters.push(neighbor);
            } else {
                queue.push(neighbor);
            }
        }
    }
    return parameters;
}
