// (C) 2023-2025 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import { invariant } from "ts-invariant";

import { SetDashboardDateFilterWithDimensionConfigMode } from "../../commands/dashboard.js";
import { dateFilterModeChanged } from "../../events/filters.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { dispatchDashboardEvent } from "../../store/_infra/eventDispatcher.js";
import { selectDateFilterConfigsOverrides } from "../../store/dateFilterConfigs/dateFilterConfigsSelectors.js";
import { dateFilterConfigsActions } from "../../store/dateFilterConfigs/index.js";
import { selectFilterContextDateFilterByDataSet } from "../../store/filterContext/filterContextSelectors.js";
import { DashboardContext } from "../../types/commonTypes.js";
import { dispatchFilterContextChanged } from "../filterContext/common.js";

export function* changeDateFilterWithDimensionModeHandler(
    ctx: DashboardContext,
    cmd: SetDashboardDateFilterWithDimensionConfigMode,
): SagaIterator<void> {
    const { dataSet } = cmd.payload;

    // validate dataSet
    const affectedFilter: ReturnType<ReturnType<typeof selectFilterContextDateFilterByDataSet>> =
        yield select(selectFilterContextDateFilterByDataSet(dataSet));

    if (!affectedFilter) {
        throw invalidArgumentsProvided(ctx, cmd, `Filter with data set ${dataSet} not found.`);
    }

    yield put(dateFilterConfigsActions.changeMode(cmd.payload));

    const changedFilter: ReturnType<ReturnType<typeof selectFilterContextDateFilterByDataSet>> = yield select(
        selectFilterContextDateFilterByDataSet(dataSet),
    );

    const filterConfigs: ReturnType<typeof selectDateFilterConfigsOverrides> = yield select(
        selectDateFilterConfigsOverrides,
    );
    const changedFilterConfig = filterConfigs.find((item) => item.dateDataSet === dataSet);

    invariant(
        changedFilter,
        "Inconsistent state in changeDateModeHandler, cannot update date filter for given data set.",
    );

    invariant(
        changedFilterConfig,
        "Inconsistent state in changeDateModeHandler, cannot update date filter config for given data set.",
    );

    yield dispatchDashboardEvent(dateFilterModeChanged(ctx, changedFilter, changedFilterConfig.config));
    yield call(dispatchFilterContextChanged, ctx, cmd);
}
