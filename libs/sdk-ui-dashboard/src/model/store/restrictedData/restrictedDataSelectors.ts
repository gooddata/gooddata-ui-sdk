// (C) 2026 GoodData Corporation

import { createSelector, lruMemoize } from "@reduxjs/toolkit";
import stringify from "json-stable-stringify";

import {
    type IDashboardFilter,
    type IFilter,
    type IInsight,
    type ObjRef,
    insightFilters,
    insightRef,
    isInsightWidget,
} from "@gooddata/sdk-model";

import { type FilterableDashboardWidget } from "../../types/layoutTypes.js";
import { resolveWidgetDashboardFilters } from "../../utils/widgetFilters.js";
import { createMemoizedSelector } from "../_infra/selectors.js";
import { selectInsightByWidgetRef } from "../insights/insightsSelectors.js";
import { selectAttributeFilterConfigsDisplayAsLabelMap } from "../tabs/attributeFilterConfigs/attributeFilterConfigsSelectors.js";
import {
    selectAllFiltersForWidgetByRefAcrossTabs,
    selectFilterableWidgetByRef,
} from "../tabs/layout/layoutSelectors.js";
import { resolveEffectiveParameterValuesForRoots } from "../tabs/parameters/parametersHelpers.js";
import { selectWidgetParameterContext } from "../tabs/parameters/parametersSelectors.js";
import { type DashboardSelector, type DashboardState } from "../types.js";

// the dashboard filters the widget's execution applies
function resolveExecutedDashboardFilters(
    widgetAwareFilters: [IDashboardFilter[], IDashboardFilter[]],
    widget: FilterableDashboardWidget | undefined,
    displayAsLabelMap: Map<string, ObjRef>,
    insight: IInsight | undefined,
): IFilter[] {
    if (!widget) {
        return widgetAwareFilters.flat();
    }
    const { dateFilters, attributeFilters, measureValueFilters } = resolveWidgetDashboardFilters(
        widget,
        widgetAwareFilters,
        displayAsLabelMap,
        insight ? insightFilters(insight) : [],
    );
    return [...dateFilters.map(({ filter }) => filter), ...attributeFilters, ...measureValueFilters];
}

/**
 * Identifies what the widget with the given ref executes: its insight with the widget's own
 * visualization properties, the dashboard filters it does not ignore and the parameter values its
 * insight depends on, resolved the same way as for its execution.
 *
 * @internal
 */
export const selectWidgetExecutionInputsKey: (ref: ObjRef) => DashboardSelector<string> =
    createMemoizedSelector((ref: ObjRef) =>
        createSelector(
            selectAllFiltersForWidgetByRefAcrossTabs(ref),
            selectFilterableWidgetByRef(ref),
            selectAttributeFilterConfigsDisplayAsLabelMap,
            selectWidgetParameterContext(ref),
            selectInsightByWidgetRef(ref),
            (filters, widget, displayAsLabelMap, parameterContext, insight) =>
                stringify({
                    // a replaced or updated visualization executes again, even under the same ref
                    insight: insight?.insight,
                    widgetProperties: isInsightWidget(widget) ? widget.properties : undefined,
                    filters: resolveExecutedDashboardFilters(filters, widget, displayAsLabelMap, insight),
                    parameters: insight
                        ? resolveEffectiveParameterValuesForRoots(
                              parameterContext,
                              [insightRef(insight)],
                              insight,
                          )
                        : [],
                }) ?? "",
        ),
    );

const NO_WIDGET_IDS: string[] = [];

const selectRefusedExecutions = (state: DashboardState) => state.restrictedData.refusedExecutions;

const selectWidgetIdsRefusedWithCurrentInputs = (state: DashboardState): string[] => {
    const refusedExecutions = Object.entries(selectRefusedExecutions(state));
    return refusedExecutions.length === 0
        ? NO_WIDGET_IDS
        : refusedExecutions
              .filter(([, { ref, inputsKey }]) => selectWidgetExecutionInputsKey(ref)(state) === inputsKey)
              .map(([id]) => id);
};

const haveSameWidgetIds = (first: readonly string[], second: readonly string[]): boolean =>
    first.length === second.length && first.every((id, index) => id === second[index]);

/**
 * Selects the widgets whose execution was refused because the current user may not read some of
 * the data, as serialized widget refs. A widget stays in it while its insight, its own filters and its
 * parameters are the ones it was refused with; once any of them changes, it executes again.
 *
 * @internal
 */
export const selectWidgetsWithRestrictedData: DashboardSelector<ReadonlySet<string>> = createSelector(
    selectWidgetIdsRefusedWithCurrentInputs,
    (ids): ReadonlySet<string> => new Set(ids),
    // the same set while the restricted widgets stay the same, so other updates do not re-render its users
    { memoize: lruMemoize, memoizeOptions: { equalityCheck: haveSameWidgetIds } },
);
