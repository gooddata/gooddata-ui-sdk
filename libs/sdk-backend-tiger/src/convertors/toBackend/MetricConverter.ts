// (C) 2021-2025 GoodData Corporation

import { JsonApiMetricOutAttributes } from "@gooddata/api-client-tiger";
import { IMeasureMetadataObjectDefinition } from "@gooddata/sdk-model";

export function convertMetricToBackend(
    measure: IMeasureMetadataObjectDefinition,
): JsonApiMetricOutAttributes {
    return {
        title: measure.title,
        description: measure.description,
        content: {
            format: measure.format,
            maql: measure.expression,
            ...(typeof measure.metricType === "undefined" ? {} : { metricType: measure.metricType }),
        },
        tags: measure.tags,
    };
}
