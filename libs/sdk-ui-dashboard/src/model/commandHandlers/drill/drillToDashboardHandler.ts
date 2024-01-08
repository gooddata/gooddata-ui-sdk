// (C) 2021-2024 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import compact from "lodash/compact.js";
import isEmpty from "lodash/isEmpty.js";
import { invariant } from "ts-invariant";
import { DashboardContext } from "../../types/commonTypes.js";
import { DrillToDashboard } from "../../commands/drill.js";
import {
    DashboardDrillToDashboardResolved,
    drillToDashboardRequested,
    drillToDashboardResolved,
} from "../../events/drill.js";
import {
    selectFilterContextAttributeFilters,
    selectFilterContextDateFilter,
} from "../../store/filterContext/filterContextSelectors.js";
import { selectAnalyticalWidgetByRef } from "../../store/layout/layoutSelectors.js";
import { IDashboardFilter } from "../../../types.js";
import { dashboardAttributeFilterToAttributeFilter } from "../../../converters/index.js";
import {
    areObjRefsEqual,
    IDashboardAttributeFilter,
    IInsight,
    insightMeasures,
    isSimpleMeasure,
    measureFilters,
    isDateFilter,
    IInsightWidget,
    IFilter,
    IAttributeFilter,
    IDashboardDateFilter,
    newAllTimeDashboardDateFilter,
} from "@gooddata/sdk-model";
import { selectCatalogDateAttributes } from "../../store/catalog/catalogSelectors.js";
import { selectInsightByRef } from "../../store/insights/insightsSelectors.js";
import { DashboardState } from "../../store/types.js";
import { convertIntersectionToAttributeFilters } from "./common/intersectionUtils.js";

export function* drillToDashboardHandler(
    ctx: DashboardContext,
    cmd: DrillToDashboard,
): SagaIterator<DashboardDrillToDashboardResolved> {
    // put start event
    yield put(
        drillToDashboardRequested(
            ctx,
            cmd.payload.drillDefinition,
            cmd.payload.drillEvent,
            cmd.correlationId,
        ),
    );

    // decide if we should use date filter (only if enabled and connected to a dataset)
    const widget: IInsightWidget = yield select(
        selectAnalyticalWidgetByRef(cmd.payload.drillEvent.widgetRef!),
    );
    const insight: IInsight = yield select(selectInsightByRef(widget.insight));

    // if this bombs, widget is not an insight widget and something is seriously wrong
    invariant(insight);

    const shouldUseDateFilter = !!widget.dateDataSet && !isDateFilterDisabled(insight);
    // widget's dateDataSet is not needed in common date filter because target dashboard widget's will use their own dateDataSet
    const commonDateFilter: ReturnType<typeof selectDrillingDateFilter> = shouldUseDateFilter
        ? yield select(selectDrillingDateFilter)
        : undefined;

    // get proper attr filters
    const isDrillingToSelf = areObjRefsEqual(ctx.dashboardRef, cmd.payload.drillDefinition.target);

    // TODO INE: place where to add other date filters
    const dashboardFilters = isDrillingToSelf
        ? // if drilling to self, just take all filters
          yield select(selectAllAttributeFilters)
        : // if drilling to other, resolve widget filter ignores
          yield call(getWidgetAwareAttributeFilters, ctx, widget);

    const dateAttributes: ReturnType<typeof selectCatalogDateAttributes> = yield select(
        selectCatalogDateAttributes,
    );
    const drillIntersectionFilters = convertIntersectionToAttributeFilters(
        cmd.payload.drillEvent.drillContext.intersection!,
        dateAttributes.map((dA) => dA.attribute.ref),
        ctx.backend.capabilities.supportsElementUris ?? true,
    );

    // concat everything, order is important – drill filters must go first
    const resultingFilters = compact([commonDateFilter, ...drillIntersectionFilters, ...dashboardFilters]);

    // put end event
    return drillToDashboardResolved(
        ctx,
        resultingFilters,
        cmd.payload.drillDefinition,
        cmd.payload.drillEvent,
        cmd.correlationId,
    );
}

// result needs to be IDashboardDateFilter to allow optional dateDataSet
function selectDrillingDateFilter(state: DashboardState): IDashboardDateFilter {
    const globalDateFilter = selectFilterContextDateFilter(state);

    return globalDateFilter ?? newAllTimeDashboardDateFilter();
}

function selectAllAttributeFilters(state: DashboardState): IDashboardAttributeFilter[] {
    return selectFilterContextAttributeFilters(state);
}

function* getWidgetAwareAttributeFilters(
    ctx: DashboardContext,
    widget: IInsightWidget,
): SagaIterator<IAttributeFilter[]> {
    const filterContextItems: ReturnType<typeof selectFilterContextAttributeFilters> = yield select(
        selectFilterContextAttributeFilters,
    );

    const filters = filterContextItems.map(dashboardAttributeFilterToAttributeFilter);

    return yield call(getResolvedFiltersForWidget, ctx, widget, filters);
}

function isDateFilterDisabled(insight: IInsight): boolean {
    const measures = insightMeasures(insight);

    return isEmpty(measures)
        ? false
        : measures.every((measure) => {
              if (isSimpleMeasure(measure)) {
                  const filters = measureFilters(measure);
                  return !!filters?.some(isDateFilter);
              }
              return true;
          });
}

function getResolvedFiltersForWidget(
    ctx: DashboardContext,
    widget: IInsightWidget,
    filters: IDashboardFilter[],
): Promise<IFilter[]> {
    return ctx.backend.workspace(ctx.workspace).dashboards().getResolvedFiltersForWidget(widget, filters);
}
