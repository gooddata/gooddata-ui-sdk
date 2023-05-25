// (C) 2021-2022 GoodData Corporation
import React, { useCallback } from "react";
import classNames from "classnames";
import { invariant } from "ts-invariant";
import {
    areObjRefsEqual,
    IDashboardAttributeFilter,
    IDashboardDateFilter,
    objRefToString,
} from "@gooddata/sdk-model";
import {
    changeAttributeFilterSelection,
    changeDateFilterSelection,
    clearDateFilterSelection,
    selectEffectiveDateFilterAvailableGranularities,
    selectEffectiveDateFilterMode,
    selectEffectiveDateFilterOptions,
    selectEffectiveDateFilterTitle,
    selectFilterContextFilters,
    selectIsExport,
    selectSupportsElementUris,
    useDashboardDispatch,
    useDashboardSelector,
    selectIsInEditMode,
    selectAttributeFilterDisplayFormsMap,
    selectCanAddMoreAttributeFilters,
} from "../../../model/index.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";
import {
    AttributeFilterDropZone,
    AttributeFilterDropZoneHint,
    DraggableAttributeFilter,
} from "../../dragAndDrop/index.js";
import { HiddenDashboardDateFilter } from "../dateFilter/index.js";
import { IDashboardDateFilterConfig, IFilterBarProps } from "../types.js";
import { DefaultFilterBarContainer } from "./DefaultFilterBarContainer.js";
import {
    isFilterBarAttributeFilterPlaceholder,
    useFiltersWithAddedPlaceholder,
} from "./useFiltersWithAddedPlaceholder.js";
import { HiddenFilterBar } from "./HiddenFilterBar.js";
import {
    convertDashboardAttributeFilterElementsUrisToValues,
    convertDashboardAttributeFilterElementsValuesToUris,
} from "../../../_staging/dashboard/legacyFilterConvertors.js";

/**
 * @alpha
 */
export const useFilterBarProps = (): IFilterBarProps => {
    const filters = useDashboardSelector(selectFilterContextFilters);
    const supportElementUris = useDashboardSelector(selectSupportsElementUris);

    const dispatch = useDashboardDispatch();
    const onAttributeFilterChanged = useCallback(
        (filter: IDashboardAttributeFilter) => {
            const convertedFilter = supportElementUris
                ? filter
                : convertDashboardAttributeFilterElementsValuesToUris(filter);
            const { attributeElements, negativeSelection, localIdentifier } = convertedFilter.attributeFilter;

            dispatch(
                changeAttributeFilterSelection(
                    localIdentifier!,
                    attributeElements,
                    negativeSelection ? "NOT_IN" : "IN",
                ),
            );
        },
        [dispatch, supportElementUris],
    );

    const onDateFilterChanged = useCallback(
        (filter: IDashboardDateFilter | undefined, dateFilterOptionLocalId?: string) => {
            if (!filter) {
                // all time filter
                dispatch(clearDateFilterSelection());
            } else {
                const { type, granularity, from, to } = filter.dateFilter;
                dispatch(changeDateFilterSelection(type, granularity, from, to, dateFilterOptionLocalId));
            }
        },
        [dispatch],
    );

    return { filters, onAttributeFilterChanged, onDateFilterChanged, DefaultFilterBar };
};

/**
 * @alpha
 */
