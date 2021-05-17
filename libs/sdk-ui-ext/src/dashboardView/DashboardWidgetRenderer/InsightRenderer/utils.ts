// (C) 2020-2021 GoodData Corporation
import { IWidgetDefinition } from "@gooddata/sdk-backend-spi";
import {
    IFilter,
    IInsight,
    insightMeasures,
    isDateFilter,
    isSimpleMeasure,
    measureFilters,
    newAllTimeFilter,
} from "@gooddata/sdk-model";
import { hasDateFilterForDateDataset } from "../../../internal";

export function addImplicitAllTimeFilter(widget: IWidgetDefinition, resolvedFilters: IFilter[]): IFilter[] {
    // if the widget is connected to a dateDataset and has no date filters for it in the context,
    // add an implicit All time filter for that dimension - this will cause the InsightView to ignore
    // any date filters on that dimension - this is how KPI dashboards behave
    if (widget.dateDataSet && !hasDateFilterForDateDataset(resolvedFilters, widget.dateDataSet)) {
        return [...resolvedFilters, newAllTimeFilter(widget.dateDataSet)];
    }
    return resolvedFilters;
}

/**
 * Tests whether dashboard's date filter should not be applied on the insight included in the provided widget.
 *
 * This should happen for insights whose simple measures are all already set up with date filters. I guess ignoring
 * global date filter is desired because otherwise there is a large chance that the intersection of global date filter
 * and measure's date filters would lead to empty set and no data shown for the insight?
 */
export function isDateFilterIgnoredForInsight(insight: IInsight): boolean {
    const simpleMeasures = insightMeasures(insight, isSimpleMeasure);

    if (simpleMeasures.length === 0) {
        return false;
    }

    const simpleMeasuresWithDateFilter = simpleMeasures.filter((m) =>
        (measureFilters(m) ?? []).some(isDateFilter),
    );

    return simpleMeasures.length === simpleMeasuresWithDateFilter.length;
}
