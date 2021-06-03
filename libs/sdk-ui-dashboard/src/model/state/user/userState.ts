// (C) 2021 GoodData Corporation

import { IUser } from "@gooddata/sdk-backend-spi";

/**
 * @internal
 */
export interface UserState {
    user?: IUser;
}

export const userInitialState: UserState = { user: undefined };
