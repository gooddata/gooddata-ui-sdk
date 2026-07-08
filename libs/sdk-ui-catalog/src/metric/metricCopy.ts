// (C) 2026 GoodData Corporation

import { isUnexpectedResponseError } from "@gooddata/sdk-backend-spi";
import type { IMeasureMetadataObjectDefinition } from "@gooddata/sdk-model";

const canonicalUuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const trailingCopySuffixRegex = /^(.*) \((\d+)\)$/;

export function createCopiedMetric(
    metric: IMeasureMetadataObjectDefinition,
): IMeasureMetadataObjectDefinition {
    const title = getCopiedTitle(metric.title);
    const id = shouldOmitCopiedId(metric.id) ? undefined : getCopiedId(title);
    // Whitelist only definition-owned fields; the source may be a loaded measure carrying
    // server-managed fields (uri, ref, timestamps, ...) that must not leak into the definition.
    // metricType and isHiddenFromKda are author-owned semantics, so they carry over to the copy.
    return {
        type: "measure",
        ...(id === undefined ? {} : { id }),
        ...(title === undefined ? {} : { title }),
        description: metric.description,
        tags: metric.tags,
        expression: metric.expression,
        format: metric.format,
        ...(metric.metricType === undefined ? {} : { metricType: metric.metricType }),
        ...(metric.isHidden === undefined ? {} : { isHidden: metric.isHidden }),
        ...(metric.isHiddenFromKda === undefined ? {} : { isHiddenFromKda: metric.isHiddenFromKda }),
    };
}

function getCopiedTitle(title: string | undefined): string | undefined {
    if (title === undefined) {
        return undefined;
    }
    if (title === "") {
        return "";
    }
    const match = title.match(trailingCopySuffixRegex);
    if (match) {
        const [, prefix, suffix] = match;
        return `${prefix} (${Number(suffix) + 1})`;
    }
    return `${title} (2)`;
}

// A UUID id was server-generated, so the copy omits its id and lets the server generate a fresh one.
// A human-authored id (e.g. "revenue.total") is instead re-derived from the copied title to stay
// readable; a resulting collision is handled by the create 409 retry-without-id.
function shouldOmitCopiedId(id: string | undefined): boolean {
    return id === undefined || isCanonicalUuid(id);
}

function getCopiedId(title: string | undefined): string | undefined {
    if (!title) {
        return undefined;
    }
    const normalizedTitle = title
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\W/g, "_")
        .toLowerCase();
    return normalizedTitle || undefined;
}

function isCanonicalUuid(value: string): boolean {
    return canonicalUuidRegex.test(value);
}

export function isDuplicateIdError(error: unknown): boolean {
    return isUnexpectedResponseError(error) && error.httpStatus === 409;
}
