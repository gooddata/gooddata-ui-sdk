// (C) 2021-2022 GoodData Corporation

import { JsonApiMetricInAttributes } from "@gooddata/api-client-tiger";
import { IMeasureMetadataObjectDefinition } from "@gooddata/sdk-model";

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
