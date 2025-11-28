// (C) 2025 GoodData Corporation

import type { EntitySearchSort } from "@gooddata/api-client-tiger";

/**
 * Builds a sorting query array from an array of strings.
 *
 * @remarks
 * Each string in the input array should be in the format "property" or "property,direction",
 * where direction can be "asc" or "desc" (case-insensitive). The default direction is "ASC".
 *
 * Examples:
 * - "title" -\> \{ property: "title", direction: "ASC" \}
 * - "title,desc" -\> \{ property: "title", direction: "DESC" \}
 * - "created,asc" -\> \{ property: "created", direction: "ASC" \}
 *
 * @param sort - Array of sort strings in the format "property" or "property,direction"
 * @returns Array of sort query objects, or undefined if no valid sorts are provided
 * @internal
 */
export function buildSortQuery(sort?: string[]): EntitySearchSort[] | undefined {
    if (!sort || sort.length === 0) {
        return undefined;
    }

    const result: EntitySearchSort[] = [];
    for (const value of sort) {
        if (!value) {
            continue;
        }

        const [rawProperty, rawDirection] = value.split(",");
        const property = rawProperty?.trim();

        if (!property) {
            continue;
        }

        const direction: EntitySearchSort["direction"] =
            rawDirection?.toLowerCase() === "desc" ? "DESC" : "ASC";

        result.push({
            property,
            direction,
        });
    }

    return result.length > 0 ? result : undefined;
}
