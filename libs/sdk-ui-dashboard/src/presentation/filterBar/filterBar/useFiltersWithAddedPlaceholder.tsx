// (C) 2021-2025 GoodData Corporation

import { useCallback, useMemo, useState } from "react";
import partition from "lodash/partition.js";

import {
    areObjRefsEqual,
    FilterContextItem,
    IDashboardAttributeFilter,
    IDashboardDateFilter,
    isDashboardAttributeFilter,
    isDashboardCommonDateFilter,
    isDashboardDateFilter,
    isDashboardDateFilterWithDimension,
    isIdentifierRef,
    ObjRef,
} from "@gooddata/sdk-model";

import {
    addAttributeFilter as addAttributeFilterAction,
    addDateFilter as addDateFilterAction,
    dispatchAndWaitFor,
    selectAllCatalogDateDatasetsMap,
    selectCatalogAttributes,
    selectEnableDuplicatedLabelValuesInAttributeFilter,
    selectSelectedFilterIndex,
    uiActions,
    useDashboardDispatch,
    useDashboardSelector,
    getFilterIdentifier,
} from "../../../model/index.js";
import find from "lodash/find.js";

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
export function isFilterBarFilterPlaceholder(object: any): object is FilterBarFilterPlaceholder {
    return object.type === "filterPlaceholder";
}

/**
 * @internal
 */
export type FilterBarAttributeFilterIndexed = {
    filter: IDashboardAttributeFilter;
    filterIndex: number;
    workingFilter?: IDashboardAttributeFilter;
};

/**
 * @internal
 */
export type FilterBarAttributeItem = FilterBarFilterPlaceholder | FilterBarAttributeFilterIndexed;
export function isFilterBarAttributeFilter(object: any): object is FilterBarAttributeFilterIndexed {
    return isDashboardAttributeFilter(object.filter);
}

/**
 * @internal
 */
export type FilterBarAttributeItems = FilterBarAttributeItem[];
export type FilterBarDateFilterIndexed = {
    filter: IDashboardDateFilter;
    filterIndex: number;
    workingFilter?: IDashboardDateFilter;
};

/**
 * @internal
 */
export function isFilterBarDateFilterWithDimension(
    object: FilterBarItem,
): object is FilterBarDateFilterIndexed {
    if (!isFilterBarFilterPlaceholder(object) && isDashboardDateFilter(object.filter)) {
        return !!object.filter.dateFilter.dataSet;
    }
    return false;
}

/**
 * @internal
 */
export type FilterBarItem =
    | FilterBarFilterPlaceholder
    | FilterBarAttributeFilterIndexed
    | FilterBarDateFilterIndexed;

/**
 * @internal
 */
export type FilterBarDraggableItems = FilterBarItem[];

function isNotDashboardCommonDateFilter(
    obj: unknown,
): obj is IDashboardAttributeFilter | IDashboardDateFilter {
    return isDashboardAttributeFilter(obj) || isDashboardDateFilterWithDimension(obj);
}

/**
 * @internal
 */
