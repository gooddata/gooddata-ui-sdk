// (C) 2021-2026 GoodData Corporation

import { type JsonApiMetricPostOptionalIdAttributes } from "@gooddata/api-client-tiger";
import { type IMeasureMetadataObjectDefinition } from "@gooddata/sdk-model";

export function convertMetricToBackend(
    measure: IMeasureMetadataObjectDefinition,
): JsonApiMetricPostOptionalIdAttributes {
    return {
        title: measure.title,
        description: measure.description,
        content: {
            format: measure.format,
            maql: measure.expression,
            ...(typeof measure.metricType === "undefined" ? {} : { metricType: measure.metricType }),
        },
        tags: measure.tags,
        isHidden: measure.isHidden,
        isHiddenFromKda: measure.isHiddenFromKda,
    };
}
