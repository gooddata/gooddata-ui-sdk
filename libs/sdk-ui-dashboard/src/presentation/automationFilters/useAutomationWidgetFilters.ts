// (C) 2025 GoodData Corporation

import { useMemo } from "react";
import {
    FilterContextItem,
    filterLocalIdentifier,
    IAutomationVisibleFilter,
    IFilter,
    IInsightWidget,
    isInsightWidget,
} from "@gooddata/sdk-model";
import compact from "lodash/compact.js";
import { filterContextItemsToDashboardFiltersByWidget } from "../../converters/index.js";
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
    allDashboardFilters,
    widgetFilters,
    allVisibleFiltersMetadata,
    enableAutomationFilterContext,
}: {
    widget: ExtendedDashboardWidget | undefined;
    allDashboardFilters?: FilterContextItem[] | undefined;
    widgetFilters?: IFilter[] | undefined;
    allVisibleFiltersMetadata?: IAutomationVisibleFilter[] | undefined;
    enableAutomationFilterContext?: boolean;
}): IUseAutomationWidgetFilters => {
    const visibleFilters = useMemo(
        () => getVisibleFiltersByFilters(allDashboardFilters, allVisibleFiltersMetadata),
        [allDashboardFilters, allVisibleFiltersMetadata],
    );

    const dashboardFiltersLocalIdentifiers = useMemo(
        () => compact((allDashboardFilters ?? []).map(getFilterLocalIdentifier)),
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
        ? filterContextItemsToDashboardFiltersByWidget(allDashboardFilters ?? [], widget as IInsightWidget)
        : [];

    // When FF is off, return widget filters for previous experience
    if (!enableAutomationFilterContext) {
        return {
            insightExecutionFilters: widgetFilters ?? [],
            dashboardExecutionFilters: [],
            visibleWidgetFilters: undefined,
        };
    }

    return {
        insightExecutionFilters,
        dashboardExecutionFilters,
        visibleWidgetFilters: visibleFilters,
    };
};
