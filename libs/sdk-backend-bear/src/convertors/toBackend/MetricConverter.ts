// (C) 2021 GoodData Corporation

import { GdcMetadata } from "@gooddata/api-model-bear";
import {
    IMeasureMetadataObject,
    IMeasureMetadataObjectDefinition,
    isMeasureMetadataObject,
} from "@gooddata/sdk-backend-spi";
import IMetric = GdcMetadata.IMetric;

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
        },
        content: {
            expression: measure.expression,
            format: measure.format,
        },
    };
}
