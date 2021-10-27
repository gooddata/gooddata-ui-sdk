// (C) 2021 GoodData Corporation

import { IUser } from "@gooddata/sdk-model";

/**
 * @alpha
 */
export interface UserState {
    user?: IUser;
}

export const userInitialState: UserState = { user: undefined };
