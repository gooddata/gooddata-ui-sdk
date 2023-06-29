// (C) 2021-2023 GoodData Corporation
import { ExtendedDashboardItem } from "../../../types/layoutTypes.js";
import { ObjRefMap } from "../../../../_staging/metadata/objRefMap.js";
import {
    areObjRefsEqual,
    IInsight,
    insightRef,
    objRefToString,
    IDashboardAttributeFilter,
    isDashboardAttributeFilterReference,
    IKpiWidget,
    IInsightWidget,
    isKpiWidget,
    isInsightWidget,
} from "@gooddata/sdk-model";
import { invariant } from "ts-invariant";
import { InsightResolutionResult, resolveInsights } from "../../../utils/insightResolver.js";
import { DashboardContext } from "../../../types/commonTypes.js";
import { SagaIterator } from "redux-saga";
import { call, SagaReturnType, select } from "redux-saga/effects";
import isEmpty from "lodash/isEmpty.js";
import { invalidArgumentsProvided } from "../../../events/general.js";
import { extractInsightRefsFromItems } from "../../../utils/dashboardItemUtils.js";
import { IDashboardCommand } from "../../../commands/index.js";
import {
    InsightDateDatasets,
    insightSelectDateDataset,
    MeasureDateDatasets,
    queryDateDatasetsForInsight,
    queryDateDatasetsForMeasure,
} from "../../../queries/index.js";
import { query } from "../../../store/_infra/queryCall.js";
import {
    validateAttributeFiltersToIgnore,
    validateDatasetForInsightWidgetDateFilter,
    validateDatasetForKpiWidgetDateFilter,
} from "../../widgets/validation/filterValidation.js";
import { ItemResolutionResult } from "./stashValidation.js";
import { selectFilterContextAttributeFilters } from "../../../store/filterContext/filterContextSelectors.js";

function normalizeItems(
    items: ExtendedDashboardItem[],
    insights: ObjRefMap<IInsight>,
): ExtendedDashboardItem[] {
    return items.map((item) => {
        if (isInsightWidget(item.widget)) {
            const existingInsight = insights.get(item.widget.insight);

            invariant(existingInsight);

            return {
                ...item,
                widget: {
                    ...item.widget,
                    insight: insightRef(existingInsight),
                },
            };
        }

        return item;
    });
}

type ItemValidationResult = {
    normalizedItems: ItemResolutionResult;
    resolvedInsights: InsightResolutionResult;
};

/**
 * Given resolved items that should be added onto a dashboard, this function will ensure that items that reference
 * either KPI or Insight widgets reference valid insights or measures.
 *
 * Once the validity of used insights and measures is established, the code will additionally normalize the widget
 * definitions so that they use the native object `ref`s included in the referenced objects.
 *
 * This generator function will consult with backend on the existence of insights and measures if they are not
 * already stored in the state. If an insight is not found in the state but is available on the backend, the
 * insight will be retrieved and returned in the final validation result.
 */
