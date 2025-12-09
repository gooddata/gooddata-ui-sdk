// (C) 2025 GoodData Corporation

import type { IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { assertNever } from "@gooddata/sdk-model";
import { UnexpectedSdkError } from "@gooddata/sdk-ui";

import { createExecutionContextFromLayer } from "./layerContext.js";
import type { IGeoLayer } from "../../types/layers/index.js";
import { getLayerAdapter } from "../registry/adapterRegistry.js";
import type { IGeoAdapterContext } from "../registry/adapterTypes.js";

/**
 * Builds execution for the provided geo layer using the registered adapter.
 *
 * @remarks
 * Each execution is tagged with the originating layer so that downstream consumers
 * (e.g., {@link GeoChartNextInternal}) can reconstruct layer/execution pairs from the
 * standard `execution` + `executions` props.
 *
 * @internal
 */
export function buildLayerExecution(layer: IGeoLayer, context: IGeoAdapterContext): IPreparedExecution {
    switch (layer.type) {
        case "pushpin":
        case "area": {
            const adapter = getLayerAdapter(layer.type);
            return adapter.buildExecution(layer, context).withContext(createExecutionContextFromLayer(layer));
        }
        default:
            assertNever(layer);
            throw new UnexpectedSdkError("Unsupported geo layer type.");
    }
}
