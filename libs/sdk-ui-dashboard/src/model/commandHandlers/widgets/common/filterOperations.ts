// (C) 2021-2025 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { SagaReturnType, call, select } from "redux-saga/effects";
import { invariant } from "ts-invariant";

import {
    IAnalyticalWidget,
    ICatalogDateDataset,
    IDashboardAttributeFilter,
    IDashboardDateFilter,
    IDashboardFilterReference,
    ObjRef,
    areObjRefsEqual,
    isDashboardAttributeFilterReference,
    isDashboardDateFilter,
    isDashboardDateFilterReference,
    isInsightWidget,
    isKpiWidget,
    isRichTextWidget,
} from "@gooddata/sdk-model";

import { IDashboardCommand } from "../../../commands/index.js";
import {
    InsightDateDatasets,
    MeasureDateDatasets,
    insightSelectDateDataset,
    queryDateDatasetsForInsight,
    queryDateDatasetsForMeasure,
} from "../../../queries/index.js";
import { query } from "../../../store/_infra/queryCall.js";
import { selectAllCatalogDateDatasetsMap } from "../../../store/catalog/catalogSelectors.js";
import { selectAttributeFilterConfigsDisplayAsLabelMap } from "../../../store/tabs/attributeFilterConfigs/attributeFilterConfigsSelectors.js";
import {
    selectFilterContextAttributeFilters,
    selectFilterContextDateFiltersWithDimension,
    selectFilterContextDraggableFilters,
} from "../../../store/tabs/filterContext/filterContextSelectors.js";
import { DashboardContext } from "../../../types/commonTypes.js";
import {
    FilterOpEnableDateFilter,
    FilterOpIgnoreAttributeFilter,
    FilterOpIgnoreDateFilter,
    FilterOpReplaceAll,
    FilterOpReplaceAttributeIgnores,
    FilterOpUnignoreAttributeFilter,
    FilterOpUnignoreDateFilter,
    WidgetFilterOperation,
} from "../../../types/widgetTypes.js";

function toAttributeDisplayFormRefs(references: IDashboardFilterReference[]) {
    return references.filter(isDashboardAttributeFilterReference).map((reference) => reference.displayForm);
}

function toDateDataSetRefs(references: IDashboardFilterReference[]) {
    return references.filter(isDashboardDateFilterReference).map((reference) => reference.dataSet);
}

function toRefs(references: IDashboardFilterReference[]) {
    return references.map((reference) => {
        if (isDashboardDateFilterReference(reference)) {
            return reference.dataSet;
        }
        return reference.displayForm;
    });
}

function getIgnoredAttributeFilters(
    filters: IDashboardAttributeFilter[],
    displayAsLabelMap: Map<string, ObjRef>,
    ignored: IDashboardFilterReference[],
): IDashboardAttributeFilter[] {
    const ignoredRefs = toAttributeDisplayFormRefs(ignored);

    return filters.filter((filter) => {
        return ignoredRefs.some((ref) => {
            const displayAsLabel = displayAsLabelMap.get(filter.attributeFilter.localIdentifier!);
            return (
                areObjRefsEqual(filter.attributeFilter.displayForm, ref) ||
                areObjRefsEqual(displayAsLabel, ref)
            );
        });
    });
}

function getIgnoredDateFilters(
    filters: IDashboardDateFilter[],
    ignored: IDashboardFilterReference[],
): IDashboardDateFilter[] {
    const ignoredRefs = toDateDataSetRefs(ignored);

    return filters.filter((filter) => {
        return ignoredRefs.some((ref) => areObjRefsEqual(filter.dateFilter.dataSet!, ref));
    });
}

function getIgnoredFilters(
    filters: Array<IDashboardDateFilter | IDashboardAttributeFilter>,
    displayAsLabelMap: Map<string, ObjRef>,
    ignored: IDashboardFilterReference[],
): Array<IDashboardDateFilter | IDashboardAttributeFilter> {
    const ignoredRefs = toRefs(ignored);

    return filters.filter((filter) => {
        return ignoredRefs.some((ref) => {
            if (isDashboardDateFilter(filter)) {
                return areObjRefsEqual(filter.dateFilter.dataSet!, ref);
            }
            const displayAsLabel = displayAsLabelMap.get(filter.attributeFilter.localIdentifier!);
            return (
                areObjRefsEqual(filter.attributeFilter.displayForm, ref) ||
                areObjRefsEqual(displayAsLabel, ref)
            );
        });
    });
}

