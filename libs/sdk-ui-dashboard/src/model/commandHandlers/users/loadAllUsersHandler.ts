// (C) 2021-2024 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, put } from "redux-saga/effects";
import { DashboardContext } from "../../types/commonTypes.js";
import { PromiseFnReturnType } from "../../types/sagas.js";
import { usersActions } from "../../store/users/index.js";
import { loadWorkspaceUsers } from "./loadWorkspaceUsers.js";
import { LoadAllWorkspaceUsers } from "../../commands/users.js";
import { convertError } from "@gooddata/sdk-ui";
import { batchActions } from "redux-batched-actions";

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
