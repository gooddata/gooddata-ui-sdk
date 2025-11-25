// (C) 2025 GoodData Corporation

import { PlaceholdersResolvedValues, useResolveValuesWithPlaceholders } from "@gooddata/sdk-ui";

/**
 * Helper wrapper to resolve arrays of placeholders consistently.
 *
 * @internal
 */
export function useResolvedPlaceholderValues<T extends unknown[], C>(
    values: [...T],
    resolutionContext?: C,
): PlaceholdersResolvedValues<T> {
    return useResolveValuesWithPlaceholders(values, resolutionContext);
}
