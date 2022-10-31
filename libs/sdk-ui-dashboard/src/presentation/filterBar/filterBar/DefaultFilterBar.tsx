// (C) 2021-2022 GoodData Corporation
import {
    areObjRefsEqual,
    IDashboardAttributeFilter,
    IDashboardDateFilter,
    objRefToString,
} from "@gooddata/sdk-model";
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
    selectSupportsElementUris,
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
import {
    convertDashboardAttributeFilterElementsUrisToValues,
    convertDashboardAttributeFilterElementsValuesToUris,
} from "../../../_staging/dashboard/legacyFilterConvertors";

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

    const customFilterName = useDashboardSelector(selectEffectiveDateFilterTitle);
    const availableGranularities = useDashboardSelector(selectEffectiveDateFilterAvailableGranularities);
    const dateFilterOptions = useDashboardSelector(selectEffectiveDateFilterOptions);
    const dateFilterMode = useDashboardSelector(selectEffectiveDateFilterMode);
    const isExport = useDashboardSelector(selectIsExport);
    const { AttributeFilterComponentSet, DashboardDateFilterComponentProvider } =
        useDashboardComponentsContext();
    const supportElementUris = useDashboardSelector(selectSupportsElementUris);

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
                    const convertedFilter = supportElementUris
                        ? filter
                        : convertDashboardAttributeFilterElementsUrisToValues(filter);
                    const CustomAttributeFilterComponent =
                        AttributeFilterComponentSet.MainComponentProvider(convertedFilter);

                    return (
                        <DraggableAttributeFilter
                            key={objRefToString(filter.attributeFilter.displayForm)}
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
