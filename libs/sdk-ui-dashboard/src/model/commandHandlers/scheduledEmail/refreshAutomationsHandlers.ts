// (C) 2021-2025 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, select, put, all } from "redux-saga/effects";
import { batchActions } from "redux-batched-actions";
import { convertError } from "@gooddata/sdk-ui";
import { DashboardContext } from "../../types/commonTypes.js";
import { PromiseFnReturnType } from "../../types/sagas.js";
import { RefreshAutomations } from "../../commands/scheduledEmail.js";
import { loadDashboardUserAutomations, loadWorkspaceAutomationsCount } from "./loadAutomations.js";
import {
    selectEnableAlerting,
    selectEnableScheduling,
    selectIsReadOnly,
} from "../../store/config/configSelectors.js";
import { automationsActions } from "../../store/automations/index.js";
import { selectDashboardId } from "../../store/meta/metaSelectors.js";
import { selectCurrentUser } from "../../store/user/userSelectors.js";
import { selectCanManageWorkspace } from "../../store/permissions/permissionsSelectors.js";
import { automationsRefreshed } from "../../events/scheduledEmail.js";

export function* refreshAutomationsHandlers(ctx: DashboardContext, cmd: RefreshAutomations): SagaIterator {
    const dashboardId: ReturnType<typeof selectDashboardId> = yield select(selectDashboardId);
    const user: ReturnType<typeof selectCurrentUser> = yield select(selectCurrentUser);
    const enableScheduling: ReturnType<typeof selectEnableScheduling> = yield select(selectEnableScheduling);
    const enableAlerting: ReturnType<typeof selectEnableAlerting> = yield select(selectEnableAlerting);
    const canManageAutomations: ReturnType<typeof selectCanManageWorkspace> = yield select(
        selectCanManageWorkspace,
    );
    const isReadOnly: ReturnType<typeof selectIsReadOnly> = yield select(selectIsReadOnly);
    const enableAutomations = enableScheduling || enableAlerting;

    if (!dashboardId || !user || !enableAutomations || isReadOnly) {
        return;
    }

    yield put(automationsActions.setAutomationsLoading(true));

    try {
        const [automations, allAutomationsCount]: [
            PromiseFnReturnType<typeof loadDashboardUserAutomations>,
            PromiseFnReturnType<typeof loadWorkspaceAutomationsCount>,
        ] = yield all([
            call(loadDashboardUserAutomations, ctx, dashboardId, user.login, !canManageAutomations),
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

        batchActions([
            automationsActions.setAutomationsLoading(false),
            automationsActions.setAutomationsError(convertError(e)),
        ]);
    }

    return automationsRefreshed(ctx, cmd.correlationId);
}
