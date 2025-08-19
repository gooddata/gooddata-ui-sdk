// (C) 2021-2025 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { SagaReturnType, call, put, select } from "redux-saga/effects";

import {
    IAnalyticalWidget,
    IDashboardAttributeFilterReference,
    IKpiWidget,
    isDashboardAttributeFilter,
} from "@gooddata/sdk-model";

import { FilterValidators, processFilterOp } from "./common/filterOperations.js";
import {
    validateAttributeFiltersToIgnore,
    validateDatasetForKpiWidgetDateFilter,
} from "./validation/filterValidation.js";
import { validateExistingKpiWidget } from "./validation/widgetValidations.js";
import { ChangeKpiWidgetFilterSettings } from "../../commands/index.js";
import { DashboardKpiWidgetFilterSettingsChanged } from "../../events/index.js";
import { kpiWidgetFilterSettingsChanged } from "../../events/kpi.js";
import { layoutActions } from "../../store/layout/index.js";
import { selectWidgetsMap } from "../../store/layout/layoutSelectors.js";
import { DashboardContext } from "../../types/commonTypes.js";

const KpiWidgetFilterValidations: FilterValidators<IKpiWidget> = {
    dateDatasetValidator: validateDatasetForKpiWidgetDateFilter,
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
export function* changeKpiWidgetFilterSettingsHandler(
    ctx: DashboardContext,
    cmd: ChangeKpiWidgetFilterSettings,
): SagaIterator<DashboardKpiWidgetFilterSettingsChanged> {
    const widgets: ReturnType<typeof selectWidgetsMap> = yield select(selectWidgetsMap);
    const kpiWidget = validateExistingKpiWidget(widgets, cmd, ctx);

    const result: SagaReturnType<typeof processFilterOp> = yield call(
        processFilterOp,
        ctx,
        KpiWidgetFilterValidations as FilterValidators<IAnalyticalWidget>,
        cmd,
        kpiWidget,
    );
    const { dateDataSet, ignoredFilters } = result;

    // KPI supports only attribute filters
    const ignoredAttributeFilters = ignoredFilters?.filter(isDashboardAttributeFilter);

    const ignoreDashboardFilters = ignoredAttributeFilters?.map((filter) => {
        const filterReference: IDashboardAttributeFilterReference = {
            type: "attributeFilterReference",
            displayForm: filter.attributeFilter.displayForm,
        };

        return filterReference;
    });

    yield put(
        layoutActions.replaceWidgetFilterSettings({
            ref: kpiWidget.ref,
            dateDataSet: dateDataSet?.dataSet.ref,
            ignoreDashboardFilters,
            undo: {
                cmd,
            },
        }),
    );

    return kpiWidgetFilterSettingsChanged(
        ctx,
        kpiWidget.ref,
        ignoredAttributeFilters ?? [],
        result.dateDataSet,
        cmd.correlationId,
    );
}
