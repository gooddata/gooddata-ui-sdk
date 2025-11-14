// (C) 2022-2025 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import { invariant } from "ts-invariant";

import { SetDateFilterConfigTitle } from "../../commands/dashboard.js";
import { dateFilterTitleChanged } from "../../events/filters.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { dispatchDashboardEvent } from "../../store/_infra/eventDispatcher.js";
import { selectDateFilterConfigOverrides } from "../../store/tabs/dateFilterConfig/dateFilterConfigSelectors.js";
import { selectDateFilterConfigsOverrides } from "../../store/tabs/dateFilterConfigs/dateFilterConfigsSelectors.js";
import {
    selectFilterContextDateFilter,
    selectFilterContextDateFilterByDataSet,
} from "../../store/tabs/filterContext/filterContextSelectors.js";
import { tabsActions } from "../../store/tabs/index.js";
import { DashboardContext } from "../../types/commonTypes.js";
import { dispatchFilterContextChanged } from "../filterContext/common.js";

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

        yield put(tabsActions.changeDateFilterConfigsTitle(cmd.payload));

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
        yield put(tabsActions.setDateFilterConfigTitle(cmd.payload.title));

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
