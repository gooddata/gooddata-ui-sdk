// (C) 2021-2026 GoodData Corporation

import { isEmpty, partition } from "lodash-es";
import { type SagaIterator } from "redux-saga";
import { type SagaReturnType, call, select } from "redux-saga/effects";

import {
    type IAnalyticalWidget,
    type ICatalogDateDataset,
    type IDashboardAttributeFilter,
    type IDashboardDateFilter,
    type IInsight,
    type IInsightWidget,
    type IKpiWidget,
    type IRichTextWidget,
    type ObjRef,
    areObjRefsEqual,
    objRefToString,
} from "@gooddata/sdk-model";

import { newInsight } from "../../../../_staging/insight/insightBuilder.js";
import { newCatalogDateDatasetMap } from "../../../../_staging/metadata/objRefMap.js";
import { type IDashboardCommand } from "../../../commands/base.js";
import { invalidArgumentsProvided } from "../../../events/general.js";
import { type IInsightDateDatasets, queryDateDatasetsForInsight } from "../../../queries/insights.js";
import { type IMeasureDateDatasets, queryDateDatasetsForMeasure } from "../../../queries/kpis.js";
import { query } from "../../../store/_infra/queryCall.js";
import {
    selectAllCatalogDateDatasetsMap,
    selectCatalogDateDatasets,
} from "../../../store/catalog/catalogSelectors.js";
import { selectEnableUnavailableItemsVisibility } from "../../../store/config/configSelectors.js";
import { selectAttributeFilterConfigsDisplayAsLabelMap } from "../../../store/tabs/attributeFilterConfigs/attributeFilterConfigsSelectors.js";
import {
    selectFilterContextAttributeFilters,
    selectFilterContextDateFiltersWithDimension,
} from "../../../store/tabs/filterContext/filterContextSelectors.js";
import { type DashboardContext } from "../../../types/commonTypes.js";
import { resolveDisplayFormMetadata } from "../../../utils/displayFormResolver.js";

/**
 * This generator validates that a date dataset with the provided ref can be used for date filtering of insight in
 * particular insight widget. If the result is positive, a catalog entry of the date dataset will be returned.
 *
 * If the result is negative a DashboardCommandFailed will be thrown.
 *
 * The validation will trigger the QueryInsightDateDatasets to obtain a list of all available, valid date datasets for
 * the insight widget - that's where the actual complex logic takes place.
 *
 * Note that the query is a cached query - first execution will cache all available date dataset information in state and
 * the subsequent calls will be instant.
 *
 * @param ctx - dashboard context in which the validation is done
 * @param cmd - dashboard command it the context of which the validation is done
 * @param widget - insight that whose date filter is about to change
 * @param dateDataSet - ref of a date dataset to validate
 * @param resolvedInsight - specify entire insight used by the insight widget; if provided, the query
 *  to obtain date datasets for the insight will use insight instead of looking up insight ref in the current dashboard state.
 *  Passing resolved insight is essential in cases when this validation is done before the insight widget
 *  is actually added onto dashboard - because in that case the insight itself is not yet part of the state and
 *  the query is limited (intentionally) to query only by refs of insights that are on the dashboard
 */
