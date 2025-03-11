// (C) 2021-2025 GoodData Corporation

import { DashboardContext } from "../../types/commonTypes.js";
import { ChangeRichTextWidgetFilterSettings } from "../../commands/index.js";
import { SagaIterator } from "redux-saga";
import {
    DashboardRichTextWidgetFilterSettingsChanged,
    richTextWidgetFilterSettingsChanged,
} from "../../events/index.js";
import { selectWidgetsMap } from "../../store/layout/layoutSelectors.js";
import { call, put, SagaReturnType, select } from "redux-saga/effects";
import { validateExistingRichTextWidget } from "./validation/widgetValidations.js";
import { layoutActions } from "../../store/layout/index.js";
import {
    IDashboardAttributeFilterReference,
    IAnalyticalWidget,
    IRichTextWidget,
    isDashboardAttributeFilter,
    IDashboardDateFilterReference,
    isDashboardDateFilterWithDimension,
} from "@gooddata/sdk-model";
import { FilterValidators, processFilterOp } from "./common/filterOperations.js";
import {
    validateAttributeFiltersToIgnore,
    validateDatasetForRichTextWidgetDateFilter,
    validateDateFiltersToIgnore,
} from "./validation/filterValidation.js";

const RichTextWidgetFilterValidations: FilterValidators<IRichTextWidget> = {
    dateDatasetValidator: validateDatasetForRichTextWidgetDateFilter,
    attributeFilterValidator: validateAttributeFiltersToIgnore,
    dateFilterValidator: validateDateFiltersToIgnore,
};

/**
 * Filter setting handler contains some of the more complex validations.
 *
 * If command specifies date dataset to use for date filter (meaning at the same time that date filter should be enabled),
 * then the date dataset validation occurs. This needs to perform complex query processing first to obtain all available
 * date datasets for the rich text widget.
 *
 * If command specifies refs of display forms to ignore attribute filters by, then another validation occurs. This one
 * will ensure that the display form refs on the input represent valid, existing display forms. And then ensure that
 * those display forms are actually used in currently used attribute filters.
 */
export function* changeRichTextWidgetFilterSettingsHandler(
    ctx: DashboardContext,
    cmd: ChangeRichTextWidgetFilterSettings,
): SagaIterator<DashboardRichTextWidgetFilterSettingsChanged> {
    const widgets: ReturnType<typeof selectWidgetsMap> = yield select(selectWidgetsMap);
    const richTextWidget = validateExistingRichTextWidget(widgets, cmd, ctx);

    const result: SagaReturnType<typeof processFilterOp> = yield call(
        processFilterOp,
        ctx,
        RichTextWidgetFilterValidations as FilterValidators<IAnalyticalWidget>,
        cmd,
        richTextWidget,
    );
    const { dateDataSet, ignoredFilters } = result;

    const ignoreDashboardFilters = ignoredFilters?.map((filter) => {
        if (isDashboardAttributeFilter(filter)) {
            const filterReference: IDashboardAttributeFilterReference = {
                type: "attributeFilterReference",
                displayForm: filter.attributeFilter.displayForm,
            };

            return filterReference;
        }
        const filterReference: IDashboardDateFilterReference = {
            type: "dateFilterReference",
            dataSet: filter.dateFilter.dataSet!,
        };

        return filterReference;
    });

    yield put(
        layoutActions.replaceWidgetFilterSettings({
            ref: richTextWidget.ref,
            dateDataSet: dateDataSet?.dataSet.ref,
            ignoreDashboardFilters,
            undo: {
                cmd,
            },
        }),
    );

    return richTextWidgetFilterSettingsChanged(
        ctx,
        richTextWidget.ref,
        (ignoredFilters ?? []).filter(isDashboardAttributeFilter),
        result.dateDataSet,
        cmd.correlationId,
        (ignoredFilters ?? []).filter(isDashboardDateFilterWithDimension),
    );
}
