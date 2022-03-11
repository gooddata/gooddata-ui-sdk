// (C) 2021-2022 GoodData Corporation

import { JsonApiMetricOutAttributes } from "@gooddata/api-client-tiger";
import { IMeasureMetadataObjectDefinition } from "@gooddata/sdk-backend-spi";

export function convertMetricToBackend(
    measure: IMeasureMetadataObjectDefinition,
): JsonApiMetricOutAttributes {
    return {
        title: measure.title,
        description: measure.description,
        content: {
            format: measure.format,
            maql: measure.expression,
        },
    };
}
