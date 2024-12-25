// (C) 2024 GoodData Corporation
import { IWorkspaceUser } from "@gooddata/sdk-model";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

/**
 * @alpha
 */
export interface UsersState {
    users?: IWorkspaceUser[];
    error?: GoodDataSdkError;
    status: "pending" | "loading" | "success" | "error";
}

export const usersInitialState: UsersState = { users: undefined, error: undefined, status: "pending" };
