// (C) 2025 GoodData Corporation

import { AfmMetricValueChange } from "@gooddata/api-client-tiger";
import { type IKeyDriver } from "@gooddata/sdk-backend-spi";

export function convertChangeAnalyzeToKeyDriver(value: AfmMetricValueChange): IKeyDriver {
    return {
        value: value.attributeValue,
        metricValue: {
            from: value.metricValueInReferencePeriod,
            to: value.metricValueInAnalyzedPeriod,
            delta: value.metricValueDelta,
        },
        displayForm: {
            identifier: value.attributeName,
            type: "displayForm",
        },
        std: value.attributeValuesChangeStd,
        mean: value.attributeValuesChangeMean,
        isSignificantChange: value.isSignificantChange,
    };
}
