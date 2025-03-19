// (C) 2021-2025 GoodData Corporation
import React, { useCallback } from "react";
import classNames from "classnames";
import { invariant } from "ts-invariant";
import {
    areObjRefsEqual,
    DashboardAttributeFilterConfigModeValues,
    DashboardDateFilterConfigModeValues,
    FilterContextItem,
    IDashboardAttributeFilter,
    IDashboardDateFilter,
    isAllTimeDashboardDateFilter,
    isDashboardAttributeFilter,
    ObjRef,
    objRefToString,
    serializeObjRef,
} from "@gooddata/sdk-model";
import {
    changeAttributeFilterSelection,
    changeMigratedAttributeFilterSelection,
    changeDateFilterSelection,
    clearDateFilterSelection,
    selectEffectiveDateFilterAvailableGranularities,
    selectEffectiveDateFilterMode,
    selectEffectiveDateFilterOptions,
    selectFilterContextFilters,
    selectIsExport,
    selectSupportsElementUris,
    useDashboardDispatch,
    useDashboardSelector,
    selectIsInEditMode,
    selectAttributeFilterDisplayFormsMap,
    selectEffectiveAttributeFiltersModeMap,
    selectCanAddMoreFilters,
    selectCatalogDateDatasets,
    selectEffectiveDateFiltersModeMap,
    selectAttributeFilterConfigsDisplayAsLabelMap,
    selectEnableDuplicatedLabelValuesInAttributeFilter,
    setAttributeFilterDisplayForm,
    setDashboardAttributeFilterConfigDisplayAsLabel,
    changeWorkingAttributeFilterSelection,
    selectEnableDashboardFiltersApplyModes,
    selectWorkingFilterContextFilters,
    selectCrossFilteringFiltersLocalIdentifiers,
    selectIsWorkingFilterContextChanged,
    selectDashboardFiltersApplyMode,
} from "../../../model/index.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";
import {
    DraggableFilterDropZone,
    DraggableFilterDropZoneHint,
    DraggableAttributeFilter,
    DraggableDateFilter,
} from "../../dragAndDrop/index.js";
import { HiddenDashboardDateFilter } from "../dateFilter/index.js";
import { IDashboardDateFilterConfig, IFilterBarProps } from "../types.js";
import { DefaultFilterBarContainer } from "./DefaultFilterBarContainer.js";
import {
    isFilterBarAttributeFilter,
    isFilterBarFilterPlaceholder,
    useFiltersWithAddedPlaceholder,
} from "./useFiltersWithAddedPlaceholder.js";
import { HiddenFilterBar } from "./HiddenFilterBar.js";
import {
    convertDashboardAttributeFilterElementsUrisToValues,
    convertDashboardAttributeFilterElementsValuesToUris,
} from "../../../_staging/dashboard/legacyFilterConvertors.js";
import { areAllFiltersHidden } from "../utils.js";
import { ResetFiltersButton } from "./ResetFiltersButton.js";

/**
 * @alpha
 */
