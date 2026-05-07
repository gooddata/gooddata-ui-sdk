// (C) 2021-2026 GoodData Corporation

import { type ReactElement, useCallback } from "react";

import classNames from "classnames";

import { generateDateFilterLocalIdentifier } from "@gooddata/sdk-backend-base";
import {
    type DashboardAttributeFilterItem,
    DashboardDateFilterConfigModeValues,
    DashboardParameterModeValues,
    type FilterContextItem,
    type IDashboardDateFilter,
    type IDashboardMeasureValueFilter,
    type MeasureValueFilterCondition,
    type ObjRef,
    areObjRefsEqual,
    dashboardAttributeFilterItemDisplayForm,
    dashboardAttributeFilterItemLocalIdentifier,
    dashboardFilterLocalIdentifier,
    isAllTimeDashboardDateFilter,
    isDashboardAttributeFilter,
    isDashboardAttributeFilterItem,
    isDashboardDateFilter,
    isDashboardMeasureValueFilter,
    objRefToString,
} from "@gooddata/sdk-model";

import { convertDashboardAttributeFilterElementsValuesToUris } from "../../../_staging/dashboard/legacyFilterConvertors.js";
import { setDashboardAttributeFilterConfigDisplayAsLabel } from "../../../model/commands/dashboard.js";
import {
    changeAttributeFilterSelection,
    changeDateFilterSelection,
    changeMeasureValueFilterCondition,
    changeMigratedAttributeFilterSelection,
    changeWorkingAttributeFilterSelection,
    changeWorkingMeasureValueFilterCondition,
    clearDateFilterSelection,
    replaceAttributeFilterItemSelection,
    replaceWorkingAttributeFilterItemSelection,
    setAttributeFilterDisplayForm,
} from "../../../model/commands/filters.js";
import { useDashboardDispatch, useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectSupportsElementUris } from "../../../model/store/backendCapabilities/backendCapabilitiesSelectors.js";
import {
    selectEnableDashboardFilterGroups,
    selectEnableDateFilterIdentifiers,
    selectEnableMeasureValueFilterKD,
    selectEnableParameters,
    selectIsApplyFiltersAllAtOnceEnabledAndSet,
    selectIsExport,
} from "../../../model/store/config/configSelectors.js";
import { selectDashboardParameters } from "../../../model/store/parameters/parametersSelectors.js";
import { selectIsInEditMode } from "../../../model/store/renderMode/renderModeSelectors.js";
import { selectEffectiveAttributeFiltersModeMap } from "../../../model/store/tabs/attributeFilterConfigs/attributeFilterConfigsSelectors.js";
import {
    selectEffectiveDateFilterAvailableGranularities,
    selectEffectiveDateFilterMode,
    selectEffectiveDateFilterOptions,
} from "../../../model/store/tabs/dateFilterConfig/dateFilterConfigSelectors.js";
import { selectEffectiveDateFiltersModeMap } from "../../../model/store/tabs/dateFilterConfigs/dateFilterConfigsSelectors.js";
import {
    selectCanAddMoreFilters,
    selectFilterContextFilters,
    selectWorkingFilterContextFilters,
} from "../../../model/store/tabs/filterContext/filterContextSelectors.js";
import { selectFilterGroupsConfig } from "../../../model/store/tabs/filterGroups/filterGroupsSelectors.js";
import { selectEffectiveMeasureValueFiltersModeMap } from "../../../model/store/tabs/measureValueFilterConfigs/measureValueFilterConfigsSelectors.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/DashboardComponentsContext.js";
import { DraggableFilterDropZone } from "../../dragAndDrop/draggableFilterDropZone/DraggableFilterDropZone.js";
import { DraggableFilterDropZoneHint } from "../../dragAndDrop/draggableFilterDropZone/DraggableFilterDropZoneHint.js";
import { HiddenDashboardDateFilter } from "../dateFilter/HiddenDashboardDateFilter.js";
import { type IDashboardDateFilterConfig } from "../dateFilter/types.js";
import { AddFilterMenu } from "../parameterFilter/AddFilterMenu.js";
import { DashboardParameterFilter } from "../parameterFilter/DashboardParameterFilter.js";
import { areAllFiltersHidden } from "../utils.js";
import { DefaultFilterBarContainer } from "./DefaultFilterBarContainer.js";
import { DefaultFilterBarItem } from "./DefaultFilterBarItem.js";
import { groupFilterItems } from "./filterGroupUtils.js";
import { HiddenFilterBar } from "./HiddenFilterBar.js";
import { ResetFiltersButton } from "./ResetFiltersButton.js";
import { type IFilterBarProps } from "./types.js";
import { useFiltersWithAddedPlaceholder } from "./useFiltersWithAddedPlaceholder.js";

