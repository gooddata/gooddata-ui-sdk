// (C) 2024 GoodData Corporation
import { IWorkspaceUser } from "@gooddata/sdk-model";

/**
 * @alpha
 */
export interface UsersState {
    users: IWorkspaceUser[];
}

export const usersInitialState: UsersState = { users: [] };
