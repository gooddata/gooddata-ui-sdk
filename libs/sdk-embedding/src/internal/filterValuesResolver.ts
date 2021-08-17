// (C) 2021 GoodData Corporation
import { EmbeddedGdc } from "../iframe/common";

/**
 *
 * @param filters Filters with resolvable values
 *  = all selected elements of attribute filter
 *  + from/to limits of relative date filter
 *  + from/to limits of absolute date filter
 * @returns Map of resolved filter values per filter's identifier (date dimension ref or attribute DF ref)
 */
export function resolveFilterValues(
    filters: EmbeddedGdc.ResolvableFilter[],
): Promise<EmbeddedGdc.IResolvedFilterValues> {
    const resolvedValuesMap: EmbeddedGdc.IResolvedFilterValues = {};
    return new Promise((resolve) =>
        resolve(
            filters.reduce((result, filter) => {
                // eslint-disable-next-line no-console
                console.log(filter);
                // TODO switch per filter type
                return result;
            }, resolvedValuesMap),
        ),
    );
}