function* replaceFilterSettings(
    ctx: DashboardContext,
    validators: FilterValidators<IAnalyticalWidget>,
    cmd: IDashboardCommand,
    widget: IAnalyticalWidget,
    op: FilterOpReplaceAll,
): SagaIterator<FilterOpResult> {
    let dateDataSet: ICatalogDateDataset | undefined;
    if (op.dateDatasetForFiltering) {
        dateDataSet = yield call(
            validators.dateDatasetValidator,
            ctx,
            cmd,
            widget,
            op.dateDatasetForFiltering,
        );
    }

    let ignoredFilters: Array<IDashboardAttributeFilter | IDashboardDateFilter> | undefined = undefined;
    if (op.ignoreAttributeFilters) {
        ignoredFilters = yield call(
            validators.attributeFilterValidator,
            ctx,
            cmd,
            widget,
            op.ignoreAttributeFilters,
        );
    }

    if (op.ignoreDateFilters && validators.dateFilterValidator) {
        const ignoredDateFilters: SagaReturnType<typeof validators.dateFilterValidator> = yield call(
            validators.dateFilterValidator,
            ctx,
            cmd,
            widget,
            op.ignoreDateFilters,
        );
        if (ignoredFilters) {
            ignoredFilters.push(...ignoredDateFilters);
        } else {
            ignoredFilters = ignoredDateFilters;
        }
    }

    return {
        dateDataSet,
        ignoredFilters,
    };
}

function* changeDateFilterIgnore(
    widget: IAnalyticalWidget,
    dateDataSet: ICatalogDateDataset | undefined,
): SagaIterator<FilterOpResult> {
    const filters: ReturnType<typeof selectFilterContextAttributeFilters> = yield select(
        selectFilterContextDraggableFilters,
    );
    const displayAsLabelMap: ReturnType<typeof selectAttributeFilterConfigsDisplayAsLabelMap> = yield select(
        selectAttributeFilterConfigsDisplayAsLabelMap,
    );
    const ignoredFilters = getIgnoredFilters(filters, displayAsLabelMap, widget.ignoreDashboardFilters);

    return {
        dateDataSet,
        ignoredFilters,
    };
}

function* disableDateFilter(
    _ctx: DashboardContext,
    _validators: FilterValidators<IAnalyticalWidget>,
    _cmd: IDashboardCommand,
    widget: IAnalyticalWidget,
): SagaIterator<FilterOpResult> {
    const result: SagaReturnType<typeof changeDateFilterIgnore> = yield call(
        changeDateFilterIgnore,
        widget,
        undefined,
    );
    return result;
}

function* enableDateFilter(
    ctx: DashboardContext,
    validators: FilterValidators<IAnalyticalWidget>,
    cmd: IDashboardCommand,
    widget: IAnalyticalWidget,
    op: FilterOpEnableDateFilter,
): SagaIterator<FilterOpResult> {
    let dateDatasetToUse: ICatalogDateDataset | undefined;

    if (op.dateDataset === "default") {
        if (isInsightWidget(widget)) {
            const queryResult: InsightDateDatasets = yield call(
                query,
                queryDateDatasetsForInsight(widget.insight),
            );
            dateDatasetToUse = insightSelectDateDataset(queryResult);
        } else if (isKpiWidget(widget)) {
            const queryResult: MeasureDateDatasets = yield call(
                query,
                queryDateDatasetsForMeasure(widget.kpi.metric),
            );
            dateDatasetToUse = queryResult.dateDatasetsOrdered[0];
        } else if (isRichTextWidget(widget)) {
            const queryResult: InsightDateDatasets = yield call(query, queryDateDatasetsForInsight());
            dateDatasetToUse = insightSelectDateDataset(queryResult);
        } else {
            invariant(false, "Cannot use default date dataset for custom widgets");
        }
    } else {
        dateDatasetToUse = yield call(validators.dateDatasetValidator, ctx, cmd, widget, op.dateDataset);
    }

    const result: SagaReturnType<typeof changeDateFilterIgnore> = yield call(
        changeDateFilterIgnore,
        widget,
        dateDatasetToUse,
    );
    return result;
}

function* changeIgnores(
    widget: IAnalyticalWidget,
    newlyIgnoredFilters: Array<IDashboardAttributeFilter | IDashboardDateFilter> | undefined,
): SagaIterator<FilterOpResult> {
    const dateDataSetMap: SagaReturnType<typeof selectAllCatalogDateDatasetsMap> = yield select(
        selectAllCatalogDateDatasetsMap,
    );
    const dateDataSet = widget.dateDataSet ? dateDataSetMap.get(widget.dateDataSet) : undefined;

    return {
        dateDataSet,
        ignoredFilters: newlyIgnoredFilters,
    };
}

