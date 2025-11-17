// (C) 2023-2025 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import { invariant } from "ts-invariant";

import { SetAttributeFilterTitle } from "../../../commands/filters.js";
import { attributeDisplayTitleChanged } from "../../../events/filters.js";
import { invalidArgumentsProvided } from "../../../events/general.js";
import { dispatchDashboardEvent } from "../../../store/_infra/eventDispatcher.js";
import { selectFilterContextAttributeFilterByLocalId } from "../../../store/tabs/filterContext/filterContextSelectors.js";
import { tabsActions } from "../../../store/tabs/index.js";
import { DashboardContext } from "../../../types/commonTypes.js";
import { dispatchFilterContextChanged } from "../common.js";

export function* changeAttributeTitleHandler(
    ctx: DashboardContext,
    cmd: SetAttributeFilterTitle,
): SagaIterator<void> {
    const { filterLocalId, title } = cmd.payload;

    // validate filterLocalId
    const affectedFilter: ReturnType<ReturnType<typeof selectFilterContextAttributeFilterByLocalId>> =
        yield select(selectFilterContextAttributeFilterByLocalId(cmd.payload.filterLocalId));

    if (!affectedFilter) {
        throw invalidArgumentsProvided(ctx, cmd, `Filter with filterLocalId ${filterLocalId} not found.`);
    }

    yield put(
        tabsActions.changeAttributeTitle({
            filterLocalId,
            title,
        }),
    );

    const changedFilter: ReturnType<ReturnType<typeof selectFilterContextAttributeFilterByLocalId>> =
        yield select(selectFilterContextAttributeFilterByLocalId(cmd.payload.filterLocalId));

    invariant(
        changedFilter,
        "Inconsistent state in changeAttributeTitleHandler, cannot update attribute filter for given local identifier.",
    );

    yield dispatchDashboardEvent(attributeDisplayTitleChanged(ctx, changedFilter, cmd.correlationId));
    yield call(dispatchFilterContextChanged, ctx, cmd);
}
