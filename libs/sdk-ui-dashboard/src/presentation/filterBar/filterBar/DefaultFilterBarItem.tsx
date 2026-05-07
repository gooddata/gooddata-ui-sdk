// (C) 2021-2026 GoodData Corporation

import { type ReactNode } from "react";

import { invariant } from "ts-invariant";

import {
    DashboardAttributeFilterConfigModeValues,
    DashboardDateFilterConfigModeValues,
    type ObjRef,
    areObjRefsEqual,
    dashboardAttributeFilterItemDisplayForm,
    dashboardAttributeFilterItemLocalIdentifier,
    isDashboardAttributeFilter,
    objRefToString,
    serializeObjRef,
} from "@gooddata/sdk-model";

import { convertDashboardAttributeFilterElementsUrisToValues } from "../../../_staging/dashboard/legacyFilterConvertors.js";
import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectSupportsElementUris } from "../../../model/store/backendCapabilities/backendCapabilitiesSelectors.js";
import {
    selectCatalogAttributes,
    selectCatalogDateDatasets,
    selectCatalogMeasures,
} from "../../../model/store/catalog/catalogSelectors.js";
import {
    selectEnableDashboardFilterGroups,
    selectIsApplyFiltersAllAtOnceEnabledAndSet,
} from "../../../model/store/config/configSelectors.js";
import { selectCrossFilteringFiltersLocalIdentifiers } from "../../../model/store/drill/drillSelectors.js";
import {
    selectAttributeFilterConfigsDisplayAsLabelMap,
    selectEffectiveAttributeFiltersModeMap,
} from "../../../model/store/tabs/attributeFilterConfigs/attributeFilterConfigsSelectors.js";
import {
    selectEffectiveDateFilterAvailableGranularities,
    selectEffectiveDateFilterOptions,
} from "../../../model/store/tabs/dateFilterConfig/dateFilterConfigSelectors.js";
import { selectEffectiveDateFiltersModeMap } from "../../../model/store/tabs/dateFilterConfigs/dateFilterConfigsSelectors.js";
import {
    selectAttributeFilterDisplayFormsMap,
    selectIsWorkingFilterContextChanged,
} from "../../../model/store/tabs/filterContext/filterContextSelectors.js";
import { selectEffectiveMeasureValueFiltersModeMap } from "../../../model/store/tabs/measureValueFilterConfigs/measureValueFilterConfigsSelectors.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/DashboardComponentsContext.js";
import { DraggableAttributeFilter } from "../../dragAndDrop/draggableAttributeFilter/DraggableAttributeFilter.js";
import { DraggableDateFilter } from "../../dragAndDrop/draggableDateFilter/DraggableDateFilter.js";
import { DraggableMeasureValueFilter } from "../../dragAndDrop/draggableMeasureValueFilter/DraggableMeasureValueFilter.js";
import { type IDashboardDateFilterConfig } from "../dateFilter/types.js";
import { type DashboardFilterSelectionType } from "../filterSelectionTypes.js";
import { DefaultDashboardFilterGroup } from "./DefaultDashboardFilterGroup.js";
import { type IFilterBarProps } from "./types.js";
import {
    type FilterBarItem,
    isFilterBarAttributeFilter,
    isFilterBarFilterGroupItem,
    isFilterBarFilterPlaceholder,
    isFilterBarMeasureValueFilter,
} from "./useFiltersWithAddedPlaceholder.js";

/**
 * @alpha
 */
export interface IFilterBarItemProps extends IFilterBarProps {
    item: FilterBarItem;
    autoOpenFilter: ObjRef | undefined;
    addDraggableFilterPlaceholder: (index: number) => void;
    selectDraggableFilter: (ref: ObjRef, selectionType?: DashboardFilterSelectionType) => void;
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
        onMeasureValueFilterChanged,
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
    const measureValueFiltersModeMap = useDashboardSelector(selectEffectiveMeasureValueFiltersModeMap);
    const dateFiltersModeMap = useDashboardSelector(selectEffectiveDateFiltersModeMap);
    const allDateDatasets = useDashboardSelector(selectCatalogDateDatasets);
    const attributes = useDashboardSelector(selectCatalogAttributes);
    const measures = useDashboardSelector(selectCatalogMeasures);

