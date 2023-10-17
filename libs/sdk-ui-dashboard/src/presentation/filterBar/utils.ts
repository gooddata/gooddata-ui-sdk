// (C) 2023 GoodData Corporation
import { IntlShape } from "react-intl";
import { messages } from "../../locales.js";
import { IFilterButtonCustomIcon, VisibilityMode } from "@gooddata/sdk-ui-filters";
import { DashboardDateFilterConfigModeValues } from "@gooddata/sdk-model";

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
            icon: "gd-icon-invisible",
            tooltip: intl.formatMessage(messages.filterHiddenTooltip),
        };
    }

    if (mode === DashboardDateFilterConfigModeValues.READONLY) {
        return {
            ...VISIBILITY_BUBBLE_SETTINGS,
            icon: "gd-icon-lock",
            tooltip: intl.formatMessage(
                isInEditMode
                    ? messages.filterReadonlyInEditModeTooltip
                    : messages.filterReadonlyInViewModeTooltip,
            ),
        };
    }
};
