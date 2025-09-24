// (C) 2025 GoodData Corporation

import { IFilterBaseOptions } from "@gooddata/sdk-backend-spi";

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
    const filters: string[] = [];

    if (filter.search) {
        const search = formatValue(filter.search);
        // Parentheses ensure the search filter is evaluated as a single condition.
        // The OR `,` operator is used to match any of the properties.
        filters.push(
            `(id==${search},title=containsic=${search},description=containsic=${search},tags=containsic=${search})`,
        );
    }

    if (filter.id && filter.id.length > 0) {
        filters.push(`id=in=(${formatInValues(filter.id)})`);
    }
    if (filter.title) {
        filters.push(`title=containsic=${formatValue(filter.title)}`);
    }
    if (filter.createdBy && filter.createdBy.length > 0) {
        filters.push(`createdBy.id=in=(${formatInValues(filter.createdBy)})`);
    }
    if (filter.tags && filter.tags.length > 0) {
        filters.push(`tags=in=(${formatInValues(filter.tags)})`);
    }

    // Join all filters if any
    if (filters.length > 0) {
        return filters.join(";");
    }
    return undefined;
}

/**
 * Formats values for RSQL "in" operator.
 *
 * Wrapping each value in double quotes allows values with spaces.
 * Joining by comma acts as an OR operator.
 */
function formatInValues(values: string[]): string {
    return values.map(formatValue).join(",");
}

/**
 * Formats value for RSQL.
 */
function formatValue(value: string): string {
    return `"${escapeValue(value)}"`;
}

/**
 * Escapes characters (backslashes and double quotes) that would break quoted filter values.
 */
function escapeValue(value: string): string {
    return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