    const {
        AttributeFilterComponentSet,
        DashboardDateFilterComponentProvider,
        DashboardMeasureValueFilterComponentProvider,
        DashboardFilterGroupComponentProvider,
    } = useDashboardComponentsContext();
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
                measures={measures}
            />
        );
    }

    if (isFilterBarFilterGroupItem(item)) {
        if (!enableDashboardFilterGroups) {
            return null;
        }
        const CustomFilterGroupComponent =
            DashboardFilterGroupComponentProvider?.(item.groupConfig) ?? DefaultDashboardFilterGroup;
        return (
            <CustomFilterGroupComponent
                groupItem={item}
                onAttributeFilterChanged={onAttributeFilterChanged}
            />
        );
    }

    if (isFilterBarAttributeFilter(item)) {
        const { filter, filterIndex, workingFilter } = item;

        const filterLocalId = dashboardAttributeFilterItemLocalIdentifier(filter);
        const filterDisplayForm = dashboardAttributeFilterItemDisplayForm(filter);

        // URI conversion only applies to standard element-based attribute filters
        const convertedFilter =
            supportElementUris || !isDashboardAttributeFilter(filter)
                ? filter
                : convertDashboardAttributeFilterElementsUrisToValues(filter);
        const CustomAttributeFilterComponent =
            AttributeFilterComponentSet.MainComponentProvider(convertedFilter);
        const attributeFilterMode = attributeFiltersModeMap.get(filterLocalId!);
        const displayAsLabel = attributeFiltersDisplayAsLabelMap.get(filterLocalId!);

        /**
         * Use the attribute as key, not the display form.
         * This is to make sure we do not remount this when user changes the display form used:
         * it should just reload the elements, not close and remount the whole filter.
         *
         * This is fine because we do not allow multiple filters of the same attribute to be on
         * the same dashboard.
         */
        const convertedDisplayForm = dashboardAttributeFilterItemDisplayForm(convertedFilter);
        const displayForm = displayFormsMap.get(convertedDisplayForm!);
        invariant(displayForm, "inconsistent state, display form for a filter was not found");

        if (attributeFilterMode === DashboardAttributeFilterConfigModeValues.HIDDEN) {
            return null;
        }

        if (
            filterLocalId &&
            crossFilterLocalIds.includes(filterLocalId) &&
            isWorkingFilterContextChanged &&
            isApplyAllAtOnceEnabledAndSet
        ) {
            return null;
        }

        return (
            <DraggableAttributeFilter
                key={`${objRefToString(displayForm.attribute)}-${filterLocalId}`}
                autoOpen={areObjRefsEqual(filterDisplayForm, autoOpenFilter)}
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

    if (isFilterBarMeasureValueFilter(item)) {
        const { filter, filterIndex } = item;
        const { localIdentifier: localId, measure } = filter.dashboardMeasureValueFilter;

        if (!onMeasureValueFilterChanged) {
            return null;
        }

        const measureValueFilterMode =
            measureValueFiltersModeMap.get(localId) ?? DashboardAttributeFilterConfigModeValues.ACTIVE;
        const isHidden = measureValueFilterMode === DashboardAttributeFilterConfigModeValues.HIDDEN;
        const isReadonly = measureValueFilterMode === DashboardAttributeFilterConfigModeValues.READONLY;
        if (isHidden) {
            return null;
        }

        const CustomMeasureValueFilterComponent = DashboardMeasureValueFilterComponentProvider(filter);

        return (
            <DraggableMeasureValueFilter
                key={localId}
                autoOpen={areObjRefsEqual(measure, autoOpenFilter)}
                filter={filter}
                filterIndex={filterIndex}
                readonly={isReadonly}
                FilterComponent={CustomMeasureValueFilterComponent}
                onMeasureValueFilterChanged={onMeasureValueFilterChanged}
                onMeasureValueFilterAdded={addDraggableFilterPlaceholder}
                onMeasureValueFilterClose={onCloseAttributeFilter}
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
