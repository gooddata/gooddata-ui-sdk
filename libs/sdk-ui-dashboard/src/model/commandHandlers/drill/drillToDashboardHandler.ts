// (C) 2021-2023 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import compact from "lodash/compact";
import isEmpty from "lodash/isEmpty";
import isString from "lodash/isString";
import invariant from "ts-invariant";
import { DashboardContext } from "../../types/commonTypes";
import { DrillToDashboard } from "../../commands/drill";
import {
    DashboardDrillToDashboardResolved,
    drillToDashboardRequested,
    drillToDashboardResolved,
} from "../../events/drill";
import {
    selectFilterContextAttributeFilters,
    selectFilterContextDateFilter,
} from "../../store/filterContext/filterContextSelectors";
import { selectAnalyticalWidgetByRef } from "../../store/layout/layoutSelectors";
import { IDashboardFilter } from "../../../types";
import { dashboardAttributeFilterToAttributeFilter } from "../../../converters";
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
    FilterContextItem,
    IDashboardDateFilter,
    IFilter,
    IFilterableWidget,
    IAttributeFilter,
    filterAttributeElements,
    filterObjRef,
    isNegativeAttributeFilter,
} from "@gooddata/sdk-model";
import { selectCatalogDateAttributes } from "../../store/catalog/catalogSelectors";
import { selectInsightByRef } from "../../store/insights/insightsSelectors";
import { DashboardState } from "../../store/types";

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
    const dateFilter: IDashboardDateFilter | undefined = shouldUseDateFilter
        ? yield select(selectDrillingDateFilter, widget)
        : undefined;

    // get proper attr filters
    const isDrillingToSelf = areObjRefsEqual(ctx.dashboardRef, cmd.payload.drillDefinition.target);

    const dashboardFilters: IDashboardAttributeFilter[] = isDrillingToSelf
        ? // if drilling to self, just take all filters
          yield select(selectAllAttributeFilters)
        : // if drilling to other, resolve widget filter ignores
          yield call(getWidgetAwareAttributeFilters, ctx, widget);

    const dateAttributes: ReturnType<typeof selectCatalogDateAttributes> = yield select(
        selectCatalogDateAttributes,
    );
    const drillIntersectionFilters = convertIntersectionToDashboardAttributeFilters(
        cmd.payload.drillEvent.drillContext.intersection!,
        dateAttributes.map((dA) => dA.attribute.ref),
        ctx.backend.capabilities.supportsElementUris ?? true,
    );

    // concat everything, order is important – drill filters must go first
    const resultingFilters: FilterContextItem[] = compact([
        dateFilter,
        ...drillIntersectionFilters,
        ...dashboardFilters,
    ]);

    // put end event
    return drillToDashboardResolved(
        ctx,
        resultingFilters,
        cmd.payload.drillDefinition,
        cmd.payload.drillEvent,
        cmd.correlationId,
    );
}

function numberOrStringToNumber(input: number | string): number {
    return isString(input) ? Number.parseInt(input) : input;
}

function dashboardDateFilterByWidget(
    filter: IDashboardDateFilter,
    widget: Partial<IFilterableWidget>,
): IDashboardDateFilter {
    if (filter.dateFilter.type === "relative") {
        return {
            dateFilter: {
                type: "relative",
                granularity: filter.dateFilter.granularity,
                dataSet: widget.dateDataSet!,
                from: numberOrStringToNumber(filter.dateFilter.from!),
                to: numberOrStringToNumber(filter.dateFilter.to!),
            },
        };
    } else {
        return {
            dateFilter: {
                type: "absolute",
                granularity: "GDC.time.date",
                dataSet: widget.dateDataSet!,
                from: numberOrStringToNumber(filter.dateFilter.from!),
                to: numberOrStringToNumber(filter.dateFilter.to!),
            },
        };
    }
}

function selectDrillingDateFilter(state: DashboardState, widget: IInsightWidget): IDashboardDateFilter {
    const globalDateFilter = selectFilterContextDateFilter(state);

    return globalDateFilter
        ? dashboardDateFilterByWidget(globalDateFilter, widget)
        : {
              dateFilter: {
                  type: "relative",
                  dataSet: widget.dateDataSet!,
                  granularity: "GDC.time.date",
              },
          };
}

function selectAllAttributeFilters(state: DashboardState): IDashboardAttributeFilter[] {
    return selectFilterContextAttributeFilters(state);
}

function attributeFilterToDashboardAttributeFilter(filter: IAttributeFilter): IDashboardAttributeFilter {
    const attributeElements = filterAttributeElements(filter);
    const displayForm = filterObjRef(filter);
    return {
        attributeFilter: {
            attributeElements,
            displayForm,
            negativeSelection: isNegativeAttributeFilter(filter),
        },
    };
}

function* getWidgetAwareAttributeFilters(
    ctx: DashboardContext,
    widget: IInsightWidget,
): SagaIterator<IDashboardAttributeFilter[]> {
    const filterContextItems: ReturnType<typeof selectFilterContextAttributeFilters> = yield select(
        selectFilterContextAttributeFilters,
    );

    const filters = filterContextItems.map(dashboardAttributeFilterToAttributeFilter);

    const resolvedFiltersForWidget = yield call(getResolvedFiltersForWidget, ctx, widget, filters);

    return resolvedFiltersForWidget.map(attributeFilterToDashboardAttributeFilter);
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

function convertIntersectionToDashboardAttributeFilters(
    intersection: IDrillEventIntersectionElement[],
    dateDataSetsAttributesRefs: ObjRef[],
    backendSupportsElementUris: boolean,
): IDashboardAttributeFilter[] {
    return intersection
        .map((i) => i.header)
        .filter((i: DrillEventIntersectionElementHeader) => filterIntersection(i, dateDataSetsAttributesRefs))
        .filter(isDrillIntersectionAttributeItem)
        .map((h: IDrillIntersectionAttributeItem): IDashboardAttributeFilter => {
            if (backendSupportsElementUris) {
                return {
                    attributeFilter: {
                        displayForm: h.attributeHeader.ref,
                        negativeSelection: false,
                        attributeElements: { uris: [h.attributeHeaderItem.uri] },
                    },
                };
            } else {
                return {
                    attributeFilter: {
                        displayForm: h.attributeHeader.ref,
                        negativeSelection: false,
                        attributeElements: { uris: [h.attributeHeaderItem.name] },
                    },
                };
            }
        });
}
