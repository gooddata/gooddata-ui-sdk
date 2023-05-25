// (C) 2021-2023 GoodData Corporation
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
import {
    dashboardAttributeFilterToAttributeFilter,
    dashboardDateFilterToDateFilterByWidget,
} from "../../../converters/index.js";
import {
    DrillEventIntersectionElementHeader,
    IDrillEventIntersectionElement,
    IDrillIntersectionAttributeItem,
    isDrillIntersectionAttributeItem,
} from "@gooddata/sdk-ui";
import {
    areObjRefsEqual,
    IDashboardAttributeFilter,
    ObjRef,
    IInsight,
    insightMeasures,
    isSimpleMeasure,
    measureFilters,
    isDateFilter,
    IInsightWidget,
    IFilter,
    IAttributeFilter,
    newPositiveAttributeFilter,
    newAllTimeFilter,
    IDateFilter,
} from "@gooddata/sdk-model";
import { selectCatalogDateAttributes } from "../../store/catalog/catalogSelectors.js";
import { selectInsightByRef } from "../../store/insights/insightsSelectors.js";
import { DashboardState } from "../../store/types.js";

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
    const dateFilter = shouldUseDateFilter ? yield select(selectDrillingDateFilter, widget) : undefined;

    // get proper attr filters
    const isDrillingToSelf = areObjRefsEqual(ctx.dashboardRef, cmd.payload.drillDefinition.target);

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
    const resultingFilters = compact([dateFilter, ...drillIntersectionFilters, ...dashboardFilters]);

    // put end event
    return drillToDashboardResolved(
        ctx,
        resultingFilters,
        cmd.payload.drillDefinition,
        cmd.payload.drillEvent,
        cmd.correlationId,
    );
}

function selectDrillingDateFilter(state: DashboardState, widget: IInsightWidget): IDateFilter {
    const globalDateFilter = selectFilterContextDateFilter(state);

    return globalDateFilter
        ? dashboardDateFilterToDateFilterByWidget(globalDateFilter, widget)
        : newAllTimeFilter(widget.dateDataSet!);
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

/**
 *  For correct drill intersection that should be converted into AttributeFilters must be drill intersection:
 *  1. AttributeItem
 *  2. Not a date attribute
 */
function filterIntersection(
    intersection: DrillEventIntersectionElementHeader,
    dateDataSetsAttributesRefs: ObjRef[],
): boolean {
    const attributeItem = isDrillIntersectionAttributeItem(intersection) ? intersection : undefined;
    const ref = attributeItem?.attributeHeader?.formOf?.ref;

    return ref ? !dateDataSetsAttributesRefs.some((ddsRef) => areObjRefsEqual(ddsRef, ref)) : false;
}

function convertIntersectionToAttributeFilters(
    intersection: IDrillEventIntersectionElement[],
    dateDataSetsAttributesRefs: ObjRef[],
    backendSupportsElementUris: boolean,
): IAttributeFilter[] {
    return intersection
        .map((i) => i.header)
        .filter((i: DrillEventIntersectionElementHeader) => filterIntersection(i, dateDataSetsAttributesRefs))
        .filter(isDrillIntersectionAttributeItem)
        .map((h: IDrillIntersectionAttributeItem): IAttributeFilter => {
            if (backendSupportsElementUris) {
                return newPositiveAttributeFilter(h.attributeHeader.ref, {
                    uris: [h.attributeHeaderItem.uri],
                });
            } else {
                return newPositiveAttributeFilter(h.attributeHeader.ref, {
                    uris: [h.attributeHeaderItem.name],
                });
            }
        });
}
