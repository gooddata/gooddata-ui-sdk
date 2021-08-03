// (C) 2021 GoodData Corporation

import { DashboardContext } from "../../types/commonTypes";
import { ChangeInsightWidgetFilterSettings } from "../../commands";
import { SagaIterator } from "redux-saga";
import { DashboardInsightWidgetFilterSettingsChanged } from "../../events";
import { selectWidgetsMap } from "../../state/layout/layoutSelectors";
import { call, put, SagaReturnType, select } from "redux-saga/effects";
import { validateExistingInsightWidget } from "./validation/widgetValidations";
import { layoutActions } from "../../state/layout";
import { insightWidgetFilterSettingsChanged } from "../../events/insight";
import {
    validateAttributeFiltersToIgnore,
    validateDatasetForInsightWidgetDateFilter,
} from "./validation/filterValidation";
import {
    ICatalogDateDataset,
    IDashboardAttributeFilter,
    IDashboardAttributeFilterReference,
    IDashboardFilterReference,
    IInsightWidget,
    isDashboardAttributeFilterReference,
} from "@gooddata/sdk-backend-spi";
import {
    FilterOpEnableDateFilter,
    FilterOpIgnoreAttributeFilter,
    FilterOpReplaceAll,
    FilterOpReplaceAttributeIgnores,
    FilterOpUnignoreAttributeFilter,
} from "../../types/widgetTypes";
import { areObjRefsEqual } from "@gooddata/sdk-model";
import { selectFilterContextAttributeFilters } from "../../state/filterContext/filterContextSelectors";

/*
 * This is one of the more complex event handlers. Here is a little introduction to make studying easier. You
 * really should read this first because you start messing around here villy-nilly. It can simplify things hopefully.
 *
 * In order to provide rich/convenient API for fiddling with widget filters, the ChangeInsightWidgetFilterSettings
 * allows caller to use different types of operations such as:
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
 *
 */

type FilterOpResult = {
    dateDataSet?: ICatalogDateDataset;
    ignoredFilters?: IDashboardAttributeFilter[];
};

function toAttributeDisplayFormRefs(references: IDashboardFilterReference[]) {
    return references.filter(isDashboardAttributeFilterReference).map((reference) => reference.displayForm);
}

function getIgnoredAttributeFilters(
    filters: IDashboardAttributeFilter[],
    ignored: IDashboardFilterReference[],
): IDashboardAttributeFilter[] {
    const ignoredRefs = toAttributeDisplayFormRefs(ignored);

    return filters.filter((filter) => {
        return ignoredRefs.some((ref) => areObjRefsEqual(filter.attributeFilter.displayForm, ref));
    });
}

function* replaceFilterSettings(
    ctx: DashboardContext,
    widget: IInsightWidget,
    op: FilterOpReplaceAll,
    correlationId: string | undefined,
): SagaIterator<FilterOpResult> {
    let dateDataSet: ICatalogDateDataset | undefined;
    if (op.dateDatasetForFiltering) {
        dateDataSet = yield call(
            validateDatasetForInsightWidgetDateFilter,
            ctx,
            widget,
            op.dateDatasetForFiltering,
            correlationId,
        );
    }

    let ignoredFilters: IDashboardAttributeFilter[] | undefined = undefined;
    if (op.ignoreAttributeFilters) {
        ignoredFilters = yield call(
            validateAttributeFiltersToIgnore,
            ctx,
            op.ignoreAttributeFilters,
            correlationId,
        );
    }

    return {
        dateDataSet,
        ignoredFilters,
    };
}

function* disableDateFilter(
    ctx: DashboardContext,
    widget: IInsightWidget,
    correlationId: string | undefined,
): SagaIterator<FilterOpResult> {
    const replaceEquivalent: FilterOpReplaceAll = {
        type: "replace",
        dateDatasetForFiltering: undefined,
        ignoreAttributeFilters: toAttributeDisplayFormRefs(widget.ignoreDashboardFilters),
    };

    return yield call(replaceFilterSettings, ctx, widget, replaceEquivalent, correlationId);
}

function* enableDateFilter(
    ctx: DashboardContext,
    widget: IInsightWidget,
    op: FilterOpEnableDateFilter,
    correlationId: string | undefined,
): SagaIterator<FilterOpResult> {
    const replaceEquivalent: FilterOpReplaceAll = {
        type: "replace",
        dateDatasetForFiltering: op.dateDataset,
        ignoreAttributeFilters: toAttributeDisplayFormRefs(widget.ignoreDashboardFilters),
    };

    return yield call(replaceFilterSettings, ctx, widget, replaceEquivalent, correlationId);
}

function* replaceAttributeIgnores(
    ctx: DashboardContext,
    widget: IInsightWidget,
    op: FilterOpReplaceAttributeIgnores,
    correlationId: string | undefined,
): SagaIterator<FilterOpResult> {
    const replaceEquivalent: FilterOpReplaceAll = {
        type: "replace",
        dateDatasetForFiltering: widget.dateDataSet,
        ignoreAttributeFilters: op.displayFormRefs,
    };

    return yield call(replaceFilterSettings, ctx, widget, replaceEquivalent, correlationId);
}

