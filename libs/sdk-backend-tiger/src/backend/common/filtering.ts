// (C) 2025 GoodData Corporation
import { IFilterBaseOptions } from "@gooddata/sdk-backend-spi";

/**
 * Builds an RSQL filter query string from base options.
 *
 * @see https://www.gooddata.com/docs/cloud/api-and-sdk/api/conventions/
 *
 * @internal
 */
export function buildFilterQuery(filter: IFilterBaseOptions) {
    const filters: string[] = [];

    if (filter.id && filter.id.length > 0) {
        filters.push(`id=in=(${formatInValues(filter.id)})`);
    }
    if (filter.title) {
        // containsic === contains + ignore case
        filters.push(`title=containsic="${filter.title}"`);
    }
    if (filter.createdBy && filter.createdBy.length > 0) {
        filters.push(`createdBy.id=in=(${formatInValues(filter.createdBy)})`);
    }
    if (filter.tags && filter.tags.length > 0) {
        filters.push(`tags=in=(${formatInValues(filter.tags)})`);
    }

    //Join all filters if any
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
    return values.map((value) => `"${value}"`).join(",");
}
