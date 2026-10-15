// (C) 2026 GoodData Corporation

/**
 * A variable every document resolves, referenced from text as `{name}`.
 *
 * @alpha
 */
export type PublisherTextVariableV2 =
    | "documentName"
    | "documentDescription"
    | "documentDateRange"
    | "documentAttributeFilters"
    | "periodStart"
    | "periodEnd"
    | "lastModifiedAt"
    | "lastModifiedBy"
    | "exportedAt"
    | "exportedBy"
    | "workspaceName"
    | "workspaceId"
    | "currentPageNumber"
    | "totalPages";

/**
 * All document text variable names.
 *
 * @alpha
 */
export const PublisherTextVariablesV2: readonly PublisherTextVariableV2[] = [
    "documentName",
    "documentDescription",
    "documentDateRange",
    "documentAttributeFilters",
    "periodStart",
    "periodEnd",
    "lastModifiedAt",
    "lastModifiedBy",
    "exportedAt",
    "exportedBy",
    "workspaceName",
    "workspaceId",
    "currentPageNumber",
    "totalPages",
];

const placeholderRegex = /\{([a-zA-Z][a-zA-Z0-9_]*)\}/g;

/**
 * The marker referencing the variable from document text.
 *
 * @alpha
 */
export function publisherTextPlaceholderV2(name: PublisherTextVariableV2): string {
    return `{${name}}`;
}

/**
 * Collects the distinct `{variable}` names referenced in the text, in order of first occurrence.
 *
 * @alpha
 */
export function getPublisherTextPlaceholdersV2(text: string): string[] {
    const names: string[] = [];
    for (const match of text.matchAll(placeholderRegex)) {
        const name = match[1]!;
        if (!names.includes(name)) {
            names.push(name);
        }
    }
    return names;
}

/**
 * Replaces `{variable}` markers with values. A marker with no value stays as typed.
 *
 * @alpha
 */
export function resolvePublisherTextPlaceholdersV2(
    text: string,
    values: Partial<Record<PublisherTextVariableV2, string>>,
): string {
    return text.replace(placeholderRegex, (marker, name: string) => {
        const value = Object.prototype.hasOwnProperty.call(values, name)
            ? values[name as PublisherTextVariableV2]
            : undefined;
        return value === undefined ? marker : value;
    });
}
