// (C) 2021-2022 GoodData Corporation

import { useCallback, useMemo, useState } from "react";
import partition from "lodash/partition.js";
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
    selectCatalogAttributes,
    selectSelectedFilterIndex,
    uiActions,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../model/index.js";

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

    const [[dateFilter], attributeFilters] = partition(filters, isDashboardDateFilter);
    const [selectedDisplayForm, setSelectedDisplayForm] = useState<ObjRef | undefined>();
    const [autoOpenFilter, setAutoOpenFilter] = useState<ObjRef | undefined>();

    const addedAttributeFilter: FilterBarAttributeFilterPlaceholder | undefined = useMemo(() => {
        if (selectedFilterIndex !== undefined) {
            if (selectedDisplayForm) {
                return {
                    ...({
                        type: "attributeFilterPlaceholder",
                        filterIndex: selectedFilterIndex,
                    } as FilterBarAttributeFilterPlaceholder),
                    selectedDisplayForm,
                };
            }
            return { type: "attributeFilterPlaceholder", filterIndex: selectedFilterIndex };
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

    const attributeFiltersWithPlaceholder = useMemo(() => {
        const filterObjects: FilterBarAttributeItems = attributeFilters.map((filter, filterIndex) => ({
            filter,
            filterIndex,
        }));

        const containsAddedAttributeDisplayForm =
            selectedDisplayForm &&
            attributeFilters.some((attributeFilter) =>
                areObjRefsEqual(attributeFilter.attributeFilter.displayForm, selectedDisplayForm),
            );

        if (addedAttributeFilter === undefined || containsAddedAttributeDisplayForm) {
            return filterObjects;
        }

        filterObjects.splice(addedAttributeFilter.filterIndex, 0, addedAttributeFilter);

        return filterObjects;
    }, [addedAttributeFilter, attributeFilters, selectedDisplayForm]);

    const selectAttributeFilter = useCallback(
        function (displayForm: ObjRef) {
            if (!addedAttributeFilter) {
                return;
            }

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
        },
        [addedAttributeFilter, attributeFilters, allAttributes, clearAddedFilter, dispatch],
    );

    const onCloseAttributeFilter = useCallback(() => {
        setAutoOpenFilter(undefined);
    }, []);
    return [
        {
            dateFilter,
            attributeFiltersWithPlaceholder,
            attributeFiltersCount: attributeFilters.length,
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