export function useFiltersWithAddedPlaceholder(
    filters: FilterContextItem[],
    workingFilters?: FilterContextItem[],
): [
    {
        commonDateFilter: IDashboardDateFilter;
        commonWorkingDateFilter?: IDashboardDateFilter;
        draggableFiltersWithPlaceholder: FilterBarDraggableItems;
        draggableFiltersCount: number;
        autoOpenFilter: ObjRef | undefined;
    },
    {
        addDraggableFilterPlaceholder: (index: number) => void;
        selectDraggableFilter: (displayForm: ObjRef) => void;
        closeAttributeSelection: () => void;
        onCloseAttributeFilter: () => void;
    },
] {
    const dispatch = useDashboardDispatch();
    const selectedFilterIndex = useDashboardSelector(selectSelectedFilterIndex);
    const allAttributes = useDashboardSelector(selectCatalogAttributes);
    const dateDatasetsMap = useDashboardSelector(selectAllCatalogDateDatasetsMap);
    const enableDuplicatedLabelValuesInAttributeFilter = useDashboardSelector(
        selectEnableDuplicatedLabelValuesInAttributeFilter,
    );

    const commonWorkingDateFilter = find(workingFilters, isDashboardCommonDateFilter);
    const [draggableFilters, [commonDateFilter]] = partition(filters, isNotDashboardCommonDateFilter);
    const [dateFiltersWithDimensions, attributeFilters] = partition(
        draggableFilters,
        isDashboardDateFilterWithDimension,
    );

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

    const addDraggableFilterPlaceholder = useCallback(
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
            if (isDashboardAttributeFilter(filter)) {
                const workingFilter =
                    workingFilters
                        ?.filter(isDashboardAttributeFilter)
                        .find((wf) => getFilterIdentifier(wf) === getFilterIdentifier(filter)) ?? filter;
                return {
                    filter,
                    filterIndex,
                    workingFilter,
                };
            }

            const workingFilter =
                workingFilters
                    ?.filter(isDashboardDateFilter)
                    .find((wf) => getFilterIdentifier(wf) === getFilterIdentifier(filter)) ?? filter;
            return {
                filter,
                filterIndex,
                workingFilter,
            };
        });

        const containsAddedAttributeDisplayForm =
            selectedDisplayForm &&
            draggableFilters.some((draggableFilter) => {
                if (isDashboardAttributeFilter(draggableFilter)) {
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

    // selects AF or DF with dimension
    const selectDraggableFilter = useCallback(
        function (ref: ObjRef) {
            if (!addedAttributeFilter) {
                return;
            }

            // date filter added
            if (isIdentifierRef(ref) && ref.type === "dataSet") {
                const relatedDateDataset = dateDatasetsMap.get(ref);

                const usedDateDataset = dateFiltersWithDimensions.find((df) =>
                    areObjRefsEqual(df.dateFilter.dataSet, relatedDateDataset?.dataSet.ref),
                );

                // We allowed just one dateFilter for one date dimension,
                if (!usedDateDataset) {
                    setSelectedDisplayForm(ref);
                    setAutoOpenFilter(ref);
                    dispatchAndWaitFor(
                        dispatch,
                        addDateFilterAction(ref, addedAttributeFilter.filterIndex),
                    ).finally(clearAddedFilter);
                } else {
                    setAutoOpenFilter(usedDateDataset.dateFilter.dataSet);
                    clearAddedFilter();
                }
            } else {
                // attribute filter added
                const relatedAttribute = allAttributes.find((att) =>
                    att.displayForms.some((df) => areObjRefsEqual(df.ref, ref)),
                );

                const usedDisplayForm = relatedAttribute?.displayForms.find((df) => {
                    return attributeFilters.find((x) =>
                        areObjRefsEqual(x.attributeFilter.displayForm, df.ref),
                    );
                });

                const primaryDisplayForm = enableDuplicatedLabelValuesInAttributeFilter
                    ? relatedAttribute?.displayForms.find((df) => {
                          return df.isPrimary;
                      })
                    : undefined;

                // We allowed just one attributeFilter for one attribute,
                if (!usedDisplayForm) {
                    setSelectedDisplayForm(ref);
                    setAutoOpenFilter(primaryDisplayForm ? primaryDisplayForm.ref : ref);
                    dispatchAndWaitFor(
                        dispatch,
                        addAttributeFilterAction(
                            ref,
                            addedAttributeFilter.filterIndex,
                            undefined,
                            undefined,
                            undefined,
                            undefined,
                            undefined,
                            undefined,
                            primaryDisplayForm?.ref,
                        ),
                    ).finally(clearAddedFilter);
                } else {
                    setAutoOpenFilter(usedDisplayForm.ref);
                    clearAddedFilter();
                }
            }
        },
        [
            addedAttributeFilter,
            dateFiltersWithDimensions,
            attributeFilters,
            dateDatasetsMap,
            allAttributes,
            clearAddedFilter,
            dispatch,
            enableDuplicatedLabelValuesInAttributeFilter,
        ],
    );

    const onCloseAttributeFilter = useCallback(() => {
        setAutoOpenFilter(undefined);
    }, []);
    return [
        {
            commonDateFilter,
            commonWorkingDateFilter,
            draggableFiltersWithPlaceholder,
            draggableFiltersCount: draggableFilters.length,
            autoOpenFilter,
        },
        {
            addDraggableFilterPlaceholder,
            selectDraggableFilter,
            closeAttributeSelection,
            onCloseAttributeFilter,
        },
    ];
}