function* replaceAttributeIgnores(
    ctx: DashboardContext,
    validators: FilterValidators<IAnalyticalWidget>,
    cmd: IDashboardCommand,
    widget: IAnalyticalWidget,
    op: FilterOpReplaceAttributeIgnores,
): SagaIterator<FilterOpResult> {
    const ignoredFilters: SagaReturnType<typeof validators.attributeFilterValidator> = yield call(
        validators.attributeFilterValidator,
        ctx,
        cmd,
        widget,
        op.displayFormRefs,
    );

    const ignoredDateFilters: SagaReturnType<typeof getIgnoredDateFiltersWorWidget> = yield call(
        getIgnoredDateFiltersWorWidget,
        widget,
    );

    const result: SagaReturnType<typeof changeIgnores> = yield call(
        changeIgnores,
        widget,
        ignoredFilters ? [...ignoredFilters, ...ignoredDateFilters] : ignoredDateFilters,
    );

    return result;
}

function* getIgnoredDateFiltersWorWidget(widget: IAnalyticalWidget) {
    const dateFilters: ReturnType<typeof selectFilterContextDateFiltersWithDimension> = yield select(
        selectFilterContextDateFiltersWithDimension,
    );
    return getIgnoredDateFilters(dateFilters, widget.ignoreDashboardFilters);
}

function* getIgnoredAttributeFiltersWorWidget(widget: IAnalyticalWidget) {
    const attributeFilters: ReturnType<typeof selectFilterContextAttributeFilters> = yield select(
        selectFilterContextAttributeFilters,
    );
    const displayAsLabelMap: ReturnType<typeof selectAttributeFilterConfigsDisplayAsLabelMap> = yield select(
        selectAttributeFilterConfigsDisplayAsLabelMap,
    );
    return getIgnoredAttributeFilters(attributeFilters, displayAsLabelMap, widget.ignoreDashboardFilters);
}

function* ignoreAttributeFilter(
    ctx: DashboardContext,
    validators: FilterValidators<IAnalyticalWidget>,
    cmd: IDashboardCommand,
    widget: IAnalyticalWidget,
    op: FilterOpIgnoreAttributeFilter,
): SagaIterator<FilterOpResult> {
    const ignoredFilters: SagaReturnType<typeof validators.attributeFilterValidator> = yield call(
        validators.attributeFilterValidator,
        ctx,
        cmd,
        widget,
        op.displayFormRefs,
    );

    const alreadyIgnored: SagaReturnType<typeof getIgnoredAttributeFiltersWorWidget> = yield call(
        getIgnoredAttributeFiltersWorWidget,
        widget,
    );
    const addToIgnore = (ignoredFilters ?? []).filter((candidate) => {
        return !alreadyIgnored.some((ignoredFilter) =>
            areObjRefsEqual(ignoredFilter.attributeFilter.displayForm, candidate.attributeFilter.displayForm),
        );
    });

    const ignoredDateFilters: SagaReturnType<typeof getIgnoredDateFiltersWorWidget> = yield call(
        getIgnoredDateFiltersWorWidget,
        widget,
    );

    const result: SagaReturnType<typeof changeIgnores> = yield call(changeIgnores, widget, [
        ...alreadyIgnored,
        ...addToIgnore,
        ...ignoredDateFilters,
    ]);

    return result;
}

function* unignoreAttributeFilter(
    ctx: DashboardContext,
    validators: FilterValidators<IAnalyticalWidget>,
    cmd: IDashboardCommand,
    widget: IAnalyticalWidget,
    op: FilterOpUnignoreAttributeFilter,
): SagaIterator<FilterOpResult> {
    const unignoredFilters: SagaReturnType<typeof validators.attributeFilterValidator> = yield call(
        validators.attributeFilterValidator,
        ctx,
        cmd,
        widget,
        op.displayFormRefs,
    );

    const alreadyIgnored: SagaReturnType<typeof getIgnoredAttributeFiltersWorWidget> = yield call(
        getIgnoredAttributeFiltersWorWidget,
        widget,
    );
    const reducedIgnores = alreadyIgnored.filter((candidate) => {
        return !(unignoredFilters ?? []).some((toRemove) =>
            areObjRefsEqual(candidate.attributeFilter.displayForm, toRemove.attributeFilter.displayForm),
        );
    });

    const ignoredDateFilters: SagaReturnType<typeof getIgnoredDateFiltersWorWidget> = yield call(
        getIgnoredDateFiltersWorWidget,
        widget,
    );

    const result: SagaReturnType<typeof changeIgnores> = yield call(changeIgnores, widget, [
        ...reducedIgnores,
        ...ignoredDateFilters,
    ]);

    return result;
}

