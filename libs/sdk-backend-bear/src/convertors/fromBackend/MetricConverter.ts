import { GdcMetadata } from "@gooddata/api-model-bear";
import { newMeasureMetadataObject } from "@gooddata/sdk-backend-base";
import { IMeasureMetadataObject } from "@gooddata/sdk-backend-spi";
import { uriRef } from "@gooddata/sdk-model";
import IMetric = GdcMetadata.IMetric;

export function convertMetricFromBackend(metric: IMetric): IMeasureMetadataObject {
    const ref = uriRef(metric.meta.uri!);

    return newMeasureMetadataObject(ref, (m) =>
        m
            .id(metric.meta.identifier!)
            .title(metric.meta.title)
            .description(metric.meta.summary || "")
            .expression(metric.content.expression)
            .format(metric.content.format || "##,#"),
    );
}