/**
 * @alpha
 */
export const useFilterBarProps = (): IFilterBarProps => {
    const allFilters = useDashboardSelector(selectFilterContextFilters);
    const allWorkingFilters = useDashboardSelector(selectWorkingFilterContextFilters);
    const supportElementUris = useDashboardSelector(selectSupportsElementUris);
    const filterGroupsConfig = useDashboardSelector(selectFilterGroupsConfig);
    const enableMeasureValueFilterKD = useDashboardSelector(selectEnableMeasureValueFilterKD);

    // Hide measure value filters from the filter bar when the FF is off.
    // The FF gates the entire MVF UI; without it, dashboards that already persist MVFs
    // should render as if they had only attribute and date filters.
    const filters = enableMeasureValueFilterKD
        ? allFilters
        : allFilters.filter((f) => !isDashboardMeasureValueFilter(f));
    const workingFilters = enableMeasureValueFilterKD
        ? allWorkingFilters
        : allWorkingFilters.filter((f) => !isDashboardMeasureValueFilter(f));

    const isApplyAllAtOnceEnabledAndSet = useDashboardSelector(selectIsApplyFiltersAllAtOnceEnabledAndSet);
    const enableDateFilterIdentifiers = useDashboardSelector(selectEnableDateFilterIdentifiers);

    const dispatch = useDashboardDispatch();
    const onAttributeFilterChanged = useCallback(
        (
            filter: DashboardAttributeFilterItem,
            displayAsLabel?: ObjRef,
            isWorkingSelectionChange?: boolean,
            isResultOfMigration?: boolean,
            isSelectionInvalid?: boolean,
        ) => {
            const localIdentifier = dashboardAttributeFilterItemLocalIdentifier(filter);

            // Detect cross-type migration: incoming filter type differs from stored filter type.
            // e.g. text filter in store being replaced by a list filter (or vice versa).
            const filtersForComparison =
                isWorkingSelectionChange && isApplyAllAtOnceEnabledAndSet ? workingFilters : filters;
            const existingFilter = filtersForComparison.find(
                (f) =>
                    isDashboardAttributeFilterItem(f) &&
                    dashboardAttributeFilterItemLocalIdentifier(f) === localIdentifier,
            );
            const isCrossTypeMigration = existingFilter
                ? isDashboardAttributeFilter(filter) !== isDashboardAttributeFilter(existingFilter)
                : false;

            // For text filter types OR cross-type migrations, use the replace command which
            // swaps the entire filter item in the filter context.
            if (!isDashboardAttributeFilter(filter) || isCrossTypeMigration) {
                if (isWorkingSelectionChange && isApplyAllAtOnceEnabledAndSet) {
                    dispatch(
                        replaceWorkingAttributeFilterItemSelection(
                            localIdentifier!,
                            filter,
                            undefined,
                            isSelectionInvalid,
                        ),
                    );
                } else {
                    dispatch(
                        replaceAttributeFilterItemSelection(
                            localIdentifier!,
                            filter,
                            undefined,
                            isSelectionInvalid,
                        ),
                    );
                }

                // For text→list migration: transfer the old text filter's displayForm
                // as displayAsLabel on the new list filter (it was the secondary label).
                if (isCrossTypeMigration && isDashboardAttributeFilter(filter) && existingFilter) {
                    const secondaryLabel = dashboardAttributeFilterItemDisplayForm(
                        existingFilter as DashboardAttributeFilterItem,
                    );
                    if (!areObjRefsEqual(secondaryLabel, filter.attributeFilter.displayForm)) {
                        dispatch(
                            setDashboardAttributeFilterConfigDisplayAsLabel(localIdentifier!, secondaryLabel),
                        );
                    }
                }
                return;
            }

            // Standard element-based attribute filter handling (existing flow)
            const convertedFilter = supportElementUris
                ? filter
                : convertDashboardAttributeFilterElementsValuesToUris(filter);
            const { attributeElements, negativeSelection } = convertedFilter.attributeFilter;

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
        [dispatch, supportElementUris, filters, workingFilters, isApplyAllAtOnceEnabledAndSet],
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
                        filter?.dateFilter.emptyValueHandling,
                    ),
                );
            } else {
                const {
                    type,
                    granularity,
                    from,
                    to,
                    dataSet,
                    localIdentifier,
                    boundedFilter,
                    emptyValueHandling,
                } = filter.dateFilter;
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
                        emptyValueHandling,
                    ),
                );
            }
        },
        [dispatch, isApplyAllAtOnceEnabledAndSet, filters, enableDateFilterIdentifiers],
    );

    const onMeasureValueFilterChanged = useCallback(
        (
            filter: IDashboardMeasureValueFilter,
            conditions: MeasureValueFilterCondition[] | undefined,
            isWorkingSelectionChange?: boolean,
        ) => {
            dispatch(
                isWorkingSelectionChange && isApplyAllAtOnceEnabledAndSet
                    ? changeWorkingMeasureValueFilterCondition(
                          dashboardFilterLocalIdentifier(filter)!,
                          conditions,
                      )
                    : changeMeasureValueFilterCondition(dashboardFilterLocalIdentifier(filter)!, conditions),
            );
        },
        [dispatch, isApplyAllAtOnceEnabledAndSet],
    );

    return {
        filters,
        workingFilters,
        filterGroupsConfig,
        onAttributeFilterChanged,
        onDateFilterChanged,
        onMeasureValueFilterChanged,
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
    const measureValueFiltersModeMap = useDashboardSelector(selectEffectiveMeasureValueFiltersModeMap);
    const enableDashboardFilterGroups = useDashboardSelector(selectEnableDashboardFilterGroups);
    const enableParameters = useDashboardSelector(selectEnableParameters);
    const dashboardParameters = useDashboardSelector(selectDashboardParameters);

    const isExport = useDashboardSelector(selectIsExport);
    const { DashboardDateFilterComponentProvider } = useDashboardComponentsContext();
    const canAddMoreFilters = useDashboardSelector(selectCanAddMoreFilters);
    const haveAllFiltersHidden = areAllFiltersHidden(
        draggableFiltersWithPlaceholder,
        commonDateFilterMode,
        attributeFiltersModeMap,
        dateFiltersModeMap,
        measureValueFiltersModeMap,
    );

    const isApplyAllAtOnceEnabledAndSet = useDashboardSelector(selectIsApplyFiltersAllAtOnceEnabledAndSet);

    const hasVisibleParameterControls =
        enableParameters &&
        (isInEditMode ||
            dashboardParameters.some((parameter) => parameter.mode !== DashboardParameterModeValues.HIDDEN));

    if (isExport || (haveAllFiltersHidden && !hasVisibleParameterControls)) {
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
            {enableParameters
                ? dashboardParameters.map((parameter) => (
                      <DashboardParameterFilter key={objRefToString(parameter.ref)} parameter={parameter} />
                  ))
                : null}
            {canAddMoreFilters ? (
                <DraggableFilterDropZone
                    targetIndex={draggableFiltersCount}
                    onDrop={addDraggableFilterPlaceholder}
                />
            ) : null}
            {enableParameters && isInEditMode ? <AddFilterMenu /> : null}
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
