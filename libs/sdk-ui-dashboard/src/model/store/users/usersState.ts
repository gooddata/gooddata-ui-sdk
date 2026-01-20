// (C) 2024-2026 GoodData Corporation

import { type IWorkspaceUser } from "@gooddata/sdk-model";
import { type GoodDataSdkError } from "@gooddata/sdk-ui";

/**
 * @alpha
 */
export interface IUsersState {
    users?: IWorkspaceUser[];
    error?: GoodDataSdkError;
    status: "pending" | "loading" | "success" | "error";
}

export const usersInitialState: IUsersState = { users: undefined, error: undefined, status: "pending" };