export function* validateDatasetForInsightWidgetDateFilter(
    ctx: DashboardContext,
    cmd: IDashboardCommand,
    widget: IInsightWidget,
    dateDataSet: ObjRef,
    resolvedInsight?: IInsight,
): SagaIterator<ICatalogDateDataset> {
    const insightDateDatasets: IInsightDateDatasets = yield call(
        query,
        queryDateDatasetsForInsight(resolvedInsight || widget.insight),
    );
    const enableUnavailableItemsVisible = yield select(selectEnableUnavailableItemsVisibility);
    const dateDataSetsToValidate = enableUnavailableItemsVisible
        ? yield select(selectCatalogDateDatasets)
        : insightDateDatasets.allAvailableDateDatasets;
    const catalogDataSet = newCatalogDateDatasetMap(dateDataSetsToValidate).get(dateDataSet);

    if (!catalogDataSet) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Attempting to use date dataset ${objRefToString(dateDataSet)}
            to filter rich text widget ${objRefToString(widget.ref)} but the data set either does not exist or
            is not valid to use for filtering the rich text.`,
        );
    }

    return catalogDataSet;
}

/**
 * This generator validates that a date dataset with the provided ref can be used for date filtering of rich text in
 * particular rich text widget. If the result is positive, a catalog entry of the date dataset will be returned.
 *
 * If the result is negative a DashboardCommandFailed will be thrown.
 *
 * The validation will trigger the QueryRichTextDateDatasets to obtain a list of all available, valid date datasets for
 * the rich text widget - that's where the actual complex logic takes place.
 *
 * Note that the query is a cached query - first execution will cache all available date dataset information in state and
 * the subsequent calls will be instant.
 *
 * @param ctx - dashboard context in which the validation is done
 * @param cmd - dashboard command it the context of which the validation is done
 * @param widget - insight that whose date filter is about to change
 * @param dateDataSet - ref of a date dataset to validate
 */
export function* validateDatasetForRichTextWidgetDateFilter(
    ctx: DashboardContext,
    cmd: IDashboardCommand,
    widget: IRichTextWidget,
    dateDataSet: ObjRef,
): SagaIterator<ICatalogDateDataset> {
    const insightDateDatasets: IInsightDateDatasets = yield call(
        query,
        queryDateDatasetsForInsight(newInsight("local:table")),
    );
    const enableUnavailableItemsVisible = yield select(selectEnableUnavailableItemsVisibility);
    const dateDataSetsToValidate = enableUnavailableItemsVisible
        ? yield select(selectCatalogDateDatasets)
        : insightDateDatasets.allAvailableDateDatasets;
    const catalogDataSet = newCatalogDateDatasetMap(dateDataSetsToValidate).get(dateDataSet);

    if (!catalogDataSet) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Attempting to use date dataset ${objRefToString(dateDataSet)}
            to filter insight widget ${objRefToString(widget.ref)} but the data set either does not exist or
            is not valid to use for filtering the insight.`,
        );
    }

    return catalogDataSet;
}

/**
 * This generator validates that a date dataset with the provided ref can be used for date filtering of a particular
 * KPI widget. If the result is positive, a normalized ref of the date dataset will be returned - this ref
 * should be used going forward, stored in state etc etc. If the result is negative a DashboardCommandFailed will be
 * thrown.
 *
 * The validation will trigger the QueryInsightDateDatasets to obtain a list of all available, valid date datasets for
 * the insight widget - that's where the actual complex logic takes place.
 *
 * Note that the query is a cached query - first execution will cache all available date dataset information in state and
 * the subsequent calls will be instant.
 *
 * @param ctx - dashboard context in which the validation is done
 * @param cmd - dashboard command it the context of which the validation is done
 * @param widget - insight that whose date filter is about to change
 * @param dateDataSet - ref of a date dataset to validate
 */
