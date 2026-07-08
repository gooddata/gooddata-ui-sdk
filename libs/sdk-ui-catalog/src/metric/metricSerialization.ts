// (C) 2026 GoodData Corporation

import { Document, Pair, Scalar } from "yaml";

import type { MetricYaml } from "./metricConverter.js";

/**
 * Serializes a canonical AAC metric object to YAML.
 *
 * A blank line is placed before `title` and `maql` to visually group identity, metadata,
 * and definition, matching the analytics-as-code tooling layout. The `id` line is omitted when
 * the metric has none so the server derives one on create.
 */
export function serializeMetricToYaml(metric: MetricYaml): string {
    const doc = new Document(
        metric.id === undefined ? { type: "metric" } : { type: "metric", id: metric.id },
    );

    doc.add(spacedPair("title", metric.title ?? ""));
    if (metric.description) {
        doc.add(doc.createPair("description", metric.description));
    }
    if (metric.tags && metric.tags.length > 0) {
        doc.add(doc.createPair("tags", metric.tags));
    }

    doc.add(spacedPair("maql", metric.maql ?? ""));
    if (metric.format) {
        doc.add(doc.createPair("format", metric.format));
    }
    if (metric.show_in_ai_results === false) {
        doc.add(doc.createPair("show_in_ai_results", false));
    }

    return doc.toString({ lineWidth: 0 }).trimEnd();
}

/** Builds a map entry preceded by a blank line. */
function spacedPair(key: string, value: unknown): Pair {
    const keyScalar = new Scalar(key);
    keyScalar.spaceBefore = true;
    return new Pair(keyScalar, value);
}
