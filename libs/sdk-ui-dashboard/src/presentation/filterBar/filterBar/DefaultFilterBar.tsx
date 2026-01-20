// (C) 2021-2026 GoodData Corporation

import { type ReactElement, useCallback } from "react";

import classNames from "classnames";

import { generateDateFilterLocalIdentifier } from "@gooddata/sdk-backend-base";
import {
    DashboardDateFilterConfigModeValues,
    type FilterContextItem,
    type IDashboardAttributeFilter,
    type IDashboardDateFilter,
    type ObjRef,
    areObjRefsEqual,
    isAllTimeDashboardDateFilter,
    isDashboardAttributeFilter,
    isDashboardDateFilter,
} from "@gooddata/sdk-model";

import { DefaultFilterBarContainer } from "./DefaultFilterBarContainer.js";
import { HiddenFilterBar } from "./HiddenFilterBar.js";
import { ResetFiltersButton } from "./ResetFiltersButton.js";
import { useFiltersWithAddedPlaceholder } from "./useFiltersWithAddedPlaceholder.js";
import { convertDashboardAttributeFilterElementsValuesToUris } from "../../../_staging/dashboard/legacyFilterConvertors.js";
import {
    changeAttributeFilterSelection,
    changeDateFilterSelection,
    changeMigratedAttributeFilterSelection,
    changeWorkingAttributeFilterSelection,
    clearDateFilterSelection,
    selectCanAddMoreFilters,
    selectEffectiveAttributeFiltersModeMap,
    selectEffectiveDateFilterAvailableGranularities,
    selectEffectiveDateFilterMode,
    selectEffectiveDateFilterOptions,
    selectEffectiveDateFiltersModeMap,
    selectEnableDashboardFilterGroups,
    selectEnableDateFilterIdentifiers,
    selectFilterContextFilters,
    selectFilterGroupsConfig,
    selectIsApplyFiltersAllAtOnceEnabledAndSet,
    selectIsExport,
    selectIsInEditMode,
    selectSupportsElementUris,
    selectWorkingFilterContextFilters,
    setAttributeFilterDisplayForm,
    setDashboardAttributeFilterConfigDisplayAsLabel,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../model/index.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";
import { DraggableFilterDropZone, DraggableFilterDropZoneHint } from "../../dragAndDrop/index.js";
import { HiddenDashboardDateFilter } from "../dateFilter/index.js";
import { type IDashboardDateFilterConfig, type IFilterBarProps } from "../types.js";
import { areAllFiltersHidden } from "../utils.js";
import { DefaultFilterBarItem } from "./DefaultFilterBarItem.js";
import { groupFilterItems } from "./filterGroupUtils.js";

/**
 * @alpha
 */
export const useFilterBarProps = (): IFilterBarProps => {
    const filters = useDashboardSelector(selectFilterContextFilters);
    const workingFilters = useDashboardSelector(selectWorkingFilterContextFilters);
    const supportElementUris = useDashboardSelector(selectSupportsElementUris);
    const filterGroupsConfig = useDashboardSelector(selectFilterGroupsConfig);

    const isApplyAllAtOnceEnabledAndSet = useDashboardSelector(selectIsApplyFiltersAllAtOnceEnabledAndSet);
    const enableDateFilterIdentifiers = useDashboardSelector(selectEnableDateFilterIdentifiers);

    const dispatch = useDashboardDispatch();
    const onAttributeFilterChanged = useCallback(
        (
            filter: IDashboardAttributeFilter,
            displayAsLabel?: ObjRef,
            isWorkingSelectionChange?: boolean,
            isResultOfMigration?: boolean,
            isSelectionInvalid?: boolean,
        ) => {
            const convertedFilter = supportElementUris
                ? filter
                : convertDashboardAttributeFilterElementsValuesToUris(filter);
            const { attributeElements, negativeSelection, localIdentifier } = convertedFilter.attributeFilter;

            const getCurrentFilter = (
                existingFilter: FilterContextItem[],
                filterLocalId: string | undefined,
            ) => {
                return existingFilter
                    .filter(isDashboardAttributeFilter)
                    .find(
                        (existingFilter) => existingFilter.attributeFilter.localIdentifier === filterLocalId,
                    );
            };
            const currentFilter = getCurrentFilter(filters, localIdentifier);
            if (
                !areObjRefsEqual(
                    filter.attributeFilter.displayForm,
                    currentFilter?.attributeFilter.displayForm,
                )
            ) {
                dispatch(
                    setAttributeFilterDisplayForm(
                        localIdentifier!,
                        filter.attributeFilter.displayForm,
                        isWorkingSelectionChange && isApplyAllAtOnceEnabledAndSet,
                        isResultOfMigration,
                    ),
                );
            }
            if (displayAsLabel) {
                dispatch(setDashboardAttributeFilterConfigDisplayAsLabel(localIdentifier!, displayAsLabel));
            }

            if (isWorkingSelectionChange && isApplyAllAtOnceEnabledAndSet) {
                dispatch(
                    changeWorkingAttributeFilterSelection(
                        localIdentifier!,
                        attributeElements,
                        negativeSelection ? "NOT_IN" : "IN",
                        undefined,
                        isSelectionInvalid,
                    ),
                );
            } else if (isResultOfMigration) {
                dispatch(
                    changeMigratedAttributeFilterSelection(
                        localIdentifier!,
                        attributeElements,
                        negativeSelection ? "NOT_IN" : "IN",
                    ),
                );
            } else {
                dispatch(
                    changeAttributeFilterSelection(
                        localIdentifier!,
                        attributeElements,
                        negativeSelection ? "NOT_IN" : "IN",
                    ),
                );
            }
        },
        [dispatch, supportElementUris, filters, isApplyAllAtOnceEnabledAndSet],
    );

    const onDateFilterChanged = useCallback(
        (
            filter: IDashboardDateFilter | undefined,
            dateFilterOptionLocalId?: string,
            isWorkingSelectionChange?: boolean,
        ) => {
            if (!filter) {
                dispatch(
                    clearDateFilterSelection(
                        undefined,
                        undefined,
                        isWorkingSelectionChange && isApplyAllAtOnceEnabledAndSet,
                    ),
                );
            } else if (isAllTimeDashboardDateFilter(filter)) {
                const localIdentifier =
                    (filter?.dateFilter.localIdentifier ?? enableDateFilterIdentifiers)
                        ? generateDateFilterLocalIdentifier(0, filter?.dateFilter.dataSet)
                        : undefined;
                // all time filter
                dispatch(
                    clearDateFilterSelection(
                        undefined,
                        filter?.dateFilter.dataSet,
                        isWorkingSelectionChange && isApplyAllAtOnceEnabledAndSet,
                        localIdentifier,
                    ),
                );
            } else {
                const { type, granularity, from, to, dataSet, localIdentifier, boundedFilter } =
                    filter.dateFilter;
                const filterIndex = filters
                    .filter(isDashboardDateFilter)
                    .findIndex((filter) => areObjRefsEqual(filter.dateFilter.dataSet, dataSet));
                const sanitizedFilterIndex = filterIndex < 0 ? 0 : filterIndex;
                const newLocalIdentifier = enableDateFilterIdentifiers
                    ? generateDateFilterLocalIdentifier(sanitizedFilterIndex, dataSet)
                    : undefined;
                dispatch(
                    changeDateFilterSelection(
                        type,
                        granularity,
                        from,
                        to,
                        dateFilterOptionLocalId,
                        undefined,
                        dataSet,
                        isWorkingSelectionChange && isApplyAllAtOnceEnabledAndSet,
                        localIdentifier ?? newLocalIdentifier,
                        boundedFilter,
                    ),
                );
            }
        },
        [dispatch, isApplyAllAtOnceEnabledAndSet, filters, enableDateFilterIdentifiers],
    );

    return {
        filters,
        workingFilters,
        filterGroupsConfig,
        onAttributeFilterChanged,
        onDateFilterChanged,
        DefaultFilterBar,
    };
};

/**
 * @alpha
 */
export function DefaultFilterBar(props: IFilterBarProps): ReactElement {
    const { filters, workingFilters, filterGroupsConfig, onDateFilterChanged } = props;

    const [
        {
            commonDateFilter,
            commonWorkingDateFilter,
            draggableFiltersWithPlaceholder,
            draggableFiltersCount,
            autoOpenFilter,
        },
        {
            addDraggableFilterPlaceholder,
            closeAttributeSelection,
            selectDraggableFilter,
            onCloseAttributeFilter,
        },
    ] = useFiltersWithAddedPlaceholder(filters, workingFilters);

    const isInEditMode = useDashboardSelector(selectIsInEditMode);
    const availableGranularities = useDashboardSelector(selectEffectiveDateFilterAvailableGranularities);
    const dateFilterOptions = useDashboardSelector(selectEffectiveDateFilterOptions);
    const commonDateFilterMode = useDashboardSelector(selectEffectiveDateFilterMode);
    const attributeFiltersModeMap = useDashboardSelector(selectEffectiveAttributeFiltersModeMap);
    const dateFiltersModeMap = useDashboardSelector(selectEffectiveDateFiltersModeMap);
    const enableDashboardFilterGroups = useDashboardSelector(selectEnableDashboardFilterGroups);

    const isExport = useDashboardSelector(selectIsExport);
    const { DashboardDateFilterComponentProvider } = useDashboardComponentsContext();
    const canAddMoreFilters = useDashboardSelector(selectCanAddMoreFilters);
    const haveAllFiltersHidden = areAllFiltersHidden(
        draggableFiltersWithPlaceholder,
        commonDateFilterMode,
        attributeFiltersModeMap,
        dateFiltersModeMap,
    );

    const isApplyAllAtOnceEnabledAndSet = useDashboardSelector(selectIsApplyFiltersAllAtOnceEnabledAndSet);

    if (isExport || haveAllFiltersHidden) {
        return <HiddenFilterBar {...props} />;
    }

    const groupedFilterItems =
        enableDashboardFilterGroups && !isInEditMode
            ? groupFilterItems(draggableFiltersWithPlaceholder, filterGroupsConfig)
            : draggableFiltersWithPlaceholder;

    const commonDateFilterComponentConfig: IDashboardDateFilterConfig = {
        availableGranularities,
        dateFilterOptions,
    };

    const CustomCommonDateFilterComponent = DashboardDateFilterComponentProvider(commonDateFilter);

    return (
        <DefaultFilterBarContainer>
            <div
                className={classNames("dash-filters-date", {
                    "dash-filter-is-edit-mode": isInEditMode,
                })}
            >
                {commonDateFilterMode === DashboardDateFilterConfigModeValues.HIDDEN ? (
                    <HiddenDashboardDateFilter />
                ) : (
                    <>
                        <CustomCommonDateFilterComponent
                            filter={commonDateFilter}
                            workingFilter={
                                isApplyAllAtOnceEnabledAndSet ? commonWorkingDateFilter : undefined
                            }
                            onFilterChanged={onDateFilterChanged}
                            config={commonDateFilterComponentConfig}
                            readonly={commonDateFilterMode === DashboardDateFilterConfigModeValues.READONLY}
                        />
                        <DraggableFilterDropZoneHint
                            placement="outside"
                            hintPosition="next"
                            targetIndex={0}
                            onAddAttributePlaceholder={addDraggableFilterPlaceholder}
                            acceptPlaceholder={canAddMoreFilters}
                        />
                    </>
                )}
            </div>
            {groupedFilterItems.map((filterItem) => (
                <DefaultFilterBarItem
                    key={filterItem.filterIndex}
                    {...props}
                    item={filterItem}
                    autoOpenFilter={autoOpenFilter}
                    addDraggableFilterPlaceholder={addDraggableFilterPlaceholder}
                    closeAttributeSelection={closeAttributeSelection}
                    selectDraggableFilter={selectDraggableFilter}
                    onCloseAttributeFilter={onCloseAttributeFilter}
                />
            ))}
            {canAddMoreFilters ? (
                <DraggableFilterDropZone
                    targetIndex={draggableFiltersCount}
                    onDrop={addDraggableFilterPlaceholder}
                />
            ) : null}
            <ResetFiltersButton />
            <div className="filter-bar-dropzone-container">
                <DraggableFilterDropZoneHint
                    placement="outside"
                    hintPosition="prev"
                    acceptPlaceholder={false}
                    targetIndex={draggableFiltersCount}
                />
            </div>
        </DefaultFilterBarContainer>
    );
}