export function* validateAndNormalizeWidgetItems(
    ctx: DashboardContext,
    items: ItemResolutionResult,
    cmd: IDashboardCommand,
): SagaIterator<ItemValidationResult> {
    const insightRefs = extractInsightRefsFromItems(items.resolved);
    const resolvedInsights: SagaReturnType<typeof resolveInsights> = yield call(
        resolveInsights,
        ctx,
        insightRefs,
    );

    if (!isEmpty(resolvedInsights.missing)) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Attempting to add dashboard items that reference missing insights: ${resolvedInsights.missing
                .map(objRefToString)
                .join(", ")}`,
        );
    }

    return {
        normalizedItems: {
            ...items,
            resolved: normalizeItems(items.resolved, resolvedInsights.resolved),
        },
        resolvedInsights,
    };
}

function* validateAndResolveInsightWidgetFilters(
    ctx: DashboardContext,
    cmd: IDashboardCommand,
    widget: IInsightWidget,
    autoDateDataset: boolean,
    resolvedInsight: IInsight,
): SagaIterator<IInsightWidget> {
    const ignoredFilterRefs = widget.ignoreDashboardFilters
        .filter(isDashboardAttributeFilterReference)
        .map((f) => f.displayForm);
    yield call(validateAttributeFiltersToIgnore, ctx, cmd, widget, ignoredFilterRefs);

    if (widget.dateDataSet) {
        yield call(
            validateDatasetForInsightWidgetDateFilter,
            ctx,
            cmd,
            widget,
            widget.dateDataSet,
            resolvedInsight,
        );

        return widget;
    } else if (autoDateDataset) {
        const insightDateDatasets: InsightDateDatasets = yield call(
            query,
            queryDateDatasetsForInsight(resolvedInsight),
        );

        return {
            ...widget,
            dateDataSet: insightSelectDateDataset(insightDateDatasets)?.dataSet.ref,
        };
    } else {
        return widget;
    }
}

function* validateAndResolveKpiFilters(
    ctx: DashboardContext,
    cmd: IDashboardCommand,
    widget: IKpiWidget,
    autoDateDataset: boolean,
): SagaIterator<IKpiWidget> {
    const ignoredFilterRefs = widget.ignoreDashboardFilters
        .filter(isDashboardAttributeFilterReference)
        .map((f) => f.displayForm);
    yield call(validateAttributeFiltersToIgnore, ctx, cmd, widget, ignoredFilterRefs);

    if (widget.dateDataSet) {
        yield call(validateDatasetForKpiWidgetDateFilter, ctx, cmd, widget, widget.dateDataSet);

        return widget;
    } else if (autoDateDataset) {
        const measureDateDatasets: MeasureDateDatasets = yield call(
            query,
            queryDateDatasetsForMeasure(widget.kpi.metric),
        );

        return {
            ...widget,
            dateDataSet: measureDateDatasets.dateDatasetsOrdered[0]?.dataSet.ref,
        };
    } else {
        return widget;
    }
}

function removeObsoleteAttributeFilterIgnores<T extends IKpiWidget | IInsightWidget>(
    widget: T,
    attributeFilters: IDashboardAttributeFilter[],
): T {
    const onlyExistingFilterIgnores = widget.ignoreDashboardFilters.filter((filterRef) => {
        if (isDashboardAttributeFilterReference(filterRef)) {
            return attributeFilters.find((filter) =>
                areObjRefsEqual(filter.attributeFilter.displayForm, filterRef.displayForm),
            );
        }

        return true;
    });

    return {
        ...widget,
        ignoreDashboardFilters: onlyExistingFilterIgnores,
    };
}

/**
 * This generator function will ensure that Insight and KPI widgets that are included in the `items`
 * have valid filter settings:
 *
 * -  the date dataset to use for filtering is correct
 * -  the attribute filters to ignore are correct and reference existing attribute filters
 *
 * Additionally, if the widget does not have dateDataSet to use for filtering set AND the `autoDateDataset` is true,
 * the generator will automatically update the widget with date dataset to use for filtering. It does this by
 * performing the necessary query to obtain relevant date dataset and then picking the most relevant one.
 *
 * @param ctx - dashboard context in which filter validation & resolution is done
 * @param items - items that are about to be added to the dashboard
 * @param cmd - command that is adding the items to the dashboard
 * @param autoDateDataset - indicates whether to automatically resolve and set date dataset to use for filtering for
 * KPI and Insight widgets.
 */
export function* validateAndResolveItemFilterSettings(
    ctx: DashboardContext,
    cmd: IDashboardCommand,
    items: ItemValidationResult,
    autoDateDataset: boolean = false,
): SagaIterator<ExtendedDashboardItem[]> {
    const attributeFilters: ReturnType<typeof selectFilterContextAttributeFilters> = yield select(
        selectFilterContextAttributeFilters,
    );
    const { resolvedInsights, normalizedItems } = items;
    const updatedItems: ExtendedDashboardItem[] = [];
    let i = 0;

    for (const item of normalizedItems.resolved) {
        const widget = item.widget;
        const isNew = normalizedItems.newItemBitmap[i];

        if (!isNew) {
            /*
             * processing an existing item; this is the case when some items from the layout got stashed and
             * are now being retrieved from stash and added back onto the dashboard.
             *
             * the stashed items were already thoroughly validated & normalized the first time they were added onto the
             * dashboard so the code does not have to re-do all the validations.
             */
            if (isInsightWidget(widget) || isKpiWidget(widget)) {
                /*
                 * Insight and KPI widgets may be set to ignore some attribute filters. validation must check
                 * that any ignored filters on the stashed item are still present on the filter context.
                 *
                 * Any ignored filters that are obsolete can be safely removed.
                 */
                const updatedWidget = removeObsoleteAttributeFilterIgnores(widget, attributeFilters);

                updatedItems.push({
                    ...item,
                    widget: updatedWidget,
                });
            } else {
                updatedItems.push(item);
            }
        } else {
            if (isInsightWidget(widget)) {
                const resolvedInsight = resolvedInsights.resolved.get(widget.insight);
                // if code gets here and the insight for the widget is not found it means either the resolution logic
                // or the logic to verify resolution result has failed. normally if insight widget references missing
                // insight the handler should find this and fail way sooner
                invariant(resolvedInsight);

                const updatedWidget: SagaReturnType<typeof validateAndResolveInsightWidgetFilters> =
                    yield call(
                        validateAndResolveInsightWidgetFilters,
                        ctx,
                        cmd,
                        widget,
                        autoDateDataset,
                        resolvedInsight,
                    );

                updatedItems.push({
                    ...item,
                    widget: updatedWidget,
                });
            } else if (isKpiWidget(widget)) {
                const updatedWidget: SagaReturnType<typeof validateAndResolveKpiFilters> = yield call(
                    validateAndResolveKpiFilters,
                    ctx,
                    cmd,
                    widget,
                    autoDateDataset,
                );

                updatedItems.push({
                    ...item,
                    widget: updatedWidget,
                });
            } else {
                updatedItems.push(item);
            }
        }

        i++;
    }

    return updatedItems;
}
