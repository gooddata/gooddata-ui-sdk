// (C) 2025 GoodData Corporation

import { IAttribute, IFilter, IMeasure, ISortItem, ITotal } from "@gooddata/sdk-model";
import { useResolveValueWithPlaceholders } from "@gooddata/sdk-ui";

import { IPivotTableNextResolvedProps } from "../types/internal.js";
import { IPivotTableNextProps } from "../types/public.js";

/**
 * Resolves placeholders and returns strongly-typed props using generic inference.
 *
 * @internal
 */
export function useResolvedProps(props: IPivotTableNextProps): IPivotTableNextResolvedProps {
    const measures = useResolveValueWithPlaceholders<
        IPivotTableNextProps["measures"],
        IPivotTableNextProps["placeholdersResolutionContext"]
    >(props.measures, props.placeholdersResolutionContext) as IMeasure[] | undefined;
    const columns = useResolveValueWithPlaceholders<
        IPivotTableNextProps["columns"],
        IPivotTableNextProps["placeholdersResolutionContext"]
    >(props.columns, props.placeholdersResolutionContext) as IAttribute[] | undefined;
    const rows = useResolveValueWithPlaceholders<
        IPivotTableNextProps["rows"],
        IPivotTableNextProps["placeholdersResolutionContext"]
    >(props.rows, props.placeholdersResolutionContext) as IAttribute[] | undefined;
    const totals = useResolveValueWithPlaceholders<
        IPivotTableNextProps["totals"],
        IPivotTableNextProps["placeholdersResolutionContext"]
    >(props.totals, props.placeholdersResolutionContext) as ITotal[] | undefined;
    const filters = useResolveValueWithPlaceholders<
        IPivotTableNextProps["filters"],
        IPivotTableNextProps["placeholdersResolutionContext"]
    >(props.filters, props.placeholdersResolutionContext) as IFilter[] | undefined;
    const sortBy = useResolveValueWithPlaceholders<
        IPivotTableNextProps["sortBy"],
        IPivotTableNextProps["placeholdersResolutionContext"]
    >(props.sortBy, props.placeholdersResolutionContext) as ISortItem[] | undefined;

    return {
        ...props,
        measures,
        columns,
        rows,
        totals,
        filters,
        sortBy,
    };
}
