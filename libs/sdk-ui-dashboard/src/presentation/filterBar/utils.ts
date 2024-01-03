// (C) 2023 GoodData Corporation
import { IntlShape } from "react-intl";
import { IFilterButtonCustomIcon, VisibilityMode } from "@gooddata/sdk-ui-filters";
import {
    DashboardAttributeFilterConfigMode,
    DashboardAttributeFilterConfigModeValues,
    DashboardDateFilterConfigMode,
    DashboardDateFilterConfigModeValues,
} from "@gooddata/sdk-model";

import { messages } from "../../locales.js";
import {
    FilterBarAttributeItem,
    FilterBarAttributeItems,
    isFilterBarAttributeFilterPlaceholder,
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
    attributeFilters: FilterBarAttributeItems,
    effectedDateFilterMode: DashboardDateFilterConfigMode,
    effectedAttributeFiltersModeMap: Map<string, DashboardAttributeFilterConfigMode>,
) => {
    const isDateFilterHidden = effectedDateFilterMode === DashboardDateFilterConfigModeValues.HIDDEN;
    const areAllAttributeFiltersHidden = attributeFilters.every((it) =>
        isAttributeFilterHidden(it, effectedAttributeFiltersModeMap),
    );

    return isDateFilterHidden && areAllAttributeFiltersHidden;
};

const isAttributeFilterHidden = (
    attributeFilter: FilterBarAttributeItem,
    effectedAttributeFiltersModeMap: Map<string, DashboardAttributeFilterConfigMode>,
) => {
    if (isFilterBarAttributeFilterPlaceholder(attributeFilter)) {
        return false;
    }

    const attributeFilterMode = effectedAttributeFiltersModeMap.get(
        attributeFilter.filter.attributeFilter.localIdentifier!,
    );
    return attributeFilterMode === DashboardAttributeFilterConfigModeValues.HIDDEN;
};
