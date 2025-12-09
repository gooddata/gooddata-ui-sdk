// (C) 2025 GoodData Corporation

import type { IExecutionContext, IPreparedExecution } from "@gooddata/sdk-backend-spi";

import type { IGeoLayer } from "../../types/layers/index.js";
import { isRecord } from "../../utils/guards.js";

/**
 * Creates execution context from a geo layer.
 *
 * @remarks
 * The layer is stored directly as the execution context so that downstream
 * consumers can access layer properties (id, type, etc.) directly from
 * `execution.context`.
 *
 * @param layer - The geo layer to create context from
 * @returns Execution context containing the layer properties
 *
 * @internal
 */
export function createExecutionContextFromLayer(layer: IGeoLayer): IExecutionContext {
    return layer;
}

/**
 * Type guard to ensure execution contains geo layer context.
 *
 * @remarks
 * Executions created by `buildLayerExecution` have layer metadata embedded
 * in their context. This guard verifies that the context contains the
 * expected layer properties.
 *
 * @param execution - The prepared execution to check
 * @returns `true` if the execution has valid geo layer context
 *
 * @internal
 */
export function hasGeoLayerContext(
    execution: IPreparedExecution,
): execution is IPreparedExecution & { context: IGeoLayer } {
    const context = execution.context;
    if (!isRecord(context)) {
        return false;
    }

    return typeof context["id"] === "string" && (context["type"] === "pushpin" || context["type"] === "area");
}
