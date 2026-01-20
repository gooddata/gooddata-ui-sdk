// (C) 2021-2026 GoodData Corporation

import { type ReactNode } from "react";

import { invariant } from "ts-invariant";

import {
    DashboardAttributeFilterConfigModeValues,
    DashboardDateFilterConfigModeValues,
    type ObjRef,
    areObjRefsEqual,
    objRefToString,
    serializeObjRef,
} from "@gooddata/sdk-model";

import {
    type FilterBarItem,
    isFilterBarAttributeFilter,
    isFilterBarFilterGroupItem,
    isFilterBarFilterPlaceholder,
} from "./useFiltersWithAddedPlaceholder.js";
import { convertDashboardAttributeFilterElementsUrisToValues } from "../../../_staging/dashboard/legacyFilterConvertors.js";
import {
    selectAttributeFilterConfigsDisplayAsLabelMap,
    selectAttributeFilterDisplayFormsMap,
    selectCatalogAttributes,
    selectCatalogDateDatasets,
    selectCrossFilteringFiltersLocalIdentifiers,
    selectEffectiveAttributeFiltersModeMap,
    selectEffectiveDateFilterAvailableGranularities,
    selectEffectiveDateFilterOptions,
    selectEffectiveDateFiltersModeMap,
    selectEnableDashboardFilterGroups,
    selectIsApplyFiltersAllAtOnceEnabledAndSet,
    selectIsWorkingFilterContextChanged,
    selectSupportsElementUris,
    useDashboardSelector,
} from "../../../model/index.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";
import { DraggableAttributeFilter, DraggableDateFilter } from "../../dragAndDrop/index.js";
import { type IDashboardDateFilterConfig, type IFilterBarProps } from "../types.js";
import { DashboardFilterGroup } from "./DashboardFilterGroup.js";

/**
 * @alpha
 */
export interface IFilterBarItemProps extends IFilterBarProps {
    item: FilterBarItem;
    autoOpenFilter: ObjRef | undefined;
    addDraggableFilterPlaceholder: (index: number) => void;
    selectDraggableFilter: (displayForm: ObjRef) => void;
    closeAttributeSelection: () => void;
    onCloseAttributeFilter: () => void;
}

/**
 * @alpha
 */
export function DefaultFilterBarItem(props: IFilterBarItemProps): ReactNode {
    const {
        item,
        autoOpenFilter,
        onAttributeFilterChanged,
        onDateFilterChanged,
        addDraggableFilterPlaceholder,
        closeAttributeSelection,
        selectDraggableFilter,
        onCloseAttributeFilter,
    } = props;

    const availableGranularities = useDashboardSelector(selectEffectiveDateFilterAvailableGranularities);
    const dateFilterOptions = useDashboardSelector(selectEffectiveDateFilterOptions);
    const attributeFiltersModeMap = useDashboardSelector(selectEffectiveAttributeFiltersModeMap);
    const attributeFiltersDisplayAsLabelMap = useDashboardSelector(
        selectAttributeFilterConfigsDisplayAsLabelMap,
    );
    const dateFiltersModeMap = useDashboardSelector(selectEffectiveDateFiltersModeMap);
    const allDateDatasets = useDashboardSelector(selectCatalogDateDatasets);
    const attributes = useDashboardSelector(selectCatalogAttributes);

    const { AttributeFilterComponentSet, DashboardDateFilterComponentProvider } =
        useDashboardComponentsContext();
    const supportElementUris = useDashboardSelector(selectSupportsElementUris);
    const displayFormsMap = useDashboardSelector(selectAttributeFilterDisplayFormsMap);

    const crossFilterLocalIds = useDashboardSelector(selectCrossFilteringFiltersLocalIdentifiers);
    const isWorkingFilterContextChanged = useDashboardSelector(selectIsWorkingFilterContextChanged);
    const isApplyAllAtOnceEnabledAndSet = useDashboardSelector(selectIsApplyFiltersAllAtOnceEnabledAndSet);
    const enableDashboardFilterGroups = useDashboardSelector(selectEnableDashboardFilterGroups);

    const commonDateFilterComponentConfig: IDashboardDateFilterConfig = {
        availableGranularities,
        dateFilterOptions,
    };

    if (isFilterBarFilterPlaceholder(item)) {
        const CreatingPlaceholderComponent =
            AttributeFilterComponentSet.creating.CreatingPlaceholderComponent!;
        return (
            <CreatingPlaceholderComponent
                key={item.filterIndex}
                onClose={closeAttributeSelection}
                onSelect={selectDraggableFilter}
                attributes={attributes}
                dateDatasets={allDateDatasets}
            />
        );
    }

    if (isFilterBarFilterGroupItem(item)) {
        if (!enableDashboardFilterGroups) {
            return null;
        }
        return <DashboardFilterGroup item={item} onAttributeFilterChanged={onAttributeFilterChanged} />;
    }

    if (isFilterBarAttributeFilter(item)) {
        const { filter, filterIndex, workingFilter } = item;
        const convertedFilter = supportElementUris
            ? filter
            : convertDashboardAttributeFilterElementsUrisToValues(filter);
        const CustomAttributeFilterComponent =
            AttributeFilterComponentSet.MainComponentProvider(convertedFilter);
        const attributeFilterMode = attributeFiltersModeMap.get(filter.attributeFilter.localIdentifier!);
        const displayAsLabel = attributeFiltersDisplayAsLabelMap.get(filter.attributeFilter.localIdentifier!);

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
            isApplyAllAtOnceEnabledAndSet
        ) {
            return null;
        }

        return (
            <DraggableAttributeFilter
                key={`${objRefToString(displayForm.attribute)}-${filter.attributeFilter.localIdentifier}`}
                autoOpen={areObjRefsEqual(filter.attributeFilter.displayForm, autoOpenFilter)}
                filter={filter}
                workingFilter={isApplyAllAtOnceEnabledAndSet ? workingFilter : undefined}
                filterIndex={filterIndex}
                readonly={attributeFilterMode === DashboardAttributeFilterConfigModeValues.READONLY}
                displayAsLabel={displayAsLabel}
                FilterComponent={CustomAttributeFilterComponent}
                onAttributeFilterChanged={onAttributeFilterChanged}
                onAttributeFilterAdded={addDraggableFilterPlaceholder}
                onAttributeFilterClose={onCloseAttributeFilter}
            />
        );
    }

    if (item.filter.dateFilter.dataSet) {
        const { filter, workingFilter, filterIndex } = item;

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
                key={objRefToString(item.filter.dateFilter.dataSet)}
                autoOpen={areObjRefsEqual(item.filter.dateFilter.dataSet, autoOpenFilter)}
                filter={filter}
                workingFilter={isApplyAllAtOnceEnabledAndSet ? workingFilter : undefined}
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
