// (C) 2026 GoodData Corporation

import { type IReferencesResult, isUnexpectedResponseError } from "@gooddata/sdk-backend-spi";
import {
    type IInsight,
    type IdentifierRef,
    insightRef,
    isIdentifierRef,
    serializeObjRef,
} from "@gooddata/sdk-model";

import { type DashboardContext } from "../../types/commonTypes.js";

interface IParameterDependenciesLoadResult {
    byRoot: Record<string, IdentifierRef[]>;
    failedRoots: IdentifierRef[];
}

/**
 * Loads the root -> parameter dependencies of `roots` from the workspace references service.
 *
 * @remarks
 * Walks the dependency graph in `direction: "down"` from each root, then collects the parameter
 * nodes reachable from it through metrics and computed attributes. Each root is keyed by
 * `serializeObjRef` of the ref exactly as it was supplied, so a caller looks its own refs up again.
 * A batch the backend rejects for one unknown root is retried root by root, so the remaining roots
 * stay available and only the rejected ones fail. Any other failure is endpoint-wide and fails every
 * root at once.
 */
export async function loadParameterDependencies(
    ctx: DashboardContext,
    roots: IdentifierRef[],
): Promise<IParameterDependenciesLoadResult> {
    if (roots.length === 0) {
        return { byRoot: {}, failedRoots: [] };
    }

    try {
        return { byRoot: await loadReachableParameterMap(ctx, roots), failedRoots: [] };
    } catch (error) {
        if (roots.length === 1 || !rejectsWholeBatch(error)) {
            return { byRoot: {}, failedRoots: roots };
        }
        const results = await Promise.allSettled(roots.map((root) => loadReachableParameterMap(ctx, [root])));
        const byRoot: Record<string, IdentifierRef[]> = {};
        const failedRoots: IdentifierRef[] = [];
        for (let i = 0; i < roots.length; i++) {
            const result = results[i];
            if (result.status === "fulfilled") {
                Object.assign(byRoot, result.value);
            } else {
                failedRoots.push(roots[i]);
            }
        }
        return { byRoot, failedRoots };
    }
}

/**
 * The dependency roots of insights: their own refs, less the ones spelled by uri - the graph is
 * walked by identifier.
 *
 * @internal
 */
export function insightRoots(insights: IInsight[]): IdentifierRef[] {
    return insights.map(insightRef).filter(isIdentifierRef);
}

/**
 * The graph endpoint answers a batch holding one root it does not know with `400`, so the other
 * roots are lost with it and only a per-root retry tells them apart. Every other failure - the
 * endpoint down, the session gone - fails a retry the same way, for every root.
 */
function rejectsWholeBatch(error: unknown): boolean {
    return isUnexpectedResponseError(error) && error.httpStatus === 400;
}

async function loadReachableParameterMap(
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

/**
 * Only insight roots arrive untyped, and the graph needs the type to start the walk. The map key
 * keeps the ref as it was supplied, so the coercion never reaches it.
 */
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
