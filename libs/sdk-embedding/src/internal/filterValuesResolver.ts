// (C) 2021 GoodData Corporation
import invariant from "ts-invariant";
import {
    filterObjRef,
    IAttributeFilter,
    IDateFilter,
    isAbsoluteDateFilter,
    serializeObjRef,
} from "@gooddata/sdk-model";
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
                const ref = filterObjRef(filter);
                invariant(ref, `filter without reference not supported: ${filter}`);
                const refString = serializeObjRef(ref);
                if (isAbsoluteDateFilter(filter)) {
                    const currentValues = getResolvedFilterValues(result, filter) || [];
                    result[refString] = [
                        ...currentValues,
                        {
                            from: filter.absoluteDateFilter.from,
                            to: filter.absoluteDateFilter.to,
                            granularity: "GDC.time.date",
                        },
                    ];
                }
                return result;
            }, resolvedValuesMap),
        ),
    );
}

function getResolvedFilterValues(
    map: EmbeddedGdc.IResolvedFilterValues,
    filter: IAttributeFilter,
): EmbeddedGdc.IResolvedAttributeFilterValues | undefined;
function getResolvedFilterValues(
    map: EmbeddedGdc.IResolvedFilterValues,
    filter: IDateFilter,
): EmbeddedGdc.ResolvedDateFilterValues | undefined;
function getResolvedFilterValues(
    map: EmbeddedGdc.IResolvedFilterValues,
    filter: IAttributeFilter | IDateFilter,
): EmbeddedGdc.IResolvedAttributeFilterValues | EmbeddedGdc.ResolvedDateFilterValues | undefined {
    return map[serializeObjRef(filterObjRef(filter))];
}
