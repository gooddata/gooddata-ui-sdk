// (C) 2026 GoodData Corporation

/**
 * ISO 8601 calendar date (YYYY-MM-DD).
 *
 * @alpha
 */
export type ReportDateString = string;

/**
 * Variables resolved by the rendering runtime; they are never declared or stored.
 *
 * @remarks
 * Referenced from report text as `{name}`. Custom variable names must not collide with these;
 * on collision the built-in wins.
 *
 * @alpha
 */
export type ReportBuiltInVariable =
    | "reportName"
    | "reportDescription"
    | "periodStart"
    | "periodEnd"
    | "reportDateRange"
    | "reportAttributeFilters"
    | "exportedAt"
    | "exportedBy"
    | "lastModifiedAt"
    | "lastModifiedBy"
    | "workspaceName"
    | "workspaceId"
    | "totalPages"
    | "currentPageNumber"
    | "logo"
    | "logoInverse";

/**
 * All built-in report variable names.
 *
 * @alpha
 */
export const ReportBuiltInVariables: ReportBuiltInVariable[] = [
    "reportName",
    "reportDescription",
    "periodStart",
    "periodEnd",
    "reportDateRange",
    "reportAttributeFilters",
    "exportedAt",
    "exportedBy",
    "lastModifiedAt",
    "lastModifiedBy",
    "workspaceName",
    "workspaceId",
    "totalPages",
    "currentPageNumber",
    "logo",
    "logoInverse",
];

/**
 * A custom variable declared by report content and given a value by a report.
 *
 * @remarks
 * Referenced from text as `{name}`. Values come from {@link IReportBase.variableValues},
 * falling back to {@link IReportVariableDefinition.defaultValue}.
 *
 * @alpha
 */
export interface IReportVariableDefinition {
    /**
     * Variable name as used inside the `{...}` marker. Must match /^[a-zA-Z][a-zA-Z0-9_]*$/.
     * Built-in names ({@link ReportBuiltInVariable}) are reserved.
     */
    name: string;

    /**
     * Human readable label shown in the editor.
     */
    title?: string;

    description?: string;

    /**
     * Value used when the report does not provide one. May not contain further
     * placeholders — there is no recursive expansion.
     */
    defaultValue?: string;
}

const placeholderRegex = /\{([a-zA-Z][a-zA-Z0-9_]*)\}/g;

/**
 * The marker referencing the named variable from report text.
 *
 * @alpha
 */
export function reportTextPlaceholder(name: string): string {
    return `{${name}}`;
}

/**
 * Collects the distinct `{variable}` names referenced in the text, in order of first occurrence.
 *
 * @alpha
 */
export function getReportTextPlaceholders(text: string): string[] {
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
 * Replaces `{variable}` markers with values. Markers with no value are left as-is.
 * Values are inserted verbatim — there is no recursive expansion.
 *
 * @remarks
 * A marker resolves wherever it appears, braces around it included, so there is no escape for a
 * literal `{name}` in report text.
 *
 * @alpha
 */
export function resolveReportTextPlaceholders(text: string, values: Record<string, string>): string {
    return text.replace(placeholderRegex, (marker, name: string) =>
        Object.prototype.hasOwnProperty.call(values, name) ? values[name]! : marker,
    );
}
