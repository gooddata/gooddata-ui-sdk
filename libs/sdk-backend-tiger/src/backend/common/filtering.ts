// (C) 2025 GoodData Corporation

import type { IFilterBaseOptions } from "@gooddata/sdk-backend-spi";

/**
 * Builds an RSQL filter query string from base options.
 *
 * @see https://www.gooddata.com/docs/cloud/api-and-sdk/api/conventions/
 *
 * containsic === contains + ignore case
 *
 * @internal
 */
export function buildFilterQuery(filter: IFilterBaseOptions) {
    return joinClauses([
        buildSearchClause(filter.search),
        buildListClause("id", "in", filter.id),
        buildListClause("id", "out", filter.excludeId),
        buildContainsIcClause("title", filter.title),
        buildListClause("createdBy.id", "in", filter.createdBy),
        buildListClause("createdBy.id", "out", filter.excludeCreatedBy),
        buildListClause("tags", "in", filter.tags),
        buildListClause("tags", "out", filter.excludeTags),
        buildIsHiddenClause(filter.isHidden),
    ]);
}

/**
 * Builds the search clause applied across multiple fields
 */
function buildSearchClause(search?: string): string | undefined {
    if (!search) {
        return undefined;
    }
    const value = formatValue(search);
    // Parentheses ensure the search filter is evaluated as a single condition.
    // The OR `,` operator is used to match any of the properties.
    return `(id==${value},title=containsic=${value},description=containsic=${value},tags=containsic=${value})`;
}

/**
 * Builds a single clause for a list-based operator (in/out) if values are provided.
 * @internal
 */
export function buildListClause(
    field: string,
    operator: "in" | "out",
    values?: string[],
): string | undefined {
    if (!hasValues(values)) {
        return undefined;
    }
    return `${field}=${operator}=(${formatInValues(values)})`;
}

/**
 * Builds a case-insensitive contains clause for a single string value.
 * @internal
 */
export function buildContainsIcClause(field: string, value?: string): string | undefined {
    if (!value) {
        return undefined;
    }
    return `${field}=containsic=${formatValue(value)}`;
}

/**
 * Builds the visibility clause for `isHidden`.
 */
function buildIsHiddenClause(isHidden?: boolean): string | undefined {
    if (isHidden === true) {
        return "isHidden==true";
    }
    if (isHidden === false) {
        // Parentheses ensure the search filter is evaluated as a single condition.
        return "(isHidden==false,isHidden=isnull=true)";
    }
    return undefined;
}

/**
 * Joins multiple filter clauses with semicolon separator.
 * @internal
 */
export function joinClauses(clauses: Array<string | undefined>): string | undefined {
    const present = clauses.filter(Boolean);
    return present.length > 0 ? present.join(";") : undefined;
}

function hasValues(values?: string[]): values is string[] {
    return Array.isArray(values) && values.length > 0;
}

/**
 * Formats values for RSQL "in" operator.
 *
 * Wrapping each value in double quotes allows values with spaces.
 * Joining by comma acts as an OR operator.
 *
 * @internal
 */
export function formatInValues(values: string[]): string {
    return values.map(formatValue).join(",");
}

/**
 * Formats value for RSQL.
 * @internal
 */
export function formatValue(value: string): string {
    return `"${escapeValue(value)}"`;
}

/**
 * Escapes characters (backslashes and double quotes) that would break quoted filter values.
 * @internal
 */
export function escapeValue(value: string): string {
    return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
