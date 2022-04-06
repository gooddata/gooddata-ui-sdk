// (C) 2021-2022 GoodData Corporation

import { GdcMetadata } from "@gooddata/api-model-bear";
import { newMeasureMetadataObject } from "@gooddata/sdk-backend-base";
import { uriRef, IMeasureMetadataObject } from "@gooddata/sdk-model";
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
            .format(content.format || "#,#.##")
            .deprecated(meta.deprecated === "1")
            .isLocked(Boolean(meta.locked))
            .production(Boolean(meta.isProduction))
            .unlisted(Boolean(meta.unlisted)),
    );
}

export function convertListedMetric(metricLink: GdcMetadata.IObjectLink): IMeasureMetadataObject {
    const ref = uriRef(metricLink.link);

    return newMeasureMetadataObject(ref, (m) =>
        m
            .id(metricLink.identifier!)
            .uri(metricLink.link as string)
            .title(metricLink.title || "")
            .description(metricLink.summary || ""),
    );
}
