// (C) 2021-2022 GoodData Corporation

import { IMetric } from "@gooddata/api-model-bear";

import {
    IMeasureMetadataObject,
    isMeasureMetadataObject,
    IMeasureMetadataObjectDefinition,
} from "@gooddata/sdk-model";

export function convertMetricToBackend(
    measure: IMeasureMetadataObjectDefinition | IMeasureMetadataObject,
): IMetric {
    return {
        meta: {
            ...(isMeasureMetadataObject(measure) && {
                identifier: measure.id,
                uri: measure.uri,
            }),
            title: measure.title || "",
            summary: measure.description,
            locked: measure.isLocked,
        },
        content: {
            expression: measure.expression,
            format: measure.format,
        },
    };
}
