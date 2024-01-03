// (C) 2021-2022 GoodData Corporation
import React, { useCallback } from "react";
import classNames from "classnames";
import { invariant } from "ts-invariant";
import {
    areObjRefsEqual,
    DashboardAttributeFilterConfigModeValues,
    DashboardDateFilterConfigModeValues,
    IDashboardAttributeFilter,
    IDashboardDateFilter,
    isAllTimeDashboardDateFilter,
    objRefToString,
    serializeObjRef,
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
    selectEffectiveAttributeFiltersModeMap,
    selectCanAddMoreFilters,
    selectCatalogDateDatasets,
    selectEffectiveDateFiltersModeMap,
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
import { DraggableDateFilter } from "../../dragAndDrop/draggableDateFilter/DraggableDateFilter.js";

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
                dispatch(clearDateFilterSelection());
            } else if (isAllTimeDashboardDateFilter(filter)) {
                // all time filter
                dispatch(clearDateFilterSelection(undefined, filter?.dateFilter.dataSet));
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
                    ),
                );
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
        { commonDateFilter, draggableFiltersWithPlaceholder, attributeFiltersCount, autoOpenFilter },
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
    const commonDateFilterMode = useDashboardSelector(selectEffectiveDateFilterMode);
    const attributeFiltersModeMap = useDashboardSelector(selectEffectiveAttributeFiltersModeMap);
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

    if (isExport || haveAllFiltersHidden) {
        return <HiddenFilterBar {...props} />;
    }

    const commonDateFilterComponentConfig: IDashboardDateFilterConfig = {
        availableGranularities,
        dateFilterOptions,
        customFilterName,
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
                            onFilterChanged={onDateFilterChanged}
                            config={commonDateFilterComponentConfig}
                            readonly={commonDateFilterMode === DashboardDateFilterConfigModeValues.READONLY}
                        />
                        <AttributeFilterDropZoneHint
                            placement="outside"
                            hintPosition="next"
                            targetIndex={0}
                            onAddAttributePlaceholder={addAttributeFilterPlaceholder}
                            acceptPlaceholder={canAddMoreFilters}
                        />
                    </>
                )}
            </div>
            {draggableFiltersWithPlaceholder.map((filterOrPlaceholder) => {
                if (isFilterBarFilterPlaceholder(filterOrPlaceholder)) {
                    const CreatingPlaceholderComponent =
                        AttributeFilterComponentSet.creating.CreatingPlaceholderComponent;
                    return (
                        <CreatingPlaceholderComponent
                            key={filterOrPlaceholder.filterIndex}
                            onClose={closeAttributeSelection}
                            onSelect={selectAttributeFilter}
                        />
                    );
                } else if (isFilterBarAttributeFilter(filterOrPlaceholder)) {
                    const { filter, filterIndex } = filterOrPlaceholder;
                    const convertedFilter = supportElementUris
                        ? filter
                        : convertDashboardAttributeFilterElementsUrisToValues(filter);
                    const CustomAttributeFilterComponent =
                        AttributeFilterComponentSet.MainComponentProvider(convertedFilter);
                    const attributeFilterMode = attributeFiltersModeMap.get(
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

                    return (
                        <DraggableAttributeFilter
                            key={`${objRefToString(displayForm.attribute)}-${
                                filter.attributeFilter.localIdentifier
                            }`}
                            autoOpen={areObjRefsEqual(filter.attributeFilter.displayForm, autoOpenFilter)}
                            filter={filter}
                            filterIndex={filterIndex}
                            readonly={
                                attributeFilterMode === DashboardAttributeFilterConfigModeValues.READONLY
                            }
                            FilterComponent={CustomAttributeFilterComponent}
                            onAttributeFilterChanged={onAttributeFilterChanged}
                            onAttributeFilterAdded={addAttributeFilterPlaceholder}
                            onAttributeFilterClose={onCloseAttributeFilter}
                        />
                    );
                } else {
                    if (filterOrPlaceholder.filter.dateFilter.dataSet) {
                        const { filter, filterIndex } = filterOrPlaceholder;

                        const CustomDateFilterComponent = DashboardDateFilterComponentProvider(filter);

                        const dateFilterMode =
                            dateFiltersModeMap.get(serializeObjRef(filter.dateFilter.dataSet!)) ||
                            DashboardDateFilterConfigModeValues.ACTIVE;

                        if (dateFilterMode === DashboardDateFilterConfigModeValues.HIDDEN) {
                            return null;
                        }

                        const defaultDateFilterName = allDateDatasets.find((ds) =>
                            areObjRefsEqual(ds.dataSet.ref, filter.dateFilter.dataSet),
                        )!.dataSet.title;

                        return (
                            <DraggableDateFilter
                                key={objRefToString(filterOrPlaceholder.filter.dateFilter.dataSet)}
                                autoOpen={areObjRefsEqual(
                                    filterOrPlaceholder.filter.dateFilter.dataSet,
                                    autoOpenFilter,
                                )}
                                filter={filter}
                                filterIndex={filterIndex}
                                config={{
                                    ...commonDateFilterComponentConfig,
                                    customFilterName: defaultDateFilterName,
                                }}
                                readonly={dateFilterMode === DashboardDateFilterConfigModeValues.READONLY}
                                FilterComponent={CustomDateFilterComponent}
                                onDateFilterChanged={onDateFilterChanged}
                                onDateFilterAdded={addAttributeFilterPlaceholder}
                                onDateFilterClose={onCloseAttributeFilter}
                            />
                        );
                    }
                }
            })}
            {canAddMoreFilters ? (
                <AttributeFilterDropZone
                    targetIndex={attributeFiltersCount}
                    onDrop={addAttributeFilterPlaceholder}
                />
            ) : null}
            <ResetFiltersButton />
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
