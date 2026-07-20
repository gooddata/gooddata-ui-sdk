// (C) 2026 GoodData Corporation

import type { IMeasureMetadataObjectDefinition } from "@gooddata/sdk-model";

import { deriveCopyIdentity } from "../asCode/copy.js";

export function createCopiedMetric(
    metric: IMeasureMetadataObjectDefinition,
): IMeasureMetadataObjectDefinition {
    // Whitelist only definition-owned fields; the source may be a loaded measure carrying
    // server-managed fields (uri, ref, timestamps, ...) that must not leak into the definition.
    // metricType, isHidden, and isHiddenFromKda are author-owned semantics, so they carry over.
    return {
        type: "measure",
        ...deriveCopyIdentity(metric),
        description: metric.description,
        tags: metric.tags,
        expression: metric.expression,
        format: metric.format,
        ...(metric.metricType === undefined ? {} : { metricType: metric.metricType }),
        ...(metric.isHidden === undefined ? {} : { isHidden: metric.isHidden }),
        ...(metric.isHiddenFromKda === undefined ? {} : { isHiddenFromKda: metric.isHiddenFromKda }),
    };
}
