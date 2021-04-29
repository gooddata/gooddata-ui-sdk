// (C) 2021 GoodData Corporation

import { GdcMetadata } from "@gooddata/api-model-bear";
import { newMeasureMetadataObject } from "@gooddata/sdk-backend-base";
import { IMeasureMetadataObject } from "@gooddata/sdk-backend-spi";
import { uriRef } from "@gooddata/sdk-model";
import IMetric = GdcMetadata.IMetric;

export function convertMetricFromBackend(metric: IMetric): IMeasureMetadataObject {
    const ref = uriRef(metric.meta.uri!);

    const { meta, content } = metric;

    return newMeasureMetadataObject(ref, (m) =>
        m
            .id(meta.identifier!)
            .uri(meta.uri as string)
            .title(meta.title)
            .description(meta.summary || "")
            .expression(content.expression)
            .format(content.format || "##,#")
            .deprecated(meta.deprecated === "1")
            .isLocked(Boolean(meta.locked))
            .production(Boolean(meta.isProduction))
            .unlisted(Boolean(meta.unlisted)),
    );
}
