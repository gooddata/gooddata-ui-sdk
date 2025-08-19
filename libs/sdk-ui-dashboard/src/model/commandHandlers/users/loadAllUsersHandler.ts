// (C) 2021-2025 GoodData Corporation
import { batchActions } from "redux-batched-actions";
import { SagaIterator } from "redux-saga";
import { call, put } from "redux-saga/effects";

import { convertError } from "@gooddata/sdk-ui";

import { loadWorkspaceUsers } from "./loadWorkspaceUsers.js";
import { LoadAllWorkspaceUsers } from "../../commands/users.js";
import { usersActions } from "../../store/users/index.js";
import { DashboardContext } from "../../types/commonTypes.js";
import { PromiseFnReturnType } from "../../types/sagas.js";

export function* loadAllWorkspaceUsersHandler(
    ctx: DashboardContext,
    _cmd: LoadAllWorkspaceUsers,
): SagaIterator {
    try {
        yield put(usersActions.setUsersLoadingStatus("loading"));

        const users: PromiseFnReturnType<typeof loadWorkspaceUsers> = yield call(loadWorkspaceUsers, ctx);
        yield put(
            batchActions([usersActions.setUsers(users), usersActions.setUsersLoadingStatus("success")]),
        );
    } catch (e) {
        yield put(
            batchActions([
                usersActions.setErrorUsers(convertError(e)),
                usersActions.setUsersLoadingStatus("error"),
            ]),
        );
    }
}
