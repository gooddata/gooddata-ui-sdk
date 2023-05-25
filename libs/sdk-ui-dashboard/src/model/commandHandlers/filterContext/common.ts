// (C) 2021-2022 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { select } from "redux-saga/effects";
import { IDashboardDateFilter } from "@gooddata/sdk-model";

import { IDashboardCommand } from "../../commands/base.js";
import { filterContextChanged } from "../../events/filters.js";
import { selectFilterContextDefinition } from "../../store/filterContext/filterContextSelectors.js";
import { DashboardContext } from "../../types/commonTypes.js";
import { dispatchDashboardEvent } from "../../store/_infra/eventDispatcher.js";
import { selectEffectiveDateFilterOptions } from "../../store/dateFilterConfig/dateFilterConfigSelectors.js";
import { findDateFilterOptionByValue } from "../../../_staging/dateFilterConfig/dateFilterOptionMapping.js";

export function* dispatchFilterContextChanged(
    ctx: DashboardContext,
    cmd: IDashboardCommand,
): SagaIterator<void> {
    const filterContext: ReturnType<typeof selectFilterContextDefinition> = yield select(
        selectFilterContextDefinition,
    );

    yield dispatchDashboardEvent(filterContextChanged(ctx, filterContext, cmd.correlationId));
}

export function* canApplyDateFilter(dateFilter: IDashboardDateFilter): SagaIterator<boolean> {
    const effectiveDateFilterOptions: ReturnType<typeof selectEffectiveDateFilterOptions> = yield select(
        selectEffectiveDateFilterOptions,
    );

    const targetOption = findDateFilterOptionByValue(dateFilter, effectiveDateFilterOptions);

    if (!targetOption) {
        if (dateFilter.dateFilter.type === "absolute") {
            return !!effectiveDateFilterOptions?.absoluteForm?.visible;
        } else if (dateFilter.dateFilter.type === "relative") {
            if (
                dateFilter.dateFilter.granularity === "GDC.time.date" &&
                dateFilter.dateFilter.from === undefined &&
                dateFilter.dateFilter.to === undefined
            ) {
                return !!effectiveDateFilterOptions?.allTime?.visible;
            }
            return !!effectiveDateFilterOptions?.relativeForm?.visible;
        }
    }

    return !!targetOption;
}