function* ignoreDateFilter(
    ctx: DashboardContext,
    validators: FilterValidators<IAnalyticalWidget>,
    cmd: IDashboardCommand,
    widget: IAnalyticalWidget,
    op: FilterOpIgnoreDateFilter,
): SagaIterator<FilterOpResult> {
    let ignoreFilterDataSetRefs: ObjRef[] = [];
    if (validators.dateFilterValidator) {
        const ignoreDateFilters: SagaReturnType<typeof validators.dateFilterValidator> = yield call(
            validators.dateFilterValidator!,
            ctx,
            cmd,
            widget,
            op.dateDataSetRefs,
        );
        ignoreFilterDataSetRefs = ignoreDateFilters.map((df) => df.dateFilter.dataSet!);
    } else {
        ignoreFilterDataSetRefs = op.dateDataSetRefs;
    }

    const dateFilters: ReturnType<typeof selectFilterContextDateFiltersWithDimension> = yield select(
        selectFilterContextDateFiltersWithDimension,
    );
    const alreadyIgnored: SagaReturnType<typeof getIgnoredDateFiltersWorWidget> = yield call(
        getIgnoredDateFiltersWorWidget,
        widget,
    );

    const addToIgnore = dateFilters.filter((df) => {
        return (
            !alreadyIgnored.some((ignoredFilter) =>
                areObjRefsEqual(ignoredFilter.dateFilter.dataSet, df.dateFilter.dataSet),
            ) && ignoreFilterDataSetRefs.some((ds) => areObjRefsEqual(ds, df.dateFilter.dataSet))
        );
    });

    const ignoredAttributeFilters: SagaReturnType<typeof getIgnoredAttributeFiltersWorWidget> = yield call(
        getIgnoredAttributeFiltersWorWidget,
        widget,
    );

    const result: SagaReturnType<typeof changeIgnores> = yield call(changeIgnores, widget, [
        ...alreadyIgnored,
        ...addToIgnore,
        ...ignoredAttributeFilters,
    ]);

    return result;
}

function* unignoreDateFilter(
    ctx: DashboardContext,
    validators: FilterValidators<IAnalyticalWidget>,
    cmd: IDashboardCommand,
    widget: IAnalyticalWidget,
    op: FilterOpUnignoreDateFilter,
): SagaIterator<FilterOpResult> {
    let unignoreFilterDataSets: ObjRef[] = [];
    if (validators.dateFilterValidator) {
        const ignoreDateFilters: SagaReturnType<typeof validators.dateFilterValidator> = yield call(
            validators.dateFilterValidator!,
            ctx,
            cmd,
            widget,
            op.dateDataSetRefs,
        );
        unignoreFilterDataSets = ignoreDateFilters.map((df) => df.dateFilter.dataSet!);
    } else {
        unignoreFilterDataSets = op.dateDataSetRefs;
    }

    const alreadyIgnored: SagaReturnType<typeof getIgnoredDateFiltersWorWidget> = yield call(
        getIgnoredDateFiltersWorWidget,
        widget,
    );

    const reducedIgnores = alreadyIgnored.filter((candidate) => {
        return !(unignoreFilterDataSets ?? []).some((toRemove) =>
            areObjRefsEqual(candidate.dateFilter.dataSet, toRemove),
        );
    });

    const ignoredAttributeFilters: SagaReturnType<typeof getIgnoredAttributeFiltersWorWidget> = yield call(
        getIgnoredAttributeFiltersWorWidget,
        widget,
    );

    const result: SagaReturnType<typeof changeIgnores> = yield call(changeIgnores, widget, [
        ...reducedIgnores,
        ...ignoredAttributeFilters,
    ]);

    return result;
}

//
//
//

/**
 * Result of the filter operation. This is fully resolved variant of filter settings that should be set as-is
 * on the widget.
 */
export interface FilterOpResult {
    /**
     * Date data set (if any) to use for date filtering the widget
     */
    dateDataSet?: ICatalogDateDataset;

    /**
     * Attribute filters to ignore on the widget.
     */
    ignoredFilters?: Array<IDashboardAttributeFilter | IDashboardDateFilter>;
}

