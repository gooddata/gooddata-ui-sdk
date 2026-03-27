// (C) 2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import { invariant } from "ts-invariant";

import { type ISetDashboardAttributeFilterSelectionType } from "../../commands/dashboard.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { selectFilterContextAttributeFilterItemByLocalId } from "../../store/tabs/filterContext/filterContextSelectors.js";
import { tabsActions } from "../../store/tabs/index.js";
import { type DashboardContext } from "../../types/commonTypes.js";
import { dispatchFilterContextChanged } from "../filterContext/common.js";

export function* changeAttributeFilterSelectionTypeHandler(
    ctx: DashboardContext,
    cmd: ISetDashboardAttributeFilterSelectionType,
): SagaIterator<void> {
    const { localIdentifier } = cmd.payload;

    // validate localIdentifier
    const affectedFilter: ReturnType<ReturnType<typeof selectFilterContextAttributeFilterItemByLocalId>> =
        yield select(selectFilterContextAttributeFilterItemByLocalId(localIdentifier));

    if (!affectedFilter) {
        throw invalidArgumentsProvided(ctx, cmd, `Filter with localIdentifier ${localIdentifier} not found.`);
    }

    yield put(tabsActions.changeAttributeFilterSelectionType(cmd.payload));

    const changedFilter: ReturnType<ReturnType<typeof selectFilterContextAttributeFilterItemByLocalId>> =
        yield select(selectFilterContextAttributeFilterItemByLocalId(localIdentifier));

    invariant(
        changedFilter,
        "Inconsistent state in changeAttributeFilterSelectionTypeHandler, cannot update attribute filter for given local identifier.",
    );

    yield call(dispatchFilterContextChanged, ctx, cmd);
}
