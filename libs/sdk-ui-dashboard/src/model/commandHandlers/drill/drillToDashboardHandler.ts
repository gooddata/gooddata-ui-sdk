// (C) 2021-2024 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { SagaReturnType, call, put, select } from "redux-saga/effects";
import compact from "lodash/compact.js";
import isEmpty from "lodash/isEmpty.js";
import isEqual from "lodash/isEqual.js";
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
    selectFilterContextDraggableFilters,
} from "../../store/filterContext/filterContextSelectors.js";
import { selectAnalyticalWidgetByRef } from "../../store/layout/layoutSelectors.js";
import { IDashboardFilter } from "../../../types.js";
import {
    dashboardAttributeFilterToAttributeFilter,
    dashboardDateFilterToDateFilterByWidget,
} from "../../../converters/index.js";
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
    FilterContextItem,
    isDashboardAttributeFilter,
    IDateFilter,
    IDashboardAttributeFilterConfig,
    ObjRef,
} from "@gooddata/sdk-model";
import { selectCatalogDateAttributes } from "../../store/catalog/catalogSelectors.js";
import { selectInsightByRef } from "../../store/insights/insightsSelectors.js";
import { DashboardState } from "../../store/types.js";
import {
    IConversionResult,
    convertIntersectionToAttributeFilters,
    removeIgnoredValuesFromDrillIntersection,
} from "./common/intersectionUtils.js";
import { selectSupportsMultipleDateFilters } from "../../store/backendCapabilities/backendCapabilitiesSelectors.js";
import {
    selectEnableDuplicatedLabelValuesInAttributeFilter,
    selectEnableMultipleDateFilters,
} from "../../store/config/configSelectors.js";
import {
    selectAttributeFilterConfigsDisplayAsLabelMap,
    selectAttributeFilterConfigsOverrides,
} from "../../store/attributeFilterConfigs/attributeFilterConfigsSelectors.js";
import { generateFilterLocalIdentifier } from "../../store/_infra/generators.js";

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

    const supportsMultipleDateFilters = yield select(selectSupportsMultipleDateFilters);
    const enableMultipleDateFilters = yield select(selectEnableMultipleDateFilters);
    const includeOtherDateFilters = supportsMultipleDateFilters && enableMultipleDateFilters;

    const allOtherFilters: ReturnType<typeof selectAllOtherFilters> = yield select(selectAllOtherFilters);
    const allAttributeFilters: ReturnType<typeof selectAllAttributeFilters> = yield select(
        selectAllAttributeFilters,
    );

    const widgetAwareFilters: SagaReturnType<typeof getWidgetAwareDashboardFilters> = !isDrillingToSelf
        ? yield call(getWidgetAwareDashboardFilters, ctx, widget, includeOtherDateFilters)
        : [];

    const dashboardFilters = isDrillingToSelf
        ? // if drilling to self, just take all filters
          includeOtherDateFilters
            ? allOtherFilters
            : allAttributeFilters
        : // if drilling to other, resolve widget filter ignores
          widgetAwareFilters;

    const dateAttributes: ReturnType<typeof selectCatalogDateAttributes> = yield select(
        selectCatalogDateAttributes,
    );

    const enableDuplicatedLabelValuesInAttributeFilter: ReturnType<
        typeof selectEnableDuplicatedLabelValuesInAttributeFilter
    > = yield select(selectEnableDuplicatedLabelValuesInAttributeFilter);

    const filteredIntersection = cmd.payload.drillDefinition.drillIntersectionIgnoredAttributes
        ? removeIgnoredValuesFromDrillIntersection(
              cmd.payload.drillEvent.drillContext.intersection ?? [],
              cmd.payload.drillDefinition.drillIntersectionIgnoredAttributes ?? [],
          )
        : cmd.payload.drillEvent.drillContext.intersection!;

    const filtersCount = dashboardFilters.length;
    const drillIntersectionFilters = convertIntersectionToAttributeFilters(
        filteredIntersection,
        dateAttributes.map((dA) => dA.attribute.ref),
        ctx.backend.capabilities.supportsElementUris ?? true,
        enableDuplicatedLabelValuesInAttributeFilter,
        false,
        filtersCount,
    );

    const [transformedFilters, attributeFilterConfigsFromTransformation] = transformToPrimaryLabelFilters(
        drillIntersectionFilters,
        filtersCount,
    );

    const attributeFilterConfigs: IDashboardAttributeFilterConfig[] =
        enableDuplicatedLabelValuesInAttributeFilter ? attributeFilterConfigsFromTransformation : [];
    const intersectionFilters = enableDuplicatedLabelValuesInAttributeFilter
        ? transformedFilters
        : drillIntersectionFilters.map((f) => f.attributeFilter);

    const attributeFilterDisplayAsLabelMap: ReturnType<typeof selectAttributeFilterConfigsDisplayAsLabelMap> =
        yield select(selectAttributeFilterConfigsDisplayAsLabelMap);

    if (enableDuplicatedLabelValuesInAttributeFilter) {
        const dashboardFilterConfigs = getDashboardFilterConfigs(
            dashboardFilters,
            attributeFilterDisplayAsLabelMap,
        );
        attributeFilterConfigs.push(...dashboardFilterConfigs);
    }

    // concat everything, order is important – drill filters must go first
    const resultingFilters = compact([commonDateFilter, ...intersectionFilters, ...dashboardFilters]);

    // put end event
    return drillToDashboardResolved(
        ctx,
        resultingFilters,
        attributeFilterConfigs,
        cmd.payload.drillDefinition,
        cmd.payload.drillEvent,
        cmd.correlationId,
    );
}

