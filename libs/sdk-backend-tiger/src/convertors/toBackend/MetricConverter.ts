// (C) 2021 GoodData Corporation

import { JsonApiMetricInAttributes } from "@gooddata/api-client-tiger";
import { IMeasureMetadataObjectDefinition } from "@gooddata/sdk-backend-spi";

export function convertMetricToBackend(measure: IMeasureMetadataObjectDefinition): JsonApiMetricInAttributes {
    return {
        title: measure.title,
        description: measure.description,
        content: {
            format: measure.format,
            maql: measure.expression,
        },
    };
}
