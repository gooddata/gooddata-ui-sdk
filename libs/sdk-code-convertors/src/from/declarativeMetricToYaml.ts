// (C) 2023-2026 GoodData Corporation

import { Document } from "yaml";

import { type DeclarativeMetric } from "@gooddata/api-client-tiger";
import type { Metric } from "@gooddata/sdk-code-schemas/v1";

import { METRIC_COMMENT } from "../utils/texts.js";
import { entryWithSpace, fillOptionalMetaFields } from "../utils/yamlUtils.js";

/** @public */
export function declarativeMetricToYaml(metric: DeclarativeMetric): {
    content: string;
    json: Metric;
} {
    // Create new doc and add mandatory fields right away
    const doc = new Document({
        type: "metric",
        id: metric.id,
    });

    // Add intro comment to the document
    doc.commentBefore = METRIC_COMMENT;

    // Add optional meta fields
    fillOptionalMetaFields(doc, metric);

    // Add MAQL field
    doc.add(entryWithSpace("maql", (metric.content as any).maql ?? ""));

    // Add MAQL formatting
    const format = (metric.content as any).format;
    if (format) {
        doc.add(doc.createPair("format", format));
    }

    // Add visibility flag only when hidden
    if (metric.isHidden === true) {
        doc.add(doc.createPair("show_in_ai_results", false));
    }

    return {
        content: doc.toString({
            lineWidth: 0,
        }),
        json: doc.toJSON() as Metric,
    };
}