function* ignoreAttributeFilter(
    ctx: DashboardContext,
    widget: IInsightWidget,
    op: FilterOpIgnoreAttributeFilter,
    correlationId: string | undefined,
): SagaIterator<FilterOpResult> {
    const replaceIntermediate: FilterOpReplaceAll = {
        type: "replace",
        dateDatasetForFiltering: widget.dateDataSet,
        ignoreAttributeFilters: op.displayFormRefs,
    };

    const intermediate: SagaReturnType<typeof replaceFilterSettings> = yield call(
        replaceFilterSettings,
        ctx,
        widget,
        replaceIntermediate,
        correlationId,
    );
    const attributeFilters: ReturnType<typeof selectFilterContextAttributeFilters> = yield select(
        selectFilterContextAttributeFilters,
    );
    const alreadyIgnored = getIgnoredAttributeFilters(attributeFilters, widget.ignoreDashboardFilters);
    const addToIgnore = (intermediate.ignoredFilters ?? []).filter((candidate) => {
        return (
            alreadyIgnored.find((ignoredFilter) =>
                areObjRefsEqual(
                    ignoredFilter.attributeFilter.displayForm,
                    candidate.attributeFilter.displayForm,
                ),
            ) === undefined
        );
    });

    return {
        dateDataSet: intermediate.dateDataSet,
        ignoredFilters: [...alreadyIgnored, ...addToIgnore],
    };
}

function* unignoreAttributeFilter(
    ctx: DashboardContext,
    widget: IInsightWidget,
    op: FilterOpUnignoreAttributeFilter,
    correlationId: string | undefined,
): SagaIterator<FilterOpResult> {
    const replaceIntermediate: FilterOpReplaceAll = {
        type: "replace",
        dateDatasetForFiltering: widget.dateDataSet,
        ignoreAttributeFilters: op.displayFormRefs,
    };

    const intermediate: SagaReturnType<typeof replaceFilterSettings> = yield call(
        replaceFilterSettings,
        ctx,
        widget,
        replaceIntermediate,
        correlationId,
    );
    const attributeFilters: ReturnType<typeof selectFilterContextAttributeFilters> = yield select(
        selectFilterContextAttributeFilters,
    );
    const alreadyIgnored = getIgnoredAttributeFilters(attributeFilters, widget.ignoreDashboardFilters);
    const reducedIgnores = alreadyIgnored.filter((candidate) => {
        return (
            (intermediate.ignoredFilters ?? []).find((toRemove) =>
                areObjRefsEqual(candidate.attributeFilter.displayForm, toRemove.attributeFilter.displayForm),
            ) === undefined
        );
    });

    return {
        dateDataSet: intermediate.dateDataSet,
        ignoredFilters: reducedIgnores,
    };
}

function* processFilterOp(
    ctx: DashboardContext,
    cmd: ChangeInsightWidgetFilterSettings,
    widget: IInsightWidget,
): SagaIterator<FilterOpResult> {
    const {
        payload: { operation },
        correlationId,
    } = cmd;

    switch (operation.type) {
        case "replace": {
            return yield call(replaceFilterSettings, ctx, widget, operation, correlationId);
        }
        case "disableDateFilter": {
            return yield call(disableDateFilter, ctx, widget, correlationId);
        }
        case "enableDateFilter": {
            return yield call(enableDateFilter, ctx, widget, operation, correlationId);
        }
        case "replaceAttributeIgnores": {
            return yield call(replaceAttributeIgnores, ctx, widget, operation, correlationId);
        }
        case "ignoreAttributeFilter": {
            return yield call(ignoreAttributeFilter, ctx, widget, operation, correlationId);
        }
        case "unignoreAttributeFilter": {
            return yield call(unignoreAttributeFilter, ctx, widget, operation, correlationId);
        }
    }
}

/**
 * Filter setting handler contains some of the more complex validations.
 *
 * If command specifies date dataset to use for date filter (meaning at the same time that date filter should be enabled),
 * then the date dataset validation occurs. This needs to perform complex query processing first to obtain all available
 * date datasets for the insight widget.
 *
 * If command specifies refs of display forms to ignore attribute filters by, then another validation occurs. This one
 * will ensure that the display form refs on the input represent valid, existing display forms. And then ensure that
 * those display forms are actually used in currently used attribute filters.
 */
export function* changeInsightWidgetFilterSettingsHandler(
    ctx: DashboardContext,
    cmd: ChangeInsightWidgetFilterSettings,
): SagaIterator<DashboardInsightWidgetFilterSettingsChanged> {
    const widgets: ReturnType<typeof selectWidgetsMap> = yield select(selectWidgetsMap);
    const insightWidget = validateExistingInsightWidget(widgets, cmd, ctx);

    const result: SagaReturnType<typeof processFilterOp> = yield call(
        processFilterOp,
        ctx,
        cmd,
        insightWidget,
    );
    const { dateDataSet, ignoredFilters } = result;

    const ignoreDashboardFilters = ignoredFilters?.map((filter) => {
        const filterReference: IDashboardAttributeFilterReference = {
            type: "attributeFilterReference",
            displayForm: filter.attributeFilter.displayForm,
        };

        return filterReference;
    });

    yield put(
        layoutActions.replaceWidgetFilterSettings({
            ref: insightWidget.ref,
            dateDataSet: dateDataSet?.dataSet.ref,
            ignoreDashboardFilters: ignoreDashboardFilters,
            undo: {
                cmd,
            },
        }),
    );

    return insightWidgetFilterSettingsChanged(
        ctx,
        insightWidget.ref,
        ignoredFilters ?? [],
        result.dateDataSet,
        cmd.correlationId,
    );
}
