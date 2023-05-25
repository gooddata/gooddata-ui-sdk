// (C) 2021-2022 GoodData Corporation

import { DashboardContext } from "../../types/commonTypes.js";
import { ChangeInsightWidgetFilterSettings } from "../../commands/index.js";
import { SagaIterator } from "redux-saga";
import { DashboardInsightWidgetFilterSettingsChanged } from "../../events/index.js";
import { selectWidgetsMap } from "../../store/layout/layoutSelectors.js";
import { call, put, SagaReturnType, select } from "redux-saga/effects";
import { validateExistingInsightWidget } from "./validation/widgetValidations.js";
import { layoutActions } from "../../store/layout/index.js";
import { insightWidgetFilterSettingsChanged } from "../../events/insight.js";
import { IDashboardAttributeFilterReference, IAnalyticalWidget, IInsightWidget } from "@gooddata/sdk-model";
import { FilterValidators, processFilterOp } from "./common/filterOperations.js";
import {
    validateAttributeFiltersToIgnore,
    validateDatasetForInsightWidgetDateFilter,
} from "./validation/filterValidation.js";

const InsightWidgetFilterValidations: FilterValidators<IInsightWidget> = {
    dateDatasetValidator: validateDatasetForInsightWidgetDateFilter,
    attributeFilterValidator: validateAttributeFiltersToIgnore,
};

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
        InsightWidgetFilterValidations as FilterValidators<IAnalyticalWidget>,
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