export const useFilterBarProps = (): IFilterBarProps => {
    const filters = useDashboardSelector(selectFilterContextFilters);
    const workingFilters = useDashboardSelector(selectWorkingFilterContextFilters);
    const supportElementUris = useDashboardSelector(selectSupportsElementUris);
    const enableDuplicatedLabelValuesInAttributeFilter = useDashboardSelector(
        selectEnableDuplicatedLabelValuesInAttributeFilter,
    );
    const enableDashboardFiltersApplyModes = useDashboardSelector(selectEnableDashboardFiltersApplyModes);

    const dispatch = useDashboardDispatch();
    const onAttributeFilterChanged = useCallback(
        (
            filter: IDashboardAttributeFilter,
            displayAsLabel?: ObjRef,
            isWorkingSelectionChange?: boolean,
            isResultOfMigration?: boolean,
        ) => {
            const convertedFilter = supportElementUris
                ? filter
                : convertDashboardAttributeFilterElementsValuesToUris(filter);
            const { attributeElements, negativeSelection, localIdentifier } = convertedFilter.attributeFilter;
            if (enableDuplicatedLabelValuesInAttributeFilter) {
                const getCurrentFilter = (
                    existingFilter: FilterContextItem[],
                    filterLocalId: string | undefined,
                ) => {
                    return existingFilter
                        .filter(isDashboardAttributeFilter)
                        .find(
                            (existingFilter) =>
                                existingFilter.attributeFilter.localIdentifier === filterLocalId,
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
                            isWorkingSelectionChange && enableDashboardFiltersApplyModes,
                            isResultOfMigration,
                        ),
                    );
                }
                if (displayAsLabel) {
                    dispatch(
                        setDashboardAttributeFilterConfigDisplayAsLabel(localIdentifier!, displayAsLabel),
                    );
                }
            }

            if (isWorkingSelectionChange && enableDashboardFiltersApplyModes) {
                dispatch(
                    changeWorkingAttributeFilterSelection(
                        localIdentifier!,
                        attributeElements,
                        negativeSelection ? "NOT_IN" : "IN",
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
        [
            dispatch,
            supportElementUris,
            enableDuplicatedLabelValuesInAttributeFilter,
            filters,
            enableDashboardFiltersApplyModes,
        ],
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
                        isWorkingSelectionChange && enableDashboardFiltersApplyModes,
                    ),
                );
            } else if (isAllTimeDashboardDateFilter(filter)) {
                // all time filter
                dispatch(
                    clearDateFilterSelection(
                        undefined,
                        filter?.dateFilter.dataSet,
                        isWorkingSelectionChange && enableDashboardFiltersApplyModes,
                    ),
                );
            } else {
                const { type, granularity, from, to, dataSet } = filter.dateFilter;
                dispatch(
                    changeDateFilterSelection(
                        type,
                        granularity,
                        from,
                        to,
                        dateFilterOptionLocalId,
                        undefined,
                        dataSet,
                        isWorkingSelectionChange && enableDashboardFiltersApplyModes,
                    ),
                );
            }
        },
        [dispatch, enableDashboardFiltersApplyModes],
    );

    return { filters, workingFilters, onAttributeFilterChanged, onDateFilterChanged, DefaultFilterBar };
};

/**
 * @alpha
 */
