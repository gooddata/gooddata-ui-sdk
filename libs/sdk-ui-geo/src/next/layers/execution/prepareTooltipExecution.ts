// (C) 2025-2026 GoodData Corporation

import { type IPreparedExecution } from "@gooddata/sdk-backend-spi";
import {
    type IExecutionDefinition,
    type ObjRef,
    attributeAlias,
    attributeDisplayFormRef,
    attributeLocalId,
    bucketAttribute,
    bucketsAttributes,
    bucketsMeasures,
    newAttribute,
    newBucket,
} from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";

import { TOOLTIP_TEXT_ATTRIBUTE_LOCAL_ID } from "../common/constants.js";
import { getGeoChartDimensions } from "../common/dimensions.js";
import { type IGeoAdapterContext } from "../registry/adapterTypes.js";

function getTooltipBucketIndex(execution: IPreparedExecution): number {
    return execution.definition.buckets.findIndex(
        (bucket) => bucket.localIdentifier === BucketNames.TOOLTIP_TEXT,
    );
}

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

function fixExistingTooltipBucketLocalId(
    context: IGeoAdapterContext,
    execution: IPreparedExecution,
): IPreparedExecution | undefined {
    const tooltipBucketIndex = getTooltipBucketIndex(execution);
    if (tooltipBucketIndex < 0) {
        return undefined;
    }

    const tooltipBucket = execution.definition.buckets[tooltipBucketIndex];
    const tooltipAttribute = bucketAttribute(tooltipBucket);
    if (!tooltipAttribute || attributeLocalId(tooltipAttribute) === TOOLTIP_TEXT_ATTRIBUTE_LOCAL_ID) {
        return execution;
    }

    const fixedTooltipAttribute = newAttribute(attributeDisplayFormRef(tooltipAttribute), (builder) =>
        builder.localId(TOOLTIP_TEXT_ATTRIBUTE_LOCAL_ID).alias(attributeAlias(tooltipAttribute)),
    );
    const buckets = execution.definition.buckets.map((bucket, index) =>
        index === tooltipBucketIndex ? newBucket(BucketNames.TOOLTIP_TEXT, fixedTooltipAttribute) : bucket,
    );
    return rebuildExecutionWithBuckets(context, execution, buckets);
}

function addTooltipBucket(
    context: IGeoAdapterContext,
    execution: IPreparedExecution,
    tooltipRef: ObjRef,
): IPreparedExecution {
    const tooltipText = newAttribute(tooltipRef, (builder) =>
        builder.localId(TOOLTIP_TEXT_ATTRIBUTE_LOCAL_ID),
    );
    const buckets = [...execution.definition.buckets, newBucket(BucketNames.TOOLTIP_TEXT, tooltipText)];
    return rebuildExecutionWithBuckets(context, execution, buckets);
}

/**
 * Ensures the execution includes a TOOLTIP_TEXT bucket.
 *
 * @param context - Adapter context
 * @param execution - Prepared execution to augment
 * @param tooltipRef - Resolved tooltip display form ref (from {@link resolveAttributeDisplayForms}).
 *   Callers should fall back to the location attribute's own display form when the
 *   resolver returns undefined.
 */
export function prepareExecutionWithTooltipText(
    context: IGeoAdapterContext,
    execution: IPreparedExecution,
    tooltipRef: ObjRef | undefined,
): IPreparedExecution {
    /*
     * Branch 1: TOOLTIP_TEXT bucket already exists — fix localId if needed.
     * Branch 2: TOOLTIP_TEXT bucket is missing — add one using the resolved ref.
     */
    const executionWithFixedTooltip = fixExistingTooltipBucketLocalId(context, execution);
    if (executionWithFixedTooltip) {
        return executionWithFixedTooltip;
    }

    if (!tooltipRef) {
        return execution;
    }

    return addTooltipBucket(context, execution, tooltipRef);
}
