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
import { ExtendedDashboardWidget, useAutomationAvailableDashboardFilters } from "../../model/index.js";

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
    automationFilters = [],
    widgetFilters,
    allVisibleFiltersMetadata,
}: {
    widget: ExtendedDashboardWidget | undefined;
    automationFilters?: FilterContextItem[];
    widgetFilters?: IFilter[] | undefined;
    allVisibleFiltersMetadata?: IAutomationVisibleFilter[] | undefined;
}): IUseAutomationWidgetFilters => {
    const availableDashboardFilters = useAutomationAvailableDashboardFilters();

    // Pair visible filters metadata with the filters that are currently selected
    const visibleFilters = useMemo(
        () => getVisibleFiltersByFilters(automationFilters, allVisibleFiltersMetadata),
        [automationFilters, allVisibleFiltersMetadata],
    );

    // Get local identifiers of all selectable dashboard filters
    const dashboardFiltersLocalIdentifiers = useMemo(
        () => compact((availableDashboardFilters ?? []).map(getFilterLocalIdentifier)),
        [availableDashboardFilters],
    );

    // Widget automation filters, that are originated from the widget filters (not present on the dashboard)
    const insightExecutionFilters = useMemo(
        () =>
            (widgetFilters ?? []).filter((filter) => {
                const localIdentifier = filterLocalIdentifier(filter);
                return localIdentifier ? !dashboardFiltersLocalIdentifiers.includes(localIdentifier) : false;
            }),
        [dashboardFiltersLocalIdentifiers, widgetFilters],
    );

    // Widget automation filters, that are originated from the dashboard filters
    const dashboardExecutionFilters = isInsightWidget(widget)
        ? filterContextItemsToAutomationDashboardFiltersByWidget(automationFilters, widget)
        : [];

    return {
        insightExecutionFilters,
        dashboardExecutionFilters,
        visibleWidgetFilters: visibleFilters,
    };
};