export function DefaultFilterBar(props: IFilterBarProps): JSX.Element {
    const { filters, workingFilters, onAttributeFilterChanged, onDateFilterChanged } = props;

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
    const attributeFiltersDisplayAsLabelMap = useDashboardSelector(
        selectAttributeFilterConfigsDisplayAsLabelMap,
    );
    const dateFiltersModeMap = useDashboardSelector(selectEffectiveDateFiltersModeMap);
    const allDateDatasets = useDashboardSelector(selectCatalogDateDatasets);

    const isExport = useDashboardSelector(selectIsExport);
    const { AttributeFilterComponentSet, DashboardDateFilterComponentProvider } =
        useDashboardComponentsContext();
    const supportElementUris = useDashboardSelector(selectSupportsElementUris);
    const displayFormsMap = useDashboardSelector(selectAttributeFilterDisplayFormsMap);
    const canAddMoreFilters = useDashboardSelector(selectCanAddMoreFilters);
    const haveAllFiltersHidden = areAllFiltersHidden(
        draggableFiltersWithPlaceholder,
        commonDateFilterMode,
        attributeFiltersModeMap,
        dateFiltersModeMap,
    );

    const crossFilterLocalIds = useDashboardSelector(selectCrossFilteringFiltersLocalIdentifiers);
    const isWorkingFilterContextChanged = useDashboardSelector(selectIsWorkingFilterContextChanged);
    const filtersApplyMode = useDashboardSelector(selectDashboardFiltersApplyMode);
    const enableDashboardFiltersApplyModes = useDashboardSelector(selectEnableDashboardFiltersApplyModes);

    if (isExport || haveAllFiltersHidden) {
        return <HiddenFilterBar {...props} />;
    }

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
                                enableDashboardFiltersApplyModes ? commonWorkingDateFilter : undefined
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
            {draggableFiltersWithPlaceholder.map((filterOrPlaceholder) => {
                if (isFilterBarFilterPlaceholder(filterOrPlaceholder)) {
                    const CreatingPlaceholderComponent =
                        AttributeFilterComponentSet.creating.CreatingPlaceholderComponent!;
                    return (
                        <CreatingPlaceholderComponent
                            key={filterOrPlaceholder.filterIndex}
                            onClose={closeAttributeSelection}
                            onSelect={selectDraggableFilter}
                        />
                    );
                } else if (isFilterBarAttributeFilter(filterOrPlaceholder)) {
                    const { filter, filterIndex, workingFilter } = filterOrPlaceholder;
                    const convertedFilter = supportElementUris
                        ? filter
                        : convertDashboardAttributeFilterElementsUrisToValues(filter);
                    const CustomAttributeFilterComponent =
                        AttributeFilterComponentSet.MainComponentProvider(convertedFilter);
                    const attributeFilterMode = attributeFiltersModeMap.get(
                        filter.attributeFilter.localIdentifier!,
                    );
                    const displayAsLabel = attributeFiltersDisplayAsLabelMap.get(
                        filter.attributeFilter.localIdentifier!,
                    );

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

                    if (attributeFilterMode === DashboardAttributeFilterConfigModeValues.HIDDEN) {
                        return null;
                    }

                    if (
                        filter.attributeFilter.localIdentifier &&
                        crossFilterLocalIds.includes(filter.attributeFilter.localIdentifier) &&
                        isWorkingFilterContextChanged &&
                        filtersApplyMode.mode === "ALL_AT_ONCE" &&
                        enableDashboardFiltersApplyModes
                    ) {
                        return null;
                    }

                    return (
                        <DraggableAttributeFilter
                            key={`${objRefToString(displayForm.attribute)}-${
                                filter.attributeFilter.localIdentifier
                            }`}
                            autoOpen={areObjRefsEqual(filter.attributeFilter.displayForm, autoOpenFilter)}
                            filter={filter}
                            workingFilter={enableDashboardFiltersApplyModes ? workingFilter : undefined}
                            filterIndex={filterIndex}
                            readonly={
                                attributeFilterMode === DashboardAttributeFilterConfigModeValues.READONLY
                            }
                            displayAsLabel={displayAsLabel}
                            FilterComponent={CustomAttributeFilterComponent}
                            onAttributeFilterChanged={onAttributeFilterChanged}
                            onAttributeFilterAdded={addDraggableFilterPlaceholder}
                            onAttributeFilterClose={onCloseAttributeFilter}
                        />
                    );
                } else {
                    if (filterOrPlaceholder.filter.dateFilter.dataSet) {
                        const { filter, workingFilter, filterIndex } = filterOrPlaceholder;

                        const CustomDateFilterComponent = DashboardDateFilterComponentProvider(filter);

                        const dateFilterMode =
                            dateFiltersModeMap.get(serializeObjRef(filter.dateFilter.dataSet!)) ||
                            DashboardDateFilterConfigModeValues.ACTIVE;

                        if (dateFilterMode === DashboardDateFilterConfigModeValues.HIDDEN) {
                            return null;
                        }

                        const defaultDateFilterName = allDateDatasets.find((ds) =>
                            areObjRefsEqual(ds.dataSet.ref, filter.dateFilter.dataSet),
                        )?.dataSet?.title;

                        return (
                            <DraggableDateFilter
                                key={objRefToString(filterOrPlaceholder.filter.dateFilter.dataSet)}
                                autoOpen={areObjRefsEqual(
                                    filterOrPlaceholder.filter.dateFilter.dataSet,
                                    autoOpenFilter,
                                )}
                                filter={filter}
                                workingFilter={enableDashboardFiltersApplyModes ? workingFilter : undefined}
                                filterIndex={filterIndex}
                                config={{
                                    ...commonDateFilterComponentConfig,
                                    customFilterName: defaultDateFilterName,
                                }}
                                readonly={dateFilterMode === DashboardDateFilterConfigModeValues.READONLY}
                                FilterComponent={CustomDateFilterComponent}
                                onDateFilterChanged={onDateFilterChanged}
                                onDateFilterAdded={addDraggableFilterPlaceholder}
                                onDateFilterClose={onCloseAttributeFilter}
                            />
                        );
                    }
                    return null;
                }
            })}
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
