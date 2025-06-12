// (C) 2021-2023 GoodData Corporation

import { IUser } from "@gooddata/sdk-model";

/**
 * @public
 */
export interface UserState {
    /** @beta */
    user?: IUser;
}

export const userInitialState: UserState = { user: undefined };
