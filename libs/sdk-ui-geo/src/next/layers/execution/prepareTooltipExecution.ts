// (C) 2025-2026 GoodData Corporation

import { type IPreparedExecution } from "@gooddata/sdk-backend-spi";
import {
    type IAttribute,
    type IAttributeDisplayFormMetadataObject,
    type IExecutionDefinition,
    type ObjRef,
    attributeDisplayFormRef,
    bucketsAttributes,
    bucketsMeasures,
    newAttribute,
    newBucket,
} from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";

import { TOOLTIP_TEXT_ATTRIBUTE_LOCAL_ID } from "../common/constants.js";
import { getGeoChartDimensions } from "../common/dimensions.js";
import { type IGeoAdapterContext } from "../registry/adapterTypes.js";

function hasTooltipTextBucket(execution: IPreparedExecution): boolean {
    return execution.definition.buckets.some((bucket) => bucket.localIdentifier === BucketNames.TOOLTIP_TEXT);
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
    if (!attribute || hasTooltipTextBucket(execution)) {
        return execution;
    }

    const displayFormRef = attributeDisplayFormRef(attribute);
    const tooltipRef = await resolveDefaultDisplayFormRef(context, displayFormRef);
    if (!tooltipRef) {
        return execution;
    }

    const tooltipText = newAttribute(tooltipRef, (builder) =>
        builder.localId(TOOLTIP_TEXT_ATTRIBUTE_LOCAL_ID),
    );
    const buckets = [...execution.definition.buckets, newBucket(BucketNames.TOOLTIP_TEXT, tooltipText)];
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
