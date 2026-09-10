// (C) 2025-2026 GoodData Corporation

import { type AfmMetricValueChange } from "@gooddata/api-client-tiger";
import { type IKeyDriver } from "@gooddata/sdk-backend-spi";

export function convertChangeAnalyzeToKeyDriver(value: AfmMetricValueChange): IKeyDriver {
    return {
        value: value.attributeValue,
        metricValue: {
            from: value.metricValueInReferencePeriod,
            to: value.metricValueInAnalyzedPeriod,
            delta: value.metricValueDelta,
        },
        // The response identifies the driver only by id: it may be a label or a computed
        // attribute's fabricated display form, and there is no discriminator to resolve which. The
        // ref is therefore left untyped, making ref comparisons fall back to identifier equality.
        // Known limitation: if a label and a computed attribute share the same id, the consumer
        // cannot tell them apart; fixing that needs a type discriminator in the changeAnalysis
        // response.
        displayForm: {
            identifier: value.attributeName,
        },
        std: value.attributeValuesChangeStd,
        mean: value.attributeValuesChangeMean,
        isSignificantChange: value.isSignificantChange,
    };
}