export function* validateDatasetForKpiWidgetDateFilter(
    ctx: DashboardContext,
    cmd: IDashboardCommand,
    widget: IKpiWidget,
    dateDataSet: ObjRef,
): SagaIterator<ICatalogDateDataset> {
    const measureDateDatasets: IMeasureDateDatasets = yield call(
        query,
        queryDateDatasetsForMeasure(widget.kpi.metric),
    );
    const catalogDataSet = newCatalogDateDatasetMap(measureDateDatasets.dateDatasets).get(dateDataSet);

    if (!catalogDataSet) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Attempting to use date dataset ${objRefToString(dateDataSet)}
            to filter insight widget ${objRefToString(widget.ref)} but the data set either does not exist or
            is not valid to use for filtering the insight.`,
        );
    }

    return catalogDataSet;
}

/**
 * This generator validates whether it is possible to disable attribute filtering based on the refs of attribute display forms.
 * The validation is not widget-specific - it does not need any info from the widget. It validates that the display forms
 * used to specify filters to ignore are valid and that they are actually used in attribute filters that are currently
 * on the dashboard.
 *
 * If the result is positive, a list of normalized display form refs will be returned - these refs should be used going forward, stored in state etc. If the
 * result is negative a DashboardCommandFailed will be thrown.
 *
 * The validation may be trigger asynchronous processing when a display form cannot be resolved directly from the workspace
 * catalog that is stored in state. This can happen in two cases:
 *
 * -  ref is for a display form that is not part of production workspace catalog that is stored in the state; for instance
 *    happens when there are CSV, non-production datasets loaded and used on some of the dashboard insights
 * -  ref is for a bogus display form; code must check on backend and will find that backend has no such display form
 *    and will eventually bomb
 *
 * @param ctx - dashboard context in which the validation is done
 * @param cmd - dashboard command in the context of which the validation is done
 * @param _widget - widget on which the filters should be ignored
 * @param toIgnore - refs of display forms used in attribute filters that should be ignored
 */
export function* validateAttributeFiltersToIgnore(
    ctx: DashboardContext,
    cmd: IDashboardCommand,
    _widget: IAnalyticalWidget,
    toIgnore: ObjRef[],
): SagaIterator<IDashboardAttributeFilter[]> {
    const resolvedDisplayForms: SagaReturnType<typeof resolveDisplayFormMetadata> = yield call(
        resolveDisplayFormMetadata,
        ctx,
        toIgnore,
    );
    const { missing, resolved } = resolvedDisplayForms;

    if (!isEmpty(missing)) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Attempting to disable attribute filters but some of the display form refs to disable filters by do not exist: ${missing
                .map(objRefToString)
                .join(", ")}`,
        );
    }

    const existingFilters: ReturnType<typeof selectFilterContextAttributeFilters> = yield select(
        selectFilterContextAttributeFilters,
    );
    const displayAsLabelMap: ReturnType<typeof selectAttributeFilterConfigsDisplayAsLabelMap> = yield select(
        selectAttributeFilterConfigsDisplayAsLabelMap,
    );
    const badIgnores: ObjRef[] = [];
    const filtersToIgnore: IDashboardAttributeFilter[] = [];

    for (const toIgnore of resolved.values()) {
        const filterForDisplayForm = existingFilters.find((filter) => {
            const displayAsLabel = displayAsLabelMap.get(filter.attributeFilter.localIdentifier!);
            return (
                areObjRefsEqual(filter.attributeFilter.displayForm, toIgnore.ref) ||
                areObjRefsEqual(displayAsLabel, toIgnore.ref)
            );
        });

        if (filterForDisplayForm) {
            filtersToIgnore.push(filterForDisplayForm);
        } else {
            badIgnores.push(toIgnore.ref);
        }
    }

    if (!isEmpty(badIgnores)) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Attempting to disable attribute filters but some of the display form refs to disable filters by are not used for filtering at all: ${badIgnores
                .map(objRefToString)
                .join(", ")}`,
        );
    }

    return filtersToIgnore;
}

/**
 * This generator validates whether it is possible to disable date filtering based on the refs of date data forms.
 * The validation is not widget-specific - it does not need any info from the widget. It validates that the date data sets
 * used to specify filters to ignore are valid and that they are actually used in date filters (not common date filter) that are currently
 * on the dashboard.
 *
 * If the result is list of valid filters to ignore. If the
 * result is negative a DashboardCommandFailed will be thrown.
 *
 * The validation against date datasets stored in state.
 *
 * @param ctx - dashboard context in which the validation is done
 * @param cmd - dashboard command in the context of which the validation is done
 * @param _widget - widget on which the filters should be ignored
 * @param toIgnore - refs of date data sets used in date filters that should be ignored
 */
export function* validateDateFiltersToIgnore(
    ctx: DashboardContext,
    cmd: IDashboardCommand,
    _widget: IAnalyticalWidget,
    toIgnore: ObjRef[],
): SagaIterator<IDashboardDateFilter[]> {
    const allAvailableDateDatasetsMap: ReturnType<typeof selectAllCatalogDateDatasetsMap> = yield select(
        selectAllCatalogDateDatasetsMap,
    );
    const [resolved, missing] = partition(toIgnore, (ref) => allAvailableDateDatasetsMap.has(ref));

    if (!isEmpty(missing)) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Attempting to disable date filters but some of the date data set refs to disable filters by do not exist: ${missing
                .map(objRefToString)
                .join(", ")}`,
        );
    }

    const existingFilters: ReturnType<typeof selectFilterContextDateFiltersWithDimension> = yield select(
        selectFilterContextDateFiltersWithDimension,
    );
    const badIgnores: ObjRef[] = [];
    const filtersToIgnore: IDashboardDateFilter[] = [];

    for (const toIgnore of resolved.values()) {
        const filterForDateDataSet = existingFilters.find((filter) =>
            areObjRefsEqual(filter.dateFilter.dataSet, toIgnore),
        );

        if (filterForDateDataSet) {
            filtersToIgnore.push(filterForDateDataSet);
        } else {
            badIgnores.push(toIgnore);
        }
    }

    if (!isEmpty(badIgnores)) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Attempting to disable date filters but some of the date data set refs to disable filters by are not used for filtering at all: ${badIgnores
                .map(objRefToString)
                .join(", ")}`,
        );
    }

    return filtersToIgnore;
}
