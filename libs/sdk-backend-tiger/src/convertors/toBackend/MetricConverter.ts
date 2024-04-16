// (C) 2021-2024 GoodData Corporation

import { JsonApiMetricOutAttributes } from "@gooddata/api-client-tiger";
import { IMeasureMetadataObjectDefinition } from "@gooddata/sdk-model";

export function convertMetricToBackend(
    measure: IMeasureMetadataObjectDefinition,
): JsonApiMetricOutAttributes {
    const convertedMeasure: JsonApiMetricOutAttributes = {
        title: measure.title,
        description: measure.description,
        content: {
            format: measure.format,
            maql: measure.expression,
        },
        tags: measure.tags,
    };

    if (measure.tags) {
        convertedMeasure.tags = measure.tags;
    }

    return convertedMeasure;
}
