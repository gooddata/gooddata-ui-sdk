// (C) 2024-2025 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import { invariant } from "ts-invariant";

import { SetAttributeFilterLimitingItems } from "../../commands/index.js";
import { dashboardAttributeConfigLimitingItemsChanged } from "../../events/filters.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { dispatchDashboardEvent } from "../../store/_infra/eventDispatcher.js";
import { selectFilterContextAttributeFilterByLocalId } from "../../store/tabs/filterContext/filterContextSelectors.js";
import { tabsActions } from "../../store/tabs/index.js";
import { DashboardContext } from "../../types/commonTypes.js";
import { dispatchFilterContextChanged } from "../filterContext/common.js";

export function* changeAttributeFilterLimitingItemsHandler(
    ctx: DashboardContext,
    cmd: SetAttributeFilterLimitingItems,
): SagaIterator<void> {
    const filterLocalId = yield call(getValidatedFilterLocalIdentifier, ctx, cmd);

    yield put(
        tabsActions.changeLimitingItems({
            filterLocalId,
            limitingItems: cmd.payload.limitingItems,
        }),
    );

    const changedFilter: ReturnType<ReturnType<typeof selectFilterContextAttributeFilterByLocalId>> =
        yield select(selectFilterContextAttributeFilterByLocalId(filterLocalId));

    invariant(
        changedFilter,
        "Inconsistent state in changeAttributeModeHandler, cannot update attribute filter for given local identifier.",
    );

    yield dispatchDashboardEvent(dashboardAttributeConfigLimitingItemsChanged(ctx, changedFilter));
    yield call(dispatchFilterContextChanged, ctx, cmd);
}

function* getValidatedFilterLocalIdentifier(
    ctx: DashboardContext,
    cmd: SetAttributeFilterLimitingItems,
): SagaIterator<string> {
    const { localIdentifier } = cmd.payload;

    const affectedFilter: ReturnType<ReturnType<typeof selectFilterContextAttributeFilterByLocalId>> =
        yield select(selectFilterContextAttributeFilterByLocalId(localIdentifier));

    if (!affectedFilter) {
        throw invalidArgumentsProvided(ctx, cmd, `Filter with localIdentifier ${localIdentifier} not found.`);
    }

    return localIdentifier;
}