export function DefaultFilterBar(props: IFilterBarProps): JSX.Element {
    const { filters, onAttributeFilterChanged, onDateFilterChanged } = props;

    const [
        { dateFilter, attributeFiltersWithPlaceholder, attributeFiltersCount, autoOpenFilter },
        {
            addAttributeFilterPlaceholder,
            closeAttributeSelection,
            selectAttributeFilter,
            onCloseAttributeFilter,
        },
    ] = useFiltersWithAddedPlaceholder(filters);

    const isInEditMode = useDashboardSelector(selectIsInEditMode);
    const customFilterName = useDashboardSelector(selectEffectiveDateFilterTitle);
    const availableGranularities = useDashboardSelector(selectEffectiveDateFilterAvailableGranularities);
    const dateFilterOptions = useDashboardSelector(selectEffectiveDateFilterOptions);
    const dateFilterMode = useDashboardSelector(selectEffectiveDateFilterMode);
    const isExport = useDashboardSelector(selectIsExport);
    const { AttributeFilterComponentSet, DashboardDateFilterComponentProvider } =
        useDashboardComponentsContext();
    const supportElementUris = useDashboardSelector(selectSupportsElementUris);
    const displayFormsMap = useDashboardSelector(selectAttributeFilterDisplayFormsMap);
    const canAddMoreAttributeFilters = useDashboardSelector(selectCanAddMoreAttributeFilters);

    if (isExport) {
        return <HiddenFilterBar {...props} />;
    }

    const dateFilterComponentConfig: IDashboardDateFilterConfig = {
        availableGranularities,
        dateFilterOptions,
        customFilterName,
    };

    const CustomDateFilterComponent = DashboardDateFilterComponentProvider(dateFilter);

    return (
        <DefaultFilterBarContainer>
            <div
                className={classNames("dash-filters-date", {
                    "dash-filter-is-edit-mode": isInEditMode,
                })}
            >
                {dateFilterMode === "hidden" ? (
                    <HiddenDashboardDateFilter />
                ) : (
                    <>
                        <CustomDateFilterComponent
                            filter={dateFilter}
                            onFilterChanged={onDateFilterChanged}
                            config={dateFilterComponentConfig}
                            readonly={dateFilterMode === "readonly"}
                        />
                        <AttributeFilterDropZoneHint
                            placement="outside"
                            hintPosition="next"
                            targetIndex={0}
                            onAddAttributePlaceholder={addAttributeFilterPlaceholder}
                            acceptPlaceholder={canAddMoreAttributeFilters}
                        />
                    </>
                )}
            </div>
            {attributeFiltersWithPlaceholder.map((filterOrPlaceholder) => {
                if (isFilterBarAttributeFilterPlaceholder(filterOrPlaceholder)) {
                    const CreatingPlaceholderComponent =
                        AttributeFilterComponentSet.creating.CreatingPlaceholderComponent;
                    return (
                        <CreatingPlaceholderComponent
                            key={filterOrPlaceholder.filterIndex}
                            onClose={closeAttributeSelection}
                            onSelect={selectAttributeFilter}
                        />
                    );
                } else {
                    const { filter, filterIndex } = filterOrPlaceholder;
                    const convertedFilter = supportElementUris
                        ? filter
                        : convertDashboardAttributeFilterElementsUrisToValues(filter);
                    const CustomAttributeFilterComponent =
                        AttributeFilterComponentSet.MainComponentProvider(convertedFilter);

                    /**
                     * Use the attribute as key, not the display form.
                     * This is to make sure we do not remount this when user changes the display form used:
                     * it should just reload the elements, not close and remount the whole filter.
                     *
                     * This is fine because we do not allow multiple filters of the same attribute to be on
                     * the same dashboard.
                     */
                    const displayForm = displayFormsMap.get(convertedFilter.attributeFilter.displayForm);
                    invariant(displayForm, "inconsistent state, display form for a filter was not found");

                    return (
                        <DraggableAttributeFilter
                            key={objRefToString(displayForm.attribute)}
                            autoOpen={areObjRefsEqual(filter.attributeFilter.displayForm, autoOpenFilter)}
                            filter={filter}
                            filterIndex={filterIndex}
                            FilterComponent={CustomAttributeFilterComponent}
                            onAttributeFilterChanged={onAttributeFilterChanged}
                            onAttributeFilterAdded={addAttributeFilterPlaceholder}
                            onAttributeFilterClose={onCloseAttributeFilter}
                        />
                    );
                }
            })}
            {canAddMoreAttributeFilters ? (
                <AttributeFilterDropZone
                    targetIndex={attributeFiltersCount}
                    onDrop={addAttributeFilterPlaceholder}
                />
            ) : null}
            <div className="filter-bar-dropzone-container">
                <AttributeFilterDropZoneHint
                    placement="outside"
                    hintPosition="prev"
                    acceptPlaceholder={false}
                    targetIndex={attributeFiltersCount}
                />
            </div>
        </DefaultFilterBarContainer>
    );
}
