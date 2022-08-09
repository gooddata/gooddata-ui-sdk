// (C) 2021-2022 GoodData Corporation

import { useCallback, useMemo, useState } from "react";
import partition from "lodash/partition";
import {
    areObjRefsEqual,
    FilterContextItem,
    IDashboardAttributeFilter,
    IDashboardDateFilter,
    isDashboardDateFilter,
    ObjRef,
} from "@gooddata/sdk-model";

import {
    addAttributeFilter as addAttributeFilterAction,
    dispatchAndWaitFor,
    useDashboardDispatch,
} from "../../../model";

/**
 * @internal
 */
export type FilterBarAttributeFilterPlaceholder = {
    type: "attributeFilterPlaceholder";
    filterIndex: number;
    displayForm?: ObjRef;
};

/**
 * @internal
 */
export function isFilterBarAttributeFilterPlaceholder(
    object: any,
): object is FilterBarAttributeFilterPlaceholder {
    return object.type === "attributeFilterPlaceholder";
}

/**
 * @internal
 */
export type FilterBarAttributeFilterIndexed = {
    filter: IDashboardAttributeFilter;
    filterIndex: number;
};

/**
 * @internal
 */
export type FilterBarAttributeItem = FilterBarAttributeFilterPlaceholder | FilterBarAttributeFilterIndexed;

/**
 * @internal
 */
export type FilterBarAttributeItems = FilterBarAttributeItem[];

/**
 * @internal
 */
export function useFiltersWithAddedPlaceholder(filters: FilterContextItem[]): [
    {
        dateFilter: IDashboardDateFilter;
        attributeFiltersWithPlaceholder: FilterBarAttributeItems;
        attributeFiltersCount: number;
    },
    {
        addAttributeFilterPlaceholder: (index: number) => void;
        selectAttributeFilter: (displayForm: ObjRef) => void;
        closeAttributeSelection: () => void;
    },
] {
    const dispatch = useDashboardDispatch();
    const [[dateFilter], attributeFilters] = partition(filters, isDashboardDateFilter);
    const [addedAttributeFilter, setAddedAttributeFilter] = useState<
        FilterBarAttributeFilterPlaceholder | undefined
    >();

    const addAttributeFilterPlaceholder = useCallback(function (index: number) {
        setAddedAttributeFilter({ type: "attributeFilterPlaceholder", filterIndex: index });
    }, []);

    const clearAddedFilter = useCallback(() => {
        setAddedAttributeFilter(undefined);
    }, []);

    const closeAttributeSelection = useCallback(
        function () {
            // close after select attribute should not clear placeholder
            if (addedAttributeFilter?.displayForm) {
                return;
            }

            clearAddedFilter();
        },
        [addedAttributeFilter?.displayForm, clearAddedFilter],
    );

    const attributeFiltersWithPlaceholder = useMemo(() => {
        const filterObjects: FilterBarAttributeItems = attributeFilters.map((filter, filterIndex) => ({
            filter,
            filterIndex,
        }));

        const containsAddedAttributeDisplayForm =
            addedAttributeFilter?.displayForm &&
            attributeFilters.some((attributeFilter) =>
                areObjRefsEqual(
                    attributeFilter.attributeFilter.displayForm,
                    addedAttributeFilter.displayForm,
                ),
            );

        if (addedAttributeFilter === undefined || containsAddedAttributeDisplayForm) {
            return filterObjects;
        }

        filterObjects.splice(addedAttributeFilter.filterIndex, 0, addedAttributeFilter);

        return filterObjects;
    }, [addedAttributeFilter, attributeFilters]);

    const selectAttributeFilter = useCallback(
        function (displayForm: ObjRef) {
            if (!addedAttributeFilter) {
                return;
            }

            setAddedAttributeFilter((f) => ({ ...(f as FilterBarAttributeFilterPlaceholder), displayForm }));

            dispatchAndWaitFor(
                dispatch,
                addAttributeFilterAction(displayForm, addedAttributeFilter.filterIndex),
            ).finally(clearAddedFilter);
        },
        [addedAttributeFilter, clearAddedFilter, dispatch],
    );

    return [
        {
            dateFilter,
            attributeFiltersWithPlaceholder,
            attributeFiltersCount: attributeFilters.length,
        },
        { addAttributeFilterPlaceholder, selectAttributeFilter, closeAttributeSelection },
    ];
}
