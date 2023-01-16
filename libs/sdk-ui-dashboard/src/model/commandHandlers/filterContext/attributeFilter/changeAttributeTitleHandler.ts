// (C) 2022-2023 GoodData Corporation
import { call, put, select } from "redux-saga/effects";
import { SagaIterator } from "redux-saga";
import invariant from "ts-invariant";

import { SetAttributeFilterTitle } from "../../../commands/filters";
import { attributeDisplayTitleChanged } from "../../../events/filters";
import { filterContextActions } from "../../../store/filterContext";
import { selectFilterContextAttributeFilterByLocalId } from "../../../store/filterContext/filterContextSelectors";
import { DashboardContext } from "../../../types/commonTypes";
import { dispatchFilterContextChanged } from "../common";
import { dispatchDashboardEvent } from "../../../store/_infra/eventDispatcher";
import { invalidArgumentsProvided } from "../../../events/general";

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
        filterContextActions.changeAttributeTitle({
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
