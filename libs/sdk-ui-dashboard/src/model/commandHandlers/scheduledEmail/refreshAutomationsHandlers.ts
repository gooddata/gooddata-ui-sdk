// (C) 2021-2026 GoodData Corporation

import { batchActions } from "redux-batched-actions";
import { type SagaIterator } from "redux-saga";
import { all, call, put, select } from "redux-saga/effects";

import { convertError } from "@gooddata/sdk-ui";

import { loadDashboardUserAutomations, loadWorkspaceAutomationsCount } from "./loadAutomations.js";
import { type IRefreshAutomations } from "../../commands/scheduledEmail.js";
import { automationsRefreshed } from "../../events/scheduledEmail.js";
import { automationsActions } from "../../store/automations/index.js";
import {
    selectEnableAlerting,
    selectEnableScheduling,
    selectExternalRecipient,
    selectIsReadOnly,
} from "../../store/config/configSelectors.js";
import { selectDashboardId } from "../../store/meta/metaSelectors.js";
import { selectCanManageWorkspace } from "../../store/permissions/permissionsSelectors.js";
import { selectCurrentUser } from "../../store/user/userSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";
import { type PromiseFnReturnType } from "../../types/sagas.js";

export function* refreshAutomationsHandlers(ctx: DashboardContext, cmd: IRefreshAutomations): SagaIterator {
    const dashboardId: ReturnType<typeof selectDashboardId> = yield select(selectDashboardId);
    const user: ReturnType<typeof selectCurrentUser> = yield select(selectCurrentUser);
    const enableScheduling: ReturnType<typeof selectEnableScheduling> = yield select(selectEnableScheduling);
    const enableAlerting: ReturnType<typeof selectEnableAlerting> = yield select(selectEnableAlerting);
    const canManageAutomations: ReturnType<typeof selectCanManageWorkspace> =
        yield select(selectCanManageWorkspace);
    const isReadOnly: ReturnType<typeof selectIsReadOnly> = yield select(selectIsReadOnly);
    const enableAutomations = enableScheduling || enableAlerting;
    const externalRecipient: ReturnType<typeof selectExternalRecipient> =
        yield select(selectExternalRecipient);

    if (!dashboardId || !user || !enableAutomations || isReadOnly) {
        return;
    }

    yield put(automationsActions.setAutomationsLoading(true));

    try {
        const [automations, allAutomationsCount]: [
            PromiseFnReturnType<typeof loadDashboardUserAutomations>,
            PromiseFnReturnType<typeof loadWorkspaceAutomationsCount>,
        ] = yield all([
            call(
                loadDashboardUserAutomations,
                ctx,
                dashboardId,
                user.login,
                !canManageAutomations,
                externalRecipient,
            ),
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
