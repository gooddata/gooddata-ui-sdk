// (C) 2023 GoodData Corporation
import { call, put, select } from "redux-saga/effects";
import { SagaIterator } from "redux-saga";
import { invariant } from "ts-invariant";

import { dispatchFilterContextChanged } from "../filterContext/common.js";
import { SetDateFilterConfigTitle } from "../../commands/dashboard.js";
// import { dashboardDateConfigModeChanged } from "../../events/filters.js";
// import { dispatchDashboardEvent } from "../../store/_infra/eventDispatcher.js";
import { selectFilterContextDateFilterByDataSet } from "../../store/filterContext/filterContextSelectors.js";
import { DashboardContext } from "../../types/commonTypes.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { dateFilterConfigsActions } from "../../store/dateFilterConfigs/index.js";
import { dateFilterConfigActions } from "../../store/dateFilterConfig/index.js";

export function* changeDateFilterTitleHandler(
    ctx: DashboardContext,
    cmd: SetDateFilterConfigTitle,
): SagaIterator<void> {
    const { dataSet } = cmd.payload;
    if (dataSet) {
        // validate dataSet
        const affectedFilter: ReturnType<ReturnType<typeof selectFilterContextDateFilterByDataSet>> =
            yield select(selectFilterContextDateFilterByDataSet(dataSet));

        if (!affectedFilter) {
            throw invalidArgumentsProvided(ctx, cmd, `Filter with data set ${dataSet} not found.`);
        }

        yield put(dateFilterConfigsActions.changeTitle(cmd.payload));

        const changedFilter: ReturnType<ReturnType<typeof selectFilterContextDateFilterByDataSet>> =
            yield select(selectFilterContextDateFilterByDataSet(dataSet));

        invariant(
            changedFilter,
            "Inconsistent state in changeDateModeHandler, cannot update date filter for given data set.",
        );
    } else {
        yield put(dateFilterConfigActions.setDateFilterConfigTitle(cmd.payload.title));
    }

    // TODO INE: dispatch event
    //yield dispatchDashboardEvent(dashboardDateConfigModeChanged(ctx, changedFilter));
    yield call(dispatchFilterContextChanged, ctx, cmd);
}
