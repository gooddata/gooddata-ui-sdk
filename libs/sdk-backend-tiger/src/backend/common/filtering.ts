// (C) 2025-2026 GoodData Corporation

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
export function buildFilterQuery(filter: IFilterBaseOptions, searchFields?: string[]) {
    return joinClauses([
        buildSearchClause(filter.search, searchFields),
        buildListClause("id", "in", filter.id),
        buildListClause("id", "out", filter.excludeId),
        buildContainsIcClause("title", filter.title),
        buildSingleOrListInClause("createdBy.id", filter.createdBy),
        buildListClause("createdBy.id", "out", filter.excludeCreatedBy),
        buildListClause("tags", "in", filter.tags),
        buildListClause("tags", "out", filter.excludeTags),
        buildIsHiddenClause(filter.isHidden),
        buildCertificationClause(filter.certification),
    ]);
}

/**
 * Builds the search clause applied across multiple fields
 */
function buildSearchClause(
    search?: string,
    fields: string[] = ["id", "title", "description", "tags"],
): string | undefined {
    // An empty field allowlist would yield an invalid empty `()` clause, so treat it as no search.
    if (!search || fields.length === 0) {
        return undefined;
    }
    const value = formatValue(search);
    // Parentheses ensure the search filter is evaluated as a single condition.
    // The OR `,` operator is used to match any of the properties.
    const clauses = fields.map((field) => (field === "id" ? `id==${value}` : `${field}=containsic=${value}`));
    return `(${clauses.join(",")})`;
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
 * Builds either an equality clause (single value) or IN clause (multiple values).
 * @internal
 */
export function buildSingleOrListInClause(field: string, values?: string[]): string | undefined {
    if (!hasValues(values)) {
        return undefined;
    }
    if (values.length === 1) {
        return buildIsClause(field, values[0]);
    }
    return buildListClause(field, "in", values);
}

/**
 * Builds an equality clause if value is provided.
 * @internal
 */
export function buildIsClause(field: string, value?: string): string | undefined {
    if (!value) {
        return undefined;
    }
    return `${field}==${formatValue(value)}`;
}

/**
 * Builds an "is null" clause if the value is provided.
 * @internal
 */
export function buildIsNullClause(field: string, value?: boolean): string | undefined {
    if (value === undefined) {
        return undefined;
    }
    return `${field}=isnull=${value}`;
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
 * Builds the enabled/disabled state clause for `isDisabled`.
 *
 * "Enabled" (`isDisabled === false`) matches items where `isDisabled` is false OR null,
 * because a missing/null value is treated as enabled (consistent with how the UI renders
 * the state). "Disabled" (`true`) matches only explicit `isDisabled == true`.
 *
 * @internal
 */
export function buildIsDisabledClause(isDisabled?: boolean): string | undefined {
    if (isDisabled === undefined) {
        return undefined;
    }
    if (isDisabled) {
        return "isDisabled==true";
    }
    // Parentheses keep the OR clause a single condition.
    return "(isDisabled==false,isDisabled=isnull=true)";
}

/**
 * Builds the certification clause.
 */
function buildCertificationClause(certification?: boolean): string | undefined {
    if (certification === true) {
        return "certification==CERTIFIED";
    }
    if (certification === false) {
        return "certification=isnull=true";
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
