// (C) 2026 GoodData Corporation

import { type IPublisherValidationIssueV2, idRef, validatePublisherEntityV2 } from "@gooddata/sdk-model";

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function onId(issue: IPublisherValidationIssueV2): IPublisherValidationIssueV2 {
    return issue.path === "ref" || issue.path.startsWith("ref.")
        ? { ...issue, path: `id${issue.path.slice("ref".length)}` }
        : issue;
}

/**
 * Validates a stored v2 document, document template or page template, named by the bare `id` the
 * declarative API stores. It runs the sdk-model validator, and an issue on the reference is reported
 * on `id`.
 *
 * @alpha
 */
export function validateDeclarativePublisherEntityV2(entity: unknown): IPublisherValidationIssueV2[] {
    if (!isRecord(entity)) {
        return validatePublisherEntityV2(entity);
    }
    const { id, ref, ...rest } = entity;
    const isNamed = typeof id === "string" && id !== "";
    const keyIssues: IPublisherValidationIssueV2[] = [
        ...(ref === undefined ? [] : [{ path: "ref", message: 'Unknown key "ref".' }]),
        ...(id === undefined
            ? [{ path: "id", message: 'Missing required key "id".' }]
            : isNamed
              ? []
              : [{ path: "id", message: `Expected a non-empty string, got ${JSON.stringify(id)}.` }]),
    ];
    const named = isNamed ? { ...rest, ref: idRef(id) } : rest;
    return [...keyIssues, ...validatePublisherEntityV2(named).map(onId)];
}
