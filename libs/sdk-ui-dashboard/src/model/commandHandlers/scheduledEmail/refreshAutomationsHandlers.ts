// (C) 2021-2024 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, select, put, all } from "redux-saga/effects";
import { batchActions } from "redux-batched-actions";
import { convertError } from "@gooddata/sdk-ui";
import { DashboardContext } from "../../types/commonTypes.js";
import { PromiseFnReturnType } from "../../types/sagas.js";
import { RefreshAutomations } from "../../commands/scheduledEmail.js";
import { loadDashboardUserAutomations, loadWorkspaceAutomationsCount } from "./loadAutomations.js";
import { selectEnableAlerting, selectEnableScheduling } from "../../store/config/configSelectors.js";
import { automationsActions } from "../../store/automations/index.js";
import { selectDashboardId } from "../../store/meta/metaSelectors.js";
import { selectCurrentUser } from "../../store/user/userSelectors.js";

export function* refreshAutomationsHandlers(ctx: DashboardContext, _cmd: RefreshAutomations): SagaIterator {
    const dashboardId: ReturnType<typeof selectDashboardId> = yield select(selectDashboardId);
    const user: ReturnType<typeof selectCurrentUser> = yield select(selectCurrentUser);
    const enableScheduling: ReturnType<typeof selectEnableScheduling> = yield select(selectEnableScheduling);
    const enableAlerting: ReturnType<typeof selectEnableAlerting> = yield select(selectEnableAlerting);

    const enableAutomations = enableScheduling || enableAlerting;

    if (!dashboardId || !user || !enableAutomations) {
        return;
    }

    yield put(automationsActions.setAutomationsLoading(true));

    try {
        const [automations, allAutomationsCount]: [
            PromiseFnReturnType<typeof loadDashboardUserAutomations>,
            PromiseFnReturnType<typeof loadWorkspaceAutomationsCount>,
        ] = yield all([
            call(loadDashboardUserAutomations, ctx, dashboardId, user.login),
            call(loadWorkspaceAutomationsCount, ctx),
        ]);

        yield put(
            batchActions([
                automationsActions.setAutomationsLoading(false),
                automationsActions.setUserAutomations(automations),
                automationsActions.setAllAutomationsCount(allAutomationsCount),
            ]),
        );
    } catch (e) {
        yield put(automationsActions.setAutomationsLoading(false));
        yield put(automationsActions.setAutomationsError(convertError(e)));
    }
}