function getDashboardFilterConfigs(
    dashboardFilters: FilterContextItem[] | IDashboardAttributeFilter[],
    attributeFilterDisplayAsLabelMap: Map<string, ObjRef>,
): IDashboardAttributeFilterConfig[] {
    return dashboardFilters.reduce((result, filter) => {
        if (isDashboardAttributeFilter(filter)) {
            const localIdentifier = filter.attributeFilter.localIdentifier;
            const displayAsLabel = localIdentifier
                ? attributeFilterDisplayAsLabelMap.get(localIdentifier)
                : undefined;
            if (displayAsLabel && localIdentifier) {
                result.push({
                    localIdentifier,
                    displayAsLabel,
                });
            }
        }
        return result;
    }, [] as IDashboardAttributeFilterConfig[]);
}

function transformToPrimaryLabelFilters(
    drillIntersectionFilters: IConversionResult[],
    filtersCount: number = 0,
): [IDashboardAttributeFilter[], IDashboardAttributeFilterConfig[]] {
    const attributeFilterConfigs: IDashboardAttributeFilterConfig[] = [];
    const transformedFilters = drillIntersectionFilters.map((f, i) => {
        if (
            f.primaryLabel &&
            !areObjRefsEqual(f.primaryLabel, f.attributeFilter.attributeFilter.displayForm)
        ) {
            const localIdentifier =
                f.attributeFilter.attributeFilter.localIdentifier ??
                generateFilterLocalIdentifier(
                    f.attributeFilter.attributeFilter.displayForm,
                    filtersCount + i,
                );
            attributeFilterConfigs.push({
                localIdentifier,
                displayAsLabel: f.attributeFilter.attributeFilter.displayForm,
            });
            return {
                attributeFilter: {
                    ...f.attributeFilter.attributeFilter,
                    localIdentifier, // in case uuid was generated
                    displayForm: f.primaryLabel,
                },
            };
        }
        return f.attributeFilter;
    });
    return [transformedFilters, attributeFilterConfigs];
}

// result needs to be IDashboardDateFilter to allow optional dateDataSet
function selectDrillingDateFilter(state: DashboardState): IDashboardDateFilter {
    const globalDateFilter = selectFilterContextDateFilter(state);

    return globalDateFilter ?? newAllTimeDashboardDateFilter();
}

function selectAllAttributeFilters(state: DashboardState): IDashboardAttributeFilter[] {
    return selectFilterContextAttributeFilters(state);
}

function selectAllOtherFilters(state: DashboardState): FilterContextItem[] {
    return selectFilterContextDraggableFilters(state);
}

function convertFilterItemsToFilters(
    filter: IDashboardAttributeFilter | IDashboardDateFilter,
    widget: IInsightWidget,
): IAttributeFilter | IDateFilter {
    return isDashboardAttributeFilter(filter)
        ? dashboardAttributeFilterToAttributeFilter(filter)
        : dashboardDateFilterToDateFilterByWidget(filter, widget);
}

function* getWidgetAwareDashboardFilters(
    ctx: DashboardContext,
    widget: IInsightWidget,
    includeOtherDateFilters: boolean,
): SagaIterator<IDashboardAttributeFilter[]> {
    const filterContextItems: ReturnType<typeof selectFilterContextAttributeFilters> = yield select(
        includeOtherDateFilters ? selectFilterContextDraggableFilters : selectFilterContextAttributeFilters,
    );

    const attributeFilterConfigs: ReturnType<typeof selectAttributeFilterConfigsOverrides> = yield select(
        selectAttributeFilterConfigsOverrides,
    );

    const filtersPairs = filterContextItems.map((filter) => ({
        filter: convertFilterItemsToFilters(filter, widget),
        originalFilter: filter,
    }));

    const widgetFilters = yield call(
        getResolvedFiltersForWidget,
        ctx,
        widget,
        filtersPairs.map((pair) => pair.filter),
        attributeFilterConfigs,
    );
    return filtersPairs
        .filter((pair) => widgetFilters.some((wf: IFilter) => isEqual(wf, pair.filter)))
        .map((pair) => pair.originalFilter);
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
    attributeFilterConfigs: IDashboardAttributeFilterConfig[],
): Promise<IFilter[]> {
    return ctx.backend
        .workspace(ctx.workspace)
        .dashboards()
        .getResolvedFiltersForWidgetWithMultipleDateFilters(widget, [], filters, attributeFilterConfigs);
}
