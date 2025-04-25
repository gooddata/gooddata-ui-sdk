// (C) 2025 GoodData Corporation

import { useMemo } from "react";
import {
    FilterContextItem,
    filterLocalIdentifier,
    IAutomationVisibleFilter,
    IFilter,
    isInsightWidget,
} from "@gooddata/sdk-model";
import compact from "lodash/compact.js";
import { filterContextItemsToAutomationDashboardFiltersByWidget } from "../../converters/index.js";
import { getFilterLocalIdentifier, getVisibleFiltersByFilters } from "./utils.js";
import { ExtendedDashboardWidget } from "../../model/index.js";

interface IUseAutomationWidgetFilters {
    insightExecutionFilters: IFilter[];
    dashboardExecutionFilters: IFilter[];
    visibleWidgetFilters?: IAutomationVisibleFilter[] | undefined;
}

/**
 * Logic to prepare automation filters for widget.
 */
export const useAutomationWidgetFilters = ({
    widget,
    allDashboardFilters = [],
    automationFilters = [],
    widgetFilters,
    allVisibleFiltersMetadata,
}: {
    widget: ExtendedDashboardWidget | undefined;
    allDashboardFilters?: FilterContextItem[];
    automationFilters?: FilterContextItem[];
    widgetFilters?: IFilter[] | undefined;
    allVisibleFiltersMetadata?: IAutomationVisibleFilter[] | undefined;
}): IUseAutomationWidgetFilters => {
    const visibleFilters = useMemo(
        () => getVisibleFiltersByFilters(automationFilters, allVisibleFiltersMetadata),
        [automationFilters, allVisibleFiltersMetadata],
    );

    const dashboardFiltersLocalIdentifiers = useMemo(
        () => compact(allDashboardFilters.map(getFilterLocalIdentifier)),
        [allDashboardFilters],
    );

    const insightExecutionFilters = useMemo(
        () =>
            (widgetFilters ?? []).filter((filter) => {
                const localIdentifier = filterLocalIdentifier(filter);
                return localIdentifier ? !dashboardFiltersLocalIdentifiers.includes(localIdentifier) : false;
            }),
        [dashboardFiltersLocalIdentifiers, widgetFilters],
    );

    const dashboardExecutionFilters = isInsightWidget(widget)
        ? filterContextItemsToAutomationDashboardFiltersByWidget(automationFilters, widget)
        : [];

    return {
        insightExecutionFilters,
        dashboardExecutionFilters,
        visibleWidgetFilters: visibleFilters,
    };
};
