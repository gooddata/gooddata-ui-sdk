// (C) 2021-2026 GoodData Corporation

import { type IUser } from "@gooddata/sdk-model";

/**
 * @public
 */
export type UserState = {
    /** @beta */
    user?: IUser;
};

export const userInitialState: UserState = { user: undefined };
