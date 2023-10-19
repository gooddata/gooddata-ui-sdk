// (C) 2023 GoodData Corporation
import { call, put, select } from "redux-saga/effects";
import { SagaIterator } from "redux-saga";
import { invariant } from "ts-invariant";

import { dispatchFilterContextChanged } from "../filterContext/common.js";
import { SetDashboardAttributeFilterConfigMode } from "../../commands/dashboard.js";
import { dashboardAttributeConfigModeChanged } from "../../events/filters.js";
import { selectFilterContextAttributeFilterByLocalId } from "../../store/filterContext/filterContextSelectors.js";
import { DashboardContext } from "../../types/commonTypes.js";
import { dispatchDashboardEvent } from "../../store/_infra/eventDispatcher.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { attributeFilterConfigsActions } from "../../store/attributeFilterConfigs/index.js";

export function* changeAttributeFilterModeHandler(
    ctx: DashboardContext,
    cmd: SetDashboardAttributeFilterConfigMode,
): SagaIterator<void> {
    const { localIdentifier } = cmd.payload;

    // validate localIdentifier
    const affectedFilter: ReturnType<ReturnType<typeof selectFilterContextAttributeFilterByLocalId>> =
        yield select(selectFilterContextAttributeFilterByLocalId(localIdentifier));

    if (!affectedFilter) {
        throw invalidArgumentsProvided(ctx, cmd, `Filter with localIdentifier ${localIdentifier} not found.`);
    }

    yield put(attributeFilterConfigsActions.changeMode(cmd.payload));

    const changedFilter: ReturnType<ReturnType<typeof selectFilterContextAttributeFilterByLocalId>> =
        yield select(selectFilterContextAttributeFilterByLocalId(localIdentifier));

    invariant(
        changedFilter,
        "Inconsistent state in changeAttributeModeHandler, cannot update attribute filter for given local identifier.",
    );

    yield dispatchDashboardEvent(dashboardAttributeConfigModeChanged(ctx, changedFilter));
    yield call(dispatchFilterContextChanged, ctx, cmd);
}
