// (C) 2021-2022 GoodData Corporation
import React, { useCallback, useState } from "react";
import partition from "lodash/partition";
import {
    IDashboardAttributeFilter,
    IDashboardDateFilter,
    isDashboardDateFilter,
    objRefToString,
} from "@gooddata/sdk-model";

import {
    addAttributeFilter,
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
import { DashboardDateFilter, HiddenDashboardDateFilter } from "../dateFilter";
import { IDashboardDateFilterConfig, IFilterBarProps } from "../types";

import { DefaultFilterBarContainer } from "./DefaultFilterBarContainer";
import { HiddenFilterBar } from "./HiddenFilterBar";
import { AttributeFilterDropZoneHint, DraggableAttributeFilter } from "../../dragAndDrop";
import { AttributeFilterDropZone } from "../../dragAndDrop/draggableAttributeFilter/AttributeFilterDropZone";
import { AttributesDropdown } from "../attributeFilter/addAttributeFilter/AttributesDropdown";
import { ICatalogAttribute } from "@gooddata/sdk-model";

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

    const customFilterName = useDashboardSelector(selectEffectiveDateFilterTitle);
    const availableGranularities = useDashboardSelector(selectEffectiveDateFilterAvailableGranularities);
    const dateFilterOptions = useDashboardSelector(selectEffectiveDateFilterOptions);
    const dateFilterMode = useDashboardSelector(selectEffectiveDateFilterMode);
    const isExport = useDashboardSelector(selectIsExport);
    const { DashboardAttributeFilterComponentProvider } = useDashboardComponentsContext();

    const [addedFilterIndex, setAddedFilterIndex] = useState<number>();
    const clearAddedFilterIndex = useCallback(() => setAddedFilterIndex(undefined), []);

    const dispatch = useDashboardDispatch();

    const onAttributeFilterSelect = function (item: ICatalogAttribute) {
        if (!addedFilterIndex) {
            return;
        }

        dispatch(addAttributeFilter(item.defaultDisplayForm, addedFilterIndex));
    };

    if (isExport) {
        return <HiddenFilterBar {...props} />;
    }

    const [[dateFilter], attributeFilters] = partition(filters, isDashboardDateFilter);

    const dateFilterComponentConfig: IDashboardDateFilterConfig = {
        availableGranularities,
        dateFilterOptions,
        customFilterName,
    };

    return (
        <DefaultFilterBarContainer>
            <div className="dash-filters-date dash-filters-attribute">
                {dateFilterMode === "hidden" ? (
                    <HiddenDashboardDateFilter />
                ) : (
                    <>
                        <DashboardDateFilter
                            filter={dateFilter}
                            onFilterChanged={onDateFilterChanged}
                            config={dateFilterComponentConfig}
                            readonly={dateFilterMode === "readonly"}
                        />
                        <AttributeFilterDropZoneHint
                            placement="outside"
                            hintPosition="next"
                            targetIndex={0}
                            onAddAttributePlaceholder={setAddedFilterIndex}
                        />
                    </>
                )}
            </div>
            {attributeFilters.map((filter, filterIndex) => {
                const CustomAttributeFilterComponent = DashboardAttributeFilterComponentProvider(filter);

                return (
                    <React.Fragment key={objRefToString(filter.attributeFilter.displayForm)}>
                        {filterIndex === addedFilterIndex && (
                            <AttributesDropdown
                                onClose={clearAddedFilterIndex}
                                onSelect={onAttributeFilterSelect}
                            />
                        )}
                        <DraggableAttributeFilter
                            filter={filter}
                            filterIndex={filterIndex}
                            FilterComponent={CustomAttributeFilterComponent}
                            onAttributeFilterChanged={onAttributeFilterChanged}
                            onAttributeFilterAdded={setAddedFilterIndex}
                        />
                    </React.Fragment>
                );
            })}
            {attributeFilters.length === addedFilterIndex && (
                <AttributesDropdown onClose={clearAddedFilterIndex} onSelect={onAttributeFilterSelect} />
            )}
            <AttributeFilterDropZone onDrop={() => setAddedFilterIndex(attributeFilters.length)} />
            <div style={{ position: "relative", flexGrow: 1, height: "55px" }}>
                <AttributeFilterDropZoneHint
                    placement="outside"
                    hintPosition="prev"
                    acceptPlaceholder={false}
                    targetIndex={attributeFilters.length - 1}
                />
            </div>
        </DefaultFilterBarContainer>
    );
}
