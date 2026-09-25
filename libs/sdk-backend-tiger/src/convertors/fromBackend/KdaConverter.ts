// (C) 2025-2026 GoodData Corporation

import { type AfmMetricValueChange } from "@gooddata/api-client-tiger";
import { type IKeyDriver } from "@gooddata/sdk-backend-spi";
import { type ObjRef, idRef } from "@gooddata/sdk-model";

export function convertChangeAnalyzeToKeyDriver(value: AfmMetricValueChange): IKeyDriver {
    return {
        value: value.attributeValue,
        metricValue: {
            from: value.metricValueInReferencePeriod,
            to: value.metricValueInAnalyzedPeriod,
            delta: value.metricValueDelta,
        },
        displayForm: convertKeyDriverDisplayForm(value),
        std: value.attributeValuesChangeStd,
        mean: value.attributeValuesChangeMean,
        isSignificantChange: value.isSignificantChange,
    };
}

/**
 * Builds the driver's display form ref from `attributeRef`, which carries the object type. A computed attribute
 * is referenced the same way the catalog references its fabricated display form, typed `computedAttribute`.
 *
 * A backend that predates `attributeRef` sends only the bare id in `attributeName`. That ref is left untyped, so
 * ref comparisons fall back to identifier equality and a consumer cannot tell a label from a computed attribute
 * with the same id.
 */
function convertKeyDriverDisplayForm(value: AfmMetricValueChange): ObjRef {
    const identifier = value.attributeRef?.identifier;
    if (!identifier) {
        return { identifier: value.attributeName };
    }
    return idRef(
        identifier.id,
        identifier.type === "computedAttribute" ? "computedAttribute" : "displayForm",
    );
}
