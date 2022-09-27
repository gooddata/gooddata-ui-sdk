// (C) 2021-2022 GoodData Corporation
import { IDashboardAttributeFilter, IDashboardDateFilter, objRefToString } from "@gooddata/sdk-model";
import React, { useCallback } from "react";
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
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../model";
import { useDashboardComponentsContext } from "../../dashboardContexts";
import {
    AttributeFilterDropZone,
    AttributeFilterDropZoneHint,
    DraggableAttributeFilter,
} from "../../dragAndDrop";
import { HiddenDashboardDateFilter } from "../dateFilter";
import { IDashboardDateFilterConfig, IFilterBarProps } from "../types";
import { DefaultFilterBarContainer } from "./DefaultFilterBarContainer";
import {
    isFilterBarAttributeFilterPlaceholder,
    useFiltersWithAddedPlaceholder,
} from "./useFiltersWithAddedPlaceholder";
import { HiddenFilterBar } from "./HiddenFilterBar";

/**
 * @alpha
 */
export const useFilterBarProps = (): IFilterBarProps => {
    const filters = useDashboardSelector(selectFilterContextFilters);
    const dispatch = useDashboardDispatch();
    const onAttributeFilterChanged = useCallback(
        (filter: IDashboardAttributeFilter) => {
            const { attributeElements, negativeSelection, localIdentifier } = filter.attributeFilter;
            dispatch(
                changeAttributeFilterSelection(
                    localIdentifier!,
                    attributeElements,
                    negativeSelection ? "NOT_IN" : "IN",
                ),
            );
        },
        [dispatch],
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
        { dateFilter, attributeFiltersWithPlaceholder, attributeFiltersCount },
        { addAttributeFilterPlaceholder, closeAttributeSelection, selectAttributeFilter },
    ] = useFiltersWithAddedPlaceholder(filters);

    const customFilterName = useDashboardSelector(selectEffectiveDateFilterTitle);
    const availableGranularities = useDashboardSelector(selectEffectiveDateFilterAvailableGranularities);
    const dateFilterOptions = useDashboardSelector(selectEffectiveDateFilterOptions);
    const dateFilterMode = useDashboardSelector(selectEffectiveDateFilterMode);
    const isExport = useDashboardSelector(selectIsExport);
    const { AttributeFilterComponentSet, DashboardDateFilterComponentProvider } =
        useDashboardComponentsContext();

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
            <div className="dash-filters-date">
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
                    const CustomAttributeFilterComponent =
                        AttributeFilterComponentSet.MainComponentProvider(filter);

                    return (
                        <DraggableAttributeFilter
                            key={objRefToString(filter.attributeFilter.displayForm)}
                            filter={filter}
                            filterIndex={filterIndex}
                            FilterComponent={CustomAttributeFilterComponent}
                            onAttributeFilterChanged={onAttributeFilterChanged}
                            onAttributeFilterAdded={addAttributeFilterPlaceholder}
                        />
                    );
                }
            })}
            <AttributeFilterDropZone
                targetIndex={attributeFiltersCount}
                onDrop={addAttributeFilterPlaceholder}
            />
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
