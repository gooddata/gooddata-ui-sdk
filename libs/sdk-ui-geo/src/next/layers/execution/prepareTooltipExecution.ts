// (C) 2025-2026 GoodData Corporation

import { type IPreparedExecution } from "@gooddata/sdk-backend-spi";
import {
    type IAttribute,
    type IAttributeDisplayFormMetadataObject,
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

function isGeoDisplayForm(displayForm: IAttributeDisplayFormMetadataObject): boolean {
    const displayFormType = displayForm.displayFormType;
    return typeof displayFormType === "string" && displayFormType.startsWith("GDC.geo.");
}

function pickPreferredDisplayForm(
    displayForms: IAttributeDisplayFormMetadataObject[],
): IAttributeDisplayFormMetadataObject | undefined {
    return (
        displayForms.find((displayForm) => displayForm.isDefault) ??
        displayForms.find((displayForm) => displayForm.isPrimary) ??
        displayForms[0]
    );
}

async function resolveDefaultDisplayFormRef(
    context: IGeoAdapterContext,
    ref: ObjRef | undefined,
): Promise<ObjRef | undefined> {
    if (!ref) {
        return undefined;
    }

    try {
        const attribute = await context.backend
            .workspace(context.workspace)
            .attributes()
            .getAttributeByDisplayForm(ref);
        const displayForms = attribute.displayForms ?? [];
        if (!displayForms.length) {
            return undefined;
        }

        const nonGeoDisplayForms = displayForms.filter((displayForm) => !isGeoDisplayForm(displayForm));
        const preferred = pickPreferredDisplayForm(
            nonGeoDisplayForms.length ? nonGeoDisplayForms : displayForms,
        );

        return preferred?.ref;
    } catch {
        return undefined;
    }
}

export async function prepareExecutionWithTooltipText(
    context: IGeoAdapterContext,
    execution: IPreparedExecution,
    attribute: IAttribute | undefined,
): Promise<IPreparedExecution> {
    /*
     * Keep tooltip handling in one place for both area and pushpin adapters.
     *
     * Branch 1: TOOLTIP_TEXT bucket already exists:
     * - Keep bucket as-is when localId is already TOOLTIP_TEXT_ATTRIBUTE_LOCAL_ID.
     * - Otherwise rewrite only tooltip localId to TOOLTIP_TEXT_ATTRIBUTE_LOCAL_ID.
     *
     * Branch 2: TOOLTIP_TEXT bucket is missing:
     * - Resolve preferred display form and add tooltip bucket with TOOLTIP_TEXT_ATTRIBUTE_LOCAL_ID.
     */
    const executionWithFixedTooltip = fixExistingTooltipBucketLocalId(context, execution);
    if (executionWithFixedTooltip) {
        return executionWithFixedTooltip;
    }

    if (!attribute) {
        return execution;
    }

    const displayFormRef = attributeDisplayFormRef(attribute);
    const tooltipRef = (await resolveDefaultDisplayFormRef(context, displayFormRef)) ?? displayFormRef;

    return addTooltipBucket(context, execution, tooltipRef);
}
