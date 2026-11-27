// (C) 2022-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import { invariant } from "ts-invariant";

import { areObjRefsEqual, isDashboardDateFilter } from "@gooddata/sdk-model";

import { type ISetDateFilterConfigTitle } from "../../commands/dashboard.js";
import { dateFilterOfAnyTypeTitleChanged, dateFilterTitleChanged } from "../../events/filters.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { dispatchDashboardEvent } from "../../store/_infra/eventDispatcher.js";
import { selectDateFilterConfigOverrides } from "../../store/tabs/dateFilterConfig/dateFilterConfigSelectors.js";
import { selectDateFilterConfigsOverrides } from "../../store/tabs/dateFilterConfigs/dateFilterConfigsSelectors.js";
import {
    selectFilterContextDateFilterOfAnyType,
    selectFilterContextDateFilterOfAnyTypeByDataSet,
} from "../../store/tabs/filterContext/filterContextSelectors.js";
import { tabsActions } from "../../store/tabs/index.js";
import { type DashboardContext } from "../../types/commonTypes.js";
import { dispatchFilterContextChanged } from "../filterContext/common.js";

export function* changeDateFilterTitleHandler(
    ctx: DashboardContext,
    cmd: ISetDateFilterConfigTitle,
): SagaIterator<void> {
    const { dataSet } = cmd.payload;
    if (dataSet) {
        // validate dataSet
        const affectedFilter: ReturnType<ReturnType<typeof selectFilterContextDateFilterOfAnyTypeByDataSet>> =
            yield select(selectFilterContextDateFilterOfAnyTypeByDataSet(dataSet));

        if (!affectedFilter) {
            throw invalidArgumentsProvided(ctx, cmd, `Filter with data set ${dataSet} not found.`);
        }

        yield put(tabsActions.changeDateFilterConfigsTitle(cmd.payload));

        const changedFilter: ReturnType<ReturnType<typeof selectFilterContextDateFilterOfAnyTypeByDataSet>> =
            yield select(selectFilterContextDateFilterOfAnyTypeByDataSet(dataSet));

        const filterConfigs: ReturnType<typeof selectDateFilterConfigsOverrides> = yield select(
            selectDateFilterConfigsOverrides,
        );
        const changedFilterConfig = filterConfigs.find((item) => areObjRefsEqual(item.dateDataSet, dataSet));

        invariant(
            changedFilter,
            "Inconsistent state in changeDateFilterTitleHandler, cannot update date filter for given data set.",
        );

        invariant(
            changedFilterConfig,
            "Inconsistent state in changeDateFilterTitleHandler, cannot update date filter config for given data set.",
        );

        if (isDashboardDateFilter(changedFilter)) {
            yield dispatchDashboardEvent(
                dateFilterTitleChanged(ctx, changedFilter, changedFilterConfig.config),
            );
        }
        yield dispatchDashboardEvent(
            dateFilterOfAnyTypeTitleChanged(ctx, changedFilter, changedFilterConfig.config),
        );
    } else {
        yield put(tabsActions.setDateFilterConfigTitle(cmd.payload.title));

        const changedFilter: ReturnType<typeof selectFilterContextDateFilterOfAnyType> = yield select(
            selectFilterContextDateFilterOfAnyType,
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

        if (isDashboardDateFilter(changedFilter)) {
            yield dispatchDashboardEvent(dateFilterTitleChanged(ctx, changedFilter, changedFilterConfig));
        }
        yield dispatchDashboardEvent(
            dateFilterOfAnyTypeTitleChanged(ctx, changedFilter, changedFilterConfig),
        );
    }

    yield call(dispatchFilterContextChanged, ctx, cmd);
}
