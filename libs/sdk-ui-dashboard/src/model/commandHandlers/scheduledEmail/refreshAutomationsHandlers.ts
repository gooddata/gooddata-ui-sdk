// (C) 2021-2024 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, select, put } from "redux-saga/effects";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

import { DashboardContext } from "../../types/commonTypes.js";
import { PromiseFnReturnType } from "../../types/sagas.js";
import { RefreshAutomations } from "../../commands/scheduledEmail.js";
import { loadWorkspaceAutomationsCount } from "../dashboard/common/loadWorkspaceAutomations.js";
import { selectConfig } from "../../store/config/configSelectors.js";
import { automationsActions } from "../../store/automations/index.js";

export function* refreshAutomationsHandlers(ctx: DashboardContext, _cmd: RefreshAutomations): SagaIterator {
    yield put(automationsActions.setAutomationsLoading());

    yield put(automationsActions.refreshAutomationsFingerprint());
    try {
        const config = yield select(selectConfig);
        const automations: PromiseFnReturnType<typeof loadWorkspaceAutomationsCount> = yield call(
            loadWorkspaceAutomationsCount,
            ctx,
            config?.settings ?? {},
        );

        yield put(automationsActions.setAutomationsCount(automations));
    } catch (e) {
        yield put(automationsActions.setAutomationsError(e as GoodDataSdkError));
    }
}
