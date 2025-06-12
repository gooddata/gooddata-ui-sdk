// (C) 2023 GoodData Corporation
import { call, put, select } from "redux-saga/effects";
import { SagaIterator } from "redux-saga";
import { invariant } from "ts-invariant";

import { dispatchFilterContextChanged } from "../filterContext/common.js";
import { SetDateFilterConfigTitle } from "../../commands/dashboard.js";
import { dispatchDashboardEvent } from "../../store/_infra/eventDispatcher.js";
import {
    selectFilterContextDateFilter,
    selectFilterContextDateFilterByDataSet,
} from "../../store/filterContext/filterContextSelectors.js";
import { DashboardContext } from "../../types/commonTypes.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { dateFilterConfigsActions } from "../../store/dateFilterConfigs/index.js";
import { selectDateFilterConfigsOverrides } from "../../store/dateFilterConfigs/dateFilterConfigsSelectors.js";
import { dateFilterConfigActions } from "../../store/dateFilterConfig/index.js";
import { selectDateFilterConfigOverrides } from "../../store/dateFilterConfig/dateFilterConfigSelectors.js";
import { dateFilterTitleChanged } from "../../events/filters.js";

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

        const filterConfigs: ReturnType<typeof selectDateFilterConfigsOverrides> = yield select(
            selectDateFilterConfigsOverrides,
        );
        const changedFilterConfig = filterConfigs.find((item) => item.dateDataSet === dataSet);

        invariant(
            changedFilter,
            "Inconsistent state in changeDateFilterTitleHandler, cannot update date filter for given data set.",
        );

        invariant(
            changedFilterConfig,
            "Inconsistent state in changeDateFilterTitleHandler, cannot update date filter config for given data set.",
        );

        yield dispatchDashboardEvent(dateFilterTitleChanged(ctx, changedFilter, changedFilterConfig.config));
    } else {
        yield put(dateFilterConfigActions.setDateFilterConfigTitle(cmd.payload.title));

        const changedFilter: ReturnType<typeof selectFilterContextDateFilter> = yield select(
            selectFilterContextDateFilter,
        );

        const changedFilterConfig: ReturnType<typeof selectDateFilterConfigOverrides> = yield select(
            selectDateFilterConfigOverrides,
        );

        invariant(
            changedFilter,
            "Inconsistent state in changeDateFilterTitleHandler, cannot update common date filter.",
        );

        invariant(
            changedFilterConfig,
            "Inconsistent state in changeDateFilterTitleHandler, cannot update common date filter config.",
        );

        yield dispatchDashboardEvent(dateFilterTitleChanged(ctx, changedFilter, changedFilterConfig));
    }

    yield call(dispatchFilterContextChanged, ctx, cmd);
}
