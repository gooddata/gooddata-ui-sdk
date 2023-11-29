// (C) 2021-2022 GoodData Corporation

import { useCallback, useMemo, useState } from "react";
import partition from "lodash/partition.js";
import {
    areObjRefsEqual,
    FilterContextItem,
    IDashboardAttributeFilter,
    IDashboardDateFilter,
    isDashboardAttributeFilter,
    isDashboardDateFilter,
    isIdentifierRef,
    ObjRef,
} from "@gooddata/sdk-model";

import {
    addAttributeFilter as addAttributeFilterAction,
    dispatchAndWaitFor,
    selectCatalogAttributes,
    selectCatalogDateDatasets,
    selectSelectedFilterIndex,
    uiActions,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../model/index.js";

/**
 * @internal
 */
export type FilterBarFilterPlaceholder = {
    type: "filterPlaceholder";
    filterIndex: number;
    displayForm?: ObjRef;
};

/**
 * @internal
 */
export function isFilterBarFilterPlaceholder(
    object: any,
): object is FilterBarFilterPlaceholder {
    return object.type === "filterPlaceholder";
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
export function isFilterBarAttributeFilter(
    object: any,
): object is FilterBarAttributeFilterIndexed {
    return isDashboardAttributeFilter(object.filter);
}

/**
 * @internal
 */
export type FilterBarDateFilterIndexed = {
    filter: IDashboardDateFilter;
    filterIndex: number;
};

/**
 * @internal
 */
export function isFilterBarDateFilterWithDimension(
    object: FilterBarItem,
): object is FilterBarDateFilterIndexed {
    if(!isFilterBarFilterPlaceholder(object) && isDashboardDateFilter(object.filter)) {
        return !!object.filter.dateFilter.dataSet;
    }
    return false;
}

/**
 * @internal
 */
export type FilterBarItem = FilterBarFilterPlaceholder | FilterBarAttributeFilterIndexed | FilterBarDateFilterIndexed;

/**
 * @internal
 */
export type FilterBarDraggableItems = FilterBarItem[];



// function isDashboardCommonDateFilter(
//     object: FilterContextItem,
// ): object is IDashboardDateFilter {
//     if(!isFilterBarFilterPlaceholder(object) && isDashboardDateFilter(object)) {
//         return !object.dateFilter.dataSet;
//     }
//     return false;
// }

function isDashboardDateFilterWithDimension(
    object: FilterContextItem,
): object is IDashboardDateFilter {
    if(isDashboardDateFilter(object)) {
        return !!object.dateFilter.dataSet;
    }
    return false;
}

/**
 * @internal
 */
export function useFiltersWithAddedPlaceholder(filters: FilterContextItem[]): [
    {
        dateFilter: IDashboardDateFilter;
        draggableFiltersWithPlaceholder: FilterBarDraggableItems;
        attributeFiltersCount: number;
        autoOpenFilter: ObjRef | undefined;
    },
    {
        addAttributeFilterPlaceholder: (index: number) => void;
        selectAttributeFilter: (displayForm: ObjRef) => void;
        closeAttributeSelection: () => void;
        onCloseAttributeFilter: () => void;
    },
] {
    const dispatch = useDashboardDispatch();
    const selectedFilterIndex = useDashboardSelector(selectSelectedFilterIndex);
    const allAttributes = useDashboardSelector(selectCatalogAttributes);
    const dateDatasets = useDashboardSelector(selectCatalogDateDatasets);


    // TODO INE: clean up types conversion from FilterContextItem to
    // IDashboardDateFilter without dimension + FilterBarDraggableItems
    const [draggableFilters, [commonDateFilter]] = partition(filters, (f)=> isDashboardAttributeFilter(f) || isDashboardDateFilterWithDimension(f));

    const [dateFiltersWithDimensions, attributeFilters] = partition(draggableFilters, isDashboardDateFilter);

    const [selectedDisplayForm, setSelectedDisplayForm] = useState<ObjRef | undefined>();
    const [autoOpenFilter, setAutoOpenFilter] = useState<ObjRef | undefined>();

    const addedAttributeFilter: FilterBarFilterPlaceholder | undefined = useMemo(() => {
        if (selectedFilterIndex !== undefined) {
            if (selectedDisplayForm) {
                return {
                    ...({
                        type: "filterPlaceholder",
                        filterIndex: selectedFilterIndex,
                    } as FilterBarFilterPlaceholder),
                    selectedDisplayForm,
                };
            }
            return { type: "filterPlaceholder", filterIndex: selectedFilterIndex };
        }
        return undefined;
    }, [selectedFilterIndex, selectedDisplayForm]);

    const addAttributeFilterPlaceholder = useCallback(
        function (index: number) {
            dispatch(uiActions.selectFilterIndex(index));
        },
        [dispatch],
    );

    const clearAddedFilter = useCallback(() => {
        setSelectedDisplayForm(undefined);
        dispatch(uiActions.clearFilterIndexSelection());
    }, [dispatch]);

    const closeAttributeSelection = useCallback(
        function () {
            // close after select attribute should not clear placeholder
            if (selectedDisplayForm) {
                return;
            }

            clearAddedFilter();
        },
        [selectedDisplayForm, clearAddedFilter],
    );

    const draggableFiltersWithPlaceholder = useMemo(() => {
        const filterObjects: FilterBarDraggableItems = draggableFilters.map((filter, filterIndex) => {
            if(isDashboardAttributeFilter(filter)) {
                return {
                    filter,
                    filterIndex,
                }
            }

            return {
                filter,
                filterIndex,
            }
        });

        const containsAddedAttributeDisplayForm =
            selectedDisplayForm &&
            draggableFilters.some((draggableFilter) => {
                if(isDashboardAttributeFilter(draggableFilter)) {
                    return areObjRefsEqual(draggableFilter.attributeFilter.displayForm, selectedDisplayForm);
                }
                return areObjRefsEqual(draggableFilter.dateFilter.dataSet, selectedDisplayForm);
            });

        if (addedAttributeFilter === undefined || containsAddedAttributeDisplayForm) {
            return filterObjects;
        }

        filterObjects.splice(addedAttributeFilter.filterIndex, 0, addedAttributeFilter);

        return filterObjects;
    }, [addedAttributeFilter, draggableFilters, selectedDisplayForm]);

    // TODO INE: selects also DF with dimension => rename
    const selectAttributeFilter = useCallback(
        function (displayForm: ObjRef) {
            if (!addedAttributeFilter) {
                return;
            }

            // date filter added
            // TODO INE: better distinguishing based on some new additional filter type param instead of ref type?
            if(isIdentifierRef(displayForm) && displayForm.type === "dataSet") {
                const relatedDateDataset = dateDatasets.find((dds) =>
                    areObjRefsEqual(dds.dataSet.ref, displayForm),
                );

                const usedDateDataset = dateFiltersWithDimensions.find((df) => areObjRefsEqual(df.dateFilter.dataSet, relatedDateDataset?.dataSet.ref));


                // We allowed just one dateFilter for one date dimension,
                if (!usedDateDataset) {
                    setSelectedDisplayForm(displayForm);
                    setAutoOpenFilter(displayForm);
                    dispatchAndWaitFor(
                        dispatch,
                        // TODO INE: dispatch new action for adding date filter instead of this one
                        addAttributeFilterAction(displayForm, addedAttributeFilter.filterIndex),
                    ).finally(clearAddedFilter);
                } else {
                    setAutoOpenFilter(usedDateDataset.dateFilter.dataSet);
                    clearAddedFilter();
                }
            // attribute filter added
            } else {
                const relatedAttribute = allAttributes.find((att) =>
                    att.displayForms.some((df) => areObjRefsEqual(df.ref, displayForm)),
                );

                const usedDisplayForm = relatedAttribute?.displayForms.find((df) => {
                    return attributeFilters.find((x) => areObjRefsEqual(x.attributeFilter.displayForm, df));
                });

                // We allowed just one attributeFilter for one attribute,
                if (!usedDisplayForm) {
                    setSelectedDisplayForm(displayForm);
                    setAutoOpenFilter(displayForm);
                    dispatchAndWaitFor(
                        dispatch,
                        addAttributeFilterAction(displayForm, addedAttributeFilter.filterIndex),
                    ).finally(clearAddedFilter);
                } else {
                    setAutoOpenFilter(usedDisplayForm);
                    clearAddedFilter();
                }
            }

        },
        [addedAttributeFilter, dateFiltersWithDimensions, attributeFilters, dateDatasets, allAttributes, clearAddedFilter, dispatch],
    );

    const onCloseAttributeFilter = useCallback(() => {
        setAutoOpenFilter(undefined);
    }, []);
    return [
        {
            dateFilter: commonDateFilter as IDashboardDateFilter, // TODO INE: rename even output variable + remove cast once types fixed
            draggableFiltersWithPlaceholder,
            attributeFiltersCount: draggableFilters.length,
            autoOpenFilter,
        },
        {
            addAttributeFilterPlaceholder,
            selectAttributeFilter,
            closeAttributeSelection,
            onCloseAttributeFilter,
        },
    ];
}
