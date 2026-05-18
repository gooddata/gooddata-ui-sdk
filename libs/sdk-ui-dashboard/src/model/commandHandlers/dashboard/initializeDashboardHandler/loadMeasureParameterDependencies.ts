// (C) 2026 GoodData Corporation

import {
    type IInsight,
    type IdentifierRef,
    insightMeasures,
    isIdentifierRef,
    isMeasureDefinition,
    objRefToString,
} from "@gooddata/sdk-model";

import { type ICatalogMeasureParametersState } from "../../../store/catalog/catalogState.js";
import { type DashboardContext } from "../../../types/commonTypes.js";

/**
 * Loads the dashboard-wide metric -> parameter dependency map from the workspace references service.
 *
 * @remarks
 * Walks the dependency graph in `direction: "down"`, then collects parameter nodes reachable from
 * each root metric, including transitive metric -> metric -> parameter chains. Disabled parameters
 * return `uninitialized`; backend errors return `failed`.
 */
export async function loadMeasureParameterDependencies(
    ctx: DashboardContext,
    insights: IInsight[],
    enableParameters: boolean,
): Promise<ICatalogMeasureParametersState> {
    if (!enableParameters) {
        return { status: "uninitialized", byMetric: {} };
    }

    const metricRefs = collectMetricRefs(insights);
    if (metricRefs.length === 0) {
        return { status: "loaded", byMetric: {} };
    }

    try {
        const result = await ctx.backend
            .workspace(ctx.workspace)
            .references()
            .getReferences(metricRefs, { direction: "down" });

        const byMetric = buildReachableParameterMap(metricRefs, result.edges);
        return { status: "loaded", byMetric };
    } catch {
        return { status: "failed", byMetric: {} };
    }
}

function collectMetricRefs(insights: IInsight[]): IdentifierRef[] {
    const seen = new Set<string>();
    const refs: IdentifierRef[] = [];
    for (const insight of insights) {
        for (const measure of insightMeasures(insight)) {
            const def = measure.measure.definition;
            if (!isMeasureDefinition(def)) {
                continue;
            }
            const item = def.measureDefinition.item;
            if (!isIdentifierRef(item)) {
                continue;
            }
            const key = objRefToString(item);
            if (seen.has(key)) {
                continue;
            }
            seen.add(key);
            refs.push(item);
        }
    }
    return refs;
}

function buildReachableParameterMap(
    roots: IdentifierRef[],
    edges: ReadonlyArray<{ from: IdentifierRef; to: IdentifierRef }>,
): Record<string, IdentifierRef[]> {
    const adjacency = buildAdjacency(edges);
    const result: Record<string, IdentifierRef[]> = {};
    for (const root of roots) {
        const reachableParameters = reachableParameterRefs(root, adjacency);
        result[objRefToString(root)] = reachableParameters;
    }
    return result;
}

function buildAdjacency(
    edges: ReadonlyArray<{ from: IdentifierRef; to: IdentifierRef }>,
): Map<string, Array<{ to: IdentifierRef; key: string }>> {
    const adjacency = new Map<string, Array<{ to: IdentifierRef; key: string }>>();
    for (const edge of edges) {
        const fromKey = objRefToString(edge.from);
        const toKey = objRefToString(edge.to);
        const next = adjacency.get(fromKey) ?? [];
        next.push({ to: edge.to, key: toKey });
        adjacency.set(fromKey, next);
    }
    return adjacency;
}

function reachableParameterRefs(
    start: IdentifierRef,
    adjacency: Map<string, Array<{ to: IdentifierRef; key: string }>>,
): IdentifierRef[] {
    const parameters: IdentifierRef[] = [];
    const parametersSeen = new Set<string>();
    const visited = new Set<string>([objRefToString(start)]);
    const queue: IdentifierRef[] = [start];
    while (queue.length > 0) {
        const node = queue.shift()!;
        const neighbors = adjacency.get(objRefToString(node)) ?? [];
        for (const neighbor of neighbors) {
            if (visited.has(neighbor.key)) {
                continue;
            }
            visited.add(neighbor.key);
            if (neighbor.to.type === "parameter") {
                if (!parametersSeen.has(neighbor.key)) {
                    parametersSeen.add(neighbor.key);
                    parameters.push(neighbor.to);
                }
                continue;
            }
            queue.push(neighbor.to);
        }
    }
    return parameters;
}