export type DateDatasetValidator<T extends IAnalyticalWidget> = (
    ctx: DashboardContext,
    cmd: IDashboardCommand,
    widget: T,
    ref: ObjRef,
) => SagaIterator<ICatalogDateDataset>;
export type AttributeFilterValidator<T extends IAnalyticalWidget> = (
    ctx: DashboardContext,
    cmd: IDashboardCommand,
    widget: T,
    refs: ObjRef[],
) => SagaIterator<IDashboardAttributeFilter[] | undefined>;
export type DateFilterValidator<T extends IAnalyticalWidget> = (
    ctx: DashboardContext,
    cmd: IDashboardCommand,
    widget: T,
    refs: ObjRef[],
) => SagaIterator<IDashboardDateFilter[]>;
export type FilterValidators<T extends IAnalyticalWidget> = {
    dateDatasetValidator: DateDatasetValidator<T>;
    attributeFilterValidator: AttributeFilterValidator<T>;
    dateFilterValidator?: DateFilterValidator<T>;
};

export interface FilterOpCommand extends IDashboardCommand {
    payload: {
        readonly operation: WidgetFilterOperation;
    };
}

/**
 * This is one of the more complex event handlers. Here is a little introduction to make studying easier. You
 * really should read this first because you start messing around here villy-nilly. It can simplify things hopefully.
 *
 * In order to provide rich/convenient API for fiddling with widget filters, the widget filter setting commands
 * allow caller to use different types of operations such as:
 *
 * -  replace filter settings completely
 * -  enable/disable date filter (by setting or unsetting date dataset)
 * -  replace list of attribute filters to ignore
 * -  add/remove one or more items from a list of attribute filters to ignore
 *
 * To keep things sane, the handler opts out for convenient - yet perhaps not optimal approach to implement these
 * operations:
 *
 * 1.  The operation to replace filter settings completely can handle validation and resolution of date dataset
 *     to filter by and attribute filters to ignore. In a way, this is the ultimate operation that can achieve
 *     everything.
 *
 * 2.  All the other operations are just thin wrappers on top of the replace filter settings. The sub-operation always
 *     prepare a 'quasi replace' or 'intermediate replace', call the the replace settings operation and
 *     then either send the results off or tweak them.
 *
 *     The latter is the case for the ignore/unignore one or more attribute filter operations. These cannot be
 *     mapped 1-1 to just the replace. However, the replace operation is still used to do intermediate work/validations.
 *
 *     The result of the intermediate operation is then tweaked. The funniest example is the unignore operation:
 *
 *     -  the intermediate operation is set with the existing date data set setting that is on the widget - this is
 *        because it should be untouched yet we need to perform resolution to catalog date dataset for the
 *        purpose of having nice, rich eventing in the end
 *
 *     -  the intermediate operation is set with attribute filters that should be removed from ignore list. that is
 *        because code needs to verify the input - whether the display form is valid and used in some attribute filter
 *
 *     -  the replace operation does the validations.. it essentially resolves date data set ref to a nice catalog
 *        date dataset info & resolves display form of the filter to remove to an attribute filter to remove
 *
 *     -  the unignore op then fiddles with with existing ignore list and removes the attribute filter that was
 *        validated and resolved by the intermediate replace operation
 */
export function* processFilterOp(
    ctx: DashboardContext,
    validators: FilterValidators<IAnalyticalWidget>,
    cmd: FilterOpCommand,
    widget: IAnalyticalWidget,
): SagaIterator<FilterOpResult> {
    const {
        payload: { operation },
    } = cmd;

    switch (operation.type) {
        case "replace": {
            return yield call(replaceFilterSettings, ctx, validators, cmd, widget, operation);
        }
        case "disableDateFilter": {
            return yield call(disableDateFilter, ctx, validators, cmd, widget);
        }
        case "enableDateFilter": {
            return yield call(enableDateFilter, ctx, validators, cmd, widget, operation);
        }
        case "replaceAttributeIgnores": {
            return yield call(replaceAttributeIgnores, ctx, validators, cmd, widget, operation);
        }
        case "ignoreAttributeFilter": {
            return yield call(ignoreAttributeFilter, ctx, validators, cmd, widget, operation);
        }
        case "unignoreAttributeFilter": {
            return yield call(unignoreAttributeFilter, ctx, validators, cmd, widget, operation);
        }
        case "ignoreDateFilter": {
            return yield call(ignoreDateFilter, ctx, validators, cmd, widget, operation);
        }
        case "unignoreDateFilter": {
            return yield call(unignoreDateFilter, ctx, validators, cmd, widget, operation);
        }
    }
}
