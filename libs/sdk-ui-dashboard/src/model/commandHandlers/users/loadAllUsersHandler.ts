// (C) 2021-2026 GoodData Corporation

import { batchActions } from "redux-batched-actions";
import { type SagaIterator } from "redux-saga";
import { call, put } from "redux-saga/effects";

import { convertError } from "@gooddata/sdk-ui";

import { loadWorkspaceUsers } from "./loadWorkspaceUsers.js";
import { type ILoadAllWorkspaceUsers } from "../../commands/users.js";
import { usersActions } from "../../store/users/index.js";
import { type DashboardContext } from "../../types/commonTypes.js";
import { type PromiseFnReturnType } from "../../types/sagas.js";

export function* loadAllWorkspaceUsersHandler(
    ctx: DashboardContext,
    _cmd: ILoadAllWorkspaceUsers,
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
