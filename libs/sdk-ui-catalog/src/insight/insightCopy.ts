// (C) 2026 GoodData Corporation

import type { IInsightDefinition } from "@gooddata/sdk-model";

import { deriveCopyIdentity } from "../asCode/copy.js";

/** Duplicate: bump the title, copy only author-owned fields — the source's identity/audit fields must not reach create. */
export function createCopiedInsight(source: IInsightDefinition): IInsightDefinition {
    const { insight } = source;
    const { title } = deriveCopyIdentity({ title: insight.title });
    return {
        insight: {
            title: title ?? insight.title,
            visualizationUrl: insight.visualizationUrl,
            buckets: insight.buckets,
            filters: insight.filters,
            sorts: insight.sorts,
            properties: insight.properties,
            ...(insight.tags === undefined ? {} : { tags: insight.tags }),
            ...(insight.summary === undefined ? {} : { summary: insight.summary }),
            ...(insight.attributeFilterConfigs === undefined
                ? {}
                : { attributeFilterConfigs: insight.attributeFilterConfigs }),
            ...(insight.parameters === undefined ? {} : { parameters: insight.parameters }),
            ...(insight.layers === undefined ? {} : { layers: insight.layers }),
            ...(insight.isHidden === undefined ? {} : { isHidden: insight.isHidden }),
        },
    };
}
