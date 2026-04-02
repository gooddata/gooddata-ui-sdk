// (C) 2026 GoodData Corporation

import { type IPreparedExecution } from "@gooddata/sdk-backend-spi";
import {
    type IExecutionDefinition,
    type ObjRef,
    bucketsAttributes,
    bucketsMeasures,
    newAttribute,
    newBucket,
} from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";

import { GEO_ICON_ATTRIBUTE_LOCAL_ID } from "../common/constants.js";
import { getGeoChartDimensions } from "../common/dimensions.js";
import { type IGeoAdapterContext } from "../registry/adapterTypes.js";

function rebuildExecutionWithBuckets(
    context: IGeoAdapterContext,
    execution: IPreparedExecution,
    buckets: IExecutionDefinition["buckets"],
): IPreparedExecution {
    const definition: IExecutionDefinition = {
        ...execution.definition,
        buckets,
        attributes: bucketsAttributes(buckets),
        measures: bucketsMeasures(buckets),
    };
    const updatedDefinition: IExecutionDefinition = {
        ...definition,
        dimensions: getGeoChartDimensions(definition),
    };
    const factory = context.backend.workspace(context.workspace).execution();
    return factory.forDefinition(updatedDefinition, {
        signal: execution.signal,
        context: execution.context,
    });
}

/**
 * Adds a GEO_ICON bucket to the execution if it is missing and a geoIcon
 * display form ref is provided.
 *
 * @param context - Adapter context with backend and workspace
 * @param execution - Prepared execution to augment
 * @param geoIconRef - Resolved GDC.geo.icon display form ref (from {@link resolveAttributeDisplayForms})
 * @returns Execution with the GEO_ICON bucket injected, or the original execution if not needed
 *
 * @internal
 */
export function prepareExecutionWithGeoIcon(
    context: IGeoAdapterContext,
    execution: IPreparedExecution,
    geoIconRef: ObjRef | undefined,
): IPreparedExecution {
    if (!geoIconRef) {
        return execution;
    }

    if (execution.definition.buckets.some((b) => b.localIdentifier === BucketNames.GEO_ICON)) {
        return execution;
    }

    const geoIconAttribute = newAttribute(geoIconRef, (builder) =>
        builder.localId(GEO_ICON_ATTRIBUTE_LOCAL_ID),
    );
    const buckets = [...execution.definition.buckets, newBucket(BucketNames.GEO_ICON, geoIconAttribute)];
    return rebuildExecutionWithBuckets(context, execution, buckets);
}
