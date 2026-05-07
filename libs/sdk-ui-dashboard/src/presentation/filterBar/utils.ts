// (C) 2023-2026 GoodData Corporation

import { type IntlShape } from "react-intl";

import {
    type DashboardAttributeFilterConfigMode,
    DashboardAttributeFilterConfigModeValues,
    type DashboardDateFilterConfigMode,
    DashboardDateFilterConfigModeValues,
    dashboardAttributeFilterItemLocalIdentifier,
    dashboardFilterLocalIdentifier,
    serializeObjRef,
} from "@gooddata/sdk-model";
import { type IFilterButtonCustomIcon, type VisibilityMode } from "@gooddata/sdk-ui-filters";

import { messages } from "../../locales.js";
import {
    type FilterBarDraggableItems,
    type FilterBarItem,
    isFilterBarAttributeFilter,
    isFilterBarDateFilterWithDimension,
    isFilterBarFilterPlaceholder,
    isFilterBarMeasureValueFilter,
} from "./filterBar/useFiltersWithAddedPlaceholder.js";

const VISIBILITY_BUBBLE_SETTINGS = {
    bubbleClassNames: "gd-filter-button-custom-icon-bubble s-gd-filter-button-custom-icon-bubble",
};

export const getVisibilityIcon = (
    mode: VisibilityMode | undefined,
    isInEditMode: boolean,
    supportsHiddenAndLockedFiltersOnUI: boolean,
    intl: IntlShape,
): IFilterButtonCustomIcon | undefined => {
    if (!supportsHiddenAndLockedFiltersOnUI) {
        return undefined;
    }

    if (mode === DashboardDateFilterConfigModeValues.HIDDEN) {
        return {
            ...VISIBILITY_BUBBLE_SETTINGS,
            icon: "gd-icon-invisible s-gd-icon-invisible",
            tooltip: intl.formatMessage(messages.filterHiddenTooltip),
        };
    }

    if (mode === DashboardDateFilterConfigModeValues.READONLY) {
        return {
            ...VISIBILITY_BUBBLE_SETTINGS,
            icon: "gd-icon-lock s-gd-icon-lock",
            tooltip: intl.formatMessage(
                isInEditMode
                    ? messages.filterReadonlyInEditModeTooltip
                    : messages.filterReadonlyInViewModeTooltip,
            ),
        };
    }

    return undefined;
};

export const areAllFiltersHidden = (
    draggableFilters: FilterBarDraggableItems,
    effectedDateFilterMode: DashboardDateFilterConfigMode,
    effectedAttributeFiltersModeMap: Map<string, DashboardAttributeFilterConfigMode>,
    effectedDateFiltersModeMap: Map<string, DashboardDateFilterConfigMode>,
    effectedMeasureValueFiltersModeMap: Map<string, DashboardAttributeFilterConfigMode> = new Map(),
) => {
    const isCommonDateFilterHidden = effectedDateFilterMode === DashboardDateFilterConfigModeValues.HIDDEN;

    const areAllDraggableFiltersHidden = draggableFilters.every((it) => {
        if (isFilterBarDateFilterWithDimension(it)) {
            return isDateFilterHidden(it, effectedDateFiltersModeMap);
        } else if (isFilterBarMeasureValueFilter(it)) {
            return isMeasureValueFilterHidden(it, effectedMeasureValueFiltersModeMap);
        } else {
            return isAttributeFilterHidden(it, effectedAttributeFiltersModeMap);
        }
    });

    return isCommonDateFilterHidden && areAllDraggableFiltersHidden;
};

const isMeasureValueFilterHidden = (
    filter: FilterBarItem,
    effectedMeasureValueFiltersModeMap: Map<string, DashboardAttributeFilterConfigMode>,
) => {
    if (isFilterBarFilterPlaceholder(filter)) {
        return false;
    }
    if (isFilterBarMeasureValueFilter(filter)) {
        const localId = dashboardFilterLocalIdentifier(filter.filter)!;
        const measureValueFilterMode = effectedMeasureValueFiltersModeMap.get(localId);
        return measureValueFilterMode === DashboardAttributeFilterConfigModeValues.HIDDEN;
    }
    return false;
};

const isAttributeFilterHidden = (
    filter: FilterBarItem,
    effectedAttributeFiltersModeMap: Map<string, DashboardAttributeFilterConfigMode>,
) => {
    if (isFilterBarFilterPlaceholder(filter)) {
        return false;
    }
    if (isFilterBarAttributeFilter(filter)) {
        const localId = dashboardAttributeFilterItemLocalIdentifier(filter.filter);
        const attributeFilterMode = effectedAttributeFiltersModeMap.get(localId!);
        return attributeFilterMode === DashboardAttributeFilterConfigModeValues.HIDDEN;
    }
    return false;
};

const isDateFilterHidden = (
    filter: FilterBarItem,
    dateFiltersModeMap: Map<string, DashboardDateFilterConfigMode>,
) => {
    if (isFilterBarFilterPlaceholder(filter)) {
        return false;
    }
    if (isFilterBarDateFilterWithDimension(filter)) {
        const dateFilterMode = dateFiltersModeMap.get(serializeObjRef(filter.filter.dateFilter.dataSet!));
        return dateFilterMode === DashboardDateFilterConfigModeValues.HIDDEN;
    }
    return false;
};
